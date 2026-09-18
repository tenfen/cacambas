import React from "react"

// Style
import "./Button.scss"

export default function Button(props) {
  const { className = "", variant = "primary", children, ...rest } = props
  return (
    <button className={`button-standard button-${variant} ${className}`} {...rest}>
      {children}
    </button>
  )
}
