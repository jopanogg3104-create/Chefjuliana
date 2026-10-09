"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { occasions, guestRanges, experiences } from "@/public/services.js";
export type ContactConfig = {
  whatsapp: string;
  storageAvailable: boolean | null;
};
type Lead = {
  key: string;
  event: string;
  guests: string;
  date: string;
  city: string;
  experience: string;
  notes: string;
  name: string;
  phone: string;
  email: string;
  privacy: boolean;
};
function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export default function QuoteDialog({
  open,
  onOpenChange,
  config,
  preset,
  restoreFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ContactConfig;
  preset: string;
  restoreFocus: () => void;
}) {
  const [data, setData] = useState<Lead>({
    key: "",
    event: "",
    guests: "",
    date: "",
    city: "",
    experience: "Quero orientação",
    notes: "",
    name: "",
    phone: "",
    email: "",
    privacy: false,
  });
  const [error, setError] = useState(""),
    [result, setResult] = useState<"stored" | "whatsapp" | null>(null),
    [sending, setSending] = useState(false),
    [copyStatus, setCopyStatus] = useState(""),
    [fallback, setFallback] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    if (preset) setData((d) => ({ ...d, experience: preset }));
  }, [preset]);
  function change<K extends keyof Lead>(key: K, value: Lead[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setError("");
  }
  const message = () =>
    `Olá, Juliana! Conheci seu trabalho pelo site e gostaria de conversar sobre um orçamento.\n\nNome: ${data.name}\nTipo de pedido: ${data.event}\nData: ${data.date || "Ainda não definida"}\nCidade: ${data.city}\nPessoas: ${data.guests}\nExperiência: ${data.experience}\nObservações: ${data.notes || "Sem observações"}`;
  const summary = (
    <div className="quote-summary">
      <strong>
        {data.event || "Ocasião a definir"}
        {data.guests ? ` · ${data.guests} pessoas` : ""}
      </strong>
      <p>
        {data.date
          ? data.date.split("-").reverse().join("/")
          : "Data a definir"}{" "}
        · {data.city || "Cidade a definir"}
      </p>
      <p>{data.experience}</p>
      {data.notes && <p>{data.notes}</p>}
      {data.name && (
        <p>
          {data.name} · {data.phone}
        </p>
      )}
    </div>
  );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current) return;
    setError("");
    if (!data.event) {
      setError("Escolha uma ocasião para continuar.");
      return;
    }
    if (!data.guests) {
      setError("Escolha a quantidade de pessoas.");
      return;
    }
    if (!data.city.trim()) {
      setError("Informe a cidade e o estado.");
      return;
    }
    if (!/^\d{10,15}$/.test(data.phone.replace(/\D/g, ""))) {
      setError("Informe um WhatsApp válido com DDD.");
      return;
    }
    if (data.name.trim().length < 2) {
      setError("Informe seu nome com pelo menos 2 caracteres.");
      return;
    }
    if (!data.privacy) {
      setError("Leia e aceite o aviso de privacidade para continuar.");
      return;
    }
    if (config.storageAvailable === false) {
      window.open(
        `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message())}`,
        "_blank",
        "noopener,noreferrer",
      );
      setResult("whatsapp");
      return;
    }
    lock.current = true;
    setSending(true);
    const key = data.key || crypto.randomUUID();
    setData((d) => ({ ...d, key }));
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, key }),
      });
      const value = await response.json();
      if (!response.ok) {
        setFallback(Boolean(value.canUseWhatsapp));
        throw Error(value.error || "Não foi possível salvar.");
      }
      setResult("stored");
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Falha de conexão. Suas respostas foram preservadas; tente novamente."
          : e instanceof Error
            ? e.message
            : "Falha de conexão. Suas respostas foram preservadas; tente novamente.",
      );
    } finally {
      lock.current = false;
      setSending(false);
    }
  }
  function field(
    key: "name" | "phone" | "email" | "city" | "date",
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) {
    return (
      <label className="form-field">
        {label}
        <Input
          value={data[key]}
          onChange={(e) => change(key, e.target.value)}
          {...props}
        />
      </label>
    );
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!sending) onOpenChange(value);
      }}
    >
      <DialogContent
        className="quote-dialog"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          restoreFocus();
        }}
        onEscapeKeyDown={(e) => {
          if (sending) e.preventDefault();
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="dialog-brand">
          JULIANA NOGUEIRA <span>UM CONVITE A CELEBRAR</span>
        </div>
        {result ? (
          <>
            <div className="success-symbol">
              <Check size={26} />
            </div>
            <DialogTitle className="quote-title">
              {result === "stored"
                ? "O primeiro passo está dado."
                : "Sua ideia está pronta para a conversa."}
            </DialogTitle>
            <DialogDescription>
              {result === "stored"
                ? "Recebemos as primeiras informações sobre seu pedido. A disponibilidade e a proposta serão combinadas com Juliana."
                : "Envie o resumo pelo WhatsApp para que Juliana receba seu pedido. Ele ainda não foi armazenado nem enviado."}
            </DialogDescription>
            {summary}
            <Button asChild className="brand-button">
              <a
                href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message())}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} />
                {result === "stored"
                  ? "Continuar no WhatsApp"
                  : "Enviar resumo pelo WhatsApp"}
                <ArrowRight size={18} />
              </a>
            </Button>
            <div className="quote-tools">
              <Button
                variant="ghost"
                onClick={() => {
                  setResult(null);
                  setError("");
                }}
              >
                Editar respostas
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(message());
                    setCopyStatus("Resumo copiado.");
                  } catch {
                    setCopyStatus(
                      "Não foi possível copiar. Selecione o resumo acima.",
                    );
                  }
                }}
              >
                <Copy size={15} />
                Copiar resumo
              </Button>
            </div>
            <p role="status" className="form-hint">
              {copyStatus}
            </p>
          </>
        ) : (
          <>
            <DialogTitle className="quote-title">
              Vamos planejar seu encontro?
            </DialogTitle>
            <DialogDescription>
              Conte o essencial em uma única tela. Se preferir, fale diretamente
              no WhatsApp.
            </DialogDescription>
            <a
              className="quote-direct text-link"
              href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent("Olá, Juliana! Gostaria de conversar sobre um orçamento.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} /> Falar sem formulário
            </a>
            <form onSubmit={submit}>
              <div className="quick-quote-grid">
                {field("name", "Seu nome", {
                  required: true,
                  minLength: 2,
                  maxLength: 120,
                  autoComplete: "name",
                })}
                {field("phone", "WhatsApp com DDD", {
                  required: true,
                  type: "tel",
                  inputMode: "tel",
                  maxLength: 30,
                  autoComplete: "tel",
                  placeholder: "(14) 99999-9999",
                })}
                <label className="form-field">
                  Ocasião
                  <select
                    required
                    aria-label="Ocasião"
                    value={data.event}
                    onChange={(e) => change("event", e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {occasions.map((v: string) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  Quantidade de pessoas
                  <select
                    required
                    aria-label="Quantidade de pessoas"
                    value={data.guests}
                    onChange={(e) => change("guests", e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {guestRanges.map((v: string) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                {field("city", "Cidade e estado", {
                  required: true,
                  maxLength: 160,
                  placeholder: "Ex.: Botucatu, SP",
                  autoComplete: "address-level2",
                })}
                <label className="form-field">
                  Experiência
                  <select
                    aria-label="Experiência"
                    value={data.experience}
                    onChange={(e) => change("experience", e.target.value)}
                  >
                    {experiences.map((v: string) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              </div>
              <details className="quote-extra">
                <summary>Adicionar data ou observações (opcional)</summary>
                {field("date", "Data desejada (opcional)", {
                  type: "date",
                  min: today(),
                })}
                <label className="form-field">
                  O que você imaginou? (opcional)
                  <Textarea
                    rows={3}
                    maxLength={2000}
                    value={data.notes}
                    onChange={(e) => change("notes", e.target.value)}
                    placeholder="Conte sua ideia…"
                  />
                </label>
                <p className="form-hint">
                  A data será confirmada com Juliana. Não inclua dados
                  sensíveis.
                </p>
              </details>
              <label className="check-field">
                <input
                  type="checkbox"
                  required
                  checked={data.privacy}
                  onChange={(e) => change("privacy", e.target.checked)}
                />
                <span>
                  Li o{" "}
                  <a
                    href="/privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    aviso de privacidade
                  </a>{" "}
                  e concordo com o uso dos dados para este orçamento.
                </span>
              </label>
              <p className="form-hint">
                Menu, valores e disponibilidade sob consulta. Este contato não
                confirma uma reserva.
              </p>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              {fallback && (
                <Button
                  variant="link"
                  type="button"
                  onClick={() => setResult("whatsapp")}
                >
                  Preparar resumo para WhatsApp
                </Button>
              )}
              <div className="quote-actions">
                <Button
                  type="submit"
                  className="brand-button"
                  disabled={sending}
                >
                  {sending
                    ? "Salvando…"
                    : config.storageAvailable === false
                      ? "Continuar no WhatsApp"
                      : "Solicitar orçamento"}
                  <ArrowRight size={17} />
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
