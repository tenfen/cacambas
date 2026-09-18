import React from "react"

// Style
import "./Footer.scss"

// Assets
import Logo from "../../assets/images/logo.svg"
import AuthContext from "../../contexts/AuthContext"

export default function Footer() {
  const { version } = React.useContext(AuthContext)
  return (
    <footer>
      {/* <span className="footer-logo"> */}
      <img src={Logo} alt="logomarca" />
      {/* </span>/ */}
      <p className="rights">
        Cacambix - Todos os direitos reservados <strong>(v{version})</strong>
      </p>
      <a href="/termos" target="_blank" rel="noreferrer" className="privacy">
        Termos de Uso
      </a>
      <a href="/privacidade" target="_blank" rel="noreferrer" className="privacy">
        Política de Privacidade
      </a>
    </footer>
  )
}
