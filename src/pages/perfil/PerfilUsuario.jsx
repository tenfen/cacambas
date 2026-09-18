import React, { useContext, useEffect, useRef, useState } from "react";
import { useAlert } from "react-alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faSave, faCreditCard } from "@fortawesome/free-solid-svg-icons";

import Button from "components/button/Button";
import { Input } from "components/input/Input";

import UserController from "../../controllers/UserController";
import PaymentController from "../../controllers/PaymentController";
import AuthContext from "contexts/AuthContext";
import LoadingContext from "../../contexts/LoadingContext";
import { setSessionItem } from "../../helpers/StorageTools";
import { isPaymentApproved } from "../../helpers/payment";

import "./PerfilUsuario.scss";

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

const PLANO_NOME = "Plano Profissional";
const PLANO_VALOR = "R$ 5,00 / mês";

const ACCOUNT_STATUS_LABELS = {
  trial: "Teste grátis",
  active: "Ativo",
  pending_payment: "Pagamento pendente",
  suspended: "Suspenso",
  cancelled: "Cancelado",
};

const PAYMENT_METHOD_LABELS = {
  pix: "Pix",
  bolbradesco: "Boleto",
  master: "Cartão de crédito (Mastercard)",
  visa: "Cartão de crédito (Visa)",
  elo: "Cartão de crédito (Elo)",
  amex: "Cartão de crédito (Amex)",
  hipercard: "Cartão de crédito (Hipercard)",
};

function formatData(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR");
}

function formatPaymentMethod(method) {
  if (!method) return "-";
  return PAYMENT_METHOD_LABELS[method] || `Cartão (${method})`;
}

function calcularDiasRestantes(currentPeriodEnd) {
  if (!currentPeriodEnd) return null;

  const fim = new Date(currentPeriodEnd);
  const hoje = new Date();
  const diffMs = fim.setHours(0, 0, 0, 0) - hoje.setHours(0, 0, 0, 0);

  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export default function PerfilUsuario() {
  const alert = useAlert();
  const { user, setUser } = useContext(AuthContext);
  const { setLoading } = useContext(LoadingContext);
  const userLogged = user?.userLogged || {};

  const [formData, setFormData] = useState({
    userName: userLogged.nm_user || "",
    userLastname: userLogged.userLastname || "",
    userPhone: userLogged.phone_user || "",
  });

  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [lastPayment, setLastPayment] = useState(null);
  const [loadingAssinatura, setLoadingAssinatura] = useState(true);

  const [renewLoading, setRenewLoading] = useState(false);
  const [renewChecking, setRenewChecking] = useState(false);
  const [renewError, setRenewError] = useState("");
  const [renewWaiting, setRenewWaiting] = useState(false);

  const pollTimerRef = useRef(null);
  const pollDeadlineRef = useRef(null);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    loadAssinatura();

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAssinatura = async () => {
    if (!userLogged.userId) return;

    setLoadingAssinatura(true);

    try {
      const userResponse = await UserController.getUserById(userLogged.userId);
      if (userResponse.status === 200) {
        setSubscriptionInfo(userResponse.content);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da assinatura:", error);
    }

    try {
      const paymentResponse = await PaymentController.getPaymentStatus(userLogged.userId);
      if (paymentResponse.status === 200) {
        setLastPayment(paymentResponse.content?.payment || null);
      }
    } catch (error) {
      /*
       * 404 quando ainda não existe nenhum pagamento registrado
       * (ex: conta ativada manualmente) — não é um erro a mostrar.
       */
      console.error("Erro ao carregar último pagamento:", error);
    } finally {
      setLoadingAssinatura(false);
    }
  };

  const checkRenewStatus = async ({ silent } = {}) => {
    if (!userLogged.userId) return false;

    if (!silent) {
      setRenewChecking(true);
      setRenewError("");
    }

    try {
      const response = await PaymentController.getPaymentStatus(userLogged.userId);

      if (response.status === 200 && isPaymentApproved(response.content)) {
        stopPolling();
        setRenewWaiting(false);
        alert.success("Pagamento confirmado! Assinatura renovada.");
        await loadAssinatura();
        return true;
      }

      if (!silent) {
        setRenewError(
          "Ainda não identificamos o pagamento. Se você já pagou, aguarde alguns instantes e tente novamente."
        );
      }

      return false;
    } catch (error) {
      console.error("Erro ao consultar status do pagamento:", error);

      if (!silent) {
        setRenewError("Não foi possível consultar o status do pagamento.");
      }

      return false;
    } finally {
      if (!silent) {
        setRenewChecking(false);
      }
    }
  };

  const startPolling = () => {
    stopPolling();

    pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS;
    setRenewWaiting(true);

    pollTimerRef.current = setInterval(async () => {
      const finished = await checkRenewStatus({ silent: true });

      if (finished) return;

      if (Date.now() >= pollDeadlineRef.current) {
        stopPolling();
        setRenewWaiting(false);
      }
    }, POLL_INTERVAL_MS);
  };

  const handleRenew = async () => {
    if (!userLogged.userId) return;

    setRenewLoading(true);
    setRenewError("");

    try {
      const response = await PaymentController.createCheckout(userLogged.userId);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(
          response.content?.message || response.message || "Não foi possível criar a cobrança."
        );
      }

      const checkoutUrl =
        response.content?.checkoutUrl || response.data?.checkoutUrl || response.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("O Mercado Pago não retornou a URL do checkout.");
      }

      const checkoutWindow = window.open(checkoutUrl, "_blank", "noopener,noreferrer");

      if (!checkoutWindow) {
        window.location.href = checkoutUrl;
        return;
      }

      startPolling();
    } catch (error) {
      console.error("Erro ao criar checkout de renovação:", error);
      setRenewError(error?.message || "Não foi possível iniciar o pagamento.");
    } finally {
      setRenewLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userName || !formData.userLastname) {
      alert.error("Nome e sobrenome são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const response = await UserController.updateProfile({
        userId: userLogged.userId,
        userName: formData.userName,
        userLastname: formData.userLastname,
        userPhone: formData.userPhone,
        userImage: userLogged.userImage,
        /*
         * Reenvia o email atual sem alteração: o backend só pede a senha
         * atual quando o email enviado é diferente do email cadastrado.
         */
        userEmail: userLogged.email_user,
      });

      if (response.status === 200) {
        const updatedUserLogged = {
          ...userLogged,
          nm_user: formData.userName,
          userLastname: formData.userLastname,
          phone_user: formData.userPhone,
        };

        setUser({ userLogged: updatedUserLogged });
        setSessionItem("user", updatedUserLogged, true);

        alert.success("Dados atualizados com sucesso!");
      } else {
        alert.error(response.message || response.content?.message || "Erro ao atualizar dados");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert.error("Erro ao atualizar dados");
    } finally {
      setLoading(false);
    }
  };

  const emTeste = subscriptionInfo?.accountStatus === "trial";
  const dataReferencia = emTeste
    ? subscriptionInfo?.trialEndsAt
    : subscriptionInfo?.currentPeriodEnd;
  const diasRestantes = calcularDiasRestantes(dataReferencia);
  const statusLabel = ACCOUNT_STATUS_LABELS[subscriptionInfo?.accountStatus] || "-";

  return (
    <section className="perfil-usuario">
      <div className="perfil-usuario-header">
        <div className="header-title">
          <FontAwesomeIcon icon={faUserCircle} className="header-icon" />
          <div>
            <h1>Meu Perfil</h1>
            <p>Atualize os seus dados de cadastro</p>
          </div>
        </div>
      </div>

      <div className="form-content">
        <div className="form-card">
          <div className="card-title">
            <FontAwesomeIcon icon={faCreditCard} /> Assinatura
          </div>

          {loadingAssinatura ? (
            <p className="subscription-loading">Carregando dados da assinatura...</p>
          ) : (
            <div className="subscription-grid">
              <div className="subscription-item">
                <span className="subscription-label">Plano</span>
                <span className="subscription-value">{PLANO_NOME}</span>
                <span className="subscription-sub">{PLANO_VALOR}</span>
              </div>

              <div className="subscription-item">
                <span className="subscription-label">Status</span>
                <span
                  className={`badge ${
                    ["active", "trial"].includes(subscriptionInfo?.accountStatus)
                      ? "badge-active"
                      : "badge-inactive"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="subscription-item">
                <span className="subscription-label">
                  {emTeste ? "Teste até" : "Válido até"}
                </span>
                <span className="subscription-value">
                  {formatData(dataReferencia)}
                </span>
              </div>

              <div className="subscription-item">
                <span className="subscription-label">Dias restantes</span>
                <span className="subscription-value">
                  {diasRestantes === null
                    ? "-"
                    : diasRestantes > 0
                    ? `${diasRestantes} dia${diasRestantes === 1 ? "" : "s"}`
                    : "Expirado"}
                </span>
              </div>

              <div className="subscription-item">
                <span className="subscription-label">Forma de cobrança</span>
                <span className="subscription-value">
                  {formatPaymentMethod(lastPayment?.paymentMethod)}
                </span>
              </div>

              <div className="subscription-item">
                <span className="subscription-label">Último pagamento</span>
                <span className="subscription-value">
                  {lastPayment
                    ? `R$ ${Number(lastPayment.amount).toFixed(2)} em ${formatData(lastPayment.paidAt || lastPayment.createdAt)}`
                    : "-"}
                </span>
              </div>
            </div>
          )}

          {!loadingAssinatura && (
            <div className="subscription-renew">
              {renewError && <div className="subscription-error">{renewError}</div>}

              {renewWaiting && (
                <div className="subscription-waiting">
                  Aguardando a confirmação do pagamento. Você pode fechar a aba do
                  Mercado Pago assim que concluir — esta tela atualiza sozinha.
                </div>
              )}

              <div className="subscription-renew-actions">
                <Button type="button" onClick={handleRenew} disabled={renewLoading}>
                  {renewLoading ? "Abrindo pagamento..." : "Renovar agora"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => checkRenewStatus()}
                  disabled={renewChecking}
                >
                  {renewChecking ? "Verificando..." : "Já paguei, verificar"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            <div className="card-title">Dados pessoais</div>

            <div className="form-row">
              <Input
                title="Nome"
                type="text"
                value={formData.userName}
                onChange={(e) => handleChange("userName", e.target.value)}
                required
              />

              <Input
                title="Sobrenome"
                type="text"
                value={formData.userLastname}
                onChange={(e) => handleChange("userLastname", e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <Input
                title="Telefone"
                type="text"
                value={formData.userPhone}
                onChange={(e) => handleChange("userPhone", e.target.value)}
              />

              <fieldset className="input-standard">
                <label>Email (login):</label>
                <input type="email" value={userLogged.email_user || ""} disabled />
                <span className="field-hint">O email de login não pode ser alterado por aqui.</span>
              </fieldset>
            </div>
          </div>

          <div className="form-actions">
            <Button type="submit">
              <FontAwesomeIcon icon={faSave} /> Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
