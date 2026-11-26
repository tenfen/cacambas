/**
 * Datas digitadas só como dia são gravadas à meia-noite UTC. Formatar no
 * fuso do Brasil mostraria o dia anterior.
 */
export function formatDia(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/** Valor para <input type="date"> de uma data gravada só como dia. */
export function paraInputDate(data) {
  if (!data) return "";
  return new Date(data).toISOString().slice(0, 10);
}

/** Dia de hoje no fuso de quem usa, no formato aaaa-mm-dd. */
export function hojeComoDia() {
  const d = new Date();
  const dois = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

/** Momento exato (ex: recolhimento), no fuso de quem está usando. */
export function formatMomento(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR");
}
