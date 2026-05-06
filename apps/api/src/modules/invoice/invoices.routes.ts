import { FastifyInstance } from "fastify";
import { invoiceService } from "./invoices.service";
import { InvoiceStatus } from "@prisma/client";
import { generateInvoicePDF } from "./invoice.pdf.helper";

export default async function invoiceRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const { page = "1", limit = "10" } = request.query as any;

    return invoiceService.getInvoices(app.prisma, Number(page), Number(limit));
  });

  app.post("/", async (request) => {
    const invoice = await invoiceService.createInvoice(
      app.prisma,
      request.body,
    );

    return invoice;
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as any;

    try {
      return await invoiceService.getInvoiceById(app.prisma, id);
    } catch (err) {
      reply.status(404);
      return { message: "Invoice not found" };
    }
  });

  app.patch("/:id/status", async (request, reply) => {
    const { id } = request.params as any;
    const { status } = request.body as { status: InvoiceStatus };

    try {
      return await invoiceService.updateStatus(app.prisma, id, status);
    } catch (err: any) {
      reply.status(400);
      return { message: err.message };
    }
  });

  app.get("/:id/pdf", async (request, reply) => {
    const { id } = request.params as any;

    const invoice = await app.prisma.invoice.findUnique({
      where: { id },
      include: { lineItems: true },
    });

    if (!invoice) {
      reply.status(404);
      return { message: "Invoice not found" };
    }

    const pdfBuffer = await generateInvoicePDF(invoice);

    reply
      .header("Content-Type", "application/pdf")
      .header(
        "Content-Disposition",
        `attachment; filename=${invoice.number}.pdf`,
      )
      .send(pdfBuffer);
  });
}
