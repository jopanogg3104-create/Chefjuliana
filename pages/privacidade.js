import Head from "next/head";
import { Header } from "../components/FishUI.js";
export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacidade — The Fish</title>
      </Head>
      <Header admin />
      <main className="page-container prose">
        <span className="eyebrow">CUIDADO COM SEUS DADOS</span>
        <h1>
          Privacidade<span className="red">.</span>
        </h1>
        <p>
          O The Fish utiliza nome, telefone e, para entregas, endereço para
          receber e atender pedidos. Não é necessário criar conta. Não
          solicitamos dados de cartão no site.
        </p>
        <h2>Acesso e armazenamento</h2>
        <p>
          Os pedidos são armazenados no banco do restaurante. O painel exige
          autenticação. O acompanhamento usa um link individual e não
          previsível; guarde-o com segurança e não compartilhe publicamente.
        </p>
        <p>
          O carrinho é salvo neste navegador. Os dados da finalização ficam na
          sessão do navegador para permitir voltar às etapas e repetir um envio
          que falhou. São removidos após um envio bem-sucedido.
        </p>
        <h2>Serviços externos</h2>
        <p>
          Links de WhatsApp, redes sociais e mapas abrem serviços externos e
          seguem suas políticas. O site não envia mensagens automaticamente pelo
          WhatsApp.
        </p>
        <h2>Seus direitos</h2>
        <p>
          Para solicitar acesso, correção ou exclusão de dados, entre em contato
          com o restaurante pelo telefone{" "}
          <a href="tel:+5514998134791">(14) 99813-4791</a>. O restaurante deve
          definir a política de retenção e os procedimentos de exclusão antes da
          operação pública.
        </p>
      </main>
    </>
  );
}
