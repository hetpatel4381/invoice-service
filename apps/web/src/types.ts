export type InvoiceStatus = "draft" | "issued" | "paid" | "void";

export interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPriceMinor: number;
}

export interface Invoice {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  currency: string;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  taxRateBps: number;
  issuedAt?: string | null;
  dueAt?: string | null;
  status: InvoiceStatus;
  lineItems: LineItem[];
  createdAt?: string;
}

export interface PaginatedInvoices {
  data: Invoice[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
