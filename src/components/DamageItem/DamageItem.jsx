import React from "react"

import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { getUrlAWSFile } from "../../helpers/MethodTools"

// Style
import "./DamageItem.scss"

// Assets
import defaultImage from "../../assets/images/no-image.png"

const DamageItem = ({ brand, onClick }) => {
  const { nm_brand, url_image_brand } = brand

  return (
    <div onClick={onClick} className="brand-item">
      <div className="brand-item--left">
        <img alt="" src={getUrlAWSFile(url_image_brand, defaultImage)} />
      </div>
      <div className="brand-item--center">
        <strong>{nm_brand}</strong>
      </div>
      <div className="brand-item--right">
        <FontAwesomeIcon icon="angle-right" />
      </div>
    </div>
  )
}

export default DamageItem
