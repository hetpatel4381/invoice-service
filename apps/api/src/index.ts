import Fastify from "fastify";
import prismaPlugin from "./plugins/prisma";
import invoiceRoutes from "./modules/invoice/invoices.routes";
import cors from "@fastify/cors";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = Fastify({ logger: true });

app.register(cors, {
  origin: [FRONTEND_URL],
});

// register plugins
app.register(prismaPlugin);

// register routes
app.register(invoiceRoutes, { prefix: "/invoices" });

app.get("/", async () => {
  return { message: "API running 🚀" };
});

const start = async () => {
  try {
    await app.listen({ port: PORT });
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
