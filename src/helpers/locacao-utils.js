/** Nome de uma caçamba ou locação, com o número pintado quando houver. */
export function nomeDaCacamba({ bucketName, bucketNumber }) {
  return `${bucketName || "Caçamba"}${bucketNumber ? ` (${bucketNumber})` : ""}`;
}

/** Link de rota até o cliente, ou null sem endereço. */
export function rotaUrl(cliente) {
  if (cliente.clienteLatitude && cliente.clienteLongitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${cliente.clienteLatitude},${cliente.clienteLongitude}`;
  }

  const endereco = [
    cliente.clienteAddressName,
    cliente.clienteAddressNumber,
    cliente.clienteAddressNeighborhood,
    cliente.clienteAddressCity,
    cliente.clienteAddressState,
  ]
    .filter(Boolean)
    .join(", ");

  if (!endereco) return null;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`;
}
