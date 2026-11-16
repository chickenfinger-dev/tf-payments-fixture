// Runs the approval workflow on a local Temporal test server, sends the approval signal
// through src/approval-client.ts, and waits 5 seconds for the workflow to complete.
import { TestWorkflowEnvironment } from "@temporalio/testing";
import { Worker } from "@temporalio/worker";
import { sendApproval } from "../src/approval-client";

const taskQueue = "approvals";

async function main(): Promise<void> {
  const env = await TestWorkflowEnvironment.createLocal();
  try {
    const worker = await Worker.create({
      connection: env.nativeConnection,
      taskQueue,
      workflowsPath: require.resolve("../src/approval"),
      activities: {},
    });
    await worker.runUntil(async () => {
      const handle = await env.client.workflow.start("awaitApprovalWorkflow", {
        taskQueue,
        workflowId: `approval-demo-${Date.now()}`,
      });
      await sendApproval(handle);
      const outcome = await Promise.race([
        handle.result().then((result) => ({ kind: "completed" as const, result })),
        new Promise<{ kind: "still-running" }>((resolve) =>
          setTimeout(() => resolve({ kind: "still-running" }), 5000)
        ),
      ]);
      const description = await handle.describe();
      console.log(JSON.stringify({ outcome, status: description.status.name }));
      if (outcome.kind !== "completed") {
        console.error("DEFECT REPRODUCED: approval signal sent, workflow still running after 5s");
        process.exitCode = 1;
      }
    });
  } finally {
    await env.teardown();
  }
  process.exit(process.exitCode ?? 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
