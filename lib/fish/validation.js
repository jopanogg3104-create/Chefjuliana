import { validSchedule, isOpen } from "./hours.js";
export class Invalid extends Error {
  constructor(message, field = "") {
    super(message);
    this.field = field;
    this.status = 422;
  }
}
const fail = (m, f) => {
  throw new Invalid(m, f);
};
const text = (v, min, max, label, field) => {
  if (typeof v !== "string" || v.trim().length < min || v.length > max)
    fail(`${label}: preencha entre ${min} e ${max} caracteres.`, field);
  return v.trim();
};
export function lineItem(raw, list) {
  if (!raw || typeof raw !== "object") fail("Item inválido.");
  const p = list.find((p) => p.id === raw.id);
  if (!p || !p.available) fail("Produto indisponível. Atualize o cardápio.");
  if (p.price === null) fail(`${p.name}: consulte o restaurante.`);
  if (!Number.isInteger(raw.quantity) || raw.quantity < 1 || raw.quantity > 30)
    fail("Quantidade inválida.");
  let price = p.price;
  let choices = [];
  if (p.variants?.length) {
    const v = p.variants.find((v) => v.name === raw.variant);
    if (!v) fail(`Escolha uma variante de ${p.name}.`);
    price = v.price;
    choices.push(v.name);
  } else if (raw.variant) fail("Variante inválida.");
  if (p.preparations?.length) {
    if (!p.preparations.includes(raw.preparation))
      fail(`Escolha o preparo de ${p.name}.`);
    choices.push(raw.preparation);
  } else if (raw.preparation) fail("Preparo inválido.");
  if (p.combo) {
    if (!Array.isArray(raw.options) || raw.options.length !== 3)
      fail(`${p.name}: selecione exatamente 3 opções.`);
    if (!p.repeat && new Set(raw.options).size !== 3)
      fail("As opções não podem se repetir.");
    for (const id of raw.options) {
      const option = list.find((i) => i.id === id);
      if (!p.eligible.includes(id) || !option?.available)
        fail("Opção de combinado indisponível.");
      choices.push(option.name);
    }
  } else if (raw.options?.length) fail("Opções inválidas.");
  const notes =
    raw.notes === undefined
      ? ""
      : text(raw.notes, 0, 500, "Observações", "notes");
  return {
    id: p.id,
    name: p.name,
    quantity: raw.quantity,
    unitPrice: price,
    subtotal: price * raw.quantity,
    choices,
    notes,
  };
}
export function validateOrder(raw, s, list, now = new Date()) {
  if (!raw || typeof raw !== "object") fail("Pedido inválido.");
  if (typeof raw.key !== "string" || !/^[0-9a-f-]{36}$/i.test(raw.key))
    fail("Identificador de envio inválido.");
  if (s.paused) fail("Recebimento de pedidos pausado.");
  if (raw.scheduledAt) {
    if (!validSchedule(s, raw.scheduledAt, now))
      fail(
        "Escolha um horário disponível nos próximos 14 dias.",
        "scheduledAt",
      );
  } else if (!isOpen(s, now))
    fail("Estamos fechados. Consulte a próxima abertura.");
  if (!Array.isArray(raw.items) || !raw.items.length || raw.items.length > 60)
    fail("Selecione de 1 a 60 itens.");
  const items = raw.items.map((i) => lineItem(i, list));
  const customer = {
    name: text(raw.customer?.name, 2, 120, "Nome", "name"),
    phone: text(raw.customer?.phone, 10, 30, "Telefone", "phone"),
  };
  if (!/^\d{10,13}$/.test(customer.phone.replace(/\D/g, "")))
    fail("Informe telefone com DDD.", "phone");
  if (!["pickup", "delivery"].includes(raw.mode) || !s[raw.mode])
    fail("Modalidade não disponível.", "mode");
  let fee = 0,
    address = null;
  if (raw.mode === "delivery") {
    address = {
      street: text(raw.address?.street, 2, 180, "Endereço", "street"),
      number: text(raw.address?.number, 1, 20, "Número", "number"),
      neighborhood: text(
        raw.address?.neighborhood,
        2,
        120,
        "Bairro",
        "neighborhood",
      ),
      extra: text(raw.address?.extra || "", 0, 200, "Complemento", "extra"),
    };
    const area = s.deliveryAreas.find(
      (a) =>
        a.name.toLocaleLowerCase("pt-BR") ===
        address.neighborhood.toLocaleLowerCase("pt-BR"),
    );
    if (!area || !Number.isInteger(area.fee) || area.fee < 0)
      fail(
        "Bairro fora da área atendida ou taxa não configurada.",
        "neighborhood",
      );
    fee = area.fee;
  }
  if (!s.payments.some((p) => p.id === raw.payment))
    fail("Selecione uma forma de pagamento habilitada.", "payment");
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  return {
    items,
    customer,
    mode: raw.mode,
    address,
    pickupAddress: raw.mode === "pickup" ? s.address : null,
    payment: s.payments.find((p) => p.id === raw.payment).name,
    paymentStatus: "Pendente",
    scheduledAt: raw.scheduledAt || null,
    subtotal,
    fee,
    total: subtotal + fee,
    status: "Recebido",
    reason: "",
    estimate: s.estimate || "",
    events: [{ status: "Recebido", at: now.toISOString() }],
  };
}
const time = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
function checkPeriods(periods) {
  return (
    Array.isArray(periods) &&
    periods.length <= 4 &&
    periods.every(
      (p, i) =>
        Array.isArray(p) &&
        p.length === 2 &&
        time.test(p[0]) &&
        time.test(p[1]) &&
        p[0] < p[1] &&
        (i === 0 || periods[i - 1][1] <= p[0]),
    )
  );
}
export function validateSettings(s) {
  if (!s || typeof s !== "object") fail("Configuração inválida.");
  for (const k of ["name", "address", "phone"]) text(s[k], 2, 250, k);
  if (!/^\d{10,15}$/.test(s.whatsapp)) fail("WhatsApp inválido.");
  for (const k of ["instagram", "facebook", "logo", "botecoLogo"])
    if (s[k] && !safeUrl(s[k])) fail("URL inválida: " + k);
  if (
    !Array.isArray(s.categories) ||
    !s.categories.length ||
    s.categories.length > 20 ||
    s.categories.some(
      (v) => typeof v !== "string" || !v.trim() || v.length > 100,
    )
  )
    fail("Categorias inválidas.");
  for (let i = 0; i < 7; i++)
    if (!checkPeriods(s.hours?.[i])) fail("Horários inválidos.");
  if (
    !s.exceptions ||
    typeof s.exceptions !== "object" ||
    Array.isArray(s.exceptions) ||
    Object.keys(s.exceptions).length > 366
  )
    fail("Exceções inválidas.");
  for (const [d, p] of Object.entries(s.exceptions))
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(d) ||
      isNaN(new Date(d + "T12:00:00Z")) ||
      !checkPeriods(p)
    )
      fail("Exceção de feriado inválida.");
  if (
    !Number.isInteger(s.cutoffMinutes) ||
    s.cutoffMinutes < 0 ||
    s.cutoffMinutes > 180
  )
    fail("Limite de recebimento inválido.");
  for (const k of ["paused", "scheduling", "pickup", "delivery"])
    if (typeof s[k] !== "boolean") fail("Opção inválida: " + k);
  if (
    !Array.isArray(s.deliveryAreas) ||
    s.deliveryAreas.length > 200 ||
    s.deliveryAreas.some(
      (a) =>
        !a ||
        typeof a.name !== "string" ||
        !a.name.trim() ||
        a.name.length > 120 ||
        !Number.isInteger(a.fee) ||
        a.fee < 0 ||
        a.fee > 100000,
    )
  )
    fail("Áreas e taxas inválidas (valores em centavos).");
  if (
    !Array.isArray(s.payments) ||
    s.payments.length > 10 ||
    new Set(s.payments.map((p) => p.id)).size !== s.payments.length ||
    s.payments.some(
      (p) =>
        !p ||
        !/^[a-z0-9-]{1,40}$/.test(p.id) ||
        typeof p.name !== "string" ||
        !p.name.trim() ||
        p.name.length > 100,
    )
  )
    fail("Formas de pagamento presencial inválidas.");
  text(s.estimate || "", 0, 250, "Previsão");
  return { ...s, timezone: "America/Sao_Paulo" };
}
export function safeUrl(v) {
  return (
    typeof v === "string" &&
    ((v.startsWith("/") && !v.startsWith("//") && !v.includes("\\")) ||
      /^https:\/\//.test(v))
  );
}
export function validateProduct(p, list, s) {
  if (!p || !/^[a-z0-9-]{1,60}$/.test(p.id)) fail("ID inválido.");
  text(p.name, 2, 120, "Nome");
  text(p.description, 0, 2000, "Descrição");
  text(p.portion || "", 0, 300, "Porção");
  if (
    !Number.isInteger(p.category) ||
    p.category < 0 ||
    p.category >= s.categories.length
  )
    fail("Categoria inválida.");
  const price = (v) =>
    v === null || (Number.isInteger(v) && v >= 1 && v <= 1000000);
  if (!price(p.price)) fail("Preço inválido (centavos; null para consulta).");
  if (typeof p.available !== "boolean") fail("Disponibilidade inválida.");
  if (p.photo && !safeUrl(p.photo))
    fail("Foto: informe URL HTTPS autorizada ou caminho local.");
  if (
    p.variants &&
    (!Array.isArray(p.variants) ||
      p.variants.length > 20 ||
      p.variants.some(
        (v) =>
          typeof v.name !== "string" ||
          !v.name.trim() ||
          v.name.length > 100 ||
          v.price === null ||
          !price(v.price),
      ) ||
      new Set(p.variants.map((v) => v.name)).size !== p.variants.length)
  )
    fail("Variantes inválidas.");
  if (
    p.preparations &&
    (!Array.isArray(p.preparations) ||
      p.preparations.length > 20 ||
      p.preparations.some(
        (v) => typeof v !== "string" || !v.trim() || v.length > 100,
      ))
  )
    fail("Preparos inválidos.");
  if (p.combo) {
    if (
      !Array.isArray(p.eligible) ||
      p.eligible.length > 60 ||
      typeof p.repeat !== "boolean"
    )
      fail("Opções do combinado inválidas.");
    for (const id of p.eligible) {
      const o = list.find((o) => o.id === id);
      if (!o || o.combo || ![3, 4].includes(o.category))
        fail("Use apenas opções das porções.");
      if (["pescador", "vip"].includes(p.id) && o.category !== 3)
        fail("Este combinado aceita apenas peixes do cardápio.");
      if (p.id === "pescador" && id === "camarao")
        fail("À moda do pescador não inclui camarão.");
    }
  }
  return p;
}
