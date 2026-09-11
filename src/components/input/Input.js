import React from "react"
import CurrencyInput from "react-currency-input-field"

// Styles
import { useEffect, useState } from "react"
import "./Input.scss"

export function Input(props) {
  const { title, type = "text", onChange, defaultValue, value } = props

  const [inputValue, setInputValue] = useState(defaultValue)

  //---------Métodos do Tipo Year--------------

  // onChange para o tipo YEAR
  function handleOnChangeDate(text) {
    if (/^\d*\.?\d*$/.test(text) && text.length <= 4) {
      onChange(text)
      return text
    } else {
      let previousText = text.split("")
      previousText.pop()
      return previousText.join("")
    }
  }

  //---------Métodos do Tipo Currency--------------

  useEffect(() => {
    if (props.value && props.type === "currency") {
      setInputValue(props.value)
    }
  }, [props.value, props.type])

  // verifica se só existe numerais na string
  function hasJustNumber(text) {
    if (/^\d*\.?\d*$/.test(text)) {
      return true
    } else return false
  }

  /**
   * Verifica se o valor está no formato currency definido
   * @param {String} text
   * @returns {String}
   */
  function onFormatValueToCurrencyType(text) {
    text = String(text)
    text = removeCurrencySymbol(text)
    text = removeDot(text)
    if (hasJustNumber(text)) {
      if (text.length >= 3) {
        let number = text.split("")
        number.splice(-2, 0, ".")
        return number.join("")
      } else {
        return text
      }
    } else {
      let number = text.split("")
      number.pop()
      return number.join("")
    }
  }

  /**
   * Handle para alterar o onChange do Input
   * @param {Object} event
   */
  function handleOnChangeInputValue(event) {
    // Atualiza o Estado
    setInputValue(onFormatValueToCurrencyType(event.target.value))
    // Retorna o Valor para o componente acima
    onChange(Number(onFormatValueToCurrencyType(event.target.value)))
  }

  // Remove o simbololo R$ do texto
  function removeCurrencySymbol(text) {
    return text.split(" R$").join("")
  }

  // Remove os pontos (.) do texto
  function removeDot(text) {
    return text.split(".").join("")
  }

  // Insere:
  //      duas casas decimais se o length for menor ou igual a 2 e um 0 na frente
  //      simbolo de Currency
  function onInsertDot(text) {
    text = String(text)
    text = removeDot(text)
    text = removeFrontZero(text)
    text = text.split("")
    if (text.length <= 2) {
      text = new Array(3 - text.length).fill(0).concat(text.split(""))
    }
    text.splice(-2, 0, ".")
    return text.join("") + " R$"
  }

  // remove zeros da frente
  function removeFrontZero(text) {
    let number = text.split(" R$").join("")
    number = number.split("")
    while (number[0] === "0") {
      number.shift()
    }
    return number.join("")
  }

  // retorna o valor para o onChange e atualiza o estado
  function handleOnBlur(text) {
    setInputValue(onInsertDot(text))
    onChange(Number(text))
  }

  function handleOnFocus(text) {
    text = removeCurrencySymbol(text)
    text = removeFrontZero(text)
    setInputValue(text)
  }

  function handleOnKeyDown(event) {
    if (event.key === "Enter") {
      setInputValue((inputValue) => onInsertDot(inputValue))
      onChange(Number(onFormatValueToCurrencyType(inputValue)))
    }
  }

  //---------Inserindo Propriedades no Input de Acordo com o tipo--------------

  const loadingProps = () => {
    if (type === "currency") {
      return {
        type: "text",
        value: inputValue,
        onChange: (e) => handleOnChangeInputValue(e),
        onBlur: (e) => handleOnBlur(e.target.value),
        onKeyDown: (e) => handleOnKeyDown(e),
        onFocus: (e) => handleOnFocus(e.target.value),
      }
    } else if (type === "year") {
      return {
        ...props,
        type: "text",
        onChange: (e) => handleOnChangeDate(e.target.value),
      }
    } else {
      return { ...props }
    }
  }

  if (type === "currency") {
    return (
      <fieldset className={`${type} input-standard `}>
        <label>{title}:</label>
        <CurrencyInput
          prefix="R$ "
          placeholder="R$ 0,00"
          value={value}
          decimalsLimit={2}
          decimalSeparator=","
          groupSeparator="."
          onValueChange={onChange}
        />
      </fieldset>
    )
  }

  return (
    <fieldset className={`${type} input-standard `}>
      <label>{title}:</label>
      <input {...loadingProps()} role={title} />
    </fieldset>
  )
}
