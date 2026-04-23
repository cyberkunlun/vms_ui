<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import PanelBox from './PanelBox.vue'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const legend = [
  { name: 'Receiving', value: 36, pct: '28.1%', color: '#fb923c' },
  { name: 'Processing', value: 34, pct: '23.8%', color: '#22d3ee' },
  { name: 'Resolved', value: 158, pct: '71.9%', color: '#22c55e' },
  { name: 'Events', value: 158, pct: '9.1%', color: '#a78bfa' },
  { name: 'Count', value: 463, pct: '6.4%', color: '#fbbf24' }
]

const resize = () => chart?.resize()

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    grid: { top: 0, left: 0, right: 0, bottom: 0 },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(2,6,23,0.92)',
      borderColor: 'rgba(56,189,248,0.3)',
      textStyle: { color: '#e0f2fe', fontSize: 11 }
    },
    series: [
      {
        type: 'pie',
        radius: ['58%', '78%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: legend.map(l => ({
          name: l.name,
          value: l.value,
          itemStyle: { color: l.color, borderColor: '#0b1a38', borderWidth: 2 }
        }))
      }
    ]
  })
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<template>
  <PanelBox title="Event Handling">
    <div class="event-wrap">
      <div class="chart-wrap">
        <div class="chart" ref="chartRef"></div>
        <div class="center-label">
          <div class="big">36</div>
          <div class="small">Processing</div>
        </div>
      </div>
      <div class="legend">
        <div v-for="item in legend" :key="item.name" class="leg">
          <span class="dot" :style="{ background: item.color }"></span>
          <span class="n">{{ item.name }}</span>
          <span class="v">{{ item.value }}</span>
          <span class="pct">{{ item.pct }}</span>
        </div>
      </div>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.event-wrap {
  display: flex;
  gap: 8px;
  height: 100%;
  align-items: center;
}
.chart-wrap {
  position: relative;
  width: 88px;
  height: 88px;
  flex-shrink: 0;
}
.chart {
  width: 100%;
  height: 100%;
}
.center-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  .big {
    font-size: 18px;
    font-weight: 700;
    color: #22d3ee;
    font-family: 'Consolas', monospace;
    line-height: 1;
  }
  .small {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 2px;
  }
}
.legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.leg {
  display: grid;
  grid-template-columns: 10px 1fr auto auto;
  gap: 6px;
  align-items: center;
  font-size: 10px;
  padding: 2px 0;
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .n { color: #cbd5e1; }
  .v { color: #e0f2fe; font-family: 'Consolas', monospace; }
  .pct { color: #94a3b8; font-family: 'Consolas', monospace; }
}
</style>
