import React, { useEffect, useRef } from "react"

import "./Loading.scss"

import Logo from "../../assets/images/logo.svg"

const Loading = ({ messages = [], action = null }) => {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

  return (
    <div className="loading">
      <div className="loading-container">
        <div className="loading-card">
          <div className="loading-bar"></div>
          <img className="loading-image" src={Logo} alt={"logomarca"} />
          <p className="loading-text">
            {lastMessage || "Buscando informações..."}
          </p>
          {messages.length > 1 && (
            <div className="loading-messages">
              {messages.slice(-6).map((msg, i) => (
                <div
                  key={i}
                  className={`loading-message-item ${
                    i === Math.min(messages.length, 6) - 1 ? 'active' : 'faded'
                  }`}
                >
                  {msg}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
          {action && (
            <div className="loading-action">
              <div className="loading-action-message">{action.message}</div>
              <div className="loading-action-buttons">
                <button
                  className="loading-action-btn loading-action-btn--yes"
                  onClick={() => action.onResolve(true)}
                >
                  Sim, usar sugeridos
                </button>
                <button
                  className="loading-action-btn loading-action-btn--no"
                  onClick={() => action.onResolve(false)}
                >
                  Não, deixar vazio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Loading
