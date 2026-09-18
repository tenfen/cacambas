import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumpster,
  faAddressBook,
  faSackDollar,
  faCheckCircle,
  faUserPlus,
  faSlidersH,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import Logo from "assets/images/logo.svg";
import "./Landing.scss";

const FUNCIONALIDADES = [
  {
    icon: faDumpster,
    title: "Gestão de caçambas",
    description:
      "Cadastre sua frota, acompanhe o tamanho, o valor da diária e o status de cada caçamba (disponível, alugada ou em manutenção).",
  },
  {
    icon: faAddressBook,
    title: "Cadastro de clientes",
    description:
      "Endereço completo, telefone, documento e localização de cada cliente, com data de entrega e de retirada da caçamba.",
  },
  {
    icon: faCheckCircle,
    title: "Controle de recolhimento",
    description:
      "Saiba sempre quais caçambas ainda precisam ser recolhidas e libere automaticamente a caçamba pra um novo cliente.",
  },
  {
    icon: faSackDollar,
    title: "Receita mensal",
    description:
      "Acompanhe no painel quanto sua locadora faturou em cada mês, com base nos pagamentos já confirmados.",
  },
];

const PASSOS = [
  {
    icon: faUserPlus,
    title: "Cadastre-se e teste grátis",
    description: "Crie sua conta e use o sistema completo por 5 dias, sem precisar pagar nada.",
  },
  {
    icon: faSlidersH,
    title: "Cadastre caçambas e clientes",
    description: "Organize sua frota e sua carteira de clientes num só lugar.",
  },
  {
    icon: faChartLine,
    title: "Acompanhe tudo no painel",
    description: "Veja o que precisa ser recolhido hoje e quanto você faturou no mês.",
  },
];

const FAQ = [
  {
    question: "O teste grátis é mesmo sem cartão de crédito?",
    answer:
      "Sim. Você usa o sistema completo por 5 dias sem informar nenhuma forma de pagamento.",
  },
  {
    question: "O que acontece quando o teste grátis acaba?",
    answer:
      "Se você não assinar, o acesso fica pausado até a confirmação do pagamento — seus dados continuam salvos.",
  },
  {
    question: "Como funciona a cobrança depois do teste?",
    answer:
      "A assinatura é mensal, via Mercado Pago (Pix ou cartão), e pode ser renovada direto pelo seu perfil.",
  },
  {
    question: "Dá pra cancelar quando quiser?",
    answer:
      "Sim, não tem fidelidade — você só paga pelos meses em que continuar usando o sistema.",
  },
  {
    question: "Funciona pelo celular?",
    answer:
      "Sim, o painel se adapta a qualquer tamanho de tela, então dá pra usar do computador ou do celular.",
  },
];

export function Landing({ onLogin, onRegister }) {
  return (
    <main id="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <img src={Logo} alt="Logomarca" className="landing-logo" />
          <button type="button" className="landing-nav-login" onClick={onLogin}>
            Entrar
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <h1>Gestão simples para a sua locadora de caçambas</h1>
          <p>
            Controle caçambas, clientes e faturamento num só painel — sem planilha,
            sem grupo de WhatsApp perdido.
          </p>

          <div className="landing-hero-actions">
            <button type="button" className="landing-btn landing-btn-primary" onClick={onRegister}>
              Teste grátis por 5 dias
            </button>
            <button type="button" className="landing-btn landing-btn-ghost" onClick={onLogin}>
              Já tenho conta
            </button>
          </div>
        </div>
      </section>

      <section className="landing-section" id="funcionalidades">
        <div className="landing-section-inner">
          <h2>Tudo que sua operação precisa</h2>

          <div className="landing-features-grid">
            {FUNCIONALIDADES.map((item) => (
              <div className="landing-feature-card" key={item.title}>
                <div className="landing-feature-icon">
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-alt" id="como-funciona">
        <div className="landing-section-inner">
          <h2>Como funciona</h2>

          <div className="landing-steps">
            {PASSOS.map((passo, index) => (
              <div className="landing-step" key={passo.title}>
                <div className="landing-step-number">{index + 1}</div>
                <div className="landing-step-icon">
                  <FontAwesomeIcon icon={passo.icon} />
                </div>
                <h3>{passo.title}</h3>
                <p>{passo.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section" id="plano">
        <div className="landing-section-inner">
          <h2>Um plano simples, sem pegadinha</h2>

          <div className="landing-plan-card">
            <span className="landing-plan-badge">5 dias grátis para testar</span>
            <div className="landing-plan-price">
              <span className="landing-plan-amount">R$ 89,90</span>
              <span className="landing-plan-period">/ mês</span>
            </div>
            <ul className="landing-plan-list">
              <li><FontAwesomeIcon icon={faCheckCircle} /> Caçambas e clientes ilimitados</li>
              <li><FontAwesomeIcon icon={faCheckCircle} /> Controle de recolhimento</li>
              <li><FontAwesomeIcon icon={faCheckCircle} /> Dashboard de faturamento</li>
              <li><FontAwesomeIcon icon={faCheckCircle} /> Pagamento via Pix ou cartão</li>
            </ul>
            <button type="button" className="landing-btn landing-btn-primary" onClick={onRegister}>
              Começar teste grátis
            </button>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-alt" id="faq">
        <div className="landing-section-inner">
          <h2>Perguntas frequentes</h2>

          <div className="landing-faq">
            {FAQ.map((item) => (
              <details className="landing-faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <img src={Logo} alt="Logomarca" className="landing-logo landing-logo-footer" />
        <button type="button" className="landing-footer-login" onClick={onLogin}>
          Entrar
        </button>
      </footer>
    </main>
  );
}

export default Landing;
