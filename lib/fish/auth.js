import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { storage, transaction, databaseUrl } from "./db.js";
export const digest = (s) => createHash("sha256").update(s).digest("hex");
export function passwordHash(password) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password, hash) {
  if (
    typeof password !== "string" ||
    password.length > 256 ||
    !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(hash)
  )
    return false;
  const [salt, h] = hash.split(":");
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(h, "hex"));
}
export async function authorized(req) {
  const raw = req.headers.cookie
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("fish_session="))
    ?.slice(13);
  if (!raw) return false;
  const store = await storage();
  return (
    (
      await store
        .prepare("SELECT expires FROM sessions WHERE hash=?")
        .get(digest(raw))
    )?.expires > Date.now()
  );
}
export function clientAddress(req) {
  return process.env.VERCEL
    ? String(req.headers["x-forwarded-for"] || req.socket.remoteAddress)
        .split(",")[0]
        .trim()
    : req.socket.remoteAddress;
}
export async function limit(key, max = 20) {
  return transaction(async (store) => {
    const now = Date.now();
    const row = await store
      .prepare(
        `INSERT INTO attempts VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN attempts.expires<? THEN 1 ELSE attempts.count+1 END,expires=CASE WHEN attempts.expires<? THEN excluded.expires ELSE attempts.expires END RETURNING count`,
      )
      .get(key, now + 900000, now, now);
    return row.count <= max;
  });
}
async function adminHash() {
  const store = await storage();
  const admin = await store.prepare("SELECT hash FROM admins WHERE id=1").get();
  if (admin) return admin.hash;
  const password = process.env.FISH_ADMIN_PASSWORD;
  if (password && password.length >= 16 && password.length <= 256) {
    await store
      .prepare("INSERT INTO admins VALUES(1,?) ON CONFLICT(id) DO NOTHING")
      .run(passwordHash(password));
    return (await store.prepare("SELECT hash FROM admins WHERE id=1").get())
      .hash;
  }
  return null;
}
export async function login(req, res, password) {
  if (!(await limit("login:" + clientAddress(req), 10)))
    return res
      .status(429)
      .json({ error: "Muitas tentativas. Aguarde 15 minutos." });
  const hash = await adminHash();
  if (!hash)
    return res
      .status(503)
      .json({
        error:
          "Administrador não configurado. Na Vercel, configure FISH_ADMIN_PASSWORD com pelo menos 16 caracteres e faça Redeploy.",
      });
  if (!verifyPassword(password, hash))
    return res.status(401).json({ error: "Senha inválida." });
  const token = randomBytes(32).toString("hex");
  const store = await storage();
  await store.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
  await store
    .prepare("INSERT INTO sessions VALUES(?,?)")
    .run(digest(token), Date.now() + 8 * 3600000);
  res.setHeader(
    "Set-Cookie",
    `fish_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.NODE_ENV === "production" && process.env.FISH_SECURE_COOKIE !== "false" ? "; Secure" : ""}`,
  );
  return res.json({ ok: true });
}
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return !req.headers["sec-fetch-site"];
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}
