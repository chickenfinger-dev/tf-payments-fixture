// Injects GET /health into the audited app and waits 3 seconds for a response.
import { buildAuditedApp } from "../src/request-audit";

async function main(): Promise<void> {
  const app = buildAuditedApp();
  const response = app.inject({ method: "GET", url: "/health" });
  const outcome = await Promise.race([
    response.then((r) => ({ kind: "responded" as const, status: r.statusCode })),
    new Promise<{ kind: "hung" }>((resolve) => setTimeout(() => resolve({ kind: "hung" }), 3000)),
  ]);
  console.log(JSON.stringify(outcome));
  if (outcome.kind === "hung") {
    console.error("DEFECT REPRODUCED: GET /health never responded within 3s");
    process.exitCode = 1;
  }
  process.exit(process.exitCode ?? 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
