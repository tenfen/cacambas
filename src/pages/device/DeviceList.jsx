import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { faMobile } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

// Components
import Search from "components/search/Search"
import Button from "components/button/Button"
import DeviceItem from "components/DeviceItem/DeviceItem"

// Controllers
import { DeviceController } from "controllers/DeviceController"

import "./DeviceList.scss"
import LoadingContext from "../../contexts/LoadingContext"

export default function DeviceList() {
  const navigate = useNavigate()

  const { setLoading } = React.useContext(LoadingContext)
  const [searchTerm, setSearchTerm] = useState("");

  // const { isLoading, content, isError, error } = useQuery("device-all-list", DeviceController.getAllDevices)

  const device = {
    brand: "Iphone",
    model: "11",
    version: "Plus",
    status: "Novo",
    processor: "AMD",
    storage: "128 GB",
    memory: "1 TB",
    broadband: "5G",
    year: "2020",
    minValue: 800,
    averageValue: 1000,
    maxValue: 1500,
  }

  const [devices, setDevices] = useState([])

  useEffect(() => {
    setLoading(true)
    DeviceController.getAllDevices() 
      .then((responseDevices) => {
        if (responseDevices.status === 200) {
          setDevices(responseDevices.content)
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
  const filteredDevices = devices.filter((device) => {
    // Converte o searchTerm para minúsculas para uma busca case-insensitive
    const searchValue = searchTerm.toLowerCase();

    // Se você quiser filtrar por vários campos, adicione mais condições aqui
    const deviceTitle = device.deviceTitle?.toLowerCase() ?? '';
    const deviceBrand = device.deviceBrand?.toLowerCase() ?? '';

    return (
      deviceTitle.includes(searchValue) || deviceBrand.includes(searchValue)
    );
  });


  function onNewDevice() {
    navigate("/device/new", { replace: true, state: null })
  }

  return (
    <section className="device-list">
      {/* {loading ? <Loading /> : null} */}
      <div className="device-list--header">
        <h2>Aparelhos</h2>
        <Button onClick={() => onNewDevice()}>Adicionar Aparelho</Button>
      </div>
      <div className="device-list--body">
      <Search
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)} // Atualiza searchTerm no estado
        icon="search" // Ícone de lupa
        />
        <div className="device-list--body--result">
          {filteredDevices.length > 0 ? (
            filteredDevices.map((device) => (
              <DeviceItem key={device.deviceId} {...device} />
            ))
          ) : (
            <p>Nenhum dispositivo encontrado.</p>
          )}
          {/*{isError ? <p className="error">{error.message}</p> : devices.map((device) => <DeviceItem key={device.id_device} {...device} />)}*/}
        </div>
      </div>
    </section>
  )
}
