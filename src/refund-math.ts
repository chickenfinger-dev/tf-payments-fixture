export function computeRefundAmountCents(amountCents: number, percent: number): number {
  if (amountCents < 0 || percent < 0 || percent > 100) {
    throw new Error("invalid refund input");
  }
  return Math.round((amountCents * percent) / 100);
}
