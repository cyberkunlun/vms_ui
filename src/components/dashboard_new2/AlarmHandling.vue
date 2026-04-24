<script setup lang="ts">
import PanelBox from './PanelBox.vue'

const actions = [
  { label: 'Live View',      color: '#22d3ee', icon: 'video' },
  { label: 'Playback',       color: '#22d3ee', icon: 'play' },
  { label: 'Video Search',   color: '#22d3ee', icon: 'search-video' },
  { label: 'Face Search',    color: '#8b5cf6', icon: 'face' },
  { label: 'Vehicle Search', color: '#8b5cf6', icon: 'car' },
  { label: 'Create Task',    color: '#22c55e', icon: 'task' },
]
</script>

<template>
  <PanelBox title="Quick Actions">
    <div class="qa-grid">
      <button v-for="a in actions" :key="a.label" class="qa-btn">
        <div class="qa-icon" :style="{ color: a.color, borderColor: a.color + '44', background: a.color + '14' }">
          <svg v-if="a.icon === 'video'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          <svg v-else-if="a.icon === 'play'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
          <svg v-else-if="a.icon === 'search-video'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <polygon points="9 8 15 11 9 14 9 8"/>
          </svg>
          <svg v-else-if="a.icon === 'face'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="9" r="5"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <svg v-else-if="a.icon === 'car'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="10" width="22" height="8" rx="2"/><path d="M5 10V8a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>
            <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="12" y2="17"/><polyline points="9 9 10 9 11 9"/>
          </svg>
        </div>
        <span class="qa-label">{{ a.label }}</span>
      </button>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.qa-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 6px; height: 100%;
}
.qa-btn {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 5px;
  background: rgba(7,14,32,0.55);
  border: 1px solid rgba(97,151,255,0.14);
  border-radius: 10px; cursor: pointer; outline: none;
  transition: all 0.18s;
  padding: 6px 4px;
  &:hover {
    background: rgba(71,139,255,0.1);
    border-color: rgba(97,151,255,0.3);
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
}
.qa-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid;
  svg { width: 15px; height: 15px; }
}
.qa-label {
  font-size: 9.5px; color: rgba(180,211,255,0.65);
  text-align: center; line-height: 1.2; letter-spacing: 0.02em;
}
</style>
