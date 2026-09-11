import React, { useEffect, useState, useContext } from "react"
import { useAlert } from "react-alert"

//  External Components
import { Button } from "reactstrap"
import { useNavigate, useParams } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

// Internal Components
import { Input } from "components/input/Input"

// Controllers
import AssistanceController from "../../controllers/AssistanceController"

// Contexts
import LoadingContext from "../../contexts/LoadingContext"
import MessageContext from "../../contexts/MessageContext"


// Style
import "./Assistance.scss"

export default function Assistance() {
  const alert = useAlert()
  const navigate = useNavigate()
  const { assistanceId } = useParams()

  const { onMessage, closeMessage } = useContext(MessageContext)
  const { setLoading } = useContext(LoadingContext)

  const [location, setLocation] = useState({
    latitude: "",
    longitude: ""
  });


  const [assistance, setAssistance] = useState({
    assistanceName: "",
    assistanceDescription: "",
    assistanceLocation: {
      type: "",
      coordinates: [],
    },
    assistancePhone: ""
  })

  useEffect(() => {
    if (assistanceId) {
      AssistanceController.getOneAssistance(assistanceId).then((responseAssistance) => {
        if (responseAssistance.status === 200) {
          const assistanceData = {
            ...responseAssistance.content[0]
          }

          setAssistance(assistanceData)
          // Ajustar a forma de pegar as coordenadas corretamente
          if (assistanceData.assistanceLocation?.coordinates) {
            const [longitude, latitude] = assistanceData.assistanceLocation.coordinates;
            setLocation({
              longitude: longitude.toString(),  // Garantir que seja uma string
              latitude: latitude.toString(),    // Garantir que seja uma string
            });
          }
        } else {
          alert.error("Erro ao consultar assistências")
        }
      })
    }
  }, [assistanceId])

   // Função para manipular mudanças nos campos de localização
   const handleChange = (e) => {
    const { name, value } = e.target;
    setLocation((prevLocation) => ({
      ...prevLocation,
      [name]: value, // Atualiza o valor correto dependendo do nome
    }));
  };

  const onCreateAssistance = (content) => {
    if (content?.assistanceName) {
      const assistanceLocation  = {
        type: "Point",
        coordinates:[location.longitude, location.latitude]
      }
        AssistanceController.createAssistance({...content, assistanceLocation:assistanceLocation})
          .then((responseAssistance) => {
            if (responseAssistance.status === 200) {
              alert.success("Assistência criada com sucesso")
              navigate("/assistances", { replace: true, state: null })
              setAssistance({
                assistanceName: "",
                assistanceDescription: "",
                assistanceLocation: {
                  type: "",
                  coordinates: [],
                },
                assistancePhone: "",
                assistances: [],
              })
            } else {
              alert.error("Erro ao criar a assistência!")
            }
          })
          .finally(() => {
            setLoading(false)
          })
    } else {
      alert.info("Faltou informar o nome da assistência!")
    }
  }

  const onUpdateAssistance= (assistanceId, content) => {
    setLoading(true)
    content.assistanceLocation  = {
      type: "Point",
      coordinates:[location.longitude, location.latitude]

    }
    AssistanceController.updateAssistance(assistanceId, content)
      .then((responseAssistance) => {
        if (responseAssistance.status === 200) {
          alert.success("Assistência atualizada com sucesso!")
          navigate("/assistances", { replace: true, state: null })
        } else {
          alert.error("Erro ao atualizar a assistência")
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const onDeleteAssistance = (assistanceId) => {
    setLoading(true)
    AssistanceController.deleteAssistance(assistanceId)
      .then((responseAssistance) => {
        if (responseAssistance.status === 200) {
          alert.success("Assistência excluída com sucesso!")
          navigate("/assistances", { replace: true, state: null })
        } else {
          alert.error("Erro ao excluir a assistência")
        }
      })
      .finally(() => {
        setLoading(false)
        closeMessage()
      })
  }

  return (
    <section id="device">
      <div className="device-header">
        <div className="back-content">
          <div>
            <FontAwesomeIcon icon="arrow-alt-circle-left" className="icon-back" onClick={() => navigate("/assistances", { replace: true })} />
            Voltar
          </div>
          <div className="back-content--button-group">
            <Button
              className={"trash-icon " + (!assistance.assistanceId ? "disabled" : "")}
              onClick={() => onMessage("Confirmação", "Deseja mesmo excluir a assistência?", () => onDeleteAssistance(assistance.assistanceId))}
            >
              <FontAwesomeIcon icon="trash-alt" />
            </Button>
            <Button
              className={"button-standard"}
              onClick={() => (assistance.assistanceId ? onUpdateAssistance(assistance.assistanceId, assistance) : onCreateAssistance(assistance))}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
      <div className="device-body">
        <div className="device-body-content">
          <div className="content-title">Informações da Assistência</div>
          <div className="device-field large">
            <Input title={"Nome"} placeholder={"Digite o Nome"} value={assistance.assistanceName} onChange={(e) => setAssistance({ ...assistance, assistanceName: e.target.value })}  />
            <Input title={"Descrição"} placeholder={"Digite a descrição"} value={assistance.assistanceDescription} onChange={(e) => setAssistance({ ...assistance, assistanceDescription: e.target.value })}  />
            <Input title={"Telefone"} placeholder={"Digite o telefone"} value={assistance.assistancePhone}  onChange={(e) => setAssistance({ ...assistance, assistancePhone: e.target.value })}/>
          </div>
          <div className="content-title">Localização</div>
          <div className="device-field small">
            <Input title={"Longitude"} placeholder={"Digite a Longitude"} value={location.longitude} onChange={(e) => setLocation({ ...location, longitude: e.target.value })}  />
            <Input title={"Latitude"} placeholder={"Digite a Latitude"} value={location.latitude} onChange={(e) => setLocation({ ...location, latitude: e.target.value })}  />
          </div>
        </div>
      </div>
    </section>
  )
}
  