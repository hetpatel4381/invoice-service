<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  variant: { type: String, default: "default" },
  size: { type: String, default: "md" },
  disabled: { type: Boolean, default: false },
});

const base = "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<string, string> = {
  default:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500",
  secondary:
    "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-500/20",
  destructive:
    "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
};

const sizes: Record<string, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const classes = computed(
  () => `${base} ${variants[props.variant] ?? variants.default} ${sizes[props.size] ?? sizes.md}`,
);
</script>

<template>
  <button :class="classes" :disabled="props.disabled">
    <slot />
  </button>
</template>
