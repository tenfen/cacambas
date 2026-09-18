import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "react-query";
import {
  transitions,
  positions,
  Provider as AlertProvider,
} from "react-alert";

import AlertTemplate from "react-alert-template-basic";

// Pages
import { RegisterEmail } from "./pages/registerEmail/registerEmail";
import { Login } from "./pages/login/Login";
import Subscription from "./pages/subscription/subscription";
import { ForgotPassword } from "./pages/forgotPassword/ForgotPassword";
import { ResetPassword } from "./pages/resetPassword/ResetPassword";
import { Landing } from "./pages/landing/Landing";
import { Termos } from "./pages/legal/Termos";
import { Privacidade } from "./pages/legal/Privacidade";

// Components
import { Router } from "./Router";

// Controllers
import UserController from "./controllers/UserController";

// Contexts
import AuthContext from "contexts/AuthContext";
import MessageContext from "./contexts/MessageContext";

// Helpers
import {
  getSessionItem,
  setSessionItem,
} from "./helpers/StorageTools";
import { normalizarPapel } from "./helpers/role";

// Modals
import MessageModal from "./modals/Message/MessageModal";

const queryClient = new QueryClient();

/*
 * Papéis que podem entrar no painel.
 */
const PAPEIS_ADMIN = ["admin", "superadmin"];

function podeEntrarNoPainel(papel) {
  const p = normalizarPapel(papel);

  return PAPEIS_ADMIN.includes(p);
}

const options = {
  position: positions.TOP_CENTER,
  timeout: 1000,
  offset: "60px",
  transition: transitions.SCALE,
  containerStyle: {
    fontSize: 14,
    zIndex: 100,
  },
};

function App() {
  const version = "1.0.8";

  /*
   * user representa uma sessão autenticada.
   * pendingUser representa um usuário recém-cadastrado,
   * ainda não autenticado e aguardando pagamento.
   */
  const [user, setUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);

  const [showRegister, setShowRegister] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [resetToken] = useState(() => {
    const match = window.location.pathname.match(/^\/reset-password\/(.+)$/);
    return match ? match[1] : null;
  });
  const [legalPage] = useState(() => {
    if (window.location.pathname === "/termos") return "termos";
    if (window.location.pathname === "/privacidade") return "privacidade";
    return null;
  });

  const [messageModal, setMessageModal] = React.useState({
    status: false,
    title: "Título",
    content: null,
    onConfirm: () => null,
    onCancel: () => null,
  });

  React.useEffect(() => {
    const userSession = getSessionItem("user", true);

    if (userSession) {
      /*
       * Se já está no formato { userLogged: {...} },
       * usa diretamente.
       */
      if (userSession.userLogged) {
        setUser(userSession);
      } else {
        /*
         * Compatibilidade com o formato antigo.
         */
        setUser({ userLogged: userSession });
      }
    }
  }, []);

  const buildUserLoggedFromUser = (returnUser) => ({
    login_user: `${returnUser.userEmail}`.trim(),
    nm_user: returnUser.userName,
    userLastname: returnUser.userLastname,
    phone_user: returnUser.userPhone,
    email_user: returnUser.userEmail,
    userId: returnUser.userId,
    userRole: returnUser.userRole,
    userAddressId: returnUser.userAddressId,
    userImage: returnUser.userImage,
    twoFactorEnabled: returnUser.twoFactorEnabled,
    notificationsEnabled: returnUser.notificationsEnabled,
    address: {
      street: "",
      number: "",
      city: "",
      state: "",
    },
  });

  const onSignIn = async ({ userEmail, userPass }) => {
    console.log("userEmail-----", userEmail);
    console.log("userPass-----", userPass);

    try {
      if (!userEmail) {
        return onMessage("Informação", "Usuário não informado!");
      }

      if (!userPass) {
        return onMessage("Informação", "Senha não informada!");
      }

      const res = await UserController.autenthicate({
        userEmail,
        userPass,
      });

      console.log("🔍 DEBUG LOGIN - Resposta completa:", res);

      if (res.status !== 200) {
        return onMessage(
          "Falha",
          res.error || res.message || "Falha ao realizar o login."
        );
      }

      const returnUser = res.content?.user;

      if (!returnUser) {
        return onMessage(
          "Falha",
          "A API não retornou os dados do usuário."
        );
      }

      const usernameRefactored = `${returnUser.userEmail}`.trim();

      console.log("🔍 DEBUG LOGIN - returnUser:", returnUser);
      console.log("🔍 DEBUG LOGIN - userRole:", returnUser.userRole);

      if (usernameRefactored !== userEmail) {
        return onMessage(
          "Informação",
          "Usuário ou senha incorretos!"
        );
      }

      /*
       * Primeiro decide o papel, porque a exigência de pagamento só
       * vale para o papel "user" (dono do negócio). admin/superadmin
       * são contas internas da plataforma e nunca passam pelo fluxo
       * de assinatura, então não têm (e não precisam ter) accountStatus
       * "active" — aplicar essa checagem antes do papel bloquearia
       * qualquer login de admin.
       */
      const papel = normalizarPapel(returnUser.userRole);

      if (podeEntrarNoPainel(returnUser.userRole)) {
        // admin/superadmin: sem checagem de pagamento, segue para o painel.
      } else if (papel === "user") {
        /*
         * accountStatus é o campo autoritativo de "pagamento em dia"
         * (é o que o webhook do Mercado Pago atualiza). Diferente de
         * "active" significa que ainda não foi pago.
         */
        if (!["active", "trial"].includes(returnUser.accountStatus)) {
          setPendingUser(returnUser);
          setShowSubscription(true);

          return onMessage(
            "Pagamento pendente",
            "Sua conta ainda não está ativa. Conclua o pagamento da mensalidade para acessar o sistema."
          );
        }
      } else {
        return onMessage(
          "Acesso negado",
          "Esta conta não tem permissão para acessar o painel. Use o aplicativo Cacambix."
        );
      }

      const userLogged = buildUserLoggedFromUser(returnUser);

      console.log("🔍 DEBUG LOGIN - userLogged criado:", userLogged);

      setUser({ userLogged });
      setSessionItem("user", userLogged, true);

      if (res.content?.token) {
        setSessionItem("authToken", res.content.token, true);
      }

      setTimeout(() => {
        window.location.href = "/";
      }, 500);

      return onMessage("Login realizado com Sucesso!");
    } catch (error) {
      console.error("Erro no login:", error);

      return onMessage(
        "Falha",
        "Falha ao realizar o login."
      );
    }
  };

  const onMessage = (
    title,
    content,
    onConfirm,
    onCancel
  ) => {
    setMessageModal({
      status: true,
      title,
      content,
      onConfirm,
      onCancel,
    });
  };

  const closeMessage = () => {
    setMessageModal({
      status: false,
      title: "Título",
      content: null,
      onConfirm: () => null,
      onCancel: () => null,
    });
  };

  const onRegister = () => {
    setShowRegister(true);
    setShowSubscription(false);
    setShowForgotPassword(false);
  };

  const onForgotPassword = () => {
    setShowForgotPassword(true);
    setShowRegister(false);
    setShowSubscription(false);
  };

  const onBackToLogin = () => {
    setShowRegister(false);
    setShowSubscription(false);
    setShowForgotPassword(false);
    setShowLogin(true);
    setPendingUser(null);
  };

  const onBackToHome = () => {
    setShowRegister(false);
    setShowSubscription(false);
    setShowForgotPassword(false);
    setShowLogin(false);
    setPendingUser(null);
  };

  /*
   * Chamado após o cadastro ser concluído. A conta já nasce em teste
   * grátis (accountStatus "trial"), então loga direto em vez de
   * forçar pagamento — o fluxo de assinatura só volta a aparecer
   * quando o teste expirar (checado no login) ou na renovação manual.
   */
  const onRegisterSuccess = (createdUser, token) => {
    console.log("Usuário criado:", createdUser);

    if (token) {
      setSessionItem("authToken", token, true);
    }

    const userLogged = buildUserLoggedFromUser(createdUser);

    setUser({ userLogged });
    setSessionItem("user", userLogged, true);
    setShowRegister(false);

    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  /*
   * Após pagamento aprovado, a tela de assinatura pode
   * redirecionar para o login.
   */
  const onPaymentFinished = () => {
    setPendingUser(null);
    setShowSubscription(false);
    setShowRegister(false);

    onMessage(
      "Pagamento realizado",
      "Pagamento recebido. Sua conta será ativada após a confirmação."
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      {(() => {
        /*
         * Link de redefinição de senha (aberto a partir do email).
         * Tem prioridade sobre qualquer outra tela, mesmo com sessão ativa.
         */
        if (resetToken) {
          return (
            <ResetPassword
              token={resetToken}
              onDone={() => {
                window.location.href = "/";
              }}
            />
          );
        }

        /*
         * Termos de Uso / Política de Privacidade: páginas públicas e
         * independentes de sessão, abertas normalmente numa aba própria.
         */
        if (legalPage === "termos") {
          return <Termos />;
        }

        if (legalPage === "privacidade") {
          return <Privacidade />;
        }

        /*
         * Usuário autenticado: mostra o painel.
         */
        if (user) {
          return (
            <AuthContext.Provider
              value={{
                user,
                version,
                setUser,
              }}
            >
              <MessageContext.Provider
                value={{
                  onMessage,
                  closeMessage,
                }}
              >
                <AlertProvider
                  template={AlertTemplate}
                  {...options}
                >
                  <BrowserRouter>
                    <div className="App">
                      <Router />
                    </div>
                  </BrowserRouter>
                </AlertProvider>
              </MessageContext.Provider>
            </AuthContext.Provider>
          );
        }

        /*
         * Usuário não autenticado: cadastro, assinatura ou login.
         */
        if (showSubscription && pendingUser) {
          return (
            <Subscription
              user={pendingUser}
              onBack={onBackToLogin}
              onPaymentFinished={onPaymentFinished}
            />
          );
        }

        if (showRegister) {
          return (
            <RegisterEmail
              onLogin={onBackToLogin}
              onBack={onBackToHome}
              onRegisterSuccess={onRegisterSuccess}
              onTerms={() => window.open("/termos", "_blank")}
              onPrivacy={() => window.open("/privacidade", "_blank")}
            />
          );
        }

        if (showForgotPassword) {
          return <ForgotPassword onBack={onBackToLogin} />;
        }

        if (showLogin) {
          return (
            <Login
              onClick={onSignIn}
              onRegister={onRegister}
              onForgotPassword={onForgotPassword}
              onBack={() => setShowLogin(false)}
            />
          );
        }

        /*
         * Porta de entrada padrão pra quem chega sem sessão: a landing
         * page de apresentação, não o login direto.
         */
        return (
          <Landing
            onLogin={() => setShowLogin(true)}
            onRegister={onRegister}
          />
        );
      })()}

      <MessageModal
        title={messageModal.title}
        status={messageModal.status}
        content={messageModal.content}
        onConfirm={messageModal.onConfirm}
        onCancel={messageModal.onCancel}
        onClose={closeMessage}
      />
    </QueryClientProvider>
  );
}

export default App;