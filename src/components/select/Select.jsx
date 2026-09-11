import React from "react"
import SelectComponent from "react-select"
// Styles
import "./Select.scss"

export function Select({ title, placeholder, onChange, value, options, label, isLoading }) {
  const opt = options && options.map((item) => (item = { value: item, label: !!label ? item[label] : item }))
  
  const customStyles = {
    option: (provided) => ({
      ...provided,
      backgroundColor: "#070707",
      color: "#E1E1E6",
      "&:hover": {
        backgroundColor: "#121214",
        color: "#21A2F6",
      },
    }),
    control: (provided, state) => ({
      ...provided,
      boxShadow: "none",
      backgroundColor: "#070707",
      height: "40px",

      border: state.isFocused ? "1px solid #21A2F6 " : "1px solid transparent",
      outline: state.isFocusedVisible && "none",
      "&:hover": {
        borderColor: " #21A2F6",
      },
    }),
    indicatorsContainer: (provided, state) => ({
      ...provided,
      color: "#E153E3",
    }),
    indicatorSeparator: () => ({}),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#070707",
      color: "#E1E1E6",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#E153E3",
    }),
    valueContainer: (provided, state) => ({
      ...provided,
      border: state.isFocused ? "1px solid #21A2F6 " : "1px solid transparent",
      outline: state.isFocusedVisible && "none",
      alignItems: "center",
      margin: 0,
      padding: "0px 2px 0px 5px",
      color: "#E1E1E6",
    }),
    singleValue: (provided, state) => {
      const opacity = state.isDisabled ? 0.5 : 1
      const transition = "opacity 300ms"
      const color = state.isSelected ? { color: "#E1E1E6" } : ""

      return { ...provided, opacity, transition, color }
    },
  }

  return (
    <fieldset className={"select-standard"}>
      <label>{title}:</label>
      <SelectComponent
        styles={customStyles}
        options={opt}
        isSearchable={false}
        placeholder={placeholder}
        onChange={onChange}
        className="select-component"
         value={opt ? opt.find(option => option.value === value) : null}
        isLoading={isLoading}
      />
    </fieldset>
  )
}
