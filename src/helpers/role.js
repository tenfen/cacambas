export function normalizarPapel(papel) {
  return String(papel || "")
    .trim()
    .toLowerCase();
}

export function isUserRole(papel) {
  return normalizarPapel(papel) === "user";
}
