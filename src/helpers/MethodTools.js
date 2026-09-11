/**
 * Métodos auxiliares
 */

export const getUrlAWSFile = (value, result = null) => {
  return !!value ? (value.indexOf("blob:") === -1 ? `${process.env.REACT_APP_S3_HOST}/${value}` : value) : result
}

export const sortList = (a, b, field, order = "asc") => {
  if (order === "asc") {
    if (a[field] > b[field]) return 1
    if (a[field] < b[field]) return -1
  } else {
    if (b[field] > a[field]) return 1
    if (b[field] < a[field]) return -1
  }

  return 0
}

export const formatFloat = (value) => {
  if (typeof value === "string") {
    if (value.indexOf("R$") !== -1) {
      value = value.substring("R$ ".length).replace(".", "")
    }
    value = value.replace(",", ".")
  }

  return Number(parseFloat(value).toFixed(2))
}

export const formatMoney = (value, prefix = "R$ ", free = true) => {
  if (typeof value === "string") {
    value = value.replace(",", ".")
  }

  return parseFloat(value) > 0 || !free ? prefix + parseFloat(value).toFixed(2).replace(".", ",") : "Grátis"
}
