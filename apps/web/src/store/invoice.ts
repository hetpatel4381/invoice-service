import { defineStore } from "pinia";
import { api } from "../api/api";
import type { Invoice } from "../types";

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const useInvoiceStore = defineStore("invoice", {
  state: () => ({
    invoices: [] as Invoice[],
    currentInvoice: null as Invoice | null,
    meta: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    } as Meta,
    loadingList: false,
    loadingItem: false,
    submitting: false,
    error: null as string | null,
  }),
  actions: {
    async fetchInvoices(page = 1, limit = 10) {
      this.loadingList = true;
      this.error = null;

      try {
        const result = await api.getInvoices(page, limit);
        this.invoices = result.data;
        this.meta = result.meta;
      } catch (error: any) {
        this.error = error?.message ?? "Unable to load invoices.";
      } finally {
        this.loadingList = false;
      }
    },

    async fetchInvoice(id: string) {
      this.loadingItem = true;
      this.error = null;

      try {
        this.currentInvoice = await api.getInvoice(id);
        return this.currentInvoice;
      } catch (error: any) {
        this.error = error?.message ?? "Unable to load this invoice.";
        this.currentInvoice = null;
        throw error;
      } finally {
        this.loadingItem = false;
      }
    },

    async createInvoice(data: Partial<Invoice>) {
      this.submitting = true;
      this.error = null;

      try {
        const created = await api.createInvoice(data);
        this.currentInvoice = created;
        return created;
      } catch (error: any) {
        this.error = error?.message ?? "Unable to create invoice.";
        throw error;
      } finally {
        this.submitting = false;
      }
    },

    async updateStatus(id: string, status: Invoice["status"]) {
      this.submitting = true;
      this.error = null;

      try {
        const updated = await api.updateStatus(id, status);
        if (this.currentInvoice?.id === updated.id) {
          this.currentInvoice = updated;
        }
        return updated;
      } catch (error: any) {
        this.error = error?.message ?? "Unable to update status.";
        throw error;
      } finally {
        this.submitting = false;
      }
    },
  },
});
