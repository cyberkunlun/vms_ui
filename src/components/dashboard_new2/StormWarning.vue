<script setup lang="ts">
import PanelBox from './PanelBox.vue'

const warnings = [
  { label: 'Gathering',        count: 4,  color: '#22d3ee', icon: 'crowd' },
  { label: 'Crowd Gathering',  count: 7,  color: '#f59e0b', icon: 'crowd2' },
  { label: 'Intrusion',        count: 7,  color: '#ef4444', icon: 'ban' },
  { label: 'Abandoned Object', count: 3,  color: '#8b5cf6', icon: 'box' },
  { label: 'Speeding',         count: 7,  color: '#22c55e', icon: 'speed' },
  { label: 'Face Proximity',   count: 6,  color: '#60e0ff', icon: 'face2' },
]
</script>

<template>
  <PanelBox title="AI Warnings Live" badge="View All">
    <div class="aw-grid">
      <div v-for="w in warnings" :key="w.label" class="aw-cell">
        <div class="aw-icon-wrap" :style="{ color: w.color, borderColor: w.color + '44', background: w.color + '12' }">
          <!-- crowd -->
          <svg v-if="w.icon === 'crowd'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="7" r="3"/><path d="M3 21v-2a5 5 0 0 1 5-5h4"/>
            <circle cx="17" cy="11" r="3"/><path d="M22 21v-2a5 5 0 0 0-5-5h-1"/>
          </svg>
          <!-- crowd2 -->
          <svg v-else-if="w.icon === 'crowd2'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="6" r="3"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/>
            <circle cx="4" cy="9" r="2"/><path d="M2 21v-1a4 4 0 0 1 4-4"/>
            <circle cx="20" cy="9" r="2"/><path d="M22 21v-1a4 4 0 0 0-4-4"/>
          </svg>
          <!-- ban / intrusion -->
          <svg v-else-if="w.icon === 'ban'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
          <!-- box / abandoned -->
          <svg v-else-if="w.icon === 'box'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="21 8 21 21 3 21 3 8"/>
            <rect x="1" y="3" width="22" height="5" rx="1"/>
            <line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
          <!-- speed -->
          <svg v-else-if="w.icon === 'speed'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17H5a2 2 0 0 1 0-4h2l2-8h6l2 8h2a2 2 0 0 1 0 4z"/>
          </svg>
          <!-- face proximity -->
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="9" r="4"/><circle cx="16" cy="9" r="4"/>
            <path d="M4 21v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1"/>
          </svg>
        </div>
        <div class="aw-count" :style="{ color: w.color }">{{ w.count }}</div>
        <div class="aw-label">{{ w.label }}</div>
      </div>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.aw-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 6px; height: 100%;
}
.aw-cell {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
  padding: 6px 4px;
  background: rgba(7,14,32,0.55);
  border: 1px solid rgba(97,151,255,0.12);
  border-radius: 10px;
  transition: all 0.18s;
  &:hover { background: rgba(71,139,255,0.08); border-color: rgba(97,151,255,0.28); }
}
.aw-icon-wrap {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid;
  svg { width: 16px; height: 16px; }
}
.aw-count {
  font-size: 18px; font-weight: 700;
  font-family: 'Consolas', monospace; line-height: 1;
}
.aw-label {
  font-size: 9px; color: rgba(180,211,255,0.55);
  text-align: center; letter-spacing: 0.03em;
  line-height: 1.2;
}
</style>
