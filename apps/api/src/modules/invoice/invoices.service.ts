import { PrismaClient, Prisma, InvoiceStatus } from "@prisma/client";

// =======================
// 🔒 Internal Helper Functions
// =======================

function calculateSubtotal(
  lineItems: {
    quantity: number;
    unitPriceMinor: number;
  }[],
) {
  return lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceMinor,
    0,
  );
}

function roundHalfToEven(value: number) {
  const floor = Math.floor(value);
  const diff = value - floor;

  if (diff < 0.5) return floor;
  if (diff > 0.5) return Math.ceil(value);

  return floor % 2 === 0 ? floor : floor + 1;
}

function calculateTax(subtotalMinor: number, taxRateBps: number) {
  const raw = (subtotalMinor * taxRateBps) / 10000;
  return roundHalfToEven(raw);
}

function calculateTotal(subtotal: number, tax: number) {
  return subtotal + tax;
}

async function generateInvoiceNumber(tx: Prisma.TransactionClient) {
  const now = new Date();
  const yearMonth =
    now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, "0");

  const counter = await tx.invoiceCounter.upsert({
    where: { yearMonth },
    update: { current: { increment: 1 } },
    create: { yearMonth, current: 1 },
  });

  const sequence = String(counter.current).padStart(4, "0");

  return `INV-${yearMonth}-${sequence}`;
}

function validateStatusTransition(current: string, next: string): boolean {
  const validTransitions: Record<string, string[]> = {
    draft: ["issued"],
    issued: ["paid", "void"],
    paid: [],
    void: [],
  };

  return validTransitions[current]?.includes(next);
}

// =======================
// 🚀 Service (Public API)
// =======================

export const invoiceService = {
  createInvoice: async (prisma: PrismaClient, input: any) => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const { customerName, customerEmail, lineItems, taxRateBps, currency } =
        input;

      const subtotal = calculateSubtotal(lineItems);
      const tax = calculateTax(subtotal, taxRateBps);
      const total = calculateTotal(subtotal, tax);

      const number = await generateInvoiceNumber(tx);

      return tx.invoice.create({
        data: {
          number,
          customerName,
          customerEmail,
          currency,
          subtotalMinor: subtotal,
          taxMinor: tax,
          totalMinor: total,
          taxRateBps,
          status: "draft",
          lineItems: {
            create: lineItems,
          },
        },
        include: {
          lineItems: true,
        },
      });
    });
  },

  getInvoices: async (
    prisma: PrismaClient,
    page: number = 1,
    limit: number = 10,
  ) => {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.invoice.count(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getInvoiceById: async (prisma: PrismaClient, id: string) => {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { lineItems: true },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    return invoice;
  },

  updateStatus: async (
    prisma: PrismaClient,
    id: string,
    newStatus: InvoiceStatus,
  ) => {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (!validateStatusTransition(invoice.status, newStatus)) {
      throw new Error(
        `Invalid transition from ${invoice.status} to ${newStatus}`,
      );
    }

    return prisma.invoice.update({
      where: { id },
      data: {
        status: newStatus,
        issuedAt: newStatus === "issued" ? new Date() : invoice.issuedAt,
      },
    });
  },
};
