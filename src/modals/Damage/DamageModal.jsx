import React from "react"
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"

import { Input } from "../../components/input/Input"

// Controllers
import DamageController from "../../controllers/DamageController"

// Contexts
import MessageContext from "../../contexts/MessageContext"

import "./DamageModal.scss"

const DamageModal = ({ status, title, content, onRefresh, onClose }) => {
  const { onMessage } = React.useContext(MessageContext)

  const [damage, setDamage] = React.useState(content)

  React.useEffect(() => {
    setDamage(content)
  }, [status])

  const onSaveDamage = (damage) => {
    if (damage?.nm_damage) {
      if (damage.id_damage) {
        DamageController.updateDamage(damage.id_damage, damage).then((responseDamage) => {
          if (responseDamage.status === 200) {
            onRefresh(responseDamage?.content)
            onMessage("Informação", "Tipo de dano atualizado com sucesso!")
          } else {
            onMessage("Informação", "Erro ao atualizar o tipo de dano")
          }
        })
      } else {
        DamageController.createDamage(damage).then((responseDamage) => {
          if (responseDamage.status === 201) {
            onRefresh(responseDamage?.content)
            onMessage("Informação", "Tipo de dano cadastrado com sucesso!")
          } else {
            onMessage("Informação", "Erro ao cadastrar o tipo de dano")
          }
        })
      }
    } else {
      onMessage("Informação", "Faltou informar o nome do dano")
    }
  }

  return (
    <Modal isOpen={status} className="damage-modal" centered={true} size="sm">
      <ModalHeader className="damage-modal--header" toggle={onClose}>
        <Label>{title}</Label>
      </ModalHeader>
      <ModalBody className="damage-modal--body">
        <div className="damage-modal--body--form">
          <Input
            title="Nome do Dano"
            placeholder={"Nome do Dano"}
            value={damage?.nm_damage || ""}
            onChange={(event) => setDamage({ ...damage, nm_damage: event.target.value })}
          />
        </div>
      </ModalBody>
      <ModalFooter className="damage-modal--footer">
        <Button className={"button-standard"} onClick={() => onSaveDamage(damage)}>
          Salvar
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default DamageModal
