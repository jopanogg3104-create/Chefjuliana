import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { passwordHash } from "../lib/fish/auth.js";
test("fluxo real Next.js + SQLite: pedidos, segurança, painel e persistência", async () => {
  const dir = mkdtempSync(join(tmpdir(), "fish-test-")),
    path = join(dir, "test.sqlite");
  const db = new DatabaseSync(path);
  db.exec("CREATE TABLE admins(id INTEGER PRIMARY KEY,hash TEXT NOT NULL)");
  db.prepare("INSERT INTO admins VALUES(1,?)").run(
    passwordHash("senha-exclusiva-de-teste"),
  );
  let child;
  const base = "http://127.0.0.1:3199";
  async function start() {
    child = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "-p", "3199"],
      {
        env: {
          ...process.env,
          FISH_DB_PATH: path,
          FISH_SECURE_COOKIE: "false",
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    await new Promise((ok, bad) => {
      let output = "";
      const t = setTimeout(
        () => bad(Error("Servidor não iniciou: " + output)),
        30000,
      );
      child.stdout.on("data", (c) => {
        output += c;
        if (output.includes("Ready")) {
          clearTimeout(t);
          ok();
        }
      });
      child.stderr.on("data", (c) => {
        output += c;
      });
      child.on("exit", (c) => {
        clearTimeout(t);
        bad(Error("Servidor saiu: " + c + " " + output));
      });
    });
  }
  async function stop() {
    if (child?.exitCode === null)
      await new Promise((ok) => {
        child.once("exit", ok);
        child.kill();
      });
  }
  let cookie = "";
  async function request(action, data, auth = false, extra = {}) {
    const r = await fetch(base + "/api/fish?action=" + action, {
      method: data === undefined ? "GET" : "POST",
      headers: {
        ...(data === undefined
          ? {}
          : { "Content-Type": "application/json", Origin: base }),
        ...(auth ? { Cookie: cookie } : {}),
        ...extra,
      },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    return { code: r.status, body: await r.json(), r };
  }
  try {
    await start();
    for (const route of ["/", "/atendimento", "/privacidade"]) {
      const r = await fetch(base + route);
      assert.equal(r.status, 200);
      assert.match(await r.text(), /The Fish/);
    }
    assert.equal((await request("admin")).code, 401);
    assert.equal((await request("login", { password: "errada" })).code, 401);
    const logged = await request("login", {
      password: "senha-exclusiva-de-teste",
    });
    assert.equal(logged.code, 200);
    cookie = logged.r.headers.get("set-cookie").split(";")[0];
    assert.match(logged.r.headers.get("set-cookie"), /HttpOnly/);
    let s = (await request("catalog")).body.settings;
    assert.equal(s.timezone, "America/Sao_Paulo");
    assert.equal(s.payments.length, 0);
    assert.equal(
      (
        await request("settings", s, true, {
          Origin: "https://intruso.example",
        })
      ).code,
      403,
    );
    const payload = {
      key: randomUUID(),
      items: [
        { id: "parmegiana", quantity: 2, variant: "Tilápia", notes: "Sem sal" },
      ],
      customer: { name: "Cliente teste", phone: "14999999999" },
      mode: "pickup",
      payment: "dinheiro",
    };
    s = {
      ...s,
      hours: Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, []])),
      payments: [{ id: "dinheiro", name: "Dinheiro no atendimento" }],
    };
    assert.equal((await request("settings", s, true)).code, 200);
    assert.equal((await request("order", payload)).code, 422);
    s.hours = Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => [i, [["00:00", "23:59"]]]),
    );
    assert.equal((await request("settings", s, true)).code, 200);
    for (const edit of [
      { items: [{ id: "parmegiana", quantity: 1 }] },
      { items: [{ id: "picadinho", quantity: 1 }] },
      { items: [{ id: "grelhados", variant: "Filé de frango", quantity: 1 }] },
      {
        items: [
          {
            id: "pescador",
            quantity: 1,
            options: ["tilapia", "merluza", "pintado"],
          },
        ],
      },
      { mode: "delivery" },
      { payment: "inexistente" },
    ])
      assert.equal(
        (await request("order", { ...payload, ...edit, key: randomUUID() }))
          .code,
        422,
      );
    let list = (await request("admin", undefined, true)).body.products;
    const tilapia = list.find((p) => p.id === "tilapia");
    assert.equal(
      (await request("product", { ...tilapia, available: false }, true)).code,
      200,
    );
    assert.equal(
      (
        await request("order", {
          ...payload,
          key: randomUUID(),
          items: [{ id: "tilapia", quantity: 1 }],
        })
      ).code,
      422,
    );
    await request("product", tilapia, true);
    const p = list.find((p) => p.id === "pescador");
    assert.equal(
      (
        await request(
          "product",
          { ...p, eligible: ["camarao", "tilapia", "merluza"] },
          true,
        )
      ).code,
      422,
    );
    assert.equal(
      (
        await request(
          "product",
          { ...p, eligible: ["tilapia", "merluza", "pintado"] },
          true,
        )
      ).code,
      200,
    );
    assert.equal(
      (
        await request("order", {
          ...payload,
          key: randomUUID(),
          items: [
            {
              id: "pescador",
              quantity: 1,
              options: ["tilapia", "tilapia", "pintado"],
            },
          ],
        })
      ).code,
      422,
    );
    const combo = await request("order", {
      ...payload,
      key: randomUUID(),
      items: [
        {
          id: "pescador",
          quantity: 1,
          options: ["tilapia", "merluza", "pintado"],
        },
      ],
    });
    assert.equal(combo.code, 201);
    db.exec(
      "CREATE TRIGGER reject_test_orders BEFORE INSERT ON orders BEGIN SELECT RAISE(ABORT, 'falha de escrita de teste'); END;",
    );
    assert.equal((await request("order", payload)).code, 503);
    db.exec("DROP TRIGGER reject_test_orders");
    const created = await request("order", payload);
    assert.equal(created.code, 201);
    assert.equal(created.body.token.length, 64);
    const duplicate = await request("order", payload);
    assert.equal(duplicate.body.number, created.body.number);
    assert.equal(duplicate.body.duplicate, true);
    assert.equal(
      (
        await request("order", {
          ...payload,
          customer: { ...payload.customer, name: "Outro nome" },
        })
      ).code,
      422,
    );
    const track = () => request("track&token=" + created.body.token);
    let o = (await track()).body;
    assert.equal(o.total, 11600);
    assert.equal(o.paymentStatus, "Pendente");
    assert.equal(o.customer.phone, undefined);
    assert.equal((await request("track&token=" + "f".repeat(64))).code, 404);
    let orders = (await request("admin", undefined, true)).body.orders;
    assert.equal(orders.length, 2);
    assert.equal(
      orders.find((o) => o.number === created.body.number).customer.phone,
      "14999999999",
    );
    await request(
      "product",
      {
        ...list.find((p) => p.id === "parmegiana"),
        price: 9900,
        variants: [{ name: "Tilápia", price: 9900 }],
      },
      true,
    );
    assert.equal((await track()).body.total, 11600);
    assert.equal(
      (
        await request(
          "status",
          { number: created.body.number, status: "Saiu para entrega" },
          true,
        )
      ).code,
      422,
    );
    for (const status of [
      "Confirmado",
      "Em preparo",
      "Pronto para retirada",
      "Concluído",
    ])
      assert.equal(
        (await request("status", { number: created.body.number, status }, true))
          .code,
        200,
      );
    assert.equal((await track()).body.status, "Concluído");
    assert.equal((await track()).body.events.length, 5);
    assert.equal(
      (
        await request(
          "status",
          { number: combo.body.number, status: "Recusado" },
          true,
        )
      ).code,
      422,
    );
    assert.equal(
      (
        await request(
          "status",
          {
            number: combo.body.number,
            status: "Recusado",
            reason: "Produto esgotado",
          },
          true,
        )
      ).code,
      200,
    );
    await request(
      "payment",
      { number: created.body.number, paymentStatus: "Pago presencialmente" },
      true,
    );
    assert.equal((await track()).body.paymentStatus, "Pago presencialmente");
    await request(
      "estimate",
      { number: created.body.number, estimate: "30 minutos" },
      true,
    );
    assert.equal((await track()).body.estimate, "30 minutos");
    s.delivery = true;
    s.deliveryAreas = [{ name: "Vila Nova", fee: 800 }];
    await request("settings", s, true);
    const delivery = {
      ...payload,
      key: randomUUID(),
      mode: "delivery",
      items: [{ id: "bife", quantity: 1 }],
      address: {
        street: "Rua Teste",
        number: "10",
        neighborhood: "Vila Nova",
        extra: "",
      },
    };
    assert.equal(
      (
        await request("order", {
          ...delivery,
          address: { ...delivery.address, neighborhood: "Sem taxa" },
        })
      ).code,
      422,
    );
    const delivered = await request("order", delivery);
    assert.equal(delivered.code, 201);
    const deliveredOrder = (
      await request("track&token=" + delivered.body.token)
    ).body;
    assert.equal(deliveredOrder.total, 5000);
    for (const status of [
      "Confirmado",
      "Em preparo",
      "Saiu para entrega",
      "Concluído",
    ])
      assert.equal(
        (
          await request(
            "status",
            { number: delivered.body.number, status },
            true,
          )
        ).code,
        200,
      );
    s.paused = true;
    await request("settings", s, true);
    assert.equal(
      (await request("order", { ...payload, key: randomUUID() })).code,
      422,
    );
    assert.equal((await request("order", payload)).body.duplicate, true);
    await stop();
    await start();
    assert.equal((await track()).body.status, "Concluído");
    assert.equal((await track()).body.total, 11600);
    assert.equal(
      (await request("admin", undefined, true)).body.orders.length,
      3,
    );
    await request("logout", {}, true);
    assert.equal((await request("admin", undefined, true)).code, 401);
  } finally {
    await stop();
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
