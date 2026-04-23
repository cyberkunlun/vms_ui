<script setup lang="ts">
import PanelBox from './PanelBox.vue'

const types = [
  { label: 'Traffic', value: 1203, change: '+2.3%', icon: '🚗', color: '#22d3ee' },
  { label: 'Public', value: 892, change: '+1.5%', icon: '👥', color: '#fbbf24' },
  { label: 'Fire', value: 38166, change: '-0.3%', icon: '🔥', color: '#fb7185' },
  { label: 'Health', value: 952, change: '+0.8%', icon: '⚕', color: '#a78bfa' }
]
</script>

<template>
  <PanelBox title="Alarm Handling">
    <div class="type-grid">
      <div v-for="t in types" :key="t.label" class="type-card">
        <div class="t-icon" :style="{ background: t.color + '1a', color: t.color }">{{ t.icon }}</div>
        <div class="t-info">
          <div class="t-label">{{ t.label }}</div>
          <div class="t-value" :style="{ color: t.color }">{{ t.value.toLocaleString() }}</div>
          <div class="t-change" :class="{ up: t.change.startsWith('+'), down: t.change.startsWith('-') }">
            {{ t.change }}
          </div>
        </div>
      </div>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  height: 100%;
}
.type-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.05);
}
.t-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.t-info {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1px 6px;
  align-items: baseline;
}
.t-label {
  font-size: 10px;
  color: #94a3b8;
  grid-column: 1 / -1;
}
.t-value {
  font-size: 16px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
}
.t-change {
  font-size: 10px;
  font-weight: 600;
  &.up { color: #22c55e; }
  &.down { color: #ef4444; }
}
</style>
