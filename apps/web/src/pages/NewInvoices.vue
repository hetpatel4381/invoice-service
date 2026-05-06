<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useInvoiceStore } from "../store/invoice";

const router = useRouter();
const store = useInvoiceStore();

const form = reactive({
  customerName: "",
  customerEmail: "",
  currency: "INR",
  taxRateBps: 1800,
  dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
  lineItems: [{ description: "", quantity: 1, unitPriceMinor: 0 }],
});

const error = ref<string | null>(null);
const formattingCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

const subtotalMinor = computed(() =>
  form.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor, 0),
);

const taxMinor = computed(() =>
  Math.round((subtotalMinor.value * form.taxRateBps) / 10000),
);

const totalMinor = computed(() => subtotalMinor.value + taxMinor.value);

const formatCurrency = (minor: number) => formattingCurrency.format(minor / 100);

const addItem = () => {
  form.lineItems.push({ description: "", quantity: 1, unitPriceMinor: 0 });
};

const removeItem = (index: number) => {
  if (form.lineItems.length > 1) {
    form.lineItems.splice(index, 1);
  }
};

const isFormValid = computed(
  () =>
    form.customerName.trim().length > 0 &&
    form.customerEmail.trim().length > 0 &&
    form.lineItems.every((item) => item.description.trim().length > 0 && item.quantity > 0 && item.unitPriceMinor >= 0),
);

const submit = async () => {
  if (!isFormValid.value) {
    error.value = "Please complete all invoice fields before submitting.";
    return;
  }

  error.value = null;

  try {
    const created = await store.createInvoice({
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      currency: form.currency,
      taxRateBps: form.taxRateBps,
      dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      lineItems: form.lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
      })),
    });

    router.push(`/invoices/${created.id}`);
  } catch (err: any) {
    error.value = err?.message ?? "Failed to create invoice.";
  }
};
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">New invoice</p>
          <h1 class="mt-3 text-3xl font-semibold text-slate-950">Create invoice</h1>
          <p class="mt-2 text-sm text-slate-600">
            Enter customer details, add line items, and calculate totals in minor currency units.
          </p>
        </div>
      </div>
    </section>

    <section class="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="grid gap-4 md:grid-cols-2">
        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Customer name</span>
          <input
            type="text"
            v-model="form.customerName"
            placeholder="Acme Corporation"
            class="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Customer email</span>
          <input
            type="email"
            v-model="form.customerEmail"
            placeholder="hello@acme.com"
            class="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Currency</span>
          <select
            v-model="form.currency"
            class="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Due date</span>
          <input
            type="date"
            v-model="form.dueAt"
            class="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label class="space-y-2 md:col-span-2">
          <span class="text-sm font-medium text-slate-700">Tax rate (basis points)</span>
          <input
            type="number"
            min="0"
            v-model.number="form.taxRateBps"
            class="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>
      </div>

      <div class="mt-6 space-y-4 rounded-4xl border border-slate-200 bg-slate-50 p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-semibold text-slate-900">Line items</p>
            <p class="text-sm text-slate-500">Add each charge or service line below.</p>
          </div>
          <button
            type="button"
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            @click="addItem"
          >
            + Add item
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="(item, index) in form.lineItems"
            :key="index"
            class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div class="grid gap-4 lg:grid-cols-[1.8fr_0.9fr_0.9fr_auto]">
              <label class="space-y-2 lg:col-span-2">
                <span class="text-sm font-medium text-slate-700">Description</span>
                <input
                  type="text"
                  v-model="item.description"
                  placeholder="Description"
                  class="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label class="space-y-2">
                <span class="text-sm font-medium text-slate-700">Qty</span>
                <input
                  type="number"
                  min="1"
                  v-model.number="item.quantity"
                  class="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label class="space-y-2">
                <span class="text-sm font-medium text-slate-700">Unit price</span>
                <input
                  type="number"
                  min="0"
                  v-model.number="item.unitPriceMinor"
                  class="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <div class="flex items-end justify-end">
                <button
                  type="button"
                  class="text-sm font-semibold text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                  @click="removeItem(index)"
                  :disabled="form.lineItems.length === 1"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-4 rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3">
        <div>
          <p class="text-sm text-slate-500">Subtotal</p>
          <p class="mt-2 text-2xl font-semibold text-slate-950">{{ formatCurrency(subtotalMinor) }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500">Tax</p>
          <p class="mt-2 text-2xl font-semibold text-slate-950">{{ formatCurrency(taxMinor) }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500">Total</p>
          <p class="mt-2 text-2xl font-semibold text-slate-950">{{ formatCurrency(totalMinor) }}</p>
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-sm text-slate-500">All totals are stored in integer minor units.</div>
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            @click="router.push('/invoices')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            @click="submit"
            :disabled="store.submitting || !isFormValid"
          >
            {{ store.submitting ? 'Creating...' : 'Create invoice' }}
          </button>
        </div>
      </div>

      <div v-if="error" class="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {{ error }}
      </div>
    </section>
  </div>
</template>