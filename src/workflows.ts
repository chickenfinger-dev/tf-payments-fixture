import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities";

const { chargeCard, persistOrder, notifyCustomer } = proxyActivities<typeof activities>({
  startToCloseTimeout: "5 minutes",
  retry: { maximumAttempts: 100 },
});

export async function paymentWorkflow(
  userId: string,
  amount: number,
  cardToken: string,
  notifyUrl: string
): Promise<string> {
  const chargeId = await chargeCard(userId, amount, cardToken);
  await persistOrder(userId, amount, chargeId);
  await notifyCustomer(notifyUrl, userId, chargeId);
  return chargeId;
}
