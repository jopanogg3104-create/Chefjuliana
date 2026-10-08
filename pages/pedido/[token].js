import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Header, Icon, OrderSummary } from "../../components/FishUI.js";
export default function Track() {
  const { query, isReady } = useRouter();
  const [order, setOrder] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    if (!isReady) return;
    let live = true;
    async function load() {
      try {
        const r = await fetch(
          "/api/fish?action=track&token=" + encodeURIComponent(query.token),
        );
        const o = await r.json();
        if (!r.ok) throw Error(o.error);
        if (live) {
          setOrder(o);
          setError("");
        }
      } catch (e) {
        if (live) setError(e.message);
      }
    }
    load();
    const t = setInterval(load, 5000);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, [query.token, isReady]);
  const steps = [
    "Recebido",
    "Confirmado",
    "Em preparo",
    order?.mode === "delivery" ? "Saiu para entrega" : "Pronto para retirada",
    "Concluído",
  ];
  return (
    <>
      <Head>
        <title>Acompanhar pedido — The Fish</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Head>
      <Header admin />
      <main className="tracking page-container">
        <Link href="/" className="text-link">
          ← Voltar ao cardápio
        </Link>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {!order && !error && <p>Consultando seu pedido…</p>}
        {order && (
          <>
            <span className="eyebrow">SEU PEDIDO NO THE FISH</span>
            <h1>
              Pedido nº {order.number}
              <span className="red">.</span>
            </h1>
            <p>
              {order.status === "Recebido"
                ? "Pedido salvo. Aguardando confirmação do restaurante."
                : order.status === "Recusado"
                  ? "O restaurante recusou este pedido."
                  : "Acompanhe as atualizações do restaurante por aqui."}
            </p>
            <div className="tracking-status">
              <Icon name={order.status === "Recusado" ? "close" : "check"} />
              <h2>{order.status}</h2>
              {order.reason && <p>{order.reason}</p>}
              {order.estimate && <p>Previsão informada: {order.estimate}</p>}
            </div>
            {order.status !== "Recusado" && (
              <ol className="timeline">
                {steps.map((s, n) => (
                  <li
                    key={s}
                    className={steps.indexOf(order.status) >= n ? "done" : ""}
                  >
                    <span>{steps.indexOf(order.status) > n ? "✓" : n + 1}</span>
                    {s}
                    {order.events.find((e) => e.status === s) && (
                      <small>
                        {new Date(
                          order.events.find((e) => e.status === s).at,
                        ).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })}
                      </small>
                    )}
                  </li>
                ))}
              </ol>
            )}
            <div className="tracking-grid">
              <div className="panel-card">
                <h3>Resumo do pedido</h3>
                <OrderSummary order={order} />
              </div>
              <div className="panel-card">
                <h3>Informações</h3>
                <p>
                  {order.mode === "pickup"
                    ? "Retirada no restaurante"
                    : "Entrega no endereço informado"}
                </p>
                {order.pickupAddress && <p>{order.pickupAddress}</p>}
                {order.scheduledAt && (
                  <p>
                    Agendado: {order.scheduledAt.replace("T", " às ")}{" "}
                    (Brasília)
                  </p>
                )}
                <p>Pagamento: {order.payment}</p>
                <span className="tag">{order.paymentStatus}</span>
                <p className="muted">
                  Guarde este link com segurança. Ele dá acesso ao
                  acompanhamento deste pedido.
                </p>
                <button
                  className="button outline"
                  onClick={() =>
                    navigator.clipboard
                      ?.writeText(location.href)
                      .then(() => setError("Link copiado."))
                      .catch(() =>
                        setError(
                          "Copie o endereço do navegador para guardar o link.",
                        ),
                      )
                  }
                >
                  Copiar link
                </button>
                <a
                  className="button"
                  href={
                    "https://wa.me/" +
                    order.contact +
                    "?text=" +
                    encodeURIComponent(
                      "Olá! Gostaria de falar sobre meu pedido nº " +
                        order.number +
                        ".",
                    )
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Falar sobre este pedido ↗
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
