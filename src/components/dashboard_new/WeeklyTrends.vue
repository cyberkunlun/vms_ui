<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import PanelBox from './PanelBox.vue'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const stats = [
  { label: 'Incidents', value: 32, change: '+12%', up: true },
  { label: 'Alarms', value: 28, change: '-11%', up: false },
  { label: 'Avg Resp', value: 15, change: '+7%', up: true },
  { label: 'Resolved', value: 59, change: '+15%', up: true }
]

const resize = () => chart?.resize()

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    grid: { top: 8, left: 8, right: 8, bottom: 16, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: { color: 'rgba(180, 211, 255, 0.48)', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(111, 166, 255, 0.16)' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'rgba(180, 211, 255, 0.45)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(111, 166, 255, 0.16)', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        data: [120, 132, 101, 134, 90, 230, 210],
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: { color: '#69b6ff' },
        lineStyle: { width: 1.5, color: '#69b6ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(105,182,255,0.28)' },
            { offset: 1, color: 'rgba(105,182,255,0)' }
          ])
        }
      },
      {
        data: [90, 85, 95, 120, 80, 145, 168],
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: { color: '#f4c669' },
        lineStyle: { width: 1.5, color: '#f4c669' }
      },
      {
        data: [60, 70, 65, 88, 55, 110, 130],
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: { color: '#70e1ff' },
        lineStyle: { width: 1.5, color: '#70e1ff' }
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
  <PanelBox title="Weekly Trends" badge="7 Days">
    <div class="weekly-wrap">
      <div class="stats-row">
        <div v-for="s in stats" :key="s.label" class="stat">
          <span class="label">{{ s.label }}</span>
          <strong class="value">{{ s.value }}</strong>
          <em class="change" :class="{ up: s.up, down: !s.up }">{{ s.change }}</em>
        </div>
      </div>
      <div class="chart" ref="chartRef"></div>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.weekly-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.stat {
  padding: 8px 10px;
  border: 1px solid rgba(100, 152, 255, 0.16);
  border-radius: 8px;
  background: rgba(7, 16, 34, 0.56);
  .label {
    display: block;
    color: rgba(201, 222, 255, 0.76);
    font-size: 10px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .value {
    display: block;
    margin-top: 4px;
    font-size: 18px;
    font-weight: 600;
    color: #f3f7ff;
    font-family: 'Consolas', monospace;
  }
  .change {
    font-style: normal;
    font-size: 10px;
    &.up { color: #76e0a1; }
    &.down { color: #ff858c; }
  }
}
.chart {
  flex: 1;
  width: 100%;
  min-height: 100px;
}
</style>
