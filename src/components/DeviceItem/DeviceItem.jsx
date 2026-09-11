import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMobileScreen, faAngleRight } from "@fortawesome/free-solid-svg-icons"
import { Link } from "react-router-dom"

// Style
import "./DeviceItem.scss"

export default function DeviceItem(props) {
  console.log('props-----------------',props)
  const {
    deviceBrand,  // corresponde a nm_brand
    deviceTitle,  // corresponde a nm_device
    deviceVersion, // corresponde a vs_device
    deviceStorage, // 
    deviceId,
  } = props

  return (
    <Link to={`/device/update/${deviceId}`} state={props} className="device-item">
      <div className="device-item--left">
        <FontAwesomeIcon icon={faMobileScreen} />
        <strong>{deviceBrand}</strong>
      </div>
      <div className="device-item--center">
        <p>Modelo:{deviceTitle}</p>
        <p>Versão:{deviceVersion}</p>
        <p>Armazenamento:{deviceStorage}</p>
      </div>
      <div className="device-item--right">
        <FontAwesomeIcon icon={faAngleRight} />
      </div>
    </Link>
  )
}
