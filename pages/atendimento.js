import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import {
  Header,
  Icon,
  api,
  OrderSummary,
  Modal,
} from "../components/FishUI.js";
import { money, statuses, nextStatuses } from "../lib/fish/catalog.js";
export default function Admin() {
  const [data, setData] = useState(null),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [tab, setTab] = useState("orders"),
    [filter, setFilter] = useState("Todos"),
    [search, setSearch] = useState(""),
    [edit, setEdit] = useState(null),
    [sound, setSound] = useState(false),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [older, setOlder] = useState([]),
    [olderMore, setOlderMore] = useState(true);
  const latest = useRef(null),
    audio = useRef(null),
    soundRef = useRef(false);
  soundRef.current = sound;
  async function refresh() {
    try {
      const d = await api("admin");
      setData(d);
      const last = d.orders[0]?.number || 0;
      if (latest.current !== null && last > latest.current) {
        setNotice("Novo pedido recebido!");
        if (soundRef.current && audio.current) {
          const o = audio.current.createOscillator(),
            g = audio.current.createGain();
          o.connect(g);
          g.connect(audio.current.destination);
          g.gain.value = 0.08;
          o.frequency.value = 660;
          o.start();
          o.stop(audio.current.currentTime + 0.4);
        }
      }
      latest.current = last;
    } catch (e) {
      if (e.status === 401) {
        setData(null);
        latest.current = null;
      } else setError(e.message);
    }
  }
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);
  async function signin(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("login", { password });
      setPassword("");
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function change(order, status) {
    let reason = "";
    if (status === "Recusado") {
      reason = window.prompt("Motivo da recusa (obrigatório):");
      if (!reason?.trim()) return;
    }
    setBusy(true);
    try {
      await api("status", {
        number: order.number,
        status,
        reason,
        estimate: order.estimate,
      });
      await refresh();
      setNotice("Status atualizado.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const allOrders = data
    ? [
        ...data.orders,
        ...older.filter((o) => !data.orders.some((n) => n.number === o.number)),
      ]
    : [];
  return (
    <>
      <Head>
        <title>Atendimento — The Fish</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Header admin s={data?.settings} />
      <main className="page-container admin">
        <span className="eyebrow">THE FISH · ÁREA DO RESTAURANTE</span>
        <h1>
          Atendimento<span className="red">.</span>
        </h1>
        {!data ? (
          <form className="login-card" onSubmit={signin}>
            <Icon name="bag" />
            <h2>Bem-vindo de volta.</h2>
            <p>Entre para gerenciar pedidos e o cardápio.</p>
            <label className="field">
              Senha do restaurante
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={256}
              />
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="button" disabled={busy}>
              {busy ? "Entrando…" : "Entrar no painel"}
            </button>
          </form>
        ) : (
          <>
            <div className="admin-top">
              <span>Atualização automática a cada 5 segundos</span>
              <div>
                <button
                  className="button outline small"
                  onClick={() => {
                    if (!sound) {
                      audio.current ||= new (
                        window.AudioContext || window.webkitAudioContext
                      )();
                      audio.current.resume();
                    }
                    setSound(!sound);
                  }}
                >
                  {sound ? "Som ativado" : "Ativar alerta sonoro"}
                </button>
                <button
                  className="text-link"
                  onClick={async () => {
                    await api("logout", {});
                    setData(null);
                  }}
                >
                  Sair
                </button>
              </div>
            </div>
            {notice && (
              <div role="status" className="info-box">
                {notice}
                <button className="text-link" onClick={() => setNotice("")}>
                  Dispensar
                </button>
              </div>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <div className="category-tabs">
              {[
                ["orders", "Pedidos"],
                ["menu", "Cardápio"],
                ["settings", "Configurações"],
                ["pending", "Pendências"],
              ].map(([v, n]) => (
                <button
                  className={tab === v ? "active" : ""}
                  onClick={() => {
                    setTab(v);
                    setError("");
                  }}
                  key={v}
                >
                  {n}
                </button>
              ))}
            </div>
            {tab === "orders" && (
              <>
                <div className="admin-stats">
                  <div>
                    <strong>
                      {
                        data.orders.filter((o) => o.status === "Recebido")
                          .length
                      }
                    </strong>
                    <span>Aguardando confirmação</span>
                  </div>
                  <div>
                    <strong>
                      {
                        data.orders.filter((o) =>
                          ["Confirmado", "Em preparo"].includes(o.status),
                        ).length
                      }
                    </strong>
                    <span>Em atendimento</span>
                  </div>
                  <div>
                    <strong>{data.orders.length}</strong>
                    <span>Pedidos no histórico</span>
                  </div>
                </div>
                <div className="admin-filters">
                  <label className="field">
                    Status
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      {["Todos", ...statuses].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Buscar pedido ou cliente
                    <input
                      placeholder="Número, nome ou data (AAAA-MM-DD)"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                </div>
                <div className="admin-orders">
                  {allOrders
                    .filter(
                      (o) =>
                        (filter === "Todos" || o.status === filter) &&
                        `${o.number} ${o.customer.name} ${o.created}`
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                    )
                    .map((o) => (
                      <article className="panel-card" key={o.number}>
                        <div className="order-card-top">
                          <h3>Pedido #{o.number}</h3>
                          <span className="tag">{o.status}</span>
                        </div>
                        <small>
                          {new Date(o.created).toLocaleString("pt-BR", {
                            timeZone: "America/Sao_Paulo",
                          })}
                        </small>
                        {o.scheduledAt && (
                          <p className="info-box">
                            Agendado: {o.scheduledAt.replace("T", " às ")}{" "}
                            (Brasília)
                          </p>
                        )}
                        <h4>
                          {o.customer.name} ·{" "}
                          <a href={"tel:" + o.customer.phone}>
                            {o.customer.phone}
                          </a>
                        </h4>
                        <p>
                          {o.mode === "pickup"
                            ? "Retirada: " + o.pickupAddress
                            : `Entrega: ${o.address.street}, ${o.address.number} — ${o.address.neighborhood}${o.address.extra ? " · " + o.address.extra : ""}`}
                        </p>
                        <OrderSummary order={o} />
                        <div className="payment-row">
                          <span>
                            {o.payment} · <strong>{o.paymentStatus}</strong>
                          </span>
                          <button
                            className="text-link"
                            disabled={busy}
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  o.paymentStatus === "Pendente"
                                    ? "Confirma que o pagamento presencial foi recebido?"
                                    : "Alterar pagamento para pendente?",
                                )
                              )
                                return;
                              try {
                                await api("payment", {
                                  number: o.number,
                                  paymentStatus:
                                    o.paymentStatus === "Pendente"
                                      ? "Pago presencialmente"
                                      : "Pendente",
                                });
                                await refresh();
                              } catch (e) {
                                setError(e.message);
                              }
                            }}
                          >
                            {o.paymentStatus === "Pendente"
                              ? "Registrar pagamento recebido"
                              : "Reverter pagamento"}
                          </button>
                        </div>
                        {o.reason && (
                          <p className="error">Motivo da recusa: {o.reason}</p>
                        )}
                        <label className="field">
                          Previsão informada (opcional)
                          <input
                            maxLength={250}
                            defaultValue={o.estimate}
                            onBlur={async (e) => {
                              if (e.target.value === o.estimate) return;
                              try {
                                await api("estimate", {
                                  number: o.number,
                                  estimate: e.target.value,
                                });
                                setNotice("Previsão salva.");
                                await refresh();
                              } catch (e) {
                                setError(e.message);
                              }
                            }}
                            placeholder="Ex.: aproximadamente 40 minutos"
                          />
                        </label>
                        <div className="order-actions">
                          {nextStatuses(o).map((status) => (
                            <button
                              className={
                                "button small " +
                                (status === "Recusado" ? "outline" : "")
                              }
                              disabled={busy}
                              key={status}
                              onClick={() => change(o, status)}
                            >
                              {status === "Confirmado"
                                ? "Aceitar pedido"
                                : status === "Recusado"
                                  ? "Recusar"
                                  : status}
                            </button>
                          ))}
                        </div>
                      </article>
                    ))}
                </div>
                {data.hasMore && olderMore && (
                  <button
                    className="button outline"
                    onClick={async () => {
                      try {
                        const response = await api(
                          "history&before=" +
                            Math.min(...allOrders.map((o) => o.number)),
                        );
                        setOlder((v) => [...v, ...response.orders]);
                        setOlderMore(response.hasMore);
                      } catch (e) {
                        setError(e.message);
                      }
                    }}
                  >
                    Carregar pedidos anteriores
                  </button>
                )}
                {!data.orders.length && (
                  <p className="empty">
                    Nenhum pedido recebido ainda. Os novos pedidos aparecerão
                    aqui.
                  </p>
                )}
              </>
            )}
            {tab === "menu" && (
              <>
                <div className="section-heading">
                  <div>
                    <h2>Seu cardápio</h2>
                    <p>Valores em reais. Apenas fotos autorizadas.</p>
                  </div>
                  <button
                    className="button"
                    onClick={() =>
                      setEdit({
                        id: "novo-" + Date.now(),
                        name: "",
                        category: 4,
                        description: "",
                        portion: "",
                        price: null,
                        available: true,
                        photo: "",
                      })
                    }
                  >
                    Cadastrar prato <Icon name="plus" />
                  </button>
                </div>
                <div className="admin-menu">
                  {data.products.map((p) => (
                    <div className="admin-menu-line" key={p.id}>
                      <div>
                        <strong>{p.name}</strong>
                        <small>
                          {data.settings.categories[p.category]} ·{" "}
                          {p.price === null ? "Sob consulta" : money(p.price)} ·{" "}
                          {p.available ? "Disponível" : "Indisponível"}
                        </small>
                      </div>
                      <button
                        className="button outline small"
                        onClick={() => setEdit(p)}
                      >
                        Editar
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
            {tab === "settings" && (
              <SettingsEditor
                initial={data.settings}
                onSave={async (s) => {
                  await api("settings", s);
                  await refresh();
                  setNotice("Configurações salvas.");
                }}
              />
            )}
            {tab === "pending" && (
              <section className="panel-card">
                <h2>Pendências para operação</h2>
                <ul className="pending-list">
                  {data.settings.reviewNotes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
                <p>
                  Não há integração com pagamento online. As formas habilitadas
                  no painel são pagas no atendimento. A escolha do cliente não
                  marca o pedido como pago.
                </p>
                <p>
                  Os combinados precisam de opções elegíveis e regra de
                  repetição confirmadas antes de serem liberados.
                </p>
              </section>
            )}
          </>
        )}
        {edit && (
          <ProductEditor
            initial={edit}
            data={data}
            onClose={() => setEdit(null)}
            onSave={async (p) => {
              await api("product", p);
              await refresh();
              setEdit(null);
              setNotice("Produto salvo.");
            }}
          />
        )}
      </main>
    </>
  );
}
function SettingsEditor({ initial, onSave }) {
  const [s, setS] = useState(initial),
    [exceptions, setExceptions] = useState(
      JSON.stringify(initial.exceptions, null, 2),
    ),
    [areas, setAreas] = useState(
      initial.deliveryAreas.map((a) => ({ ...a, fee: String(a.fee / 100) })),
    ),
    [payments, setPayments] = useState(initial.payments),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const set = (k, v) => setS((s) => ({ ...s, [k]: v }));
  const input = (k, label) => (
    <label className="field" key={k}>
      {label}
      <input
        value={s[k] || ""}
        maxLength={250}
        onChange={(e) => set(k, e.target.value)}
      />
    </label>
  );
  return (
    <form
      className="settings-grid"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
          if (
            areas.some((a) => a.fee === "" || !Number.isFinite(Number(a.fee)))
          )
            throw Error(
              "Informe a taxa de cada bairro. Taxa desconhecida não é gratuita.",
            );
          await onSave({
            ...s,
            exceptions: JSON.parse(exceptions),
            deliveryAreas: areas.map((a) => ({
              name: a.name,
              fee: Math.round(Number(a.fee) * 100),
            })),
            payments,
          });
        } catch (e) {
          setError(e.message);
        } finally {
          setSaving(false);
        }
      }}
    >
      <section className="panel-card">
        <h3>Funcionamento</h3>
        <label className="choice">
          <input
            type="checkbox"
            checked={s.paused}
            onChange={(e) => set("paused", e.target.checked)}
          />
          Pausar recebimento de pedidos
        </label>
        <label className="choice">
          <input
            type="checkbox"
            checked={s.scheduling}
            onChange={(e) => set("scheduling", e.target.checked)}
          />
          Permitir agendamento (até 14 dias)
        </label>
        <label className="field">
          Encerrar pedidos antes do fechamento (minutos)
          <input
            type="number"
            min="0"
            max="180"
            value={s.cutoffMinutes}
            onChange={(e) => set("cutoffMinutes", Number(e.target.value))}
          />
        </label>
        {input("estimate", "Previsão de atendimento (opcional)")}
        <p className="muted">
          Horários no fuso America/Sao_Paulo. Mantenha o intervalo entre almoço
          e jantar.
        </p>
        {[
          "Domingo",
          "Segunda",
          "Terça",
          "Quarta",
          "Quinta",
          "Sexta",
          "Sábado",
        ].map((d, n) => (
          <div className="hours-edit" key={d}>
            <strong>{d}</strong>
            {s.hours[n].map((p, i) => (
              <div key={i}>
                <input
                  aria-label={d + " abertura " + (i + 1)}
                  type="time"
                  value={p[0]}
                  onChange={(e) =>
                    set("hours", {
                      ...s.hours,
                      [n]: s.hours[n].map((v, j) =>
                        i === j ? [e.target.value, v[1]] : v,
                      ),
                    })
                  }
                />
                <span>até</span>
                <input
                  aria-label={d + " fechamento " + (i + 1)}
                  type="time"
                  value={p[1]}
                  onChange={(e) =>
                    set("hours", {
                      ...s.hours,
                      [n]: s.hours[n].map((v, j) =>
                        i === j ? [v[0], e.target.value] : v,
                      ),
                    })
                  }
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={"Remover período " + d}
                  onClick={() =>
                    set("hours", {
                      ...s.hours,
                      [n]: s.hours[n].filter((_, j) => j !== i),
                    })
                  }
                >
                  <Icon name="close" />
                </button>
              </div>
            ))}
            {!s.hours[n].length && <small>Fechado</small>}
            <button
              className="text-link"
              type="button"
              onClick={() =>
                set("hours", {
                  ...s.hours,
                  [n]: [...s.hours[n], ["11:00", "14:00"]],
                })
              }
            >
              + Período
            </button>
          </div>
        ))}
        <label className="field">
          Exceções para feriados (JSON)
          <textarea
            rows={5}
            value={exceptions}
            onChange={(e) => setExceptions(e.target.value)}
          />
          <small>
            Ex.: {JSON.stringify({ "2026-10-12": [] })} fecha a data. Use
            [["11:00","14:00"]] para abrir.
          </small>
        </label>
      </section>
      <section className="panel-card">
        <h3>Retirada e entrega</h3>
        {[
          ["pickup", "Habilitar retirada"],
          ["delivery", "Habilitar entrega"],
        ].map(([k, l]) => (
          <label className="choice" key={k}>
            <input
              type="checkbox"
              checked={s[k]}
              onChange={(e) => set(k, e.target.checked)}
            />
            {l}
          </label>
        ))}
        <h4>Área atendida e taxas</h4>
        <p className="muted">
          Cada bairro precisa de uma taxa conhecida. R$ 0,00 somente para
          entrega gratuita confirmada.
        </p>
        {areas.map((a, n) => (
          <div className="editable-row" key={n}>
            <label className="field">
              Bairro
              <input
                value={a.name}
                onChange={(e) =>
                  setAreas((v) =>
                    v.map((a, i) =>
                      i === n ? { ...a, name: e.target.value } : a,
                    ),
                  )
                }
              />
            </label>
            <label className="field">
              Taxa (R$)
              <input
                type="number"
                step="0.01"
                min="0"
                value={a.fee}
                onChange={(e) =>
                  setAreas((v) =>
                    v.map((a, i) =>
                      i === n ? { ...a, fee: e.target.value } : a,
                    ),
                  )
                }
              />
            </label>
            <button
              type="button"
              className="icon-button"
              aria-label="Remover bairro"
              onClick={() => setAreas((v) => v.filter((_, i) => i !== n))}
            >
              <Icon name="close" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button outline small"
          onClick={() => setAreas((v) => [...v, { name: "", fee: "" }])}
        >
          Adicionar bairro
        </button>
        <h3>Pagamento no atendimento</h3>
        <p className="muted">
          Habilite apenas formas realmente aceitas. Não configura pagamento
          online.
        </p>
        {payments.map((p, n) => (
          <div className="editable-row" key={p.id}>
            <label className="field">
              Nome da forma de pagamento
              <input
                value={p.name}
                onChange={(e) =>
                  setPayments((v) =>
                    v.map((p, i) =>
                      i === n ? { ...p, name: e.target.value } : p,
                    ),
                  )
                }
              />
            </label>
            <button
              type="button"
              className="icon-button"
              aria-label="Remover pagamento"
              onClick={() => setPayments((v) => v.filter((_, i) => i !== n))}
            >
              <Icon name="close" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button outline small"
          onClick={() =>
            setPayments((v) => [
              ...v,
              { id: "presencial-" + Date.now(), name: "" },
            ])
          }
        >
          Adicionar forma de pagamento
        </button>
      </section>
      <section className="panel-card">
        <h3>Identidade e contato</h3>
        {[
          ["name", "Nome do restaurante"],
          ["address", "Endereço e local de retirada"],
          ["phone", "Telefone exibido"],
          ["whatsapp", "WhatsApp (somente números, com 55 e DDD)"],
          ["instagram", "Instagram"],
          ["facebook", "Facebook"],
          ["logo", "URL do logo autorizado (opcional)"],
          ["botecoLogo", "URL do logo do Júlio (opcional)"],
        ].map(([k, l]) => input(k, l))}
        <label className="field">
          Categorias (uma por linha)
          <textarea
            rows={5}
            value={s.categories.join("\n")}
            onChange={(e) => set("categories", e.target.value.split("\n"))}
          />
          <small>
            Preserve a ordem para manter a categoria dos produtos existentes.
          </small>
        </label>
      </section>
      <section className="panel-card">
        <h3>Antes de salvar</h3>
        <p>
          O servidor valida horários, taxas e formas de pagamento. Pedidos já
          recebidos preservam os itens e preços da compra.
        </p>
        <p>
          As alterações afetam novos pedidos imediatamente. A previsão é uma
          informação configurada pelo restaurante, sem progressão simulada.
        </p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="button" disabled={saving}>
          {saving ? "Salvando…" : "Salvar configurações"}
        </button>
      </section>
    </form>
  );
}
function ProductEditor({ initial, data, onClose, onSave }) {
  const [p, setP] = useState(initial),
    [price, setPrice] = useState(
      initial.price === null ? "" : String(initial.price / 100),
    ),
    [variants, setVariants] = useState(
      JSON.stringify(initial.variants || [], null, 2),
    ),
    [preparations, setPreparations] = useState(
      (initial.preparations || []).join("\n"),
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const set = (k, v) => setP((p) => ({ ...p, [k]: v }));
  return (
    <Modal title="Editar prato" onClose={onClose} wide>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await onSave({
              ...p,
              price: price === "" ? null : Math.round(Number(price) * 100),
              variants: JSON.parse(variants),
              preparations: preparations.split("\n").filter(Boolean),
            });
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          <label className="field">
            Nome
            <input
              required
              value={p.name}
              maxLength={120}
              onChange={(e) => set("name", e.target.value)}
            />
          </label>
          <label className="field">
            Categoria
            <select
              value={p.category}
              onChange={(e) => set("category", Number(e.target.value))}
            >
              {data.settings.categories.map((c, n) => (
                <option key={n} value={n}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Preço (R$; vazio para consulta)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <label className="field">
            Informação de porção
            <input
              value={p.portion || ""}
              maxLength={300}
              onChange={(e) => set("portion", e.target.value)}
            />
          </label>
        </div>
        <label className="field">
          Descrição
          <textarea
            rows={3}
            maxLength={2000}
            value={p.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </label>
        <label className="field">
          URL de foto autorizada (opcional)
          <input
            value={p.photo || ""}
            onChange={(e) => set("photo", e.target.value)}
            placeholder="https://… ou /media/arquivo.webp"
          />
        </label>
        <label className="choice">
          <input
            type="checkbox"
            checked={p.available}
            onChange={(e) => set("available", e.target.checked)}
          />
          Disponível no cardápio
        </label>
        <label className="field">
          Variantes (JSON; preço em centavos)
          <textarea
            rows={4}
            value={variants}
            onChange={(e) => setVariants(e.target.value)}
          />
          <small>
            Ex.: [{'{"name":"Tilápia","price":5800}'}]. A variante será
            obrigatória.
          </small>
        </label>
        <label className="field">
          Preparos (um por linha)
          <textarea
            rows={3}
            value={preparations}
            onChange={(e) => setPreparations(e.target.value)}
          />
          <small>Quando preenchido, o preparo será obrigatório.</small>
        </label>
        <label className="choice">
          <input
            type="checkbox"
            checked={!!p.combo}
            onChange={(e) =>
              setP((p) => ({
                ...p,
                combo: e.target.checked,
                eligible: p.eligible || [],
                repeat: p.repeat || false,
              }))
            }
          />
          Combinado personalizável (exatamente 3 opções)
        </label>
        {p.combo && (
          <fieldset>
            <legend>Opções elegíveis — confirme com o restaurante</legend>
            {data.products
              .filter(
                (o) =>
                  !o.combo &&
                  [3, 4].includes(o.category) &&
                  (!(p.id === "pescador" || p.id === "vip") ||
                    o.category === 3) &&
                  (p.id !== "pescador" || o.id !== "camarao"),
              )
              .map((o) => (
                <label className="choice" key={o.id}>
                  <input
                    type="checkbox"
                    checked={p.eligible.includes(o.id)}
                    onChange={(e) =>
                      set(
                        "eligible",
                        e.target.checked
                          ? [...p.eligible, o.id]
                          : p.eligible.filter((id) => id !== o.id),
                      )
                    }
                  />
                  {o.name}
                </label>
              ))}
            <label className="choice">
              <input
                type="checkbox"
                checked={p.repeat}
                onChange={(e) => set("repeat", e.target.checked)}
              />
              Permitir repetição de opções (após confirmação)
            </label>
          </fieldset>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="checkout-footer">
          <button type="button" className="button outline" onClick={onClose}>
            Cancelar
          </button>
          <button className="button" disabled={busy}>
            {busy ? "Salvando…" : "Salvar prato"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
