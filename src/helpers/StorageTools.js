import { sha224, sha256 } from "js-sha256"
import { encode, decode } from "js-base64"

/**
 * Método responsável por encriptar valores
 * @param value     Valor a ser encriptado
 * @param type      Tipo de criptografia
 */
export const encrypt = (value, type) => {
  switch (type) {
    case "sha224":
      return sha224(value)
    case "sha256":
      return sha256(value)
    case "base64":
      return encode(value)
    default:
      return sha224(value)
  }
}

export const decrypt = (value) => {
  return decode(value)
}

export const setSessionItem = (key, value, json = false) => {
  sessionStorage.setItem(encrypt(key), encrypt(json ? JSON.stringify(value) : value, "base64"))
}

export const getSessionItem = (key, json = false) => {
  const result = sessionStorage.getItem(encrypt(key))
  return json && result ? JSON.parse(decrypt(result)) : result
}

export const removeSessionItem = (key) => {
  sessionStorage.removeItem(encrypt(key))
}

export const setLocalItem = (key, value, json = false) => {
  localStorage.setItem(encrypt(key), encrypt(json ? JSON.stringify(value) : value, "base64"))
}

export const getLocalItem = (key, json = false) => {
  const result = localStorage.getItem(encrypt(key))
  return json && result ? JSON.parse(decrypt(result)) : result
}

export const removeLocalItem = (key) => {
  localStorage.removeItem(encrypt(key))
}
