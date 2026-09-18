const FIRST_CNPJ_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const SECOND_CNPJ_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

export function normalizeCnpj(value = "") {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 14)
}

export function formatCnpj(value = "") {
  const cnpj = normalizeCnpj(value)
  if (!cnpj) return ""

  const groups = [
    cnpj.slice(0, 2),
    cnpj.slice(2, 5),
    cnpj.slice(5, 8),
    cnpj.slice(8, 12),
    cnpj.slice(12, 14),
  ].filter(Boolean)

  let formatted = groups[0] || ""
  if (groups[1]) formatted += `.${groups[1]}`
  if (groups[2]) formatted += `.${groups[2]}`
  if (groups[3]) formatted += `/${groups[3]}`
  if (groups[4]) formatted += `-${groups[4]}`

  return formatted
}

function getCnpjCharValue(char) {
  return char.charCodeAt(0) - 48
}

function calculateCnpjDigit(base, weights) {
  const sum = base
    .split("")
    .reduce((total, char, index) => total + getCnpjCharValue(char) * weights[index], 0)
  const remainder = sum % 11
  return remainder < 2 ? "0" : String(11 - remainder)
}

export function isValidCnpj(value = "") {
  const cnpj = normalizeCnpj(value)

  if (cnpj.length !== 14) return false
  if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) return false
  if (/^([A-Z0-9])\1{13}$/.test(cnpj)) return false

  const firstDigit = calculateCnpjDigit(cnpj.slice(0, 12), FIRST_CNPJ_WEIGHTS)
  const secondDigit = calculateCnpjDigit(cnpj.slice(0, 12) + firstDigit, SECOND_CNPJ_WEIGHTS)

  return cnpj.slice(12) === `${firstDigit}${secondDigit}`
}

