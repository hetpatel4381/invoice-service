import { FastifyInstance } from "fastify";

export default async function invoiceRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return { message: "List invoices (todo)" };
  });

  app.post("/", async () => {
    return { message: "Create invoice (todo)" };
  });

  app.get("/:id", async () => {
    return { message: "Get single invoice (todo)" };
  });

  app.get("/:id/pdf", async () => {
    return { message: "Download PDF (todo)" };
  });
}
