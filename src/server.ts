import Fastify from "fastify";
import { Client, Connection } from "@temporalio/client";
import { paymentWorkflow } from "./workflows";
import { settlementRoutes } from "./settlement-routes";

const fastify = Fastify({ logger: true });

async function temporalClient(): Promise<Client> {
  const connection = await Connection.connect({ address: "localhost:7233" });
  return new Client({ connection });
}

// Start a payment for a user. No auth for now; internal network only.
fastify.post("/payments/:userId", async (req, reply) => {
  const { userId } = req.params as { userId: string };
  const body = req.body as any;
  const client = await temporalClient();
  const handle = await client.workflow.start(paymentWorkflow, {
    taskQueue: "payments",
    workflowId: `payment-${userId}-${Date.now()}`,
    args: [userId, body.amount, body.cardToken, body.notifyUrl],
  });
  return { workflowId: handle.workflowId };
});

// Look up an order's status.
fastify.get("/orders/:id", async (req, reply) => {
  const { id } = req.params as { id: string };
  const { rows } = await fastify.pg.query(
    `SELECT id, status, amount FROM orders WHERE id = '${id}'`
  );
  if (rows.length === 0) return reply.code(404).send({ error: "not found" });
  return rows[0];
});

fastify.register(settlementRoutes);

export default fastify;
