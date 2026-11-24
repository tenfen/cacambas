import { useEffect, useRef, useState } from "react";
import Logo from "assets/images/logo.svg";
import Button from "components/button/Button";
import PaymentController from "../../controllers/PaymentController";
import UserController from "../../controllers/UserController";
import "./subscription.scss";

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

export default function Subscription({ user, onBack, onPaymentFinished }) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [waitingPayment, setWaitingPayment] = useState(false);

  const pollTimerRef = useRef(null);
  const pollDeadlineRef = useRef(null);
  const mountedRef = useRef(false);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    // Voltou do Mercado Pago na mesma aba: retoma a verificação.
    const retorno = new URLSearchParams(window.location.search).get("payment");

    if (retorno === "success" || retorno === "pending") {
      checkPaymentStatus({ silent: true }).then((finished) => {
        if (!finished && mountedRef.current) startPolling();
      });
    }

    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPaymentStatus = async ({ silent } = {}) => {
    if (!user?.userId) {
      return false;
    }

    if (!silent) {
      setChecking(true);
      setError("");
    }

    try {
      /*
       * Consulta a conta, e não o último pagamento: um pagamento antigo
       * aprovado não libera o acesso, e uma cobrança nova pendente não
       * pode esconder outra que já foi paga.
       */
      const response = await UserController.getUserById(user.userId);

      if (!mountedRef.current) {
        return false;
      }

      if (response.status === 200 && response.content?.accountStatus === "active") {
        stopPolling();
        setWaitingPayment(false);

        if (onPaymentFinished) {
          onPaymentFinished(response.content);
        }

        return true;
      }

      if (!silent) {
        setError(
          "Ainda não identificamos o pagamento. Se você já pagou, aguarde alguns instantes e tente novamente."
        );
      }

      return false;
    } catch (err) {
      console.error("Erro ao consultar status do pagamento:", err);

      if (!silent) {
        setError("Não foi possível consultar o status do pagamento.");
      }

      return false;
    } finally {
      if (!silent) {
        setChecking(false);
      }
    }
  };

  const startPolling = () => {
    stopPolling();

    pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS;
    setWaitingPayment(true);

    pollTimerRef.current = setInterval(async () => {
      const finished = await checkPaymentStatus({ silent: true });

      if (finished) {
        return;
      }

      if (Date.now() >= pollDeadlineRef.current) {
        stopPolling();
        setWaitingPayment(false);
      }
    }, POLL_INTERVAL_MS);
  };

  const handleCheckout = async () => {
    if (!user?.userId) {
      setError("Usuário não identificado.");
      return;
    }

    setLoading(true);
    setError("");

    /*
     * Abre a aba ainda dentro do clique, senão o navegador pode bloquear.
     * Sem "noopener": com ele window.open sempre devolve null.
     */
    const checkoutWindow = window.open("", "_blank");

    if (checkoutWindow) {
      checkoutWindow.opener = null;
    }

    try {
      const response = await PaymentController.createCheckout(user.userId);

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

      if (!checkoutWindow) {
        /*
         * Bloqueio de pop-up: navega na mesma aba como alternativa.
         */
        window.location.href = checkoutUrl;
        return;
      }

      checkoutWindow.location.replace(checkoutUrl);

      startPolling();
    } catch (err) {
      if (checkoutWindow) {
        checkoutWindow.close();
      }

      console.error("Erro ao criar checkout:", err);
      setError(err?.message || "Não foi possível iniciar o pagamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="subscription">
      <div className="subscription-container">
        <div className="subscription-card">
          <div className="subscription-header">
            <img src={Logo} alt="Logomarca" className="logomarca" />

            <h2>Falta pouco!</h2>

            <p>Ative sua assinatura para acessar o painel administrativo</p>
          </div>

          <div className="plan-box">
            <span className="plan-name">Plano Profissional</span>
            <span className="plan-price">
              R$ 89,90 <small>/ mês</small>
            </span>
          </div>

          {error && <div className="subscription-error">{error}</div>}

          {waitingPayment && (
            <div className="subscription-waiting">
              Aguardando a confirmação do pagamento. Você pode fechar a aba do
              Mercado Pago assim que concluir o pagamento — esta tela será
              atualizada automaticamente.
            </div>
          )}

          <Button type="button" onClick={handleCheckout} disabled={loading} style={{ width: "100%" }}>
            {loading ? "Abrindo pagamento..." : "Assinar agora"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => checkPaymentStatus()}
            disabled={checking}
            style={{ width: "100%" }}
          >
            {checking ? "Verificando..." : "Já paguei, verificar pagamento"}
          </Button>

          {onBack && (
            <div className="subscription-footer">
              <button type="button" onClick={onBack}>
                Voltar para o login
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
