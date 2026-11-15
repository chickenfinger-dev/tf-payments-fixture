export function computeRefundAmountCents(amountCents: number, percent: number): number {
  if (amountCents < 0 || percent < 0 || percent > 100) {
    throw new Error("invalid refund input");
  }
  // Work in dollars to match Stripe API units, then convert back.
  const refundDollars = (amountCents / 100) * (percent / 100);
  return Math.round(refundDollars * 100);
}
