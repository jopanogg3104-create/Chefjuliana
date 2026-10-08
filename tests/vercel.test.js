import { test } from "node:test";
import assert from "node:assert/strict";
import { catalog, initialSettings } from "../lib/fish/catalog.js";
import { isOpen, opening, validSchedule } from "../lib/fish/hours.js";
import {
  lineItem,
  validateSettings,
  validateOrder,
} from "../lib/fish/validation.js";
const date = (s) => new Date(s + "-03:00");
test("horário Brasília: dias fechados, almoço, intervalo, jantar e limite", () => {
  for (const [value, expected] of [
    ["2026-10-08T10:59:00", false],
    ["2026-10-08T11:00:00", true],
    ["2026-10-08T13:59:00", true],
    ["2026-10-08T14:00:00", false],
    ["2026-10-08T17:59:00", false],
    ["2026-10-08T18:00:00", true],
    ["2026-10-08T23:00:00", false],
    ["2026-10-11T12:00:00", false],
    ["2026-10-12T12:00:00", false],
  ])
    assert.equal(isOpen(initialSettings, date(value)), expected, value);
  assert.match(
    opening(initialSettings, date("2026-10-08T15:00:00")).next,
    /08\/10\/2026 às 18:00/,
  );
  assert.equal(
    isOpen(
      { ...initialSettings, cutoffMinutes: 30 },
      date("2026-10-08T13:30:00"),
    ),
    false,
  );
  assert.equal(
    isOpen(
      { ...initialSettings, exceptions: { "2026-10-08": [] } },
      date("2026-10-08T12:00:00"),
    ),
    false,
  );
  assert.equal(
    isOpen({ ...initialSettings, paused: true }, date("2026-10-08T12:00:00")),
    false,
  );
});
test("agendamento exige dia/horário válido e dentro de 14 dias", () => {
  const s = { ...initialSettings, scheduling: true },
    now = date("2026-10-07T12:00:00");
  assert.equal(validSchedule(s, "2026-10-08T12:00", now), true);
  for (const v of [
    "2026-10-08T15:00",
    "2026-10-11T12:00",
    "2026-11-05T12:00",
    "2026-10-02T12:00",
    "inválido",
  ])
    assert.equal(validSchedule(s, v, now), false);
  assert.equal(validSchedule(initialSettings, "2026-10-08T12:00", now), false);
  const raw = {
    key: "12345678-1234-1234-1234-123456789012",
    items: [{ id: "bife", quantity: 1 }],
    customer: { name: "Teste", phone: "14999999999" },
    mode: "pickup",
    payment: "dinheiro",
    scheduledAt: "2026-10-08T12:00",
  };
  assert.equal(
    validateOrder(
      raw,
      { ...s, payments: [{ id: "dinheiro", name: "Dinheiro" }] },
      catalog,
      now,
    ).scheduledAt,
    "2026-10-08T12:00",
  );
});
test("cardápio preserva porções, preços, escolhas e produtos sob consulta", () => {
  assert.equal(catalog.length, 30);
  for (const id of ["moranga", "chiclete", "havaiano"])
    assert.match(
      catalog.find((p) => p.id === id).portion,
      /6 unidades de camarão — 32 g/,
    );
  assert.match(
    catalog.find((p) => p.id === "camarao").portion,
    /500 g.*25 unidades/,
  );
  assert.equal(catalog.filter((p) => p.price === null).length, 3);
  assert.throws(() =>
    lineItem(
      { id: "grelhados", variant: "Filé de frango", quantity: 1 },
      catalog,
    ),
  );
  assert.equal(
    lineItem(
      {
        id: "grelhados",
        variant: "Filé de frango",
        preparation: "À milanesa",
        quantity: 2,
      },
      catalog,
    ).subtotal,
    7600,
  );
  assert.throws(() =>
    lineItem({ id: "parmegiana", variant: "Tilápia", quantity: -1 }, catalog),
  );
  assert.equal(
    lineItem(
      { id: "parmegiana", variant: "Camarão", quantity: 1, unitPrice: 1 },
      catalog,
    ).unitPrice,
    7800,
  );
});
test("configurações inválidas são rejeitadas", () => {
  assert.equal(validateSettings(initialSettings).timezone, "America/Sao_Paulo");
  for (const patch of [
    { hours: { ...initialSettings.hours, 4: [["14:00", "11:00"]] } },
    { deliveryAreas: [{ name: "Teste", fee: null }] },
    { payments: [{ id: "online", name: "" }] },
    { cutoffMinutes: -1 },
    { logo: "javascript:alert(1)" },
  ])
    assert.throws(() => validateSettings({ ...initialSettings, ...patch }));
});
