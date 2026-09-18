import React from "react";
import Logo from "assets/images/logo.svg";
import "./LegalPage.scss";

export function LegalPage({ title, children }) {
  const podeFechar = window.opener || window.history.length <= 1;

  return (
    <main id="legal-page">
      <div className="legal-header">
        <img src={Logo} alt="Logomarca" className="legal-logo" />
        <h1>{title}</h1>
      </div>

      <article className="legal-content">{children}</article>

      <div className="legal-footer">
        {podeFechar ? (
          <button type="button" onClick={() => window.close()}>
            Fechar
          </button>
        ) : (
          <button type="button" onClick={() => window.history.back()}>
            Voltar
          </button>
        )}
      </div>
    </main>
  );
}

export default LegalPage;
