import React from "react"

// Style
import "./Button.scss"

export default function Button(props) {
  const { className = "", children } = props
  return (
    <button className={"button-standard " + className} {...props}>
      {children}
    </button>
  )
}
