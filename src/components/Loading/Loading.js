import React from "react"

import "./Loading.scss"

import Logo from "../../assets/images/logo.png"

const Loading = () => {
  return (
    <div className="loading">
      <img className="loading-image" src={Logo} alt={"logomarca"} />
      <p>Carregando...</p>
    </div>
  )
}

export default Loading
