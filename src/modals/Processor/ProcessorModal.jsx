import React from "react"
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"

import { Input } from "../../components/input/Input"

// Controllers
import { ProcessorController } from "../../controllers/ProcessorController"

import "./ProcessorModal.scss"

const ProcessorModal = ({ status, title, content, onRefresh, onClose }) => {
  const [processor, setProcessor] = React.useState(content)

  React.useEffect(() => {
    setProcessor(content)
  }, [status])

  const onSaveProcessor = (processor) => {
    if (processor.id_processor) {
      ProcessorController.updateProcessor(processor.id_processor, processor).then((responseProcessor) => {
        if (responseProcessor.status === 200) {
          console.log("Processador atualizado com sucesso!")
          onRefresh(responseProcessor?.content)
        } else {
          alert("Erro ao atualizar o processador")
        }
      })
    } else {
      ProcessorController.createProcessor(processor).then((responseProcessor) => {
        if (responseProcessor.status === 200) {
          console.log("Processador salvo com sucesso!")
          onRefresh(responseProcessor?.content)
        } else {
          alert("Erro ao cadastrar o processsador")
        }
      })
    }
  }

  return (
    <Modal isOpen={status} className="processor-modal" centered={true} size="sm">
      <ModalHeader className="processor-modal--header" toggle={onClose}>
        <Label>{title}</Label>
      </ModalHeader>
      <ModalBody className="processor-modal--body">
        <div className="processor-modal--body--form">
          <Input
            title="Nome do Processador"
            placeholder={"Nome do Processador"}
            value={processor?.nm_processor || ""}
            onChange={(event) => setProcessor({ ...processor, nm_processor: event.target.value })}
          />
        </div>
      </ModalBody>
      <ModalFooter className="processor-modal--footer">
        <Button className={"button-standard"} onClick={() => onSaveProcessor(processor)}>
          Salvar
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ProcessorModal
