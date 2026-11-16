import { condition, defineSignal, setHandler } from "@temporalio/workflow";

export const approvePaymentSignal = defineSignal("approve-payment");

export async function awaitApprovalWorkflow(): Promise<string> {
  let approved = false;
  setHandler(approvePaymentSignal, () => {
    approved = true;
  });
  await condition(() => approved);
  return "approved";
}
