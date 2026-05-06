<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useInvoiceStore } from "../store/invoice";

const router = useRouter();
const store = useInvoiceStore();
const page = ref(1);

const invoices = computed(() => store.invoices);
const meta = computed(() => store.meta);
const isLoading = computed(() => store.loadingList);
const error = computed(() => store.error);

const formatCurrency = (minor: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(minor / 100);

const fetchPage = async (nextPage: number) => {
  page.value = nextPage;
  await store.fetchInvoices(page.value, store.meta.limit);
};

const previousPage = () => {
  if (page.value > 1) {
    fetchPage(page.value - 1);
  }
};

const nextPage = () => {
  if (page.value < meta.value.totalPages) {
    fetchPage(page.value + 1);
  }
};

onMounted(() => fetchPage(1));
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Invoices</p>
          <h1 class="mt-3 text-3xl font-semibold text-slate-950">All invoices</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-600">
            Paginated invoice list with statuses and quick access to details and PDF download.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          @click="router.push('/invoices/new')"
        >
          + New invoice
        </button>
      </div>
    </section>

    <section class="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-slate-500">Showing invoices</p>
          <p class="mt-1 text-xl font-semibold text-slate-900">
            Page {{ meta.page }} of {{ meta.totalPages }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="page <= 1 || isLoading"
            @click="previousPage"
          >
            Previous
          </button>
          <button
            type="button"
            class="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="page >= meta.totalPages || isLoading"
            @click="nextPage"
          >
            Next
          </button>
        </div>
      </div>

      <div class="mt-6 space-y-4">
        <template v-if="isLoading">
          <div class="space-y-4">
            <div class="h-28 animate-pulse rounded-3xl bg-slate-200"></div>
            <div class="h-28 animate-pulse rounded-3xl bg-slate-200"></div>
            <div class="h-28 animate-pulse rounded-3xl bg-slate-200"></div>
          </div>
        </template>

        <template v-else-if="error">
          <div class="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {{ error }}
          </div>
        </template>

        <template v-else-if="invoices.length === 0">
          <div class="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-600">
            No invoices found. Create your first invoice to get started.
          </div>
        </template>

        <template v-else>
          <div class="grid gap-4">
            <article
              v-for="invoice in invoices"
              :key="invoice.id"
              class="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div class="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
                <div class="space-y-3">
                  <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span class="font-semibold text-slate-900">{{ invoice.number }}</span>
                    <span>•</span>
                    <span>{{ invoice.customerName }}</span>
                  </div>
                  <p class="text-sm text-slate-600">{{ invoice.customerEmail }}</p>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                      {{ invoice.status }}
                    </span>
                    <span class="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm">
                      {{ formatCurrency(invoice.totalMinor, invoice.currency) }}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  class="self-start rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  @click="router.push(`/invoices/${invoice.id}`)"
                >
                  View invoice
                </button>
              </div>
            </article>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>