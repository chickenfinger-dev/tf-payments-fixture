import Fastify from "fastify";

const fastify = Fastify({ logger: true });

fastify.post("/route-test/:userId", async (req) => {
  const body = req.body as any;
  return { received: body };
});

export default fastify;
