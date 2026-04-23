<script setup lang="ts">
import PanelBox from './PanelBox.vue'

const resources = [
  { label: 'System Up', value: 156, unit: 'hrs', rate: 78 },
  { label: 'Staffing', value: 2256, unit: 'hrs', rate: 85 },
  { label: 'Resources', value: 92, unit: 'hrs', rate: 76 },
  { label: 'Time', value: 28, unit: 'hrs', rate: 64 },
  { label: 'Ambulance', value: 16, unit: 'hrs', rate: 54 },
  { label: 'Cliffs', value: 18632, unit: 'lines', rate: 80 }
]
</script>

<template>
  <PanelBox title="Resource Overview">
    <div class="res-grid">
      <article v-for="r in resources" :key="r.label" class="res-card">
        <span class="label">{{ r.label }}</span>
        <strong class="value">{{ r.value.toLocaleString() }} <em>{{ r.unit }}</em></strong>
        <div class="ring" :style="{ '--percent': r.rate + '%' } as any">
          <div class="ring-inner">{{ r.rate }}%</div>
        </div>
      </article>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.res-grid {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}
.res-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 4px 6px;
  text-align: center;
}
.label {
  color: rgba(201, 222, 255, 0.76);
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.value {
  font-size: 14px;
  font-weight: 600;
  color: #f3f7ff;
  font-family: 'Consolas', monospace;
  em {
    margin-left: 2px;
    font-size: 10px;
    font-style: normal;
    color: rgba(201, 222, 255, 0.76);
    font-weight: 400;
  }
}
.ring {
  --percent: 50%;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  padding: 5px;
  background:
    radial-gradient(circle at center, rgba(4, 11, 27, 0.95) 57%, transparent 58%),
    conic-gradient(#7eb8ff var(--percent), rgba(61, 94, 163, 0.28) 0);
  box-shadow: inset 0 0 20px rgba(102, 171, 255, 0.18);
}
.ring-inner {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid rgba(112, 168, 255, 0.25);
  color: #dceeff;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Consolas', monospace;
}

@media (max-width: 1600px) {
  .res-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    row-gap: 14px;
  }
}
</style>
