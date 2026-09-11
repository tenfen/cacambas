import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

// Components
import Search from "components/search/Search"
import Button from "components/button/Button"
import AssistanceItem from "components/AssistanceItem/AssistanceItem"

// Controllers
import  AssistanceController  from "controllers/AssistanceController.js"

import "./AssistanceList.scss"
import LoadingContext from "../../contexts/LoadingContext"

export default function AssistanceList() {
  const navigate = useNavigate()

  const { setLoading } = React.useContext(LoadingContext)
  const [searchTerm, setSearchTerm] = useState("");

  // const { isLoading, content, isError, error } = useQuery("device-all-list", DeviceController.getAllDevices)

  
  const [assistances, setAssistances] = useState([])

  useEffect(() => {
    setLoading(true)
    AssistanceController.getAllAssistances() 
      .then((responseAssistances) => {
        console.log('responseAssistances----',responseAssistances )
        if (responseAssistances.status === 200) {
          setAssistances(responseAssistances.content)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

   // Função chamada quando o valor da pesquisa muda
   const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Filtra os dispositivos com base no termo de pesquisa
  const filteredAssistance = assistances.filter((assistance) => {
    // Converte o searchTerm para minúsculas para uma busca case-insensitive
    const searchValue = searchTerm.toLowerCase();

    // Se você quiser filtrar por vários campos, adicione mais condições aqui
    const assistanceName = assistance.assistanceName?.toLowerCase() ?? '';
    const AssistanceDescription = assistance.AssistanceDescription?.toLowerCase() ?? '';

    return (
      assistanceName.includes(searchValue) || AssistanceDescription.includes(searchValue)
    );
  });


  function onNewAssistance() {
    navigate("/assistance/new", { replace: true, state: null })
  }

  return (
    <section className="device-list">
      {/* {loading ? <Loading /> : null} */}
      <div className="device-list--header">
        <h2>Assistências</h2>
        <Button onClick={() => onNewAssistance()}>Adicionar Assistência</Button>
      </div>
      <div className="device-list--body">
      <Search
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)} // Atualiza searchTerm no estado
        icon="search" // Ícone de lupa
        />
        <div className="device-list--body--result">
          {filteredAssistance.length > 0 ? (
            filteredAssistance.map((assistance) => (
              <AssistanceItem key={assistance.assistanceId} {...assistance} />
            ))
          ) : (
            <p>Nenhuma assistência encontrada.</p>
          )}
          {/*{isError ? <p className="error">{error.message}</p> : devices.map((device) => <DeviceItem key={device.id_device} {...device} />)}*/}
        </div>
      </div>
    </section>
  )
}
