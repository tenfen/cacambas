import React, { useState } from "react"
import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider, QueryClient } from "react-query"
// import { ReactQueryDevtools } from "react-query/devtools"
import { transitions, positions, Provider as AlertProvider } from "react-alert"

import AlertTemplate from "react-alert-template-basic"

// Components
import { Router } from "./Router"
import { Login } from "./pages/login/Login"

// Controllers
import BucketController from "./controllers/BucketController"
import { MemoryController } from "./controllers/MemoryController"
import { ProcessorController } from "./controllers/ProcessorController"
import { StorageController } from "./controllers/StorageContoller"
import UserController from "./controllers/UserController"

// Contexts
import AuthContext from "contexts/AuthContext"
import FeatureContext from "./contexts/FeatureContext"

// Helpers
import { getLocalItem, getSessionItem, setLocalItem, setSessionItem } from "./helpers/StorageTools"
import MessageContext from "./contexts/MessageContext"
import MessageModal from "./modals/Message/MessageModal"

const queryClient = new QueryClient()

const options = {
  position: positions.TOP_CENTER,
  timeout: 3000,
  offset: "60px",
  transition: transitions.SCALE,
  containerStyle: {
    fontSize: 14,
    zIndex: 100,
  },
}

function App() {
  const version = "1.0.8"

  const [user, setUser] = useState(null)

  const [buckets, setBuckets] = React.useState([])
  const [damages, setDamages] = React.useState([])
  const [memories, setMemories] = React.useState([])
  const [storages, setStorages] = React.useState([])
  const [processors, setProcessors] = React.useState([])

  const [messageModal, setMessageModal] = React.useState({
    status: false,
    title: "Título",
    content: null,
    onConfirm: () => null,
    onCancel: () => null,
  })

  React.useEffect(() => {
    const userSession = getSessionItem("user", true)
    if (!!userSession) {
      setUser(userSession)
    }

    console.log("1 - CARREGANDO DADOS DE Caçambas...")
    const bucketsLocal = getLocalItem("buckets", true)

    if (!!bucketsLocal) {
      setBuckets(bucketsLocal)
    }

    BucketController.getAllBuckets().then((responseBucket) => {
      if (responseBucket.status === 200) {
        setBuckets(responseBucket.content)
        setLocalItem("buckets", responseBucket.content, true)
      } else {
        console.error("Erro ao consultar dados de caçambas")
      }
    })
    console.log("2 - CARREGANDO DADOS DE MEMORIAS...")
    const memoriesLocal = getLocalItem("memories", true)

    if (!!memoriesLocal) {
      setMemories(memoriesLocal)
    }

    MemoryController.getAllMemorires().then((responseMemory) => {
      if (responseMemory.status === 200) {
        setMemories(responseMemory.content)
        setLocalItem("memories", responseMemory.content, true)
      } else {
        console.error("Erro ao consultar dados de memórias")
      }
    })
    console.log("3 - CARREGANDO DADOS DE ARMAZENAMENTO...")
    const storagesLocal = getLocalItem("storages", true)

    if (!!storagesLocal) {
      setStorages(storagesLocal)
    }

    StorageController.getAllStorages().then((responseStorage) => {
      if (responseStorage.status === 200) {
        setStorages(responseStorage.content)
        setLocalItem("storages", responseStorage.content, true)
      } else {
        console.error("Erro ao consultar dados de armazenamento")
      }
    })

    console.log("4 - CARREGANDO DADOS DE PROCESSADORES...")

    const processorsLocal = getLocalItem("processors", true)

    if (!!processorsLocal) {
      setProcessors(processorsLocal)
    }
    /*
    ProcessorController.getAllProcessors().then((responseProcessor) => {
      if (responseProcessor.status === 200) {
        setProcessors(responseProcessor.content)
        setLocalItem("processors", responseProcessor.content, true)
      } else {
        console.error("Erro ao consultar dados de processadores")
      }
    })
      */

    console.log("5 - CARREGANDO OS TIPOS DE DANOS...")

    const damagesLocal = getLocalItem("damages", true)

    if (!!damagesLocal) {
      setProcessors(damagesLocal)
    }
/*
    DamageController.getAllDamages().then((responseDamage) => {
      if (responseDamage.status === 200) {
        setDamages(responseDamage?.content)
        setLocalItem("damages", responseDamage?.content, true)
      } else {
        console.error("Erro ao consultar dados de tipos de danos")
      }
    })
      */
  }, [])


const onSignIn = async ({ userEmail, userPass }) => {
  console.log("userEmail:", userEmail);
  console.log("userPass:", userPass);

  const userLogged = {
    login_user: userEmail,
    nm_user: "Usuário Teste",
    phone_user: "",
    email_user: userEmail,
    userId: "999999",
    address: {
      street: "",
      number: "",
      city: "",
      state: "",
    },
  };

  setUser({ userLogged });
  setSessionItem("user", userLogged, true);

  return onMessage("Informação", "Login realizado com Sucesso!");
};

  /*
  const onSignIn = async ({ userEmail, userPass }) => {
    const userEmail = "crtenfen@gmail.com"
    const userPass = "654321"
    console.log('userEmail-----', userEmail);
    console.log('userPass-----', userPass);
    try{
      if (!!userEmail) {
        if (!!userPass) {
          const res = await UserController.autenthicate({ userEmail, userPass });
          const returnUser = res.content.user;
          const usernameRefactored = `${returnUser.userEmail}`.trim();
          console.log('login--------', res)
          if (res.status === 200) {
            if(usernameRefactored === userEmail) {
              const userLogged = {
                login_user: usernameRefactored,
                nm_user: returnUser.userName,
                phone_user: returnUser.userPhone,
                email_user: returnUser.userEmail,
                userId: returnUser.userId,
                address: {
                  street: "",
                  number: "",
                  city: "",
                  state: "",
                },
              }
              setUser({ userLogged })
              setSessionItem("user", userLogged, true)
              return onMessage("Informação", "Login realizado com Sucesso!")
            }
            return onMessage("Informação", "Usuário ou senha incorretos!")
          } else {
            onMessage("Falha ao realizar o loginnn")
          }
        }else{
          return onMessage("Informação", "Senha não informada!")
        }
      }else{
        return onMessage("Informação", "Usuário não informado!")
      }

    }catch{
      return onMessage("Falha", "Falha ao realizar o login")
    }

  }

  */

  const onMessage = (title, content, onConfirm, onCancel) => {
    setMessageModal({ status: true, title, content, onConfirm, onCancel })
  }

  const closeMessage = () => {
    setMessageModal({ status: false, title: "Título", content: null, onConfirm: () => null, onCancel: () => null })
  }

  return (
    <QueryClientProvider client={queryClient}>
      {(() => {
        if (!user) {
          return <Login onClick={onSignIn} />
        } else {
          return (
            <AuthContext.Provider value={{ user, version, setUser }}>
              <FeatureContext.Provider
                value={{
                  buckets,
                  memories,
                  storages,
                  processors,
                  damages,
                  setBuckets,
                  setMemories,
                  setStorages,
                  setProcessors,
                  setDamages,
                }}
              >
                <MessageContext.Provider value={{ onMessage, closeMessage }}>
                  <AlertProvider template={AlertTemplate} {...options}>
                    <BrowserRouter>
                      <div className="App">
                        <Router />
                      </div>
                    </BrowserRouter>
                  </AlertProvider>
                </MessageContext.Provider>
              </FeatureContext.Provider>
            </AuthContext.Provider>
          )
        }
      })()}

      {/*<ReactQueryDevtools initialIsOpen={false} position={"bottom-right"} />*/}

      <MessageModal
        title={messageModal.title}
        status={messageModal.status}
        content={messageModal.content}
        onConfirm={messageModal.onConfirm}
        onCancel={messageModal.onCancel}
        onClose={() =>
          setMessageModal({
            status: false,
            title: "Título",
            content: null,
            onConfirm: () => null,
            onCancel: () => null,
          })
        }
      />
    </QueryClientProvider>
  )
}

export default App
