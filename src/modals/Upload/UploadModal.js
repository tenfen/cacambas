import React from "react"
import Cropper from "react-easy-crop"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { Label, Button, Modal, ModalBody, ModalFooter, ModalHeader, Input } from "reactstrap"

import { encrypt } from "helpers/StorageTools"

import "./UploadModal.scss"
import getCroppedImg from "./CropImage"

const UploadModal = ({ status, title, content, onClose, onSave }) => {
  const [zoom, setZoom] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [crop, setCrop] = React.useState({ x: 0, y: 0 })
  const [image, setImage] = React.useState({
    imageName: "",
    imageFile: {},
    imagePreview: "",
  })
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState(null)

  /* eslint-disable*/
  React.useEffect(() => {
    setZoom(1)
    if (!!content && !!content.file) {
      setImage(content.file)
    } else {
      setImage({ imageName: "", imageFile: {}, imagePreview: "" })
    }
  }, [content])

  const onCropComplete = React.useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const showCroppedImage = React.useCallback(async () => {
    try {
      const croppedFile = await getCroppedImg(image, croppedAreaPixels, rotation)

      const newFileCropped = new File([croppedFile], croppedFile.name + croppedFile.size, {
        type: croppedFile.type,
        lastModified: croppedFile.lastModified,
      })

      setZoom(1)
      setImage({
        ...croppedFile,
        imageFile: newFileCropped,
        imagePreview: URL.createObjectURL(newFileCropped),
        imageName: encrypt(newFileCropped.name + newFileCropped.size, "sha256"),
      })
    } catch (e) {
      console.error("Erro ao cortar a imagem!", e)
    }
  }, [croppedAreaPixels, rotation])

  const onChangeFile = (event) => {
    const { files = null } = event.target
    if (!!files && files.length > 0) {
      setImage({
        imageName: encrypt(files[0].name + files[0].size, "sha224"),
        imageFile: files[0],
        imagePreview: URL.createObjectURL(files[0]),
      })
    }
  }

  const onChangeZoom = (dir) => {
    if (dir === "up") {
      const newZoom = zoom + 0.2
      if (newZoom <= 3.2) {
        setZoom(newZoom)
      }
    } else {
      const newZoom = zoom - 0.2
      if (newZoom >= 1) {
        setZoom(newZoom)
      }
    }
  }

  return (
    <Modal isOpen={status} toggle={onClose} size={!!content ? content.size || "md" : "md"} className="modal-upload" centered={true}>
      <ModalHeader toggle={onClose} className="upload-header">
        {title}
      </ModalHeader>
      <ModalBody className="upload-content">
        <div className="upload-cropper">
          <Cropper
            image={image.imagePreview}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            showGrid={false}
            cropShape={!!content ? content.shape : "rect"}
            aspect={!!content ? content.aspect : 4 / 4}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div className="upload-button-group">
          <Button
            type="button"
            color="secondary"
            onClick={() => onChangeZoom("down")}
            className={"ripple btn-raised btn-primary " + (zoom <= 1 ? "disabled readonly-group" : "")}
          >
            <FontAwesomeIcon icon="search-minus" />
          </Button>
          <Button
            type="button"
            color="secondary"
            onClick={() => onChangeZoom("up")}
            className={"ripple btn-raised btn-primary " + (zoom >= 3 ? "disabled readonly-group" : "")}
          >
            <FontAwesomeIcon icon="search-plus" />
          </Button>
          <Label className="upload-button-group--load ripple btn-raised btn-primary  btn btn-secondary">
            <Input type="file" accept="image/*" onChange={onChangeFile} />
            <FontAwesomeIcon className="icon" icon="upload" />
            &nbsp;Carregar
          </Label>
          <Button type="button" color="secondary" onClick={showCroppedImage} className="ripple btn-raised btn-danger">
            <FontAwesomeIcon icon="cut" />
            &nbsp;Cortar
          </Button>
        </div>
      </ModalBody>
      <ModalFooter className="upload-footer">
        <Button
          type="button"
          className="ripple btn-raised float-right btn-success"
          onClick={() => {
            onSave(image, content && content.name)
            onClose()
          }}
        >
          <FontAwesomeIcon icon="check" />
          &nbsp;Atualizar
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default UploadModal
