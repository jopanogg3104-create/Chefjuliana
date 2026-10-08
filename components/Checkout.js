import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Modal, Icon, Qty, api, OrderSummary } from "./FishUI.js";
import { money } from "../lib/fish/catalog.js";
export default function Checkout({ data, cart, setCart, onClose, onEdit }) {
  const router = useRouter(),
    s = data.settings;
  const [step, setStep] = useState(0),
    [form, setForm] = useState({
      mode: s.pickup ? "pickup" : s.delivery ? "delivery" : "",
      name: "",
      phone: "",
      street: "",
      number: "",
      neighborhood: "",
      extra: "",
      payment: "",
      scheduledAt: "",
    }),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [field, setField] = useState(""),
    [sending, setSending] = useState(false);
  const locked = useRef(false);
  useEffect(() => {
    try {
      const f = JSON.parse(sessionStorage.getItem("fish-checkout") || "null");
      if (f) setForm(f);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) sessionStorage.setItem("fish-checkout", JSON.stringify(form));
  }, [form, ready]);
  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
    setField("");
  };
  const items = cart
    .map((i) => {
      const p = data.products.find((p) => p.id === i.id);
      return {
        ...i,
        name: p?.name || "Produto removido",
        unitPrice:
          p?.variants?.find((v) => v.name === i.variant)?.price ??
          p?.price ??
          0,
        choices: [
          i.variant,
          i.preparation,
          ...(i.options || []).map(
            (id) => data.products.find((p) => p.id === id)?.name,
          ),
        ].filter(Boolean),
      };
    })
    .map((i) => ({ ...i, subtotal: i.unitPrice * i.quantity }));
  const subtotal = items.reduce((n, i) => n + i.subtotal, 0);
  const area = s.deliveryAreas.find((a) => a.name === form.neighborhood),
    fee = form.mode === "delivery" ? area?.fee : null;
  const order = {
    items,
    subtotal,
    mode: form.mode,
    fee: fee ?? 0,
    total: subtotal + (fee ?? 0),
  };
  function invalid(message, name) {
    setError(message);
    setField(name);
    return false;
  }
  function validate() {
    if (step === 0) {
      if (!cart.length) return invalid("Adicione um prato para continuar.");
      for (const i of cart) {
        const p = data.products.find((p) => p.id === i.id);
        if (!p?.available || p.price === null)
          return invalid(
            "Há um produto indisponível no pedido. Remova-o ou consulte o restaurante.",
          );
      }
      return true;
    }
    if (step === 1) {
      if (!s[form.mode])
        return invalid("Selecione uma modalidade habilitada.", "mode");
      if (form.mode === "delivery") {
        for (const k of ["street", "number", "neighborhood"])
          if (!form[k].trim()) return invalid("Preencha este campo.", k);
        if (fee === undefined)
          return invalid(
            "Selecione um bairro com taxa configurada.",
            "neighborhood",
          );
      }
      if (!data.opening.open && !form.scheduledAt)
        return invalid(
          s.scheduling
            ? "Escolha uma data e hora para agendamento."
            : "Estamos fechados. Aguarde a próxima abertura.",
          "scheduledAt",
        );
      return true;
    }
    if (step === 2) {
      if (form.name.trim().length < 2)
        return invalid("Informe seu nome.", "name");
      if (!/^\d{10,13}$/.test(form.phone.replace(/\D/g, "")))
        return invalid("Informe telefone com DDD.", "phone");
      if (!s.payments.some((p) => p.id === form.payment))
        return invalid("Escolha uma forma de pagamento habilitada.", "payment");
      return true;
    }
    return true;
  }
  async function send() {
    if (locked.current) return;
    locked.current = true;
    setSending(true);
    setError("");
    const payload = {
      items: cart,
      customer: { name: form.name, phone: form.phone },
      mode: form.mode,
      address: {
        street: form.street,
        number: form.number,
        neighborhood: form.neighborhood,
        extra: form.extra,
      },
      payment: form.payment,
      scheduledAt: form.scheduledAt,
    };
    let attempt;
    try {
      attempt = JSON.parse(sessionStorage.getItem("fish-attempt") || "null");
    } catch {}
    if (!attempt || attempt.body !== JSON.stringify(payload))
      attempt = { key: crypto.randomUUID(), body: JSON.stringify(payload) };
    sessionStorage.setItem("fish-attempt", JSON.stringify(attempt));
    try {
      const response = await api("order", { ...payload, key: attempt.key });
      setCart([]);
      sessionStorage.removeItem("fish-checkout");
      sessionStorage.removeItem("fish-attempt");
      await router.push("/pedido/" + response.token);
    } catch (e) {
      setError(e.message);
      setField(e.field || "");
      if (e.field) {
        if (["name", "phone", "payment"].includes(e.field)) setStep(2);
        else setStep(1);
      }
    } finally {
      locked.current = false;
      setSending(false);
    }
  }
  function input(k, label, props = {}) {
    return (
      <label className="field">
        {label}
        <input
          value={form[k]}
          onChange={(e) => update(k, e.target.value)}
          aria-invalid={field === k}
          {...props}
        />
        {field === k && <small className="error">{error}</small>}
      </label>
    );
  }
  return (
    <Modal
      title="Seu pedido"
      onClose={() => {
        if (!sending) onClose();
      }}
      wide
    >
      {data.ordersAvailable === false && (
        <p className="info-box">
          Os pedidos online ainda não estão habilitados. Você pode consultar o
          cardápio e falar com o restaurante.
        </p>
      )}
      <ol className="checkout-steps">
        {["Pedido", "Entrega ou retirada", "Dados e pagamento", "Revisão"].map(
          (v, n) => (
            <li
              key={v}
              className={n === step ? "current" : n < step ? "done" : ""}
            >
              <span>{n < step ? "✓" : n + 1}</span>
              {v}
            </li>
          ),
        )}
      </ol>
      {step === 0 && (
        <>
          <div className="cart-items">
            {items.map((i, n) => (
              <article className="cart-item" key={n}>
                <div>
                  <h3>{i.name}</h3>
                  <p>{i.choices.join(" · ")}</p>
                  {i.notes && <small>{i.notes}</small>}
                  <div className="cart-item-links">
                    <button onClick={() => onEdit(n)}>Editar</button>
                    <button
                      onClick={() =>
                        setCart((c) => c.filter((_, k) => k !== n))
                      }
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <div>
                  <strong>{money(i.subtotal)}</strong>
                  <Qty
                    value={i.quantity}
                    onChange={(q) =>
                      setCart((c) =>
                        c.map((v, k) => (k === n ? { ...v, quantity: q } : v)),
                      )
                    }
                  />
                </div>
              </article>
            ))}
          </div>
          {!cart.length && (
            <div className="empty">
              <Icon name="bag" width="40" height="40" />
              <h3>Seu pedido começa aqui.</h3>
              <p>Escolha um prato no cardápio e adicione seus favoritos.</p>
              <button className="button" onClick={onClose}>
                Explorar cardápio
              </button>
            </div>
          )}
          <div className="summary-line total">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <h3>Como você prefere receber?</h3>
          <fieldset>
            {s.pickup && (
              <label className="choice">
                <input
                  type="radio"
                  name="mode"
                  checked={form.mode === "pickup"}
                  onChange={() => update("mode", "pickup")}
                />
                <span>Retirada no restaurante</span>
                <b>Sem taxa</b>
              </label>
            )}
            {s.delivery && (
              <label className="choice">
                <input
                  type="radio"
                  name="mode"
                  checked={form.mode === "delivery"}
                  onChange={() => update("mode", "delivery")}
                />
                <span>Entrega</span>
                <small>Taxa conforme bairro</small>
              </label>
            )}
            {!s.pickup && !s.delivery && (
              <p className="error">
                Nenhuma modalidade habilitada. Fale com o restaurante.
              </p>
            )}
          </fieldset>
          {form.mode === "pickup" ? (
            <div className="info-box">
              <Icon name="pin" />
              <div>
                <strong>Local de retirada</strong>
                <p>{s.address}</p>
              </div>
            </div>
          ) : (
            form.mode === "delivery" && (
              <div className="form-grid">
                {input("street", "Endereço", {
                  autoComplete: "street-address",
                  maxLength: 180,
                })}
                {input("number", "Número", { maxLength: 20 })}
                <label className="field">
                  Bairro
                  <select
                    value={form.neighborhood}
                    onChange={(e) => update("neighborhood", e.target.value)}
                    aria-invalid={field === "neighborhood"}
                  >
                    <option value="">Selecione a área atendida</option>
                    {s.deliveryAreas.map((a) => (
                      <option key={a.name} value={a.name}>
                        {a.name} — {money(a.fee)}
                      </option>
                    ))}
                  </select>
                  {field === "neighborhood" && (
                    <small className="error">{error}</small>
                  )}
                </label>
                {input("extra", "Complemento (opcional)", { maxLength: 200 })}
              </div>
            )
          )}
          {s.scheduling && (
            <label className="field">
              Agendamento (horário de Brasília)
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => update("scheduledAt", e.target.value)}
                aria-invalid={field === "scheduledAt"}
              />
              <small>
                Escolha um horário de atendimento nos próximos 14 dias.
                {data.opening.open ? " Deixe vazio para pedir agora." : ""}
              </small>
              {field === "scheduledAt" && (
                <small className="error">{error}</small>
              )}
            </label>
          )}
          {!data.opening.open && (
            <p className="closed-note">
              {data.opening.paused
                ? "Recebimento temporariamente pausado."
                : "Fechado agora."}{" "}
              Próxima abertura: {data.opening.next || "Consulte o restaurante"}.
            </p>
          )}
        </>
      )}
      {step === 2 && (
        <>
          <h3>Só precisamos do essencial.</h3>
          <div className="form-grid">
            {input("name", "Seu nome", {
              autoComplete: "name",
              maxLength: 120,
            })}
            {input("phone", "Telefone com DDD", {
              type: "tel",
              autoComplete: "tel",
              maxLength: 30,
            })}
          </div>
          <fieldset>
            <legend>Forma de pagamento</legend>
            {s.payments.map((p) => (
              <label className="choice" key={p.id}>
                <input
                  type="radio"
                  name="payment"
                  checked={form.payment === p.id}
                  onChange={() => update("payment", p.id)}
                />
                <span>{p.name}</span>
              </label>
            ))}
            {!s.payments.length && (
              <p className="info-box">
                O restaurante ainda precisa habilitar as formas de pagamento
                para receber pedidos.
              </p>
            )}
            {field === "payment" && <small className="error">{error}</small>}
          </fieldset>
          <p className="muted">
            Pagamento no atendimento. Escolher uma forma de pagamento não
            significa que o pedido está pago. Não informe dados de cartão ou
            senhas.
          </p>
          <p className="muted">
            Usaremos seu nome, telefone e endereço somente para atender o
            pedido.{" "}
            <a href="/privacidade" target="_blank">
              Política de privacidade
            </a>
            .
          </p>
        </>
      )}
      {step === 3 && (
        <>
          <h3>Confira antes de enviar.</h3>
          <OrderSummary order={order} />
          <div className="review-data">
            <p>
              <strong>{form.name}</strong> · {form.phone}
            </p>
            <p>
              {form.mode === "pickup"
                ? "Retirada: " + s.address
                : `Entrega: ${form.street}, ${form.number} — ${form.neighborhood}${form.extra ? " · " + form.extra : ""}`}
            </p>
            <p>
              Pagamento: {s.payments.find((p) => p.id === form.payment)?.name} ·
              Pendente
            </p>
            {form.scheduledAt && (
              <p>
                Agendado: {form.scheduledAt.replace("T", " às ")} (Brasília)
              </p>
            )}
          </div>
          <p className="info-box">
            O pedido recebido ainda aguarda confirmação do restaurante. O total
            final será validado pelo sistema.
          </p>
        </>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {cart.length > 0 && (
        <div className="checkout-footer">
          <button
            className="button outline"
            disabled={sending}
            onClick={() => (step ? setStep(step - 1) : onClose())}
          >
            {step ? "Voltar" : "Continuar escolhendo"}
          </button>
          {step < 3 ? (
            <button
              className="button"
              onClick={() => {
                if (validate()) {
                  setError("");
                  setField("");
                  setStep(step + 1);
                }
              }}
            >
              Continuar <Icon name="arrow" />
            </button>
          ) : (
            <button
              className="button"
              disabled={sending || data.ordersAvailable === false}
              onClick={send}
            >
              {sending
                ? "Enviando pedido…"
                : "Enviar pedido · " + money(order.total)}
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
