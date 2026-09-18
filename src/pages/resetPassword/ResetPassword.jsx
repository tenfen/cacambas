import React, { useState } from "react";
import Logo from "assets/images/logo.svg";
import Button from "components/button/Button";
import UserController from "../../controllers/UserController";
import "./ResetPassword.scss";

export function ResetPassword({ token, onDone }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await UserController.resetPassword({
        token,
        newPassword,
        confirmNewPassword,
      });

      if (response.status === 200) {
        setDone(true);
      } else {
        setError(
          response.content?.error ||
            response.content?.message ||
            response.message ||
            "Não foi possível redefinir a senha."
        );
      }
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      setError("Não foi possível redefinir a senha.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="reset-password">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <img src={Logo} alt="Logomarca" className="logomarca" />
            <h2>Redefinir senha</h2>
            <p>Escolha uma nova senha para a sua conta</p>
          </div>

          {done ? (
            <div className="success-message show">
              <div className="success-icon">✓</div>
              <h3>Senha redefinida!</h3>
              <p>Você já pode entrar com a sua nova senha.</p>
              <Button type="button" onClick={onDone}>
                Ir para o login
              </Button>
            </div>
          ) : (
            <form className="reset-password-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="new-password"
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                  />
                  <label htmlFor="new-password">Nova senha</label>
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="confirm-new-password"
                    required
                    autoComplete="new-password"
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      setError("");
                    }}
                  />
                  <label htmlFor="confirm-new-password">Confirme a nova senha</label>
                </div>
                {error && <span className="error-message show">{error}</span>}
              </div>

              <Button type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
                {isSubmitting ? "Salvando..." : "Redefinir senha"}
              </Button>
            </form>
          )}

          {!done && (
            <div className="reset-password-footer">
              <button type="button" onClick={onDone}>
                Voltar para o login
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
