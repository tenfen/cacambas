import React from "react"
import { createPortal } from "react-dom"
import "./ConfirmModal.scss"

function ConfirmModal({
  isOpen,
  title,
  content,
  onConfirm,
  onCancel,
  confirmLabel = "Excluir",
  variant = "delete",
}) {
  if (!isOpen) return null

  const isPositive = variant === "confirm"

  const modalContent = (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className={`confirm-modal-card ${isPositive ? "confirm-modal-positive" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          {isPositive ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2"/>
              <path d="M8 12.5l2.5 2.5L16 9.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
              <path d="M12 8v4m0 4h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-content">{content}</p>
        <div className="confirm-buttons">
          <button className="confirm-button cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className={`confirm-button ${isPositive ? "confirm" : "delete"}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof document === "undefined") {
    return modalContent
  }

  return createPortal(modalContent, document.body)
}

export default ConfirmModal
