import React, { useState } from "react";
import Logo from "assets/images/logo.svg";
import Button from "components/button/Button";
import UserController from "../../controllers/UserController";
import "./ForgotPassword.scss";

export function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Informe o seu email.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await UserController.requestPasswordReset(email.trim());

      if (response.status === 200) {
        setSent(true);
      } else {
        setError(
          response.content?.error ||
            response.content?.message ||
            response.message ||
            "Não foi possível enviar o email de recuperação."
        );
      }
    } catch (err) {
      console.error("Erro ao solicitar recuperação de senha:", err);
      setError("Não foi possível enviar o email de recuperação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="forgot-password">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <img src={Logo} alt="Logomarca" className="logomarca" />
            <h2>Esqueci minha senha</h2>
            <p>Informe o email da sua conta para receber o link de redefinição</p>
          </div>

          {sent ? (
            <div className="success-message show">
              <div className="success-icon">✓</div>
              <h3>Email enviado!</h3>
              <p>
                Se <strong>{email}</strong> estiver cadastrado, você vai receber um
                link para redefinir a senha em instantes. Confira também a caixa de spam.
              </p>
            </div>
          ) : (
            <form className="forgot-password-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="forgot-email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                  />
                  <label htmlFor="forgot-email">Email</label>
                  <span className="focus-border"></span>
                </div>
                {error && <span className="error-message show">{error}</span>}
              </div>

              <Button type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
                {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          )}

          <div className="forgot-password-footer">
            <button type="button" onClick={onBack}>
              Voltar para o login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
