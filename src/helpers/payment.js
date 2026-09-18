/*
 * Considera aprovado qualquer formato de resposta que o backend possa
 * usar para sinalizar que o pagamento/assinatura está ativo.
 *
 * `PaymentController.getPaymentStatus` retorna `{ success, payment }` —
 * o status real fica em `content.payment.status` (ex: "approved"), não
 * em `content.status`.
 */
export function isPaymentApproved(content) {
  if (!content) {
    return false;
  }

  const payment = content.payment || content;

  const status = String(
    payment?.status || content.subscriptionStatus || content.paymentStatus || ""
  ).toLowerCase();

  if (["approved", "active", "paid", "authorized"].includes(status)) {
    return true;
  }

  if (content.userActive === true || content.accountStatus === "active") {
    return true;
  }

  return false;
}
