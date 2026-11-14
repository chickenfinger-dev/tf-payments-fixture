# Architecture

Fastify accepts HTTP requests and translates them into Temporal workflow
executions on the `payments` task queue. Workflow code must stay
deterministic: all side effects (database writes, card charges, HTTP calls)
happen inside activities. The worker process runs the activities and
workflows; the API process only talks to Temporal via the client.

Order state is stored in Postgres (`orders` table). Card charges go through
Stripe. Customer notifications go through a webhook the caller supplies.
