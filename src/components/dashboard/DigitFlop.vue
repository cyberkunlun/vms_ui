<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
  value: number;
  duration?: number;
}>();

const displayValue = ref(0);

const animateValue = (start: number, end: number, duration: number) => {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    displayValue.value = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
};

onMounted(() => {
  animateValue(0, props.value, props.duration || 1500);
});

watch(() => props.value, (newVal, oldVal) => {
  animateValue(oldVal || 0, newVal, props.duration || 1000);
});
</script>

<template>
  <span class="digit-flop">{{ displayValue.toLocaleString() }}</span>
</template>

<style scoped>
.digit-flop {
  display: inline-block;
  font-family: 'Digital-7', sans-serif;
}
</style>
