import { useEffect, useRef } from "react";
import Link from "next/link";
import { money } from "../lib/fish/catalog.js";
export async function api(action, data) {
  let r;
  try {
    r = await fetch("/api/fish?action=" + action, {
      method: data === undefined ? "GET" : "POST",
      headers: data === undefined ? {} : { "Content-Type": "application/json" },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  } catch {
    throw Error("Sem conexão. Seus dados estão preservados; tente novamente.");
  }
  const body = await r.json();
  if (!r.ok) {
    const e = Error(body.error || "Não foi possível concluir.");
    e.field = body.field;
    e.status = r.status;
    throw e;
  }
  return body;
}
export function Icon({ name, ...props }) {
  const paths = {
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M8 7V5a4 4 0 0 1 8 0v2" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h16M14 6l6 6-6 6" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    phone: (
      <path d="m5 3 4 1 1 5-3 2c2 3 3 4 6 6l2-3 5 1 1 4c0 4-6 3-11-1S1 4 5 3Z" />
    ),
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    fish: (
      <>
        <path d="M4 12c4-7 11-7 15 0-4 7-11 7-15 0Z" />
        <path d="m4 12-3-4v8l3-4M12 6l3-3 2 5" />
        <circle cx="16" cy="11" r=".5" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C7 3 2 8 5 15c6 6 15 1 15-12Z" />
        <path d="m4 20 10-10" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2" />
      </>
    ),
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}
export function Brand({ s }) {
  return (
    <Link
      href="/"
      className="brand"
      aria-label={(s?.name || "The Fish") + ", início"}
    >
      {s?.logo ? (
        <img className="brand-logo" src={s.logo} alt={s.name} />
      ) : (
        <>
          <span className="brand-name">
            the fish<span className="brand-dot">.</span>
          </span>
          <span className="brand-sub">RESTAURANTE & PETISCARIA</span>
        </>
      )}
    </Link>
  );
}
export function Header({ count = 0, onCart, admin = false, s }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand s={s} />
        <nav aria-label="Navegação principal">
          <Link href="/#cardapio">Cardápio</Link>
          <Link href="/#sobre">O restaurante</Link>
          <Link href="/#contato">Contato</Link>
          {admin ? (
            <Link href="/atendimento">Atendimento</Link>
          ) : (
            <button className="cart-header" onClick={onCart}>
              <Icon name="bag" />
              <span>Meu pedido</span>
              <b>{count}</b>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
export function Contact({ s }) {
  if (!s) return null;
  return (
    <>
      <section className="contact-section" id="contato">
        <div>
          <span className="eyebrow">VENHA NOS ENCONTRAR</span>
          <h2>
            Uma mesa espera
            <br />
            por você.
          </h2>
          <p>
            <Icon name="pin" />
            {s.address}
          </p>
          <a
            className="button outline"
            href={
              "https://www.google.com/maps/search/?api=1&query=" +
              encodeURIComponent(s.address)
            }
            target="_blank"
            rel="noreferrer"
          >
            Como chegar <Icon name="arrow" />
          </a>
        </div>
        <div className="contact-details">
          <h3>Vamos conversar?</h3>
          <a href={"tel:+" + s.whatsapp}>
            <Icon name="phone" />
            {s.phone}
          </a>
          <a
            href={"https://wa.me/" + s.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            Falar com o restaurante ↗
          </a>
          <p>Acompanhe nossos pratos e novidades nas redes sociais.</p>
          <div className="social-links">
            <a href={s.instagram} target="_blank" rel="noreferrer">
              Instagram ↗
            </a>
            <a href={s.facebook} target="_blank" rel="noreferrer">
              Facebook ↗
            </a>
          </div>
        </div>
      </section>
      <footer>
        <Brand s={s} />
        <div>
          <p>{s.address}</p>
          <a href={"tel:+" + s.whatsapp}>{s.phone}</a> ·{" "}
          <a href={s.instagram}>Instagram</a> ·{" "}
          <a href={s.facebook}>Facebook</a>
        </div>
        <div>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/atendimento">Painel do restaurante</Link>
          <small>© {new Date().getFullYear()} The Fish</small>
        </div>
      </footer>
    </>
  );
}
export function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const listener = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = [
          ...ref.current.querySelectorAll(
            'button,a,input,select,textarea,[tabindex="0"]',
          ),
        ].filter((n) => !n.disabled && n.offsetParent !== null);
        if (!nodes.length) {
          e.preventDefault();
          return;
        }
        const first = nodes[0],
          last = nodes.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", listener);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-shade"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={"modal " + (wide ? "wide" : "")}
      >
        <div className="modal-head">
          <h2 id="modal-title">{title}</h2>
          <button
            className="icon-button"
            aria-label="Fechar janela"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function Qty({ value, onChange }) {
  return (
    <div className="qty">
      <button
        aria-label="Diminuir quantidade"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <output aria-label="Quantidade">{value}</output>
      <button
        aria-label="Aumentar quantidade"
        disabled={value >= 30}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
export function OrderSummary({ order }) {
  return (
    <div className="order-summary">
      {order.items.map((i, n) => (
        <div className="summary-line" key={n}>
          <div>
            <strong>
              {i.quantity} × {i.name}
            </strong>
            {i.choices?.length > 0 && <small>{i.choices.join(" · ")}</small>}
            {i.notes && <small>Observação: {i.notes}</small>}
          </div>
          <b>{money(i.subtotal)}</b>
        </div>
      ))}
      <div className="summary-line">
        <span>Subtotal</span>
        <span>{money(order.subtotal)}</span>
      </div>
      <div className="summary-line">
        <span>
          {order.mode === "delivery"
            ? "Taxa de entrega"
            : "Retirada no restaurante"}
        </span>
        <span>{order.mode === "delivery" ? money(order.fee) : "Sem taxa"}</span>
      </div>
      <div className="summary-line total">
        <strong>Total</strong>
        <strong>{money(order.total)}</strong>
      </div>
    </div>
  );
}
