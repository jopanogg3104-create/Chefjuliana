import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Privacidade",
  alternates: { canonical: "/privacidade" },
};
export default function Page() {
  return (
    <main className="privacy-page">
      <Link href="/" className="text-link">
        ← Voltar ao site
      </Link>
      <span className="eyebrow">CHEF JULIANA NOGUEIRA</span>
      <h1>
        Seu encontro.
        <br />
        <em>Seus dados.</em>
      </h1>
      <p>
        Nome, contato e informações da ocasião são utilizados para atender seu
        pedido de orçamento. Não usamos os dados deste formulário para
        marketing.
      </p>
      <h2>Envio e armazenamento</h2>
      <p>
        Quando o armazenamento estiver habilitado, o pedido é salvo no servidor
        e não é publicado no site. Sem esse recurso, o formulário apenas prepara
        um resumo: você precisa enviá-lo no WhatsApp para que Juliana receba a
        mensagem. O site informa qual dessas situações se aplica antes de
        confirmar o contato.
      </p>
      <h2>Serviços externos</h2>
      <p>
        Ao continuar pelo WhatsApp ou visitar o Instagram, você acessa um
        serviço externo sujeito às próprias políticas. Não inclua informações de
        saúde ou outros dados sensíveis nas observações.
      </p>
      <h2>Contato sobre seus dados</h2>
      <p>
        Para tratar questões sobre os dados fornecidos, fale com Juliana no{" "}
        <a
          href="https://www.instagram.com/chef.juliananogueira/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram @chef.juliananogueira
        </a>
        . O responsável pelo tratamento, o contato específico de privacidade e o
        prazo de retenção devem ser confirmados para a operação comercial.
      </p>
      <Link href="/" className="text-link">
        Voltar para planejar meu encontro ↗
      </Link>
    </main>
  );
}
