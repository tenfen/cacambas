import React from "react";
import { LegalPage } from "./LegalPage";

export function Privacidade() {
  return (
    <LegalPage title="Política de Privacidade">
      <p className="legal-updated">Última atualização: setembro de 2026</p>

      <p>
        Esta Política de Privacidade descreve como o Cacambix coleta, usa,
        armazena e protege dados pessoais, em conformidade com a Lei Geral de
        Proteção de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <h2>1. Quem trata os seus dados</h2>
      <p>
        O Cacambix é oferecido por uma pessoa física, sediada em Palhoça/SC.
        Para qualquer assunto relacionado a privacidade e proteção de dados,
        entre em contato pelo e-mail crtenfen@gmail.com.
      </p>

      <h2>2. Dois papéis diferentes de dados pessoais</h2>
      <p>É importante distinguir dois tipos de dados tratados na Plataforma:</p>
      <ul>
        <li>
          <strong>Seus dados como usuário do Cacambix</strong> (nome, e-mail,
          telefone, senha, dados de pagamento): aqui, o Cacambix é o
          controlador dos dados, e esta política se aplica integralmente.
        </li>
        <li>
          <strong>Dados dos seus próprios clientes</strong>, que você cadastra
          na Plataforma para gerenciar seu negócio de locação de caçambas
          (nome, telefone, documento, endereço): aqui, você é o controlador
          desses dados perante seus clientes, e o Cacambix atua apenas como
          operador — processamos e armazenamos essas informações seguindo suas
          instruções, para permitir o funcionamento da Plataforma, sem
          utilizá-las para finalidade própria. Cabe a você garantir base legal
          adequada para coletar e tratar os dados dos seus clientes.
        </li>
      </ul>

      <h2>3. Quais dados coletamos</h2>
      <p>
        <strong>a) Dados de cadastro do usuário:</strong> nome, sobrenome,
        e-mail, telefone e senha (armazenada com criptografia unidirecional —
        nunca em texto plano).
      </p>
      <p>
        <strong>b) Dados de pagamento:</strong> o Cacambix não armazena dados
        completos de cartão de crédito. Os pagamentos são processados
        diretamente pelo Mercado Pago; armazenamos apenas o status e o
        identificador da transação, necessários para controlar sua assinatura.
      </p>
      <p>
        <strong>c) Dados que você cadastra sobre sua operação:</strong>{" "}
        caçambas (identificação, tamanho, valor), clientes (nome, telefone,
        documento, endereço) e período de locação. O endereço informado é
        usado para calcular automaticamente uma coordenada geográfica
        aproximada, para fins de localização no mapa.
      </p>
      <p>
        <strong>d) Dados técnicos:</strong> um token de sessão é armazenado no
        navegador (sessionStorage) para manter você autenticado; não
        utilizamos cookies de rastreamento ou publicidade.
      </p>

      <h2>4. Para que usamos os dados</h2>
      <ul>
        <li>Criar e manter sua conta e autenticar seu acesso;</li>
        <li>Viabilizar o cadastro e a gestão de caçambas e clientes;</li>
        <li>Processar pagamentos e controlar o status da sua assinatura;</li>
        <li>Enviar e-mails transacionais (ex.: redefinição de senha);</li>
        <li>Prestar suporte quando solicitado;</li>
        <li>Cumprir obrigações legais.</li>
      </ul>
      <p>
        Não utilizamos seus dados para envio de publicidade de terceiros nem os
        vendemos a ninguém.
      </p>

      <h2>5. Com quem compartilhamos dados</h2>
      <p>
        Utilizamos os seguintes prestadores de serviço (operadores) para
        viabilizar a Plataforma, que têm acesso aos dados estritamente
        necessário para prestar seus serviços:
      </p>
      <ul>
        <li><strong>MongoDB Atlas</strong> — armazenamento do banco de dados em nuvem;</li>
        <li><strong>Mercado Pago</strong> — processamento de pagamentos (Pix e cartão);</li>
        <li><strong>Resend</strong> — envio de e-mails transacionais (ex.: redefinição de senha).</li>
      </ul>
      <p>Não compartilhamos dados pessoais com terceiros para fins de marketing.</p>

      <h2>6. Segurança</h2>
      <p>
        Adotamos medidas técnicas para proteger seus dados, incluindo: senhas
        armazenadas com hash criptográfico (bcrypt), comunicação criptografada
        (HTTPS) e autenticação por token para acesso à conta. Apesar dos
        esforços, nenhum sistema é 100% imune a incidentes — em caso de
        incidente de segurança relevante, você será notificado conforme
        exigido pela LGPD.
      </p>

      <h2>7. Retenção e exclusão de dados</h2>
      <p>
        Mantemos seus dados enquanto sua conta estiver ativa. Você pode
        solicitar a exclusão da sua conta e dos dados associados a qualquer
        momento pelo e-mail de contato, ressalvados os dados que precisamos
        manter por obrigação legal (ex.: registros fiscais de pagamento).
      </p>

      <h2>8. Seus direitos como titular de dados</h2>
      <p>
        Nos termos da LGPD, você pode solicitar, a qualquer momento e mediante
        contato pelo e-mail informado:
      </p>
      <ul>
        <li>Confirmação da existência de tratamento de dados;</li>
        <li>Acesso aos seus dados;</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
        <li>Portabilidade dos dados a outro fornecedor;</li>
        <li>Eliminação dos dados tratados com seu consentimento;</li>
        <li>Revogação do consentimento, quando aplicável.</li>
      </ul>

      <h2>9. Dados de menores de idade</h2>
      <p>
        O Cacambix não é destinado a menores de 18 anos, e não coletamos
        intencionalmente dados de crianças ou adolescentes.
      </p>

      <h2>10. Alterações nesta política</h2>
      <p>
        Podemos atualizar esta Política periodicamente. Alterações relevantes
        serão comunicadas por e-mail ou através da própria Plataforma, com
        antecedência razoável.
      </p>

      <h2>11. Contato</h2>
      <p>
        Dúvidas, solicitações ou reclamações sobre o tratamento dos seus dados
        pessoais podem ser enviadas para crtenfen@gmail.com.
      </p>
    </LegalPage>
  );
}

export default Privacidade;
