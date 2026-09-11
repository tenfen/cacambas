import React from "react"

import { Label, Button } from "reactstrap"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

// Componentes
import Search from "../../components/search/Search"
import { Input } from "../../components/input/Input"
import { Select } from "../../components/select/Select"

// Controllers
import DamageController from "controllers/DamageController"
import { DeviceController } from "../../controllers/DeviceController"

// Contexts
import FeatureContext from "../../contexts/FeatureContext"
import LoadingContext from "../../contexts/LoadingContext"
import MessageContext from "../../contexts/MessageContext"

// Helpers
import { formatFloat, sortList } from "../../helpers/MethodTools"
import { setLocalItem } from "../../helpers/StorageTools"

// Modals
import DamageModal from "../../modals/Damage/DamageModal"

import "./DamageList.scss"
import { response } from "msw"

const DamageList = () => {
  const navigate = useNavigate()

  const { setLoading } = React.useContext(LoadingContext)
  const { onMessage } = React.useContext(MessageContext)

  const { damages, setDamages } = React.useContext(FeatureContext)

  const [devices, setDevices] = React.useState([])
  const [searchValue, setSearchValue] = React.useState([])

  const [damagesFiltered, setDamagesFiltered] = React.useState(null)

  const [partPrice, setPartPrice] = React.useState(0)
  const [repairPrice, setRepairPrice] = React.useState(0)

  const [selectedDamage, setSelectedDamage] = React.useState({})
  const [selectedDevices, setSelectedDevices] = React.useState([])

  const [damageModal, setDamageModal] = React.useState({ status: false, content: null })

  React.useEffect(() => {
    setLoading(true)
    DeviceController.getAllDevices()
      .then((responseDevices) => {
        if (responseDevices.status === 200) {
          setDevices(responseDevices?.content.sort((a, b) => sortList(a, b, "lb_device")))
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const onChangePrice = (value) => {
    setPartPrice(value)
  }

  const onChangeRepairPrice = (value) => {
    setRepairPrice(value)
  }

  const onChangeSearch = (event) => {
    const value = event.target.value
    if (value.length > 2) {
      DamageController.getAllDamages({ filterValue: value }).then((responseDamage) => {
        if (responseDamage.status === 200) {
          setDamagesFiltered(responseDamage.content)
        } else {
          setDamagesFiltered([])
        }
      })
    } else {
      setDamagesFiltered(null)
    }

    setSearchValue(value)
  }

  const onAddDeviceOnList = ({ value }) => {
    setSelectedDevices([...selectedDevices, value])

    const deviceIndex = devices.findIndex(({ id_device }) => id_device === value.id_device)
    if (deviceIndex !== -1) {
      devices.splice(deviceIndex, 1)
      setDevices([...devices.sort((a, b) => sortList(a, b, "lb_device"))])
    }
  }

  const removeDeviceOnList = (index) => {
    devices.splice(devices.length, 0, selectedDevices[index])
    setDevices([...devices.sort((a, b) => sortList(a, b, "lb_device"))])

    selectedDevices.splice(index, 1)
    setSelectedDevices([...selectedDevices])
  }

  const removeDamageOnList = (damage) => {
    const damageList = damagesFiltered || damages

    const damageIndex = damageList.findIndex(({ id_damage }) => id_damage === damage.id_damage)

    if (damageIndex !== -1) {
      damageList.splice(damageIndex, 1)

      if (damagesFiltered) {
        setDamagesFiltered([...damageList])
      } else {
        setDevices([...damageList])
      }

      DamageController.deleteDamage(damage.id_damage).then((response) => {
        if (response.status === 200) {
          onMessage("Informação", "Dano excluído com sucesso!")

          if (selectedDamage?.id_damage === damage.id_damage) {
            setSelectedDamage({})
          }
        } else {
          onMessage("Informação", "Erro ao excluir o dano")
        }
      })
    }
  }

  const onRefreshDamages = () => {
    DamageController.getAllDamages().then((responseDamage) => {
      if (responseDamage.status === 200) {
        setDamages(responseDamage.content)
        setLocalItem("damages", responseDamage.content, true)
      } else {
        onMessage("Informação", "Erro ao conultar os tipo de danos")
      }
    })
  }

  const onSelectedDamage = (damage) => {
    if (selectedDamage?.nm_damage === damage.nm_damage) {
      setSelectedDamage({})
    } else {
      setSelectedDamage(damage)
    }
  }

  const onNewDevice = () => {
    navigate("/device/new", { replace: true, state: null })
  }

  const onSaveDamageAssociation = () => {
    if (selectedDamage.id_damage) {
      if (selectedDevices.length > 0) {
        setLoading(true)

        const content = {
          vl_price: formatFloat(partPrice),
          vl_repair: formatFloat(repairPrice),
          devices: selectedDevices.map(({ id_device }) => id_device),
        }

        DamageController.associationDamage(selectedDamage.id_damage, content)
          .then((response) => {
            if (response.status === 200) {
              onMessage("Informação", "Associação entre dano e dispositivo(s) realizada com sucesso!")
            } else {
              onMessage("Informação", response?.message)
            }
          })
          .finally(() => {
            setLoading(false)
          })
      } else {
        onMessage("Informação", "Faltou selecionar ao menos um dispositivo")
      }
    } else {
      onMessage("Informação", "Faltou selecionar um tipo de dano")
    }
  }

  return (
    <div className="damage-list">
      <div className="damage-list--header">
        <h2>Tipos de Danos</h2>
        <Button className="button-standard" onClick={onSaveDamageAssociation}>
          Salvar
        </Button>
      </div>
      <div className="damage-list--body">
        <div className="damage-list--body--left">
          <div className="damage-list--body--left--values">
            <Input
              title="Valor da Peça"
              placeholder={"R$ 0,00"}
              type="currency"
              pattern="R$+^[0-9]"
              value={partPrice}
              onChange={(value) => onChangePrice(value)}
            />
            <Input
              title="Valor da Manutenção"
              placeholder={"R$ 0,00"}
              type="currency"
              pattern="R$+^[0-9]"
              value={repairPrice}
              onChange={(value) => onChangeRepairPrice(value)}
            />
            <Search className="damage-search" value={searchValue} icon="search" onChange={onChangeSearch} />
          </div>
          <div className="damage-list--body--left--damages">
            <div className="damage-values">
              {(damagesFiltered || damages).map((damage, key) => (
                <Label key={key} className={"damage-item " + (selectedDamage?.id_damage === damage.id_damage ? "damage-selected" : "")}>
                  <span onClick={() => onSelectedDamage(damage)}>{damage?.nm_damage}</span>
                  <FontAwesomeIcon icon="trash-alt" onClick={() => removeDamageOnList(damage)} />
                </Label>
              ))}
            </div>
            <Button className="button-standard damage-refresh" onClick={onRefreshDamages}>
              <FontAwesomeIcon icon="refresh" />
            </Button>
            <Button className="button-standard damage-add" onClick={() => setDamageModal({ status: true, content: selectedDamage })}>
              <FontAwesomeIcon icon={selectedDamage?.id_damage ? "pen" : "plus-circle"} />
            </Button>
          </div>
        </div>
        <div className="damage-list--body--right">
          <div className="damage-list--body--right--select">
            <Select
              title={"Dispositivos"}
              placeholder={"Selecione o dispositivo"}
              options={devices}
              label={"lb_device"}
              value={""}
              onChange={onAddDeviceOnList}
            />
            <Button className="button-standard damage-list--body--right--btn-add-device" onClick={() => onNewDevice()}>
              <FontAwesomeIcon icon="plus-circle" />
            </Button>
          </div>

          <div className="damage-list--body--right--devices">
            {selectedDevices.map((device, key) => (
              <Label key={key}>
                {device?.lb_device}
                <FontAwesomeIcon icon="trash-alt" onClick={() => removeDeviceOnList(key)} />
              </Label>
            ))}
          </div>
        </div>
      </div>

      <DamageModal
        status={damageModal.status}
        title={damageModal.content?.id_damage ? "Atualizar Dano" : "Criar Dano"}
        content={damageModal.content}
        onRefresh={() => {
          onRefreshDamages()
          setDamageModal({ status: false, content: null })
        }}
        onClose={() => setDamageModal({ status: false, content: null })}
      />
    </div>
  )
}

export default DamageList
