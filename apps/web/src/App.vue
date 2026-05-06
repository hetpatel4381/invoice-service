<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">oMazons Take-Home</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Invoice Service</h1>
          <p class="mt-2 text-sm text-slate-600 sm:max-w-xl">
            Create, list, and download invoices with a clean Tailwind + shadcn-inspired Vue UI.
          </p>
        </div>

        <nav class="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <RouterLink to="/invoices" class="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 transition hover:bg-slate-100">Invoices</RouterLink>
          <RouterLink to="/invoices/new" class="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800">New Invoice</RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>