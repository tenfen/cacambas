import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMobileScreen, faAngleRight } from "@fortawesome/free-solid-svg-icons"
import { Link } from "react-router-dom"

// Style
import "./AssistanceItem.scss"

export default function AssistanceItem(props) {
  console.log('props-----------------',props)
  const {
    assistanceName,  // corresponde a nm_brand
    assistanceDescription,  // corresponde a nm_device
    assistancePhone, // corresponde a vs_device
    assistanceId,
  } = props

  return (
    <Link to={`/assistance/update/${assistanceId}`} state={props} className="device-item">
      <div className="device-item--left">
        <FontAwesomeIcon icon={faMobileScreen} />
        <strong>Assistências</strong>
      </div>
      <div className="device-item--center">
        <p>Nome:{assistanceName}</p>
        <p>Descrição:{assistanceDescription}</p>
        <p>Fone:{assistancePhone}</p>
      </div>
      <div className="device-item--right">
        <FontAwesomeIcon icon={faAngleRight} />
      </div>
    </Link>
  )
}
