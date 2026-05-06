import type { Invoice, PaginatedInvoices } from "../types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((json?.message ?? response.statusText) || "Request failed");
  }
  return json as T;
}

export const api = {
  getInvoices: async (page = 1, limit = 10): Promise<PaginatedInvoices> =>
    handleResponse<PaginatedInvoices>(
      await fetch(`${BASE}/invoices?page=${page}&limit=${limit}`),
    ),

  getInvoice: async (id: string): Promise<Invoice> =>
    handleResponse<Invoice>(await fetch(`${BASE}/invoices/${id}`)),

  createInvoice: async (data: Partial<Invoice>): Promise<Invoice> =>
    handleResponse<Invoice>(
      await fetch(`${BASE}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    ),

  updateStatus: async (
    id: string,
    status: Invoice["status"],
  ): Promise<Invoice> =>
    handleResponse<Invoice>(
      await fetch(`${BASE}/invoices/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }),
    ),

  downloadPDF: (id: string) =>
    window.open(`${BASE}/invoices/${id}/pdf`, "_blank"),
};
