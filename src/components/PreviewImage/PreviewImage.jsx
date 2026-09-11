import React from "react"

import { Button, Label } from "reactstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import "./PreviewImage.scss"

const PreviewImage = ({ src, dimensions, className = "", loading = false, disabled = false, aspect = 16 / 16, callback = () => null }) => {
  let width = "100%"
  let height = "200px"

  const previewImageRef = React.useRef(null)

  if (dimensions) {
    width = dimensions.width || width
    height = dimensions.height || height
  } else if (previewImageRef.current) {
    switch (aspect) {
      case 16 / 10:
        height = previewImageRef.current.clientWidth * 0.6 || height
        break
      case 4 / 4:
        height = previewImageRef.current.clientWidth || height
        break
      default:
        height = previewImageRef.current.clientWidth || height
        break
    }
  }

  return (
    <div ref={previewImageRef} className={"preview-image " + className || ""}>
      <div className="preview-image--body" style={{ width, height }}>
        {(() => {
          if (src) {
            return (
              <>
                {loading ? (
                  <div className="preview-image--body--loading">
                    <Label>Salvando...</Label>
                  </div>
                ) : (
                  ""
                )}
                <img alt="" className="preview-image--body--image" src={src} style={{ opacity: loading ? 0.3 : 1 }} />
              </>
            )
          }
        })()}
        <Label className="preview-image--body--button-upload" onClick={(event) => callback(event)}>
          <FontAwesomeIcon icon="cloud-upload-alt" />
        </Label>
      </div>
    </div>
  )
}

export default PreviewImage
