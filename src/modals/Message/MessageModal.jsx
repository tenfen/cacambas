import React, { useEffect } from "react"
import "./MessageModal.scss"

function MessageModal({ status, title, content, onClose }) {
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        if (onClose) {
          onClose()
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [status, onClose])

  if (!status) return null

  return (
    <div className="message-modal-overlay" onClick={onClose}>
      <div className="message-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="message-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#06b6d4" strokeWidth="2"/>
            <path d="M12 8v4m0 4h.01" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="message-title">{title}</h3>
        <p className="message-content">{content}</p>
        <div className="message-progress-bar">
          <div className="message-progress-fill"></div>
        </div>
      </div>
    </div>
  )
}

export default MessageModal
