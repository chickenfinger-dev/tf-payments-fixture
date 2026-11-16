import Fastify, { FastifyInstance } from "fastify";

export function buildAuditedApp(): FastifyInstance {
  const app = Fastify({ logger: false });
  app.addHook("onRequest", (req, _reply, done) => {
    req.log.debug({ url: req.url }, "audit");
  });
  app.get("/health", async () => ({ ok: true }));
  return app;
}
