<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useInvoiceStore } from "../store/invoice";
import { api } from "../api/api";

const route = useRoute();
const router = useRouter();
const store = useInvoiceStore();
const localError = ref<string | null>(null);

const invoice = computed(() => store.currentInvoice);
const formattingCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

const formatCurrency = (minor: number) =>
  formattingCurrency.format(minor / 100);

const transitionOptions = computed(() => {
  if (!invoice.value) return [] as { label: string; status: string }[];
  if (invoice.value.status === "draft") {
    return [{ label: "Issue invoice", status: "issued" }];
  }
  if (invoice.value.status === "issued") {
    return [
      { label: "Mark paid", status: "paid" },
      { label: "Void invoice", status: "void" },
    ];
  }
  return [];
});

onMounted(async () => {
  try {
    await store.fetchInvoice(route.params.id as string);
  } catch (err: any) {
    localError.value = err?.message ?? "Invoice not found.";
  }
});

const changeStatus = async (status: string) => {
  if (!invoice.value) return;
  localError.value = null;

  try {
    await store.updateStatus(invoice.value.id, status as any);
  } catch (err: any) {
    localError.value = err?.message ?? "Could not update status.";
  }
};

const backToList = () => router.push("/invoices");
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Invoice detail</p>
          <h1 class="mt-3 text-3xl font-semibold text-slate-950">{{ invoice?.number ?? "Invoice detail" }}</h1>
          <div class="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
            <span>Status: {{ invoice?.status ?? "unknown" }}</span>
            <span>Due: {{ invoice?.dueAt ? new Date(invoice.dueAt).toLocaleDateString() : "—" }}</span>
            <span>Issued: {{ invoice?.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : "—" }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            @click="backToList"
          >
            Back
          </button>
          <button
            type="button"
            class="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            :disabled="!invoice"
            @click="invoice && api.downloadPDF(invoice.id)"
          >
            Download PDF
          </button>
        </div>
      </div>
    </section>

    <section v-if="invoice" class="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="space-y-6">
          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p class="text-sm text-slate-500">Customer</p>
            <p class="mt-3 text-lg font-semibold text-slate-900">{{ invoice.customerName }}</p>
            <p class="text-sm text-slate-600">{{ invoice.customerEmail }}</p>
          </div>

          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p class="text-sm text-slate-500">Totals</p>
            <div class="mt-4 space-y-3">
              <div class="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{{ formatCurrency(invoice.subtotalMinor) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span>{{ formatCurrency(invoice.taxMinor) }}</span>
              </div>
              <div class="flex items-center justify-between text-base font-semibold text-slate-950">
                <span>Total</span>
                <span>{{ formatCurrency(invoice.totalMinor) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Line items</p>
          <div class="mt-5 space-y-4">
            <div v-for="item in invoice.lineItems" :key="item.id ?? item.description" class="rounded-3xl border border-slate-200 p-4">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="font-semibold text-slate-900">{{ item.description }}</p>
                  <p class="text-sm text-slate-500">Qty: {{ item.quantity }}</p>
                </div>
                <p class="text-sm font-semibold text-slate-900">{{ formatCurrency(item.unitPriceMinor) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <template v-if="transitionOptions.length > 0">
          <button
            v-for="action in transitionOptions"
            :key="action.status"
            type="button"
            class="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            @click="changeStatus(action.status)"
          >
            {{ action.label }}
          </button>
        </template>
        <template v-else>
          <p class="text-sm text-slate-500">This invoice has no available status actions.</p>
        </template>
      </div>
    </section>

    <div v-else class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
      Invoice not found or still loading.
    </div>

    <div v-if="localError" class="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
      {{ localError }}
    </div>
  </div>
</template>