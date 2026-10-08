import Head from "next/head";
import { useEffect, useState } from "react";
import {
  Header,
  Contact,
  Icon,
  Modal,
  Qty,
  api,
} from "../components/FishUI.js";
import { money } from "../lib/fish/catalog.js";
import Checkout from "../components/Checkout.js";
const price = (p) =>
  p.variants?.length ? Math.min(...p.variants.map((v) => v.price)) : p.price;
const unit = (p, i) =>
  p.variants?.find((v) => v.name === i.variant)?.price ?? p.price;
export default function Home() {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [category, setCategory] = useState(0),
    [search, setSearch] = useState(""),
    [cart, setCart] = useState([]),
    [loaded, setLoaded] = useState(false),
    [details, setDetails] = useState(null),
    [showCart, setShowCart] = useState(false),
    [toast, setToast] = useState("");
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("fish-cart") || "[]");
      if (Array.isArray(stored)) setCart(stored);
    } catch {}
    setLoaded(true);
    const load = () =>
      api("catalog")
        .then(setData)
        .catch((e) => setError(e.message));
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem("fish-cart", JSON.stringify(cart));
  }, [cart, loaded]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const s = data?.settings,
    items = data?.products || [];
  const count = cart.reduce((n, i) => n + i.quantity, 0),
    total = cart.reduce((n, i) => {
      const p = items.find((p) => p.id === i.id);
      return n + (p ? unit(p, i) * i.quantity : 0);
    }, 0);
  const shown = items.filter((p) =>
    search
      ? p.name
          .toLocaleLowerCase("pt-BR")
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .includes(
            search
              .toLocaleLowerCase("pt-BR")
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, ""),
          )
      : p.category === category,
  );
  function add(item) {
    if (details.index !== undefined)
      setCart((c) => c.map((v, n) => (n === details.index ? item : v)));
    else setCart((c) => [...c, item]);
    setDetails(null);
    setToast("Prato adicionado ao seu pedido");
  }
  return (
    <>
      <Head>
        <title>The Fish — Restaurante e Petiscaria em Botucatu</title>
        <meta
          name="description"
          content="Peixes, camarões e petiscos. Conheça o cardápio do The Fish, em Botucatu, e faça seu pedido pelo site."
        />
      </Head>
      <Header s={s} count={count} onCart={() => setShowCart(true)} />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="tiny-line" /> BOTUCATU, SP · SABOR À MESA
            </span>
            <h1>
              Peixes, camarões
              <br />e petiscos para
              <br />
              <em>todos os momentos.</em>
            </h1>
            <p>
              Conheça nosso cardápio, escolha seus favoritos
              <br className="desktop" /> e faça seu pedido pelo site.
            </p>
            <div className="hero-actions">
              <a className="button" href="#cardapio">
                Fazer meu pedido <Icon name="arrow" />
              </a>
              <a
                className="text-link"
                href={"https://wa.me/" + (s?.whatsapp || "5514998134791")}
                target="_blank"
                rel="noreferrer"
              >
                Falar com o restaurante ↗
              </a>
            </div>
            <div className="opening">
              <span
                className={"status-dot " + (data?.opening.open ? "green" : "")}
              />
              <strong>
                {data
                  ? data.opening.open
                    ? "Aberto agora"
                    : data.opening.paused
                      ? "Pedidos pausados"
                      : "Fechado"
                  : "Consultando horários…"}
              </strong>
              <span>
                {data?.opening.open
                  ? "Quinta a sábado · almoço e jantar"
                  : data?.opening.next
                    ? "Próxima abertura: " + data.opening.next
                    : ""}
              </span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-top">
              BONS MOMENTOS.
              <br />
              BONS SABORES.
            </div>
            <div className="art-circle">
              <svg viewBox="0 0 320 220" fill="none">
                <path
                  d="M55 112C107 35 228 32 277 109c-50 79-174 78-222 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="m56 111-31-34v70l31-36M135 62l38-38 35 36M135 161l38 35 35-38"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M218 69c-20 24-20 57 0 81"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="242" cy="101" r="4" fill="currentColor" />
                <path
                  d="M75 113c36-24 88-26 122 0M83 127c30-18 77-17 112 0"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
              <span>
                FEITO PARA
                <br />
                <em>compartilhar.</em>
              </span>
            </div>
            <div className="art-bottom">
              THE FISH <span>DESDE O PRIMEIRO SABOR</span>
            </div>
          </div>
        </section>
        <div className="features">
          <div>
            <Icon name="fish" />
            <span>Peixes e camarões</span>
          </div>
          <div>
            <Icon name="people" />
            <span>Porções para compartilhar</span>
          </div>
          <div>
            <Icon name="bag" />
            <span>Seu pedido pelo site</span>
          </div>
          <div>
            <Icon name="pin" />
            <span>Retire no restaurante</span>
          </div>
        </div>
        <section className="menu-section" id="cardapio">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ESCOLHA SEU PRÓXIMO FAVORITO</span>
              <h2>
                Nosso cardápio<span className="red">.</span>
              </h2>
              <p>Do almoço aos encontros que merecem uma boa porção.</p>
            </div>
            <label className="search">
              <Icon name="search" />
              <input
                aria-label="Buscar prato"
                placeholder="O que você quer saborear?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button aria-label="Limpar busca" onClick={() => setSearch("")}>
                  <Icon name="close" />
                </button>
              )}
            </label>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}{" "}
              <button onClick={() => location.reload()}>
                Tentar novamente
              </button>
            </p>
          )}
          <div className="category-tabs" role="tablist" aria-label="Categorias">
            {(
              s?.categories || [
                "Pratos do chef",
                "Pratos executivos",
                "Combinados na tábua",
                "Porções The Fish",
                "Porções Boteco",
              ]
            ).map((name, n) => (
              <button
                key={n}
                role="tab"
                aria-selected={n === category && !search}
                className={n === category && !search ? "active" : ""}
                onClick={() => {
                  setCategory(n);
                  setSearch("");
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="menu-intro">
            <h3>
              {search
                ? "Resultados da busca"
                : s?.categories[category] || "Pratos do chef"}
            </h3>
            <span>
              {category === 0 && !search
                ? "INDIVIDUAIS"
                : category === 3 && !search
                  ? "INDICAÇÃO GERAL: 500 G"
                  : `${shown.length} opções`}
            </span>
          </div>
          {!data ? (
            <p className="empty">Carregando cardápio…</p>
          ) : (
            <div className="menu-grid">
              {shown.map((p, n) => {
                const disabled =
                  !p.available ||
                  (p.combo && p.eligible.length < (p.repeat ? 1 : 3));
                return (
                  <article
                    className={"dish " + (!p.available ? "unavailable" : "")}
                    key={p.id}
                  >
                    {p.photo && <img src={p.photo} alt={p.name} />}
                    <div className="dish-top">
                      <span className="dish-number">
                        {String(n + 1).padStart(2, "0")}
                      </span>
                      {p.combo && (
                        <span className="tag">MONTE DO SEU JEITO</span>
                      )}
                      {p.id === "costelinha" && (
                        <span className="tag">CONTÉM ESPINHAS</span>
                      )}
                    </div>
                    <h4>{p.name}</h4>
                    <p>{p.description}</p>
                    {p.portion && <small>{p.portion}</small>}
                    <div className="dish-bottom">
                      <div>
                        {p.price === null ? (
                          <span className="consult-price">
                            Preço sob consulta
                          </span>
                        ) : (
                          <>
                            <span className="price-caption">
                              {p.variants?.length ? "A partir de" : " "}
                            </span>
                            <strong className="price">{money(price(p))}</strong>
                          </>
                        )}
                      </div>
                      {p.price === null ? (
                        <a
                          className="consult"
                          href={
                            "https://wa.me/" +
                            s.whatsapp +
                            "?text=" +
                            encodeURIComponent(
                              "Olá! Gostaria de consultar o valor de " +
                                p.name +
                                ".",
                            )
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          Consultar restaurante ↗
                        </a>
                      ) : (
                        <button
                          disabled={disabled}
                          className="add-button"
                          onClick={() => setDetails({ product: p })}
                          aria-label={"Adicionar " + p.name}
                        >
                          {disabled ? (
                            p.available ? (
                              "Em revisão"
                            ) : (
                              "Indisponível"
                            )
                          ) : (
                            <>
                              Adicionar <Icon name="plus" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {data && !shown.length && (
            <p className="empty">Nenhum prato encontrado. Tente outro nome.</p>
          )}
          <div className="menu-note">
            <Icon name="leaf" />
            <p>
              Todas as pesagens são feitas com os insumos <em>in natura</em>.
            </p>
          </div>
          {category === 4 && !search && s?.botecoLogo && (
            <img className="boteco-logo" src={s.botecoLogo} alt="Júlio" />
          )}
          {data && !data.opening.open && (
            <p className="closed-note">
              O cardápio está disponível para consulta.{" "}
              {data.opening.scheduling
                ? "Você pode agendar um pedido na finalização."
                : "Novos pedidos serão recebidos no horário de funcionamento."}
            </p>
          )}
        </section>
        <section className="about-section" id="sobre">
          <span className="eyebrow">PRAZER, THE FISH</span>
          <h2>
            Boa comida.
            <br />
            <em>Melhor companhia.</em>
          </h2>
          <div>
            <p>
              O The Fish reúne pratos de peixes e camarões preparados com
              ingredientes frescos e de alta qualidade. Nosso cardápio oferece
              pratos executivos, combinados na tábua e porções para
              compartilhar.
            </p>
            <p>
              Seja para uma refeição em família, um encontro com amigos ou para
              saborear em casa, encontre seu prato favorito e faça seu pedido
              com facilidade.
            </p>
            <a href="#cardapio" className="text-link">
              Explore o cardápio <Icon name="arrow" />
            </a>
          </div>
        </section>
        {s && (
          <section className="hours-section">
            <div>
              <Icon name="clock" />
              <h3>Horários de atendimento</h3>
              <span>America/Sao_Paulo</span>
            </div>
            <ul>
              {[
                "Domingo",
                "Segunda-feira",
                "Terça-feira",
                "Quarta-feira",
                "Quinta-feira",
                "Sexta-feira",
                "Sábado",
              ].map((d, n) => (
                <li key={n}>
                  <span>{d}</span>
                  <strong>
                    {s.hours[n].length
                      ? s.hours[n].map((p) => p.join(" às ")).join(" · ")
                      : "Fechado"}
                  </strong>
                </li>
              ))}
            </ul>
            {s.cutoffMinutes > 0 && (
              <p>Pedidos até {s.cutoffMinutes} minutos antes do fechamento.</p>
            )}
          </section>
        )}
      </main>
      <Contact s={s} />
      {count > 0 && (
        <button className="floating-cart" onClick={() => setShowCart(true)}>
          <Icon name="bag" />
          <span>
            Ver pedido • {count} {count === 1 ? "item" : "itens"}
          </span>
          <strong>{money(total)}</strong>
          <Icon name="arrow" />
        </button>
      )}
      {toast && (
        <div role="status" className="toast">
          <Icon name="check" />
          {toast}
        </div>
      )}
      {details && (
        <Details
          {...details}
          products={items}
          onClose={() => setDetails(null)}
          onAdd={add}
        />
      )}
      {showCart && data && (
        <Checkout
          data={data}
          cart={cart}
          setCart={setCart}
          onClose={() => setShowCart(false)}
          onEdit={(n) => {
            setShowCart(false);
            setDetails({
              product: items.find((p) => p.id === cart[n].id),
              initial: cart[n],
              index: n,
            });
          }}
        />
      )}
    </>
  );
}
function Details({ product: p, products, initial, onAdd, onClose }) {
  const [variant, setVariant] = useState(initial?.variant || ""),
    [preparation, setPreparation] = useState(initial?.preparation || ""),
    [options, setOptions] = useState(initial?.options || []),
    [quantity, setQuantity] = useState(initial?.quantity || 1),
    [notes, setNotes] = useState(initial?.notes || "");
  const valid =
    (!p.variants?.length || variant) &&
    (!p.preparations?.length || preparation) &&
    (!p.combo || options.length === 3);
  const amount = unit(p, { variant });
  return (
    <Modal title={p.name} onClose={onClose}>
      <p className="detail-description">{p.description}</p>
      <small>{p.portion}</small>
      {p.variants?.length > 0 && (
        <fieldset>
          <legend>
            Escolha a variante <span>Obrigatório</span>
          </legend>
          {p.variants.map((v) => (
            <label className="choice" key={v.name}>
              <input
                type="radio"
                name="variant"
                checked={variant === v.name}
                onChange={() => setVariant(v.name)}
              />
              <span>{v.name}</span>
              <b>{money(v.price)}</b>
            </label>
          ))}
        </fieldset>
      )}
      {p.preparations?.length > 0 && (
        <fieldset>
          <legend>
            Como você prefere? <span>Obrigatório</span>
          </legend>
          {p.preparations.map((v) => (
            <label className="choice" key={v}>
              <input
                type="radio"
                name="preparation"
                checked={preparation === v}
                onChange={() => setPreparation(v)}
              />
              <span>{v}</span>
            </label>
          ))}
        </fieldset>
      )}
      {p.combo && (
        <fieldset>
          <legend>
            Monte seu combinado{" "}
            <span>{options.length} de 3 opções selecionadas</span>
          </legend>
          {p.repeat ? (
            <>
              {[0, 1, 2].map((n) => (
                <label className="field" key={n}>
                  Opção {n + 1}
                  <select
                    value={options[n] || ""}
                    onChange={(e) => {
                      const arr = [...options];
                      arr[n] = e.target.value;
                      setOptions(arr);
                    }}
                  >
                    <option value="">Selecione</option>
                    {p.eligible.map((id) => {
                      const v = products.find((i) => i.id === id);
                      return (
                        v?.available && (
                          <option key={id} value={id}>
                            {v.name}
                          </option>
                        )
                      );
                    })}
                  </select>
                </label>
              ))}
            </>
          ) : (
            p.eligible.map((id) => {
              const v = products.find((i) => i.id === id);
              return (
                v && (
                  <label className="choice" key={id}>
                    <input
                      type="checkbox"
                      checked={options.includes(id)}
                      disabled={
                        !v.available ||
                        (options.length === 3 && !options.includes(id))
                      }
                      onChange={(e) =>
                        setOptions(
                          e.target.checked
                            ? [...options, id]
                            : options.filter((i) => i !== id),
                        )
                      }
                    />
                    <span>
                      {v.name}
                      {!v.available ? " — indisponível" : ""}
                    </span>
                  </label>
                )
              );
            })
          )}
        </fieldset>
      )}
      <label className="field">
        Alguma observação?
        <textarea
          placeholder="Conte como podemos preparar seu pedido"
          maxLength={500}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <small>{notes.length}/500 caracteres</small>
      </label>
      <div className="detail-submit">
        <Qty value={quantity} onChange={setQuantity} />
        <button
          className="button"
          disabled={!valid || (p.combo && options.filter(Boolean).length !== 3)}
          onClick={() =>
            onAdd({ id: p.id, variant, preparation, options, quantity, notes })
          }
        >
          {initial ? "Salvar alterações" : "Adicionar ao pedido"} ·{" "}
          {money(amount * quantity)}
        </button>
      </div>
    </Modal>
  );
}
