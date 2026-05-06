<script setup lang="ts">
const props = defineProps({
  status: { type: String, required: true },
});

const colorMap: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  issued: "bg-sky-100 text-sky-700 border-sky-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  void: "bg-rose-100 text-rose-700 border-rose-200",
};
</script>

<template>
  <span :class="`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${colorMap[props.status] ?? colorMap.draft}`">
    {{ props.status }}
  </span>
</template>
