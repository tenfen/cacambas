/**
 * Datas digitadas só como dia são gravadas à meia-noite UTC. Formatar no
 * fuso do Brasil mostraria o dia anterior.
 */
export function formatDia(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/** Momento exato (ex: recolhimento), no fuso de quem está usando. */
export function formatMomento(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR");
}
