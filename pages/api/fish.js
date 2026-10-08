import {
  storage,
  transaction,
  settings,
  products,
  saveSettings,
  saveProduct,
  databaseUrl,
} from "../../lib/fish/db.js";
import {
  catalog,
  initialSettings,
  nextStatuses,
} from "../../lib/fish/catalog.js";
import { opening } from "../../lib/fish/hours.js";
import {
  authorized,
  login,
  digest,
  sameOrigin,
  limit,
  clientAddress,
} from "../../lib/fish/auth.js";
import {
  validateOrder,
  validateProduct,
  validateSettings,
  Invalid,
} from "../../lib/fish/validation.js";
export const config = {
  api: { bodyParser: { sizeLimit: "150kb" } },
  maxDuration: 30,
};
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  const action = req.query.action;
  try {
    if (req.method !== "GET" && !sameOrigin(req))
      return res.status(403).json({ error: "Origem não autorizada." });
    if (process.env.VERCEL && !databaseUrl()) {
      if (action === "catalog" && req.method === "GET")
        return res.json({
          settings: { ...initialSettings, reviewNotes: undefined },
          products: catalog,
          opening: opening(initialSettings),
          ordersAvailable: false,
        });
      return res
        .status(503)
        .json({
          error:
            "Pedidos online ainda não habilitados. Configure o banco PostgreSQL nas variáveis do projeto da Vercel e faça Redeploy.",
        });
    }
    if (action === "catalog" && req.method === "GET") {
      const s = await settings();
      return res.json({
        settings: { ...s, reviewNotes: undefined },
        products: await products(),
        opening: opening(s),
        ordersAvailable: true,
      });
    }
    if (action === "login" && req.method === "POST")
      return await login(req, res, req.body.password);
    if (action === "logout" && req.method === "POST") {
      const token = req.headers.cookie
        ?.split(";")
        .map((s) => s.trim())
        .find((s) => s.startsWith("fish_session="))
        ?.slice(13);
      if (token)
        await (
          await storage()
        )
          .prepare("DELETE FROM sessions WHERE hash=?")
          .run(digest(token));
      res.setHeader(
        "Set-Cookie",
        "fish_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
      );
      return res.json({ ok: true });
    }
    if (action === "track" && req.method === "GET") {
      if (
        typeof req.query.token !== "string" ||
        !/^[a-f0-9]{64}$/.test(req.query.token)
      )
        return res.status(404).json({ error: "Pedido não encontrado." });
      const row = await (
        await storage()
      )
        .prepare("SELECT id,data,created FROM orders WHERE token_hash=?")
        .get(digest(req.query.token));
      if (!row)
        return res.status(404).json({ error: "Pedido não encontrado." });
      const o = JSON.parse(row.data);
      return res.json({
        number: Number(row.id),
        ...o,
        customer: { name: o.customer.name },
        address: undefined,
        created: row.created,
        contact: (await settings()).whatsapp,
      });
    }
    if (action === "order" && req.method === "POST") {
      if (!(await limit("order:" + clientAddress(req), 100)))
        return res
          .status(429)
          .json({ error: "Muitas solicitações. Aguarde alguns minutos." });
      const raw = req.body;
      if (
        !raw ||
        typeof raw.key !== "string" ||
        !/^[0-9a-f-]{36}$/i.test(raw.key)
      )
        throw new Invalid("Identificador de envio inválido.");
      const hash = digest(JSON.stringify(raw));
      const result = await transaction(async (store) => {
        // Lock the settings row before checking idempotency, serializing order creation across instances.
        const setting = await store.lock(
          "SELECT data FROM settings WHERE id=1",
        );
        const old = await store
          .prepare("SELECT id,payload_hash FROM orders WHERE idempotency=?")
          .get(raw.key);
        const token = digest("tracking:" + raw.key);
        if (old) {
          if (old.payload_hash !== hash)
            throw new Invalid(
              "Esta tentativa já foi salva com outro conteúdo. Consulte o pedido recebido.",
            );
          return { number: Number(old.id), token, duplicate: true };
        }
        const order = validateOrder(
          raw,
          JSON.parse(setting.data),
          await products(store),
        );
        const r = await store
          .prepare(
            "INSERT INTO orders(token_hash,idempotency,payload_hash,data,created) VALUES(?,?,?,?,?)",
          )
          .run(
            digest(token),
            raw.key,
            hash,
            JSON.stringify(order),
            new Date().toISOString(),
          );
        return { number: Number(r.lastInsertRowid), token };
      });
      return res.status(result.duplicate ? 200 : 201).json(result);
    }
    if (
      [
        "admin",
        "history",
        "settings",
        "product",
        "status",
        "payment",
        "estimate",
      ].includes(action)
    ) {
      if (!(await authorized(req)))
        return res
          .status(401)
          .json({ error: "Faça login para acessar o painel." });
      if (["admin", "history"].includes(action) && req.method === "GET") {
        const before =
          typeof req.query.before === "string" && /^\d+$/.test(req.query.before)
            ? Number(req.query.before)
            : Number.MAX_SAFE_INTEGER;
        const rows = await (
          await storage()
        )
          .prepare(
            "SELECT id,data,created FROM orders WHERE id<? ORDER BY id DESC LIMIT 500",
          )
          .all(before);
        return res.json({
          orders: rows.map((r) => ({
            number: Number(r.id),
            ...JSON.parse(r.data),
            created: r.created,
          })),
          hasMore: rows.length === 500,
          ...(action === "admin"
            ? { settings: await settings(), products: await products() }
            : {}),
        });
      }
      if (action === "settings" && req.method === "POST") {
        await saveSettings(validateSettings(req.body));
        return res.json({ ok: true });
      }
      if (action === "product" && req.method === "POST") {
        await saveProduct(
          validateProduct(req.body, await products(), await settings()),
        );
        return res.json({ ok: true });
      }
      if (
        ["status", "payment", "estimate"].includes(action) &&
        req.method === "POST"
      ) {
        await transaction(async (store) => {
          const row = await store.lock(
            "SELECT data FROM orders WHERE id=?",
            req.body.number,
          );
          if (!row) throw new Invalid("Pedido não encontrado.");
          const order = JSON.parse(row.data);
          if (action === "status") {
            if (!nextStatuses(order).includes(req.body.status))
              throw new Invalid("Transição de status inválida.");
            if (
              req.body.status === "Recusado" &&
              (typeof req.body.reason !== "string" ||
                !req.body.reason.trim() ||
                req.body.reason.length > 500)
            )
              throw new Invalid("Informe o motivo da recusa.");
            order.status = req.body.status;
            order.reason = req.body.reason || "";
            order.events.push({
              status: order.status,
              at: new Date().toISOString(),
            });
          }
          if (action === "estimate" || req.body.estimate !== undefined) {
            if (
              typeof req.body.estimate !== "string" ||
              req.body.estimate.length > 250
            )
              throw new Invalid("Previsão inválida.");
            order.estimate = req.body.estimate;
          }
          if (action === "payment") {
            if (
              !["Pendente", "Pago presencialmente"].includes(
                req.body.paymentStatus,
              )
            )
              throw new Invalid("Pagamento inválido.");
            order.paymentStatus = req.body.paymentStatus;
          }
          await store
            .prepare("UPDATE orders SET data=? WHERE id=?")
            .run(JSON.stringify(order), req.body.number);
        });
        return res.json({ ok: true });
      }
    }
    return res.status(405).json({ error: "Operação não permitida." });
  } catch (e) {
    if (e instanceof Invalid)
      return res.status(422).json({ error: e.message, field: e.field });
    console.error("Fish API:", e.code || e.name);
    return res
      .status(503)
      .json({
        error:
          "Não foi possível concluir. Seus dados foram preservados; tente novamente.",
      });
  }
}
