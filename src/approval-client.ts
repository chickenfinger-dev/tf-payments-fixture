import type { WorkflowHandle } from "@temporalio/client";

export async function sendApproval(handle: WorkflowHandle): Promise<void> {
  await handle.signal("approve");
}
