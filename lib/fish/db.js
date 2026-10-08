import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";
import postgres from "postgres";
import { catalog, initialSettings } from "./catalog.js";
let db, initialization, pg;
export const databaseUrl = () =>
  process.env.DATABASE_URL || process.env.POSTGRES_URL;
export function database() {
  if (db) return db;
  if (process.env.VERCEL)
    throw Error(
      "Configure DATABASE_URL ou POSTGRES_URL na Vercel. SQLite não é persistente nesse ambiente.",
    );
  const path = resolve(
    /* turbopackIgnore: true */ process.env.FISH_DB_PATH ||
      "data/thefish.sqlite",
  );
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  db = new DatabaseSync(path);
  chmodSync(path, 0o600);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1),data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY AUTOINCREMENT,token_hash TEXT UNIQUE NOT NULL,idempotency TEXT UNIQUE NOT NULL,payload_hash TEXT NOT NULL,data TEXT NOT NULL,created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admins(id INTEGER PRIMARY KEY CHECK(id=1),hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);`);
  db.prepare("INSERT OR IGNORE INTO settings VALUES(1,?)").run(
    JSON.stringify(initialSettings),
  );
  const insert = db.prepare("INSERT OR IGNORE INTO products VALUES(?,?)");
  for (const p of catalog) insert.run(p.id, JSON.stringify(p));
  return db;
}
function adapter(sql) {
  return {
    postgres: true,
    prepare(query) {
      let n = 0;
      const text = query.replace(/\?/g, () => "$" + ++n);
      const run = (params) => sql.unsafe(text, params);
      return {
        get: async (...params) => (await run(params))[0],
        all: async (...params) => [...(await run(params))],
        run: async (...params) => {
          const rows = await sql.unsafe(
            /^INSERT INTO orders\(/i.test(text) ? text + " RETURNING id" : text,
            params,
          );
          return { lastInsertRowid: rows[0]?.id, changes: rows.count };
        },
      };
    },
    lock: async (query, ...params) =>
      adapter(sql)
        .prepare(query + " FOR UPDATE")
        .get(...params),
  };
}
async function initializePostgres() {
  const parsed = new URL(databaseUrl());
  if (!["postgres:", "postgresql:"].includes(parsed.protocol))
    throw Error("URL PostgreSQL inválida.");
  const local =
    ["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname) &&
    !process.env.VERCEL;
  // URL options must not weaken remote TLS verification.
  for (const name of ["sslmode", "ssl", "sslcert", "sslkey", "sslrootcert"])
    parsed.searchParams.delete(name);
  pg = postgres(parsed.toString(), {
    ssl: local ? false : { rejectUnauthorized: true },
    max: 1,
    idle_timeout: 10,
    connect_timeout: 10,
    max_lifetime: 60,
    prepare: false,
    connection: { search_path: "fish,public" },
    onnotice: () => {},
  });
  try {
    await pg.begin(async (sql) => {
      await sql`SELECT pg_advisory_xact_lock(72418608227)`;
      await sql`CREATE SCHEMA IF NOT EXISTS fish`;
      for (const query of [
        "CREATE TABLE IF NOT EXISTS fish.settings(id INTEGER PRIMARY KEY CHECK(id=1),data TEXT NOT NULL)",
        "CREATE TABLE IF NOT EXISTS fish.products(id TEXT PRIMARY KEY,data TEXT NOT NULL)",
        "CREATE TABLE IF NOT EXISTS fish.orders(id BIGSERIAL PRIMARY KEY,token_hash TEXT UNIQUE NOT NULL,idempotency TEXT UNIQUE NOT NULL,payload_hash TEXT NOT NULL,data TEXT NOT NULL,created TEXT NOT NULL)",
        "CREATE TABLE IF NOT EXISTS fish.admins(id INTEGER PRIMARY KEY CHECK(id=1),hash TEXT NOT NULL)",
        "CREATE TABLE IF NOT EXISTS fish.sessions(hash TEXT PRIMARY KEY,expires BIGINT NOT NULL)",
        "CREATE TABLE IF NOT EXISTS fish.attempts(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires BIGINT NOT NULL)",
      ])
        await sql.unsafe(query);
      await sql`INSERT INTO fish.settings VALUES(1,${JSON.stringify(initialSettings)}) ON CONFLICT(id) DO NOTHING`;
      for (const p of catalog)
        await sql`INSERT INTO fish.products VALUES(${p.id},${JSON.stringify(p)}) ON CONFLICT(id) DO NOTHING`;
    });
    return adapter(pg);
  } catch (e) {
    await pg.end({ timeout: 1 });
    pg = null;
    throw e;
  }
}
export async function storage() {
  if (!databaseUrl())
    return {
      ...database(),
      prepare: (q) => database().prepare(q),
      lock: async (q, ...args) =>
        database()
          .prepare(q)
          .get(...args),
      postgres: false,
    };
  if (!initialization)
    initialization = initializePostgres().catch((e) => {
      initialization = null;
      throw e;
    });
  return initialization;
}
let queue = Promise.resolve();
export async function transaction(fn) {
  const store = await storage();
  if (store.postgres) return pg.begin((sql) => fn(adapter(sql)));
  // Serialize asynchronous transactions on the single SQLite connection.
  const run = queue.then(async () => {
    const local = database();
    local.exec("BEGIN IMMEDIATE");
    try {
      const result = await fn(store);
      local.exec("COMMIT");
      return result;
    } catch (e) {
      local.exec("ROLLBACK");
      throw e;
    }
  });
  queue = run.catch(() => {});
  return run;
}
export async function settings(store) {
  store ||= await storage();
  return JSON.parse(
    (await store.prepare("SELECT data FROM settings WHERE id=1").get()).data,
  );
}
export async function products(store) {
  store ||= await storage();
  const rows = await store
    .prepare("SELECT data FROM products ORDER BY id")
    .all();
  return rows
    .map((r) => JSON.parse(r.data))
    .sort((a, b) => {
      const order = (id) => {
        const n = catalog.findIndex((p) => p.id === id);
        return n < 0 ? catalog.length : n;
      };
      return order(a.id) - order(b.id) || a.name.localeCompare(b.name, "pt-BR");
    });
}
export async function saveSettings(s) {
  const store = await storage();
  await store
    .prepare("UPDATE settings SET data=? WHERE id=1")
    .run(JSON.stringify(s));
}
export async function saveProduct(p) {
  const store = await storage();
  await store
    .prepare(
      "INSERT INTO products VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data",
    )
    .run(p.id, JSON.stringify(p));
}
export async function closeStorage() {
  if (pg) await pg.end({ timeout: 5 });
  pg = null;
  initialization = null;
}
