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
const titles = [
  "O que você está planejando?",
  "Para quantas pessoas?",
  "Para quando você precisa?",
  "Em qual cidade será?",
  "Que experiência você imagina?",
  "Conte um pouco da sua ideia.",
  "Como podemos falar com você?",
];
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
  const [step, setStep] = useState(0),
    [error, setError] = useState(""),
    [result, setResult] = useState<"stored" | "whatsapp" | null>(null),
    [sending, setSending] = useState(false),
    [copyStatus, setCopyStatus] = useState(""),
    [fallback, setFallback] = useState(false);
  const lock = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (preset) setData((d) => ({ ...d, experience: preset }));
  }, [preset]);
  function change<K extends keyof Lead>(key: K, value: Lead[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setError("");
  }
  function next(n: number) {
    setStep(n);
    setError("");
    setTimeout(() => heading.current?.focus(), 0);
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
    if (step === 0 && !data.event) {
      setError("Escolha uma ocasião para continuar.");
      return;
    }
    if (step === 1 && !data.guests) {
      setError("Escolha a quantidade de pessoas.");
      return;
    }
    if (step === 3 && !data.city.trim()) {
      setError("Informe a cidade e o estado.");
      return;
    }
    if (step < 6) {
      next(step + 1);
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
                  next(6);
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
            <div className="quote-progress">
              <span>0{step + 1} / 07</span>
              <span>SEU PRÓXIMO ENCONTRO</span>
            </div>
            <div className="progress-track">
              <span style={{ transform: `scaleX(${(step + 1) / 7})` }} />
            </div>
            <DialogTitle asChild>
              <h2 ref={heading} tabIndex={-1} className="quote-title">
                {titles[step]}
              </h2>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Preencha o orçamento em sete etapas. Você pode voltar sem perder
              suas respostas.
            </DialogDescription>
            <form onSubmit={submit}>
              {step < 2 && (
                <div
                  className="quote-options"
                  role="group"
                  aria-label={titles[step]}
                >
                  {(step === 0 ? occasions : guestRanges).map((v: string) => (
                    <Button
                      key={v}
                      variant="outline"
                      type="button"
                      aria-pressed={data[step === 0 ? "event" : "guests"] === v}
                      className="quote-option"
                      onClick={() => change(step === 0 ? "event" : "guests", v)}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              )}
              {step === 0 && (
                <p className="form-hint">
                  Da refeição em casa à celebração: conte o que você tem em
                  mente.
                </p>
              )}
              {step === 2 && (
                <>
                  {field("date", "Data desejada", {
                    type: "date",
                    min: today(),
                  })}
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={!data.date}
                      onChange={(e) => {
                        if (e.target.checked) change("date", "");
                      }}
                    />
                    Ainda não defini a data
                  </label>
                  <p className="form-hint">
                    A data será confirmada diretamente com Juliana.
                  </p>
                </>
              )}
              {step === 3 && (
                <>
                  {field("city", "Cidade e estado", {
                    required: true,
                    maxLength: 160,
                    placeholder: "Ex.: Botucatu, SP",
                    autoComplete: "address-level2",
                  })}
                  <p className="form-hint">
                    A região e as condições de atendimento serão avaliadas na
                    proposta.
                  </p>
                </>
              )}
              {step === 4 && (
                <>
                  <div
                    className="quote-options"
                    role="group"
                    aria-label="Experiência desejada"
                  >
                    {experiences.map((v: string) => (
                      <Button
                        key={v}
                        variant="outline"
                        type="button"
                        aria-pressed={data.experience === v}
                        className="quote-option"
                        onClick={() => change("experience", v)}
                      >
                        {v}
                      </Button>
                    ))}
                  </div>
                  <p className="form-hint">
                    Menu, disponibilidade e detalhes são combinados com a chef.
                  </p>
                </>
              )}
              {step === 5 && (
                <>
                  <label className="form-field">
                    O que você imaginou? (opcional)
                    <Textarea
                      rows={4}
                      maxLength={2000}
                      value={data.notes}
                      onChange={(e) => change("notes", e.target.value)}
                      placeholder="Uma tábua para compartilhar, um jantar especial, uma celebração…"
                    />
                  </label>
                  <p className="form-hint">
                    Não inclua informações de saúde ou dados sensíveis.
                  </p>
                </>
              )}
              {step === 6 && (
                <>
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
                  {field("email", "E-mail (opcional)", {
                    type: "email",
                    maxLength: 254,
                    autoComplete: "email",
                  })}
                  {summary}
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
                      e entendo que os dados serão usados para atender meu
                      orçamento.
                    </span>
                  </label>
                  <p className="form-hint">
                    Este contato não confirma uma reserva de data ou
                    contratação.
                  </p>
                </>
              )}
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
                  type="button"
                  variant="ghost"
                  disabled={sending}
                  onClick={() => (step ? next(step - 1) : onOpenChange(false))}
                >
                  {step ? "Voltar" : "Agora não"}
                </Button>
                <Button
                  type="submit"
                  className="brand-button"
                  disabled={sending}
                >
                  {sending
                    ? "Salvando…"
                    : step === 6
                      ? config.storageAvailable === false
                        ? "Preparar mensagem"
                        : "Enviar pedido"
                      : "Continuar"}
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
