import React, { useEffect, useState, useContext } from "react"
import { useAlert } from "react-alert"

//  External Components
import { Button, Label } from "reactstrap"
import { useNavigate, useParams } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

// Internal Components
import { Input } from "components/input/Input"
import { Select } from "components/select/Select"
import { InfoItem } from "components/infoItem/InfoItem"

import PreviewImage from "../../components/PreviewImage/PreviewImage"

// Modals
import UploadModal from "../../modals/Upload/UploadModal"
import ProcessorModal from "../../modals/Processor/ProcessorModal"

/// Helpers
import { formatMoney, getUrlAWSFile } from "../../helpers/MethodTools"
import { getLocalItem, getSessionItem, setLocalItem, setSessionItem } from "../../helpers/StorageTools"

// Controllers
import { UploadController } from "../../controllers/UploadController"
import { DeviceController } from "../../controllers/DeviceController"

// Contexts
import FeatureContext from "../../contexts/FeatureContext"
import LoadingContext from "../../contexts/LoadingContext"
import MessageContext from "../../contexts/MessageContext"


// Style
import "./Device.scss"

export default function Device() {
  const alert = useAlert()
  const navigate = useNavigate()
  const { deviceId } = useParams()

  const { onMessage, closeMessage } = useContext(MessageContext)
  const { setLoading } = useContext(LoadingContext)
  const [ brands, setBrands ] = React.useState([])
  const [ deviceUpdate, setDeviceUpdate] = React.useState([])
  const { processors, setProcessors } = useContext(FeatureContext)
  const { memories, setMemories } = useContext(FeatureContext)
  const { storages, setStorages } = useContext(FeatureContext)
  const [ conections, setConections ] = React.useState([])
  const [ imagem, setImages ] = React.useState([])


  const [device, setDevice] = useState({
    deviceTitle: "",
    deviceDescription: "",
    deviceVersion: "",
    deviceYear: "",
    deviceActive:"",
    deviceBroadband: "",
    deviceImage: "",
    deviceProcessor:  "" ,
    deviceBrand : "" ,
    deviceMemory: "" ,
    deviceStorage : "" ,
    devicePrice: {
      new: {minValue: 0, medValue: 0,  maxValue: 0 },
      used: { minValue: 0, medValue: 0, maxValue: 0 },
    },
    damages: [],
  })

  const [loadingImage, setLoadingImage] = React.useState(false)
  const [uploadImages, setUploadImages] = React.useState([])

  const [uploadModal, setUploadModal] = React.useState({ status: false, content: null })
  const [processorModal, setProcessorModal] = React.useState({ status: false, content: null })

  useEffect(() => {
    if (deviceId) {
      DeviceController.getOneDevice(deviceId).then((responseDevice) => {
        if (responseDevice.status === 200) {
          const { categories = [], damages = [], devicePrice = []  } = responseDevice?.content[0] || {}
          const device = {
            ...responseDevice.content[0],
            damages: damages.map(({ id_damage, uuid_damage, nm_damage, st_damage, damage_device }) => {
              return { id_damage, uuid_damage, nm_damage, st_damage, ...damage_device }
            }),
          }

          setDevice(device)
        } else {
          alert.error("Erro ao consultar dados do dispositivo")
        }
      })
    }
    const brandsLocal = getLocalItem("brands", true)
    setBrands(brandsLocal)

    const storagesLocal = getLocalItem("storages", true)
    setStorages(storagesLocal); // Armazena a lista formatada

    const memoryLocal = getLocalItem("memories", true)
    setMemories(memoryLocal)

    const conectionsLocal = [
      { conectionId: 1, conectionName: "3G" },
      { conectionId: 2, conectionName: "4G" },
      { conectionId: 3, conectionName: "5G" },
      { conectionId: 4, conectionName: "3G/4G" },
      { conectionId: 5, conectionName: "4G/5G" },
      { conectionId: 6, conectionName: "3G/4G/5G" }
    ];
    setConections(conectionsLocal);

    DeviceController.getAllDevices() 
          .then((responseDevices) => {
            console.log(responseDevices)
            if (responseDevices.status === 200) {
              setDeviceUpdate(responseDevices.content)
            }
          })
    

  }, [deviceId])

  const getDeviceId = (deviceId) =>{
    DeviceController.getOneDevice(deviceId).then((responseDevice) => {
      if (responseDevice.status === 200) {
        const { categories = [], damages = [], devicePrice = []  } = responseDevice?.content[0] || {}
        const device = {
          ...responseDevice.content[0],
          damages: damages.map(({ id_damage, uuid_damage, nm_damage, st_damage, damage_device }) => {
            return { id_damage, uuid_damage, nm_damage, st_damage, ...damage_device }
          }),
        }
        device.deviceImage = ""
        delete device.deviceId;
        delete device._id;
        setDevice(device)
      } else {
        alert.error("Erro ao consultar dados do dispositivo")
      }
    })
  }

  const handleChangeModel = (e) => {
    const deviceTitle = e.target.value
    //const deviceVersion = device.deviceVersion
    //const deviceDescription = `${deviceTitle} (${deviceVersion})`
    setDevice({ ...device, deviceTitle })
  }

  const handleChangeVersion = (e) => {
    const deviceVersion = e.target.value
    const deviceTitle = device.deviceTitle
    const deviceDescription = `${deviceTitle} (${deviceVersion})`
    setDevice({ ...device, deviceVersion, deviceDescription})
  }

  const handleUpdateState = (value, field, categoryId) => {
    let updatedDevicePrice = { ...device.devicePrice };

    if (categoryId === 1) { // categoria "new"
      updatedDevicePrice.new[field] = value ? value : 0;
    } else if (categoryId === 2) { // categoria "used"
      updatedDevicePrice.used[field] = value ? value : 0;
    }

    setDevice({ ...device, devicePrice: updatedDevicePrice });
    }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}`;
  }

  const onCreateDevice = (content) => {
    if (content?.deviceTitle) {
      if (uploadImages.length > 0) {
        const image = uploadImages[0]

        setLoading(true)
        const DateNow = new Date();
        const formattedDate = formatDate(DateNow);
        const path='devices/' + formattedDate + '-' + content?.deviceTitle;
        UploadController.upload([image], path)
          .then((responseUpload) => {
            if (responseUpload.status === 200) {
              const returnImage = Object.values(responseUpload.content)[0];
              // Cadastrando novo dispositivo com imagem
              DeviceController.createDevice({ ...content, deviceImage: returnImage, deviceActive:true })
                .then((responseDevice) => {
                  if (responseDevice.status === 200) {
                    alert.success("Dispositivo criado com sucesso")
                    navigate("/devices", { replace: true, state: null })
                    setDevice({
                      deviceTitle: "",
                      deviceDescription: "",
                      deviceVersion: "",
                      deviceYear: "",
                      deviceActive:"",
                      deviceBroadband: "",
                      deviceImage: "",
                      deviceProcessor: "" ,
                      deviceBrand : "" ,
                      deviceMemory:  "" ,
                      deviceStorage :  "" ,
                      devicePrice: {
                        new: {minValue: 0, medValue: 0,  maxValue: 0 },
                        used: { minValue: 0, medValue: 0, maxValue: 0 },
                      },
                      devices: [],
                    })
                  } else {
                    alert.error("Erro ao criar o dispositivo!")
                  }
                })
                .finally(() => {
                  setLoading(false)
                })
            } else {
              setLoading(false)
              alert.error("Erro ao salvar imagem do dispositivo! Tente novamente.")
            }
          })
          .catch((error) => {
            setLoading(false)
            console.error("Erro ao salvar imagem do dispositivo!", error)
            alert.error("Erro ao salvar imagem do dispositivo! Tente novamente.")
          })
          .finally(() => {
            setLoadingImage(false)
          })
      } else {
        DeviceController.createDevice({...content, deviceActive:true})
          .then((responseDevice) => {
            if (responseDevice.status === 200) {
              alert.success("Dispositivo criado com sucesso")
              navigate("/devices", { replace: true, state: null })
              setDevice({
                deviceTitle: "",
                deviceDescription: "",
                deviceVersion: "",
                deviceYear: "",
                deviceActive:"",
                deviceBroadband: "",
                deviceImage: "",
                deviceProcessor:  "" ,
                deviceBrand : "" ,
                deviceMemory: "" ,
                deviceStorage : "" ,
                devicePrice: {
                  new: {minValue: 0, medValue: 0,  maxValue: 0 },
                  used: { minValue: 0, medValue: 0, maxValue: 0 },
                },
                devices: [],
              })
            } else {
              alert.error("Erro ao criar o dispositivo!")
            }
          })
          .finally(() => {
            setLoading(false)
          })
      }
    } else {
      alert.info("Faltou informar o nome do dispositivo!")
    }
  }

  const onUpdateDevice = (deviceId, content) => {
    setLoading(true)
    DeviceController.updateDevice(deviceId, content)
      .then((responseDevice) => {
        if (responseDevice.status === 200) {
          alert.success("Dispositivo atualizado com sucesso!")
          navigate("/devices", { replace: true, state: null })
        } else {
          alert.error("Erro ao atualizar o dispositivo")
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const onDeleteDevice = (deviceId) => {
    setLoading(true)
    DeviceController.deleteDevice(deviceId)
      .then((responseDevice) => {
        if (responseDevice.status === 200) {
          alert.success("Dispositivo excluído com sucesso!")
          navigate("/devices", { replace: true, state: null })
        } else {
          alert.error("Erro ao excluir o dispositivo")
        }
      })
      .finally(() => {
        setLoading(false)
        closeMessage()
      })
  }

  const onChangeImage = (image) => {
    setLoadingImage(true)

    setImages({ ...imagem, images:image.imagePreview })

    /*
    if (!!device.deviceId) {
      const lastUrlImage = device.deviceImage ? [device.deviceImage] : []
      const DateNow = new Date();
      const formattedDate = formatDate(DateNow);
      const path='devices/' + formattedDate + '-' + device?.deviceTitle;

      UploadController.upload([image], path, lastUrlImage)
        .then((responseUpload) => {
          if (responseUpload.status === 200) {
            const returnImage = Object.values(responseUpload.content)[0];
            onUpdateDevice(device.deviceId, { ...device, deviceImage: returnImage })
          } else {
            console.error("Erro ao salvar imagem do dispositivo! Tente novamente.")
          }
        })
        .catch((error) => {
          console.error("Erro ao salvar imagem do dispositivo!", error)
        })
        .finally(() => {
          setLoadingImage(false)
        })
    } else {
      setLoadingImage(false)
      setUploadImages([...uploadImages, image])
    }
      */

    setLoadingImage(false)
    setUploadImages([...uploadImages, image])
  }

  return (
    <section id="device">
      <div className="device-header">
        <div className="back-content">
          <div>
            <FontAwesomeIcon icon="arrow-alt-circle-left" className="icon-back" onClick={() => navigate("/devices", { replace: true })} />
            Voltar
          </div>
          <div className="back-content--button-group">
            <Button
              className={"trash-icon " + (!device.deviceId ? "disabled" : "")}
              onClick={() => onMessage("Confirmação", "Deseja mesmo excluir o dispositivo?", () => onDeleteDevice(device.deviceId))}
            >
              <FontAwesomeIcon icon="trash-alt" />
            </Button>
            <Button
              className={"button-standard"}
              onClick={() => (device.deviceId ? onUpdateDevice(device.deviceId, device) : onCreateDevice(device))}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
      <div className="device-body">
        {/* Cabeçalho */}
        <fieldset className="body-header">
          <PreviewImage
            loading={loadingImage}
            src={device.deviceImage ? process.env.REACT_APP_S3_HOST + device.deviceImage : imagem.images || '../../assets/images/logo.png'}
            dimensions={{ height: "40vh" }}
            callback={() =>
              setUploadModal({
                status: true,
                content: {
                  aspect: 12 / 16,
                  name: "deviceImage",
                },
              })
            }
          />
          <li className="info-field">
            <ul className="info-title">
              <p className="title">
                {device.deviceBrand && device.deviceDescription ? `${device.deviceBrand} - ${device.deviceDescription}` : "NOVO APARELHO"}
              </p>
            </ul>
            <InfoItem label="Versão" content={device?.deviceVersion} />
            <InfoItem label="Processador" content={device?.deviceProcessor} />
            <InfoItem label="Armazenamento" content={device?.deviceStorage} />
            <InfoItem label="Memória" content={device?.deviceMemory} />
            <InfoItem label="Conexão" content={device?.deviceBroadband} />
            <InfoItem label="Ano" content={device?.deviceYear} />
            <div className="categories">
              {Object.keys(device.devicePrice).map((categoryKey, key) => {
                const category = device.devicePrice[categoryKey];
                return (
                  <div key={key}>
                    <ul className="info-title">
                      <p className="title">Valores - Aparelho {categoryKey === "new" ? "Novo" : "Usado"}</p>
                    </ul>
                    <div className="category-prices">
                      <InfoItem label="Preço Mínimo" content={`R$ ${category.minValue}`} />
                      <InfoItem label="Preço Médio" content={`R$ ${category.medValue}`} />
                      <InfoItem label="Preço Máximo" content={`R$ ${category.maxValue}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </li>
        </fieldset>

        {/* Formulário */}

        <div className="device-body-content">
          <div className="content-title">Selecionar dispositivo já cadastrado</div>
            <Select
                title={"Dispositivo"}
                placeholder={"Selecione"}
                options={deviceUpdate}
                // isLoading={isLoadingBrandData}
                label={"deviceTitle"}
                //value={deviceUpdate.find(device => device.deviceTitle)} 
                onChange={(e) => getDeviceId(e.value.deviceId)}
              />
          <p></p>
          <div className="content-title">Informações do Dispositivo</div>
          <div className="device-field large">           
            <Select
              title={"Marca"}
              placeholder={"Selecione"}
              options={brands}
              // isLoading={isLoadingBrandData}
              label={"brandName"}
              value={brands.find(brand => brand.brandName === device.deviceBrand) || null} 
              onChange={(e) => {setDevice({ ...device, deviceBrand: e.label })}}
            />
            <Input title={"Modelo"} placeholder={"Digite o modelo"} value={device.deviceTitle} onChange={handleChangeModel} />
            <Input title={"Versão"} placeholder={"Digite a versão"} value={device.deviceVersion} onChange={handleChangeVersion} />
            <Input
              title={"Processador"}
              placeholder={"Digite o processador"}
              value={device.deviceProcessor}
              type={"string"}
              onChange={(e) => setDevice({ ...device, deviceProcessor: e.target.value })}
            />
            <Button
              className={"button-standard"}
              style={{ marginTop: 38, fontSize: 12 }}
              onClick={() => {
                setProcessorModal({ status: true, content: null })
              }}
            >
              Novo Processador
            </Button>
          </div>

          <div className="device-field small">
            <Select
              title={"Armazenamento"}
              placeholder={"Selecione"}
              options={storages}
              // isLoading={isLoadingBrandData}
              label={"storageName"}
              value={storages.find(storage => storage.storageName === device.deviceStorage) || null} // Encontre o objeto correspondente
              onChange={(e) => {setDevice({ ...device, deviceStorage: e.label })}}
            />
            <Select
              title={"Memória"}
              placeholder={"Selecione"}
              options={memories}
              // isLoading={isLoadingBrandData}
              label={"memoryName"}
              value={memories.find(memory => memory.memoryName === device.deviceMemory) || null} // Encontre o objeto correspondente
              onChange={(e) => {setDevice({ ...device, deviceMemory: e.label })}}
            />
            <Select
              title={"Conexão"}
              placeholder={"Selecione"}
              options={conections}
              label={"conectionName"}
              value={conections.find(conection => conection.conectionName === device.deviceBroadband) || null} // Encontre o objeto correspondente
              onChange={(e) => {setDevice({ ...device, deviceBroadband: e.label })}}
            />
            <Input
              title={"Ano"}
              placeholder={"AAAA"}
              value={device.deviceYear}
              type={"year"}
              onChange={(deviceYear) => setDevice({ ...device, deviceYear })}
            />
          </div>

          {Object.keys(device.devicePrice).map((categoryKey, key) => {
          const category = device.devicePrice[categoryKey];
          return (
            <div key={key} className="device-field meddium">
              <div className="content-title">Valores - Aparelho {categoryKey === "new" ? "Novo" : "Usado"}</div>
              <div className="category-content">
                <Input
                  title={"Preço Mínimo"}
                  placeholder={"R$ 0,00"}
                  type="currency"
                  value={category.minValue}
                  onChange={(value) => handleUpdateState(value, "minValue", categoryKey === "new" ? 1 : 2)}
                />
                <Input
                  title={"Preço Médio"}
                  placeholder={"R$ 0,00"}
                  type="currency"
                  value={category.medValue}
                  onChange={(value) => handleUpdateState(value, "medValue", categoryKey === "new" ? 1 : 2)}
                />
                <Input
                  title={"Preço Máximo"}
                  placeholder={"R$ 0,00"}
                  type="currency"
                  value={category.maxValue}
                  onChange={(value) => handleUpdateState(value, "maxValue", categoryKey === "new" ? 1 : 2)}
                />
              </div>
            </div>
            )
          })}

          {(() => {
            if (device?.damages?.length > 0) {
              return (
                <div>
                  <Label className="device-damage--title">Tipo de Danos</Label>
                  <div className="device-damages">
                    {device?.damages.map(({ nm_damage, vl_price, vl_repair }, key) => (
                      <div key={key} className="device-damage-item">
                        <Label>{nm_damage}</Label>
                        <Label>
                          <span>Peça:</span> {formatMoney(vl_price)}
                        </Label>
                        <Label>
                          <span>Reparo:</span> {formatMoney(vl_repair)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          })()}
        </div>
      </div>

      <UploadModal
        title="Enviando Imagem"
        status={uploadModal.status}
        content={uploadModal.content}
        onSave={onChangeImage}
        onClose={() => setUploadModal({ status: false, content: null })}
      />

      <ProcessorModal
        title="Novo Processador"
        status={processorModal.status}
        content={processorModal.content}
        onRefresh={(processor) => {
          setProcessors([...processors, processor])
          setProcessorModal({ status: false, content: null })
        }}
        onClose={() => setProcessorModal({ status: false, content: null })}
      />
    </section>
  )
}
