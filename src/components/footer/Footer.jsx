import React from "react"

// Style
import "./Footer.scss"

// Assets
import Logo from "../../assets/images/logo.png"
import AuthContext from "../../contexts/AuthContext"

export default function Footer() {
  const { version } = React.useContext(AuthContext)
  return (
    <footer>
      {/* <span className="footer-logo"> */}
      <img src={Logo} alt="logomarca" />
      {/* </span>/ */}
      <p className="rights">
        iCellFipe - Todos os direitos reservados <strong>(v{version})</strong>
      </p>
      <a href="/" className="privacy">
        Politica de privacidade
      </a>
    </footer>
  )
}
