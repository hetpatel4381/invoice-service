import { createRouter, createWebHistory } from "vue-router";
import Invoices from "./pages/Invoice.vue";
import NewInvoice from "./pages/NewInvoices.vue";
import InvoiceDetail from "./pages/InvoiceDetail.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/invoices" },
    { path: "/invoices", component: Invoices },
    { path: "/invoices/new", component: NewInvoice },
    { path: "/invoices/:id", component: InvoiceDetail },
  ],
});
