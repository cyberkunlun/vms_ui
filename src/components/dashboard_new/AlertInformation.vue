<script setup lang="ts">
import PanelBox from './PanelBox.vue'

const alerts = [
  { type: 'High Wind Warning', icon: '△', color: '#fb923c', time: '03:27 PM', date: '03:37 PM' },
  { type: 'Yellow Wave Warning', icon: '△', color: '#facc15', time: '03:27 PM', date: '01:52 PM' },
  { type: 'Yellow High Temperature', icon: '△', color: '#facc15', time: '12:19 PM', date: '12:19 PM' },
  { type: 'Sandstorm Warning', icon: '⚠', color: '#d97706', time: '10:55 AM', date: '10:55 AM' },
  { type: 'Heavy Rain Warning', icon: '▲', color: '#ef4444', time: '10:05 AM', date: '10:05 AM' }
]
</script>

<template>
  <PanelBox title="Real-time Alerts" badge="226">
    <div class="tabs">
      <div class="tab active">All</div>
      <div class="tab">Weather</div>
      <div class="tab">Traffic</div>
      <div class="tab">Police</div>
      <div class="tab">Fire</div>
    </div>
    <div class="alert-list">
      <div v-for="(a, i) in alerts" :key="i" class="alert-row">
        <div class="icon" :style="{ color: a.color, borderColor: a.color }">{{ a.icon }}</div>
        <div class="info">
          <div class="name">{{ a.type }}</div>
        </div>
        <div class="times">
          <span class="t">{{ a.time }}</span>
          <span class="t muted">{{ a.date }}</span>
        </div>
      </div>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.12);
}
.tab {
  font-size: 10px;
  padding: 3px 8px;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  &.active {
    color: #22d3ee;
    background: rgba(34, 211, 238, 0.12);
    border: 1px solid rgba(34, 211, 238, 0.25);
  }
  &:not(.active):hover {
    color: #cbd5e1;
    background: rgba(255, 255, 255, 0.04);
  }
}
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.alert-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  background: rgba(15, 23, 42, 0.45);
  border-radius: 4px;
  border-left: 2px solid rgba(56, 189, 248, 0.3);
  transition: all 0.2s;
  &:hover {
    background: rgba(56, 189, 248, 0.06);
    border-left-color: #22d3ee;
  }
}
.icon {
  width: 22px;
  height: 22px;
  border: 1px solid;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.info {
  flex: 1;
  min-width: 0;
  .name {
    font-size: 11px;
    color: #e0f2fe;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.times {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  .t {
    font-size: 10px;
    color: #cbd5e1;
    font-family: 'Consolas', monospace;
    &.muted {
      color: #64748b;
      font-size: 9px;
    }
  }
}
</style>
