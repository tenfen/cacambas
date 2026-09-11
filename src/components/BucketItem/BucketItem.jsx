import React from "react"

import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { getUrlAWSFile } from "../../helpers/MethodTools"

// Style
import "./BucketItem.scss"

// Assets
import defaultImage from "../../assets/images/no-image.png"

export default function BucketItem({bucket, onClick}) {
  console.log('bucket---------',bucket)
  const { bucketName, bucketImage } = bucket
  console.log(bucketName, bucketImage)

  return (
    <div onClick={onClick} className="bucket-item">
      <div className="bucket-item--left">
        <img alt="" src={bucketImage ? process.env.REACT_APP_S3_HOST + bucketImage : defaultImage} />
      </div>
      <div className="brand-item--center">
        <strong>{bucketName}</strong>
      </div>
      <div className="bucket-item--right">
        <FontAwesomeIcon icon="angle-right" />
      </div>
    </div>
  )
}
