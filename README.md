# tf-payments-service

Test fixture service: a Fastify HTTP API that starts and queries Temporal
payment workflows. Architecture notes live in ARCHITECTURE.md.

- `src/server.ts` - Fastify routes (start payment, get order status)
- `src/workflows.ts` - Temporal workflow definitions
- `src/activities.ts` - Temporal activities (charge card, notify, persist)
- `src/worker.ts` - Temporal worker bootstrap
