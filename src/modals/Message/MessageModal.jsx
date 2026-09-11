import React from "react"
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"

import "./MessageModal.scss"

function MessageModal({ status, title, content, buttonCancel = { status: true }, buttonConfirm = { status: true }, onConfirm, onCancel, onClose }) {
  return (
    <Modal isOpen={status} toggle={onClose} className="message-modal" centered={true}>
      <ModalHeader toggle={onClose}>{title}</ModalHeader>
      <ModalBody>{content}</ModalBody>
      <ModalFooter>
        {(() => {
          if (buttonCancel?.status) {
            return (
              <Button color="secondary" onClick={onCancel || onClose}>
                {buttonCancel?.title || "Fechar"}
              </Button>
            )
          }
        })()}

        {(() => {
          if (buttonConfirm?.status) {
            return (
              <Button color="success" onClick={onConfirm || onClose}>
                {buttonConfirm?.title || "Confirmar"}
              </Button>
            )
          }
        })()}
      </ModalFooter>
    </Modal>
  )
}

export default MessageModal
