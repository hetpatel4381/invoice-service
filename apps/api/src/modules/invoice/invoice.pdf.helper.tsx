import { InvoicePDF } from "./invoice.pdf";

export async function generateInvoicePDF(invoice: any) {
  const renderer = await import("@react-pdf/renderer");
  const { renderToBuffer } = renderer;

  const buffer = await renderToBuffer(
    <InvoicePDF invoice={invoice} renderer={renderer} />,
  );

  return buffer;
}
