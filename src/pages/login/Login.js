import React from "react"
import Logo from "assets/images/logo.png"
import Button from "components/button/Button"

import { Input } from "components/input/Input"

import "./Login.scss"

export function Login({ onClick }) {
  const [login, setLogin] = React.useState({ userEmail: "", userPass: "" })

  const onChangeUsername = (userEmail) => {
    setLogin({ ...login, userEmail })
  }

  const onChangePassword = (userPass) => {
    setLogin({ ...login, userPass })
  }

  return (
    <main id="login">
      <section className="content">
        <img src={Logo} alt="Logomarca" className="logomarca" />
        <fieldset className="login-inputs">
          <h1>Acessar Gerenciador</h1>
          <Input title="Email" type="text" placeholder="Digite seu email" onChange={(event) => onChangeUsername(event.target.value)} />
          <Input title="Senha" type="password" placeholder="Digite sua senha" onChange={(event) => onChangePassword(event.target.value)} />
          <Button onClick={() => onClick(login)}>Entrar</Button>
        </fieldset>
      </section>
    </main>
  )
}
