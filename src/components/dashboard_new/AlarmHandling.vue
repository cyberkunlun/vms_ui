<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import PanelBox from './PanelBox.vue'

const rows = [
  { label: 'Cameras detected', value: 5182, delta: '+103', sub: '4,125 online', deltaUp: true, color: '#22d3ee' },
  { label: 'Alarms resolved', value: 3999, delta: '+406', sub: '3,165 today', deltaUp: true, color: '#22c55e' },
  { label: 'Alarms unresolved', value: 1226, delta: '+105', sub: '1,228 pending', deltaUp: false, color: '#fb7185' }
]

const refs = ref<(HTMLElement | null)[]>([null, null, null])
const charts: echarts.ECharts[] = []

const buildSpark = (el: HTMLElement, color: string, data: number[]) => {
  const c = echarts.init(el)
  c.setOption({
    grid: { top: 0, left: 0, right: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color + '55' },
            { offset: 1, color: color + '00' }
          ])
        }
      }
    ]
  })
  return c
}

const resize = () => charts.forEach(c => c.resize())

onMounted(() => {
  const datasets = [
    [20, 35, 28, 40, 55, 48, 65],
    [30, 45, 40, 60, 55, 68, 75],
    [50, 35, 55, 40, 62, 45, 58]
  ]
  refs.value.forEach((el, i) => {
    const row = rows[i]
    const data = datasets[i]
    if (el && row && data) charts.push(buildSpark(el, row.color, data))
  })
  window.addEventListener('resize', resize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  charts.forEach(c => c.dispose())
})
</script>

<template>
  <PanelBox title="Device Status">
    <div class="rows">
      <div v-for="(r, i) in rows" :key="i" class="row">
        <div class="info">
          <div class="icon-wrap" :style="{ color: r.color, borderColor: r.color + '55' }">
            <svg v-if="i === 0" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <svg v-else-if="i === 1" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="text">
            <div class="label">{{ r.label }}</div>
            <div class="value" :style="{ color: r.color }">{{ r.value.toLocaleString() }}</div>
            <div class="sub">{{ r.sub }}</div>
          </div>
        </div>
        <div class="trend">
          <div class="delta" :class="{ up: r.deltaUp, down: !r.deltaUp }">
            {{ r.deltaUp ? '↑' : '↓' }} {{ r.delta }}
          </div>
          <div class="spark" :ref="(el) => (refs[i] = el as HTMLElement)"></div>
        </div>
      </div>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.05);
  flex: 1;
  min-height: 0;
}
.info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.icon-wrap {
  width: 28px;
  height: 28px;
  border: 1px solid;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(34, 211, 238, 0.06);
}
.text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  .label {
    font-size: 10px;
    color: #94a3b8;
  }
  .value {
    font-size: 18px;
    font-weight: 700;
    font-family: 'Consolas', monospace;
    line-height: 1;
  }
  .sub {
    font-size: 9px;
    color: #64748b;
  }
}
.trend {
  display: flex;
  align-items: center;
  gap: 8px;
}
.delta {
  font-size: 10px;
  font-weight: 700;
  &.up { color: #22c55e; }
  &.down { color: #ef4444; }
}
.spark {
  width: 70px;
  height: 30px;
}
</style>
