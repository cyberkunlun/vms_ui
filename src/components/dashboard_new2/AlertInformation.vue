<script setup lang="ts">
import PanelBox from './PanelBox.vue'

const alerts = [
  { type: 'Face Watch',              location: 'Multiple Muscat', time: '13:57:17', color: '#22d3ee', icon: 'face' },
  { type: 'Vehicle Matchlist',       location: 'Multiple Muscat', time: '13:49:57', color: '#22d3ee', icon: 'car' },
  { type: 'Loitering Detected',      location: 'Multiple Muscat', time: '13:45:56', color: '#f59e0b', icon: 'walk' },
  { type: 'Intrusion · Restricted',  location: 'Area B-12',       time: '13:30:12', color: '#ef4444', icon: 'ban' },
  { type: 'Nighttime Presence',      location: 'Zone C-05',       time: '13:25:32', color: '#8b5cf6', icon: 'night' },
]
</script>

<template>
  <PanelBox title="Real-Time Alerts" badge="View All">
    <div class="alert-list">
      <div v-for="(a, i) in alerts" :key="i" class="alert-row">
        <div class="alert-icon" :style="{ color: a.color, borderColor: a.color + '55', background: a.color + '18' }">
          <!-- face -->
          <svg v-if="a.icon === 'face'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <!-- car -->
          <svg v-else-if="a.icon === 'car'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="10" width="22" height="8" rx="2"/><path d="M5 10V8a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>
            <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
          </svg>
          <!-- walk / loitering -->
          <svg v-else-if="a.icon === 'walk'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="5" r="2"/><path d="M6 9l6 1 3 5"/><path d="M9 21l2-5 4 3"/><path d="M6 21l3-4"/>
          </svg>
          <!-- ban / intrusion -->
          <svg v-else-if="a.icon === 'ban'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
          <!-- night -->
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </div>
        <div class="alert-info">
          <div class="alert-type">{{ a.type }}</div>
          <div class="alert-loc">{{ a.location }}</div>
        </div>
        <div class="alert-time">{{ a.time }}</div>
      </div>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.alert-list {
  display: flex; flex-direction: column; gap: 5px;
  height: 100%;
}
.alert-row {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px;
  background: rgba(7,14,32,0.5);
  border-radius: 8px;
  border-left: 2px solid rgba(97,151,255,0.22);
  flex: 1; min-height: 0;
  transition: all 0.18s;
  &:hover { background: rgba(71,139,255,0.08); border-left-color: #60e0ff; }
}
.alert-icon {
  width: 26px; height: 26px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid; flex-shrink: 0;
  svg { width: 13px; height: 13px; }
}
.alert-info { flex: 1; min-width: 0; }
.alert-type {
  font-size: 11px; font-weight: 500; color: #dceeff;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.alert-loc {
  font-size: 9.5px; color: rgba(180,211,255,0.48);
  margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.alert-time {
  font-size: 10px; color: rgba(180,211,255,0.6);
  font-family: 'Consolas', monospace; flex-shrink: 0;
}
</style>
