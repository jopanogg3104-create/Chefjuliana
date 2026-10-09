"use client";
/**
 * Direction: warm editorial, an invitation to the table rather than a sales template.
 * Display: Cormorant Garamond; body: DM Sans. Cream, terracotta and deep olive.
 * Composition: asymmetric photographic hero, generous breathing room, alternating sections.
 * Motion: one staggered hero entrance and subtle reveals, disabled for reduced motion.
 * Evidence: the existing portfolio and chef portrait; no invented reviews or statistics.
 */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Camera as Instagram,
  Menu,
  MessageCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import QuoteDialog, { type ContactConfig } from "./QuoteDialog";
const services = [
  {
    name: "Chef em domicílio",
    title: "Sua casa. Nossa cozinha.",
    description:
      "Um almoço ou jantar pensado para receber em casa. Menu e detalhes combinados diretamente com Juliana.",
    image: "table",
    alt: "Mesa com preparações gastronômicas para receber em casa",
    tag: "RECEBER SEM PRESSA",
  },
  {
    name: "Gastronomia para eventos",
    title: "Sabores que fazem parte da história.",
    description:
      "Uma proposta gastronômica para a sua celebração, construída a partir da ocasião e do que você imagina.",
    image: "abundance",
    alt: "Mesa gastronômica com frutas, queijos, frios e acompanhamentos",
    tag: "CELEBRAR EM BOA COMPANHIA",
  },
  {
    name: "Tábuas gastronômicas",
    title: "Feitas para compartilhar.",
    description:
      "Tábuas de comidas e composições à mesa para dividir sabores, histórias e uma boa conversa.",
    image: "boards",
    alt: "Tábua com queijos, frios, frutas e acompanhamentos",
    tag: "MAIS UM MOTIVO PARA REUNIR",
  },
  {
    name: "Encontros à mesa",
    title: "O encontro é o ingrediente principal.",
    description:
      "Uma refeição especial em casa, pensada com Juliana para reunir as pessoas que tornam o momento especial.",
    image: "feast",
    alt: "Mesa com frutas, pães e preparações para compartilhar",
    tag: "MOMENTOS QUE VIRAM MEMÓRIA",
  },
];
const questions = [
  [
    "Como faço para pedir um orçamento?",
    "Clique em “Planejar meu encontro” e conte a ocasião, a quantidade de pessoas, a cidade e a sua ideia. Você poderá revisar as respostas e continuar a conversa com Juliana pelo WhatsApp.",
  ],
  [
    "Posso contratar para poucas pessoas?",
    "Sim, você pode consultar atendimento para um almoço, jantar ou encontro pequeno. O formulário inclui a opção de 1 a 10 pessoas. A possibilidade e as condições são confirmadas na proposta.",
  ],
  [
    "Em quais cidades a chef atende?",
    "Informe sua cidade e estado ao solicitar o orçamento. A região atendida, o deslocamento e a disponibilidade são confirmados diretamente com Juliana.",
  ],
  [
    "O cardápio é fixo?",
    "Menu, opções e detalhes são combinados com Juliana a partir da ocasião e da experiência desejada. Se você tem outra ideia, conte no orçamento para avaliar as possibilidades.",
  ],
  [
    "Preciso ter a data definida?",
    "Não. Você pode indicar que a data ainda não foi escolhida e começar a conversa. A disponibilidade será confirmada antes da contratação.",
  ],
  [
    "Enviar o formulário reserva a data?",
    "Não. O envio inicia o contato para orçamento. Reserva de data, valores e contratação dependem da proposta e da confirmação com a chef.",
  ],
];
function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Chef Juliana Nogueira, início">
      <span className="brand-mark" aria-hidden="true">
        jn<span>·</span>
      </span>
      <span className="brand-type">
        Juliana Nogueira<small>CHEF DOMICILIAR & GASTRONOMIA</small>
      </span>
    </Link>
  );
}
export function SiteFooter({
  whatsapp = "5514997563799",
}: {
  whatsapp?: string;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Brand />
        <p>
          Boa comida.
          <br />
          Melhor companhia.
        </p>
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-contact"
        >
          <MessageCircle size={18} />
          Falar com Juliana
          <ArrowUpRight size={18} />
        </a>
      </div>
      <Separator className="footer-divider" />
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Chef Juliana Nogueira</span>
        <div>
          <Link href="/#experiencias">Experiências</Link>
          <a
            href="https://www.instagram.com/chef.juliananogueira/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <Link href="/privacidade">Privacidade</Link>
        </div>
        <span>Feito para reunir.</span>
      </div>
    </footer>
  );
}
export default function Landing({
  initialQuote = false,
}: {
  initialQuote?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false),
    [quoteOpen, setQuoteOpen] = useState(false),
    [preset, setPreset] = useState(""),
    [selected, setSelected] = useState(0),
    [config, setConfig] = useState<ContactConfig>({
      whatsapp: "5514997563799",
      storageAvailable: null,
    });
  const main = useRef<HTMLElement>(null),
    returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (initialQuote) setQuoteOpen(true);
  }, [initialQuote]);
  useEffect(() => {
    let live = true;
    fetch("/api/config")
      .then(async (r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((c) => {
        if (live)
          setConfig({
            whatsapp: String(c.whatsapp || "5514997563799").replace(/\D/g, ""),
            storageAvailable: c.storageAvailable === true,
          });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const nodes = main.current?.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!nodes) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    nodes.forEach((node) => {
      node.classList.add("will-reveal");
      observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);
  function openQuote(experience = "") {
    returnFocus.current = document.activeElement as HTMLElement;
    if (experience) setPreset(experience);
    setMenuOpen(false);
    setQuoteOpen(true);
  }
  const service = services[selected];
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo
      </a>
      <div className="announcement">
        <span>Gastronomia feita para reunir.</span>
        <a
          href="https://www.instagram.com/chef.juliananogueira/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Nossa cozinha no Instagram <ArrowUpRight size={12} />
        </a>
      </div>
      <header className="site-header">
        <div className="header-wrap">
          <Brand />
          <nav
            id="site-navigation"
            aria-label="Menu principal"
            className={menuOpen ? "is-open" : ""}
          >
            <a href="#experiencias" onClick={() => setMenuOpen(false)}>
              Experiências
            </a>
            <a href="#portfolio" onClick={() => setMenuOpen(false)}>
              À mesa
            </a>
            <a href="#sobre" onClick={() => setMenuOpen(false)}>
              A chef
            </a>
            <a href="#duvidas" onClick={() => setMenuOpen(false)}>
              Dúvidas
            </a>
            <Button
              className="brand-button header-cta"
              onClick={() => openQuote()}
            >
              Vamos conversar
              <ArrowUpRight size={16} />
            </Button>
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="menu-toggle"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </header>
      <main ref={main} id="conteudo">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <Badge className="hero-badge">
              <span />
              CHEF DOMICILIAR & GASTRONOMIA PARA EVENTOS
            </Badge>
            <h1 id="hero-title">
              Sua celebração
              <br />
              começa <em>à mesa.</em>
            </h1>
            <p>
              Você reúne as pessoas.
              <br />
              Juliana traz a gastronomia para o encontro.
            </p>
            <div className="hero-actions">
              <Button
                className="brand-button hero-cta"
                onClick={() => openQuote()}
              >
                Planejar meu encontro
                <ArrowUpRight size={19} />
              </Button>
              <a href="#experiencias" className="text-link">
                Conhecer experiências
                <ArrowDown size={16} />
              </a>
            </div>
            <div className="hero-confidence">
              <div className="confidence-mark">
                <Check size={14} />
              </div>
              <span>
                Uma proposta para a sua ocasião.
                <br />
                <strong>Menu e disponibilidade sob consulta.</strong>
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-picture">
              <Image
                src="/media/hero.webp"
                alt="Mesa gastronômica ao ar livre com frutas, queijos e flores"
                fill
                sizes="(max-width: 800px) 100vw, 52vw"
                priority
                quality={85}
              />
              <div className="photo-caption">
                <span>À MESA, A GENTE SE ENCONTRA.</span>
                <ArrowUpRight size={20} />
              </div>
            </div>
            <div className="hero-seal" aria-hidden="true">
              <span>FEITO COM CUIDADO</span>
              <em>
                para
                <br />
                celebrar.
              </em>
              <svg width="45" height="20" viewBox="0 0 60 25" fill="none">
                <path
                  d="M5 20C20 20 37 7 55 5M18 17c-9-14 2-18 8-6M33 9c0-13 12-10 13-3M19 17c7 9 15 5 14-6M37 8c8 9 17 4 13-2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
            <span className="hero-side-note">
              JULIANA NOGUEIRA · GASTRONOMIA & ENCONTROS
            </span>
          </div>
        </section>
        <div className="service-ribbon" aria-label="Serviços">
          <span>Chef em domicílio</span>
          <i aria-hidden="true">✳</i>
          <span>Gastronomia para eventos</span>
          <i aria-hidden="true">✳</i>
          <span>Tábuas gastronômicas</span>
          <i aria-hidden="true">✳</i>
          <span>Encontros à mesa</span>
        </div>
        <section className="intro section" data-reveal>
          <div>
            <span className="eyebrow">O SABOR DE ESTAR JUNTO</span>
            <h2>
              Mais presença.
              <br />
              <em>Menos preocupação.</em>
            </h2>
          </div>
          <div className="intro-copy">
            <p>
              Uma mesa bem servida é um convite para ficar. De um jantar em casa
              a uma celebração, a gastronomia acompanha o que faz seu encontro
              especial.
            </p>
            <p>
              Juliana prepara tábuas, almoços e jantares, além de propostas para
              eventos. Você conta a ideia. Os sabores e os detalhes são
              combinados em uma boa conversa.
            </p>
            <a className="text-link" href="#sobre">
              Conheça quem está na cozinha
              <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <section id="experiencias" className="experiences section">
          <div className="section-heading" data-reveal>
            <div>
              <span className="eyebrow">01 / ENCONTRE SUA EXPERIÊNCIA</span>
              <h2>
                O prazer de <em>receber.</em>
              </h2>
            </div>
            <p>
              Para as grandes ocasiões.
              <br />E para as pequenas que merecem ser celebradas.
            </p>
          </div>
          <div className="experience-layout" data-reveal>
            <div
              className="experience-list"
              role="tablist"
              aria-label="Experiências gastronômicas"
            >
              {services.map((s, n) => (
                <button
                  type="button"
                  className={
                    selected === n ? "experience-tab active" : "experience-tab"
                  }
                  id={`experience-tab-${n}`}
                  role="tab"
                  aria-selected={selected === n}
                  aria-controls="experience-panel"
                  tabIndex={selected === n ? 0 : -1}
                  key={s.name}
                  onClick={() => setSelected(n)}
                  onKeyDown={(e) => {
                    if (
                      [
                        "ArrowDown",
                        "ArrowRight",
                        "ArrowUp",
                        "ArrowLeft",
                        "Home",
                        "End",
                      ].includes(e.key)
                    ) {
                      e.preventDefault();
                      const next =
                        e.key === "Home"
                          ? 0
                          : e.key === "End"
                            ? 3
                            : (n +
                                (["ArrowUp", "ArrowLeft"].includes(e.key)
                                  ? 3
                                  : 1)) %
                              4;
                      setSelected(next);
                      document
                        .getElementById(`experience-tab-${next}`)
                        ?.focus();
                    }
                  }}
                >
                  <span className="experience-number">0{n + 1}</span>
                  <span>{s.name}</span>
                  <ArrowUpRight size={20} />
                </button>
              ))}
              <p>
                Tem outra ideia?
                <br />
                Vamos descobrir as possibilidades juntos.
              </p>
            </div>
            <Card
              id="experience-panel"
              role="tabpanel"
              aria-labelledby={`experience-tab-${selected}`}
              className="experience-card"
            >
              <div className="experience-image">
                <Image
                  src={`/media/${service.image}.webp`}
                  alt={service.alt}
                  fill
                  sizes="(max-width:800px) 90vw, 50vw"
                  quality={85}
                />
                <span>{service.tag}</span>
              </div>
              <CardContent className="experience-description">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Button
                  variant="link"
                  className="text-link"
                  onClick={() => openQuote(service.name)}
                >
                  Quero essa experiência
                  <ArrowUpRight size={17} />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="care-section section">
          <div className="care-heading" data-reveal>
            <span className="eyebrow">O QUE LEVAMOS À SUA MESA</span>
            <h2>
              O cuidado mora
              <br />
              <em>nos detalhes.</em>
            </h2>
            <p>
              Da primeira conversa à composição da mesa, o encontro é pensado
              com você.
            </p>
          </div>
          <div className="care-items" data-reveal>
            {[
              [
                "01",
                "A sua ocasião vem primeiro",
                "Menu e possibilidades conversados a partir do que você deseja para o encontro.",
              ],
              [
                "02",
                "Comida para compartilhar",
                "Tábuas, almoços e jantares que fazem da mesa um lugar de convivência.",
              ],
              [
                "03",
                "Conversa direta com a chef",
                "Sem um pacote escolhido no escuro: disponibilidade e proposta combinadas com Juliana.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <span id="eventos" className="anchor-target" />
        <section id="portfolio" className="portfolio section">
          <div className="section-heading" data-reveal>
            <div>
              <span className="eyebrow">02 / HISTÓRIAS À MESA</span>
              <h2>
                O trabalho contado
                <br />
                <em>em sabores e imagens.</em>
              </h2>
            </div>
            <p>
              Mesas inteiras, pequenos detalhes.
              <br />
              Um pouco do que já passou pela nossa cozinha.
            </p>
          </div>
          <div className="portfolio-grid">
            <figure className="portfolio-main" data-reveal>
              <div className="portfolio-image">
                <Image
                  src="/media/abundance.webp"
                  alt="Mesa gastronômica com queijos, frios, salgados, frutas e acompanhamentos"
                  fill
                  sizes="(max-width:800px) 90vw, 52vw"
                  quality={85}
                />
              </div>
              <figcaption>
                <span>Abundância em cada composição.</span>
                <span>01</span>
              </figcaption>
            </figure>
            <div className="portfolio-side">
              <figure data-reveal>
                <div className="portfolio-image">
                  <Image
                    src="/media/detail.webp"
                    alt="Detalhes dos pratos e da apresentação gastronômica de uma mesa"
                    fill
                    sizes="(max-width:800px) 90vw, 32vw"
                    quality={85}
                  />
                </div>
                <figcaption>
                  <span>Os detalhes também recebem.</span>
                  <span>02</span>
                </figcaption>
              </figure>
              <div className="portfolio-note" data-reveal>
                <span className="eyebrow">COMIDA É ENCONTRO.</span>
                <p>
                  Uma boa conversa.
                  <br />
                  Mais um prato.
                  <br />
                  <em>Tempo para celebrar.</em>
                </p>
                <Button
                  variant="link"
                  className="text-link"
                  onClick={() => openQuote()}
                >
                  Pensar na minha mesa
                  <ArrowUpRight size={17} />
                </Button>
              </div>
            </div>
          </div>
          <figure className="film-section" data-reveal>
            <div>
              <span className="eyebrow">UM OLHAR POR DENTRO</span>
              <h3>
                Do preparo
                <br />
                <em>ao encontro.</em>
              </h3>
              <p>Um registro da cozinha e do serviço gastronômico.</p>
              <small>Vídeo sem áudio.</small>
            </div>
            <video
              controls
              playsInline
              preload="none"
              poster="/media/table-film-poster.webp"
              aria-label="Vídeo de preparo e serviço gastronômico"
            >
              <source src="/media/table-film-v2.mp4" type="video/mp4" />
            </video>
          </figure>
        </section>
        <section id="sobre" className="chef-section section">
          <div className="chef-portrait" data-reveal>
            <Image
              src="/media/juliana.webp"
              alt="Chef Juliana Nogueira, de óculos e camisa laranja, folheando uma revista"
              width={960}
              height={1280}
              sizes="(max-width:800px) 90vw, 38vw"
              quality={85}
            />
            <span>JULIANA NOGUEIRA / A CHEF POR TRÁS DA MESA</span>
          </div>
          <div className="chef-story" data-reveal>
            <span className="eyebrow">03 / PRAZER, JULIANA</span>
            <h2>
              Esta é<br />
              <em>a Juliana.</em>
            </h2>
            <p>
              Chef domiciliar e criadora de experiências gastronômicas para
              eventos. Juliana leva a gastronomia para a sua casa e para os
              encontros que merecem uma mesa especial.
            </p>
            <p>
              Tábuas para compartilhar, almoços, jantares e outras ideias sob
              consulta. As possibilidades são combinadas diretamente, com espaço
              para a sua ocasião.
            </p>
            <blockquote>
              O próximo encontro começa
              <br />
              com uma boa conversa.
            </blockquote>
            <Button
              variant="link"
              className="text-link"
              onClick={() => openQuote()}
            >
              Conte sua ideia para Juliana
              <ArrowUpRight size={17} />
            </Button>
            <a
              className="chef-social"
              href="https://www.instagram.com/chef.juliananogueira/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={16} />
              @chef.juliananogueira
            </a>
          </div>
        </section>
        <section className="process section">
          <div className="section-heading" data-reveal>
            <div>
              <span className="eyebrow">04 / DO PRIMEIRO OI À CELEBRAÇÃO</span>
              <h2>
                Simples, desde
                <br />
                <em>a primeira conversa.</em>
              </h2>
            </div>
            <p>
              Uma proposta começa com a sua ideia.
              <br />
              Os próximos passos são combinados com a chef.
            </p>
          </div>
          <div className="process-steps">
            {[
              [
                "01",
                "Conte sua ideia.",
                "Ocasião, cidade, quantidade de pessoas e o que você imagina.",
              ],
              [
                "02",
                "Conversem sobre a proposta.",
                "Menu, condições e disponibilidade definidos com Juliana.",
              ],
              [
                "03",
                "Combinem os detalhes.",
                "Planejamento e confirmação antes da contratação.",
              ],
              [
                "04",
                "É hora de celebrar.",
                "O encontro chega à mesa do jeito que foi combinado.",
              ],
            ].map(([n, t, p]) => (
              <div data-reveal key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="duvidas" className="faq-section section">
          <div className="faq-heading" data-reveal>
            <span className="eyebrow">05 / ANTES DA PRIMEIRA CONVERSA</span>
            <h2>
              Um lugar para
              <br />
              <em>suas dúvidas.</em>
            </h2>
            <p>
              Não encontrou o que procurava?
              <br />
              Vamos conversar sobre a sua ideia.
            </p>
            <a
              className="text-link"
              href={`https://wa.me/${config.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Perguntar à Juliana
              <ArrowUpRight size={17} />
            </a>
          </div>
          <Accordion type="single" collapsible className="faq-list" data-reveal>
            {questions.map(([q, a], n) => (
              <AccordionItem value={`faq-${n}`} key={q}>
                <AccordionTrigger>{q}</AccordionTrigger>
                <AccordionContent>{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <section className="final-cta">
          <div className="cta-decoration" aria-hidden="true">
            <svg
              width="600"
              height="250"
              viewBox="0 0 600 250"
              fill="none"
              focusable="false"
            >
              <path
                d="M-20 160C100 10 190 270 320 140S510 20 620 170M-20 200C100 50 190 310 320 180S510 60 620 210"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div data-reveal>
            <Badge className="closing-badge">
              O PRÓXIMO ENCONTRO PODE SER O SEU
            </Badge>
            <h2>
              Você traz a ocasião.
              <br />
              <em>A conversa começa aqui.</em>
            </h2>
            <Button
              className="brand-button closing-button"
              onClick={() => openQuote()}
            >
              Planejar meu encontro
              <ArrowUpRight size={20} />
            </Button>
            <p>Sem compromisso. Com espaço para suas ideias.</p>
          </div>
        </section>
        <section className="instagram-section section" data-reveal>
          <span className="eyebrow">NOSSA COZINHA CONTINUA POR LÁ</span>
          <h2>
            Para acompanhar
            <br />
            <em>os próximos encontros.</em>
          </h2>
          <a
            href="https://www.instagram.com/chef.juliananogueira/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            <Instagram size={18} />
            @chef.juliananogueira
            <ArrowUpRight size={17} />
          </a>
        </section>
      </main>
      <SiteFooter whatsapp={config.whatsapp} />
      <div className="mobile-contact">
        <a
          href={`https://wa.me/${config.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar com Juliana no WhatsApp"
        >
          <MessageCircle size={19} />
          <span>WhatsApp</span>
        </a>
        <Button className="brand-button" onClick={() => openQuote()}>
          Planejar meu encontro
          <ArrowUpRight size={16} />
        </Button>
      </div>
      <QuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        config={config}
        preset={preset}
        restoreFocus={() => {
          (
            returnFocus.current ||
            document.querySelector<HTMLElement>(".hero-cta")
          )?.focus();
        }}
      />
    </>
  );
}
