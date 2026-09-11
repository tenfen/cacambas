import React from "react"

import { Button, Input } from "reactstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import "./Search.scss"

const Search = ({ value, icon = "", className = "", placeholder = "Procurar...", onChange }) => {
  return (
    <fieldset className={"search " + className}>
      <Input value={value} placeholder={placeholder} onChange={onChange} />
      <Button>
        {(() => {
          if (icon) {
            return <FontAwesomeIcon icon={icon} />
          } else {
            return "Procurar"
          }
        })()}
      </Button>
    </fieldset>
  )
}

export default Search
