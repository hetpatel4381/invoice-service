import Fastify from "fastify";
import prismaPlugin from "./plugins/prisma";
import invoiceRoutes from "./modules/invoice/invoices.routes";

const app = Fastify({ logger: true });

// register plugins
app.register(prismaPlugin);

// register routes
app.register(invoiceRoutes, { prefix: "/invoices" });

app.get("/", async () => {
  return { message: "API running 🚀" };
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log("Server running on http://localhost:3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
