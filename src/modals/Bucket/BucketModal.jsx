import React, { useContext, useEffect, useState } from "react"
import { useAlert } from "react-alert"
import { useNavigate, useParams } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"

import Button from "../../components/button/Button"
import PreviewImage from "../../components/PreviewImage/PreviewImage"

import { Input } from "../../components/input/Input"
import { Select } from "../../components/select/Select"
import { InfoItem } from "../../components/infoItem/InfoItem"

// Controllers
import BucketController from "../../controllers/BucketController"
import UploadController from "../../controllers/UploadController"

// Helpers
import { getUrlAWSFile } from "../../helpers/MethodTools"

// Modals
import UploadModal from "../Upload/UploadModal"
import MessageContext from "../../contexts/MessageContext"

// Assets
import defaultImage from "../../assets/images/no-image.png"

import "./BucketModal.scss"

const BucketModal = ({ status, title, content, onRefresh, onClose }) => {
  const [bucket, setBucket] = useState({})
  const alert = useAlert()
  const navigate = useNavigate()
  const { onMessage, closeMessage } = useContext(MessageContext)
  const [loadingImage, setLoadingImage] = useState(false)
  const [uploadImages, setUploadImages] = useState([])

  const [uploadModal, setUploadModal] = useState({ status: false, content: null })

  useEffect(() => {
    setBucket(content)
  }, [content])

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}`;
  }

  const onChangeImage = (image) => {
    setLoadingImage(true)
    //setBrand({ ...brand, brandImage: image.imagePreview })

    if (!!bucket.bucketId) {
      const lastUrlImage = bucket.bucketImage ? [bucket.bucketImage] : []
      const DateNow = new Date();
      const formattedDate = formatDate(DateNow);
      const path='buckets/' + formattedDate + '-' + bucket?.bucketName;
      UploadController.upload([image], path, lastUrlImage)
        .then((responseUpload) => {
          if (responseUpload.status === 200) {
            const returnImage = Object.values(responseUpload.content)[0];
            onSaveBucket({ ...bucket, bucketImage: returnImage})
            alert.success("Caçamba atualizada com sucesso!")
          } else {
            console.error("Erro ao salvar imagem do combo! Tente novamente.")
          }
        })
        .catch((error) => {
          console.error("Erro ao salvar imagem do combo!", error)
        })
        .finally(() => {
          setLoadingImage(false)
        })
    } else {
      setLoadingImage(false)
      setUploadImages([...uploadImages, image])
    }
  }

  const onSaveBucket = (bucket) => {
    if (bucket.bucketId) {
      BucketController.updateBucket(bucket.bucketId, bucket).then((responseBucket) => {
        if (responseBucket.status === 200) {
          console.log("Caçamba atualizada com sucesso!")
          onRefresh()
        } else {
          alert("Erro ao atualizar a Caçamba")
        }
      })
    } else {
        
    }
  }

  const onDeleteBucket = (bucketId) => {
    setLoadingImage(true)
    BucketController.deleteBucket(bucketId)
      .then((responseBucket) => {
        if (responseBucket.status === 200) {
          alert.success("Caçamba excluída com sucesso!")
          onClose();
          onRefresh(); // Atualiza a lista de marcas
        } else {
          alert.error("Erro ao excluir a Caçamba")
        }
      })
      .finally(() => {
        setLoadingImage(false)
        closeMessage();
      })
  }

  return (
    <Modal isOpen={status} className="bucket-modal" centered={true}>
      <ModalHeader className="bucket-modal--header" toggle={onClose}>
        <Label>{title}</Label>
      </ModalHeader>
      <ModalBody className="bucket-modal--body">
        <div className="bucket-modal--body--form">
          <Input
            title="Nome da Caçamba"
            placeholder={"Nome da Caçamba"}
            value={bucket?.bucketName || ""}
            onChange={(event) => setBucket({ ...bucket, bucketName: event.target.value })}
          />
        </div>
      </ModalBody>
      <ModalFooter className="bucket-modal--footer">
      <Button
        className={"trash-icon " + (!bucket?.bucketId ? "disabled" : "")}
        onClick={() => onMessage("Confirmação", "Deseja mesmo excluir a Caçamba?", () => onDeleteBucket(bucket.bucketId))}>
        <FontAwesomeIcon icon="trash-alt" />
      </Button>
        <Button onClick={() => onSaveBucket(bucket)}>Salvar</Button>
      </ModalFooter>

      <UploadModal
        title="Enviando Imagem"
        status={uploadModal.status}
        content={uploadModal.content}
        onSave={onChangeImage}
        onClose={() => setUploadModal({ status: false, content: null })}
      />
    </Modal>
  )
}

export default BucketModal
