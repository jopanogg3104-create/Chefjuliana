import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
const url = process.env.FISH_TEST_POSTGRES_URL;
async function server(port, env) {
  const child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
    { env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] },
  );
  await new Promise((ok, bad) => {
    let out = "";
    const timer = setTimeout(() => bad(Error("Não iniciou: " + out)), 20000);
    child.stdout.on("data", (c) => {
      out += c;
      if (out.includes("Ready")) {
        clearTimeout(timer);
        ok();
      }
    });
    child.stderr.on("data", (c) => (out += c));
    child.on("exit", (code) => {
      clearTimeout(timer);
      bad(Error("Saiu: " + code + " " + out));
    });
  });
  return child;
}
async function stop(child) {
  if (child?.exitCode === null)
    await new Promise((ok) => {
      child.once("exit", ok);
      child.kill();
    });
}
test("Vercel sem banco: catálogo consultável, pedido não é confirmado", async () => {
  let child;
  try {
    child = await server(3203, {
      VERCEL: "1",
      DATABASE_URL: "",
      POSTGRES_URL: "",
      FISH_DB_PATH: "/caminho/que/nao/deve/ser/usado",
    });
    const r = await fetch("http://127.0.0.1:3203/api/fish?action=catalog");
    const d = await r.json();
    assert.equal(r.status, 200);
    assert.equal(d.products.length, 30);
    assert.equal(d.ordersAvailable, false);
    const order = await fetch("http://127.0.0.1:3203/api/fish?action=order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://127.0.0.1:3203",
      },
      body: "{}",
    });
    assert.equal(order.status, 503);
    assert.match((await order.json()).error, /PostgreSQL/);
  } finally {
    await stop(child);
  }
});
test(
  "PostgreSQL real: transações, concorrência, login e persistência serverless",
  { skip: !url },
  async () => {
    // This suite only accepts an explicitly provisioned, local disposable database.
    const parsed = new URL(url);
    assert.equal(parsed.hostname, "127.0.0.1");
    assert.equal(parsed.pathname, "/fish_test");
    const sql = postgres(url, { ssl: false, max: 2, onnotice: () => {} });
    await sql`DROP SCHEMA IF EXISTS fish CASCADE`;
    let child,
      cookie = "";
    const base = "http://127.0.0.1:3202";
    const env = {
      DATABASE_URL: url,
      POSTGRES_URL: "",
      VERCEL: "",
      FISH_ADMIN_PASSWORD: "senha-isolada-postgres-123",
      FISH_SECURE_COOKIE: "false",
    };
    async function request(action, data, auth = false) {
      const r = await fetch(base + "/api/fish?action=" + action, {
        method: data === undefined ? "GET" : "POST",
        headers: {
          ...(data === undefined
            ? {}
            : { "Content-Type": "application/json", Origin: base }),
          ...(auth ? { Cookie: cookie } : {}),
        },
        body: data === undefined ? undefined : JSON.stringify(data),
      });
      return { code: r.status, body: await r.json(), r };
    }
    try {
      child = await server(3202, env);
      const c = await request("catalog");
      assert.equal(c.code, 200);
      assert.equal(c.body.products.length, 30);
      assert.equal(c.body.ordersAvailable, true);
      assert.equal((await request("admin")).code, 401);
      const l = await request("login", { password: env.FISH_ADMIN_PASSWORD });
      assert.equal(l.code, 200);
      cookie = l.r.headers.get("set-cookie").split(";")[0];
      const hashes = await sql`SELECT hash FROM fish.admins`;
      assert.notEqual(hashes[0].hash, env.FISH_ADMIN_PASSWORD);
      const s = {
        ...c.body.settings,
        hours: Object.fromEntries(
          Array.from({ length: 7 }, (_, i) => [i, [["00:00", "23:59"]]]),
        ),
        payments: [{ id: "dinheiro", name: "Dinheiro na retirada" }],
      };
      assert.equal((await request("settings", s, true)).code, 200);
      const raw = {
        key: randomUUID(),
        items: [
          {
            id: "parmegiana",
            variant: "Camarão",
            quantity: 2,
            notes: "Teste isolado",
          },
        ],
        mode: "pickup",
        customer: { name: "Teste PostgreSQL", phone: "14999999999" },
        payment: "dinheiro",
      };
      const responses = await Promise.all(
        Array.from({ length: 6 }, () => request("order", raw)),
      );
      assert.equal(responses.filter((r) => r.code === 201).length, 1);
      assert.equal(responses.filter((r) => r.body.duplicate).length, 5);
      const created = responses.find((r) => r.code === 201).body;
      assert.equal(new Set(responses.map((r) => r.body.number)).size, 1);
      assert.equal(
        Number((await sql`SELECT COUNT(*) AS n FROM fish.orders`)[0].n),
        1,
      );
      const tracking = () => request("track&token=" + created.token);
      assert.equal((await tracking()).body.total, 15600);
      assert.equal((await tracking()).body.paymentStatus, "Pendente");
      assert.equal(
        (
          await request("order", {
            ...raw,
            customer: { ...raw.customer, name: "Mudou" },
          })
        ).code,
        422,
      );
      const duplicateStatus = await Promise.all([
        request(
          "status",
          { number: created.number, status: "Confirmado" },
          true,
        ),
        request(
          "status",
          { number: created.number, status: "Confirmado" },
          true,
        ),
      ]);
      assert.equal(duplicateStatus.filter((r) => r.code === 200).length, 1);
      assert.equal(duplicateStatus.filter((r) => r.code === 422).length, 1);
      for (const status of ["Em preparo", "Pronto para retirada", "Concluído"])
        assert.equal(
          (await request("status", { number: created.number, status }, true))
            .code,
          200,
        );
      await stop(child);
      child = await server(3202, {
        ...env,
        FISH_ADMIN_PASSWORD: "outra-senha-nao-substitui-123",
      });
      assert.equal((await tracking()).body.status, "Concluído");
      assert.equal(
        (await request("admin", undefined, true)).body.orders.length,
        1,
      );
      assert.equal(
        (await request("login", { password: env.FISH_ADMIN_PASSWORD })).code,
        200,
      );
      s.paused = true;
      await request("settings", s, true);
      assert.equal(
        (await request("order", { ...raw, key: randomUUID() })).code,
        422,
      );
      assert.equal((await request("order", raw)).body.duplicate, true);
    } finally {
      await stop(child);
      await sql`DROP SCHEMA IF EXISTS fish CASCADE`;
      await sql.end({ timeout: 2 });
    }
  },
);
