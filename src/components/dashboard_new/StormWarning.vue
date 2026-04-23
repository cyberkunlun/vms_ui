<script setup lang="ts">
import PanelBox from './PanelBox.vue'

const rings = [
  { label: 'Wind Retails', value: '100%', percent: 100 },
  { label: 'Pressure', value: '79%', percent: 79 }
]
</script>

<template>
  <PanelBox title="Storm Warning">
    <div class="storm-wrap">
      <div class="head">
        <div class="icon">☁</div>
        <div class="copy">
          <strong>High Wind</strong>
          <p>Muscat Northern Region</p>
          <p>Sudden wind speed: 23.38–50 km/h</p>
        </div>
      </div>

      <div class="rings">
        <div v-for="r in rings" :key="r.label" class="ring-card">
          <div class="ring-progress" :style="{ '--percent': r.percent + '%' } as any">
            <div class="ring-inner">{{ r.value }}</div>
          </div>
          <span>{{ r.label }}</span>
        </div>
      </div>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.storm-wrap {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 8px;
  height: 100%;
}

.head {
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  font-size: 20px;
  color: #d7ebff;
  border-radius: 50%;
  border: 1px solid rgba(112, 168, 255, 0.28);
  background: radial-gradient(circle, rgba(95, 153, 255, 0.24), rgba(12, 22, 46, 0.5));
  flex-shrink: 0;
}

.copy {
  min-width: 0;
  strong {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #edf5ff;
    margin-bottom: 2px;
  }
  p {
    margin: 1px 0 0;
    color: rgba(201, 222, 255, 0.76);
    font-size: 10px;
    line-height: 1.3;
  }
}

.rings {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  align-items: center;
}

.ring-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.ring-progress {
  --percent: 50%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  padding: 6px;
  background:
    radial-gradient(circle at center, rgba(4, 11, 27, 0.95) 57%, transparent 58%),
    conic-gradient(#7eb8ff var(--percent), rgba(61, 94, 163, 0.28) 0);
  box-shadow: inset 0 0 24px rgba(102, 171, 255, 0.2);
}

.ring-inner {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid rgba(112, 168, 255, 0.25);
  color: #dceeff;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Consolas', monospace;
}

.ring-card span {
  color: rgba(201, 222, 255, 0.76);
  font-size: 11px;
  letter-spacing: 0.04em;
}
</style>
