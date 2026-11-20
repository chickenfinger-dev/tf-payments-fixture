import type { FastifyInstance } from "fastify";
import {
  calculateProcessingFees,
  settlementDay,
  sumCents,
  SettlementItem,
} from "./settlement";

const previewBody = {
  type: "object",
  required: ["items"],
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "amount", "currency", "createdAt"],
        properties: {
          id: { type: "string" },
          amount: { type: "number" },
          currency: { type: "string" },
          createdAt: { type: "string" },
        },
      },
    },
  },
} as const;

const previewResponse = {
  200: {
    type: "object",
    required: ["total", "fees", "day"],
    properties: {
      total: { type: "number" },
      fees: { type: "number" },
      day: { type: "string" },
    },
  },
} as const;

export async function settlementRoutes(fastify: FastifyInstance): Promise<void> {
  // Dry-run a settlement batch: totals, fees and the business day it lands in.
  fastify.post(
    "/settlements/preview",
    { schema: { body: previewBody, response: previewResponse } },
    async (req) => {
      const { items } = req.body as { items: SettlementItem[] };
      const total = sumCents(items.map((i) => i.amount));
      const fees = calculateProcessingFees(items);
      const day = settlementDay(items[0]?.createdAt ?? new Date(0).toISOString());
      return { total, fees, day };
    }
  );
}
