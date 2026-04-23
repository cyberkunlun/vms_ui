<script setup lang="ts">
import PanelBox from './PanelBox.vue'

const rings = [
  { label: 'Wind Retails', value: '100%', percent: 100 },
  { label: 'Pressure', value: '79%', percent: 79 }
]

const metrics = [
  { label: 'Gust', value: '58 km/h', tone: 'cyan' },
  { label: 'Affected Cams', value: '12', tone: 'blue' },
  { label: 'Response ETA', value: '18 min', tone: 'amber' }
]
</script>

<template>
  <PanelBox title="Storm Warning" badge="L2 Weather">
    <div class="storm-wrap">
      <div class="head">
        <div class="icon">☁</div>
        <div class="copy">
          <strong>High Wind</strong>
          <p>Muscat Northern Region</p>
          <p>Sudden wind speed: 23.38–50 km/h</p>
        </div>
      </div>

      <div class="metrics-row">
        <article v-for="item in metrics" :key="item.label" class="metric-card" :class="item.tone">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </div>

      <div class="briefing-card">
        <div class="briefing-copy">
          <span>Marine Briefing</span>
          <strong>Port visibility reduced, patrol speed limited on coastal route B3.</strong>
        </div>
        <button type="button">View Advisory</button>
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
  grid-template-rows: auto auto auto 1fr;
  gap: 10px;
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

.metrics-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.metric-card {
  min-width: 0;
  padding: 8px 9px;
  border-radius: 10px;
  border: 1px solid rgba(112, 168, 255, 0.16);
  background: rgba(7, 16, 34, 0.62);

  span {
    display: block;
    font-size: 9px;
    color: rgba(201, 222, 255, 0.66);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    margin-top: 5px;
    color: #edf5ff;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Consolas', monospace;
  }

  &.cyan strong { color: #70e1ff; }
  &.blue strong { color: #8eb8ff; }
  &.amber strong { color: #f4c669; }
}

.briefing-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(112, 168, 255, 0.16);
  background: linear-gradient(90deg, rgba(17, 40, 77, 0.58), rgba(7, 16, 34, 0.78));
}

.briefing-copy {
  min-width: 0;

  span {
    display: block;
    color: #8eb8ff;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  strong {
    display: block;
    color: #dceeff;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.35;
  }
}

.briefing-card button {
  flex-shrink: 0;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(112, 168, 255, 0.28);
  background: rgba(91, 155, 255, 0.14);
  color: #dceeff;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
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

@media (max-width: 1500px) {
  .metrics-row {
    grid-template-columns: 1fr;
  }

  .briefing-card {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
