<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import PanelBox from './PanelBox.vue'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
const activeTab = ref<'captures' | 'alarms' | 'ai'>('captures')

const datasets = {
  captures: {
    color: '#22d3ee',
    data: [8200, 9400, 8800, 11200, 9600, 13400, 12800, 10500, 14200, 13100, 11800, 15600,
           14200, 12800, 16400, 15100, 13500, 17200, 15800, 14200, 16900, 15400, 14100, 16200]
  },
  alarms: {
    color: '#f59e0b',
    data: [12, 18, 15, 22, 14, 28, 24, 18, 32, 26, 20, 35,
           30, 22, 38, 28, 24, 42, 34, 26, 38, 30, 24, 32]
  },
  ai: {
    color: '#8b5cf6',
    data: [2, 4, 3, 6, 4, 8, 6, 4, 10, 7, 5, 12,
           8, 6, 11, 8, 5, 13, 9, 6, 10, 8, 5, 9]
  }
}

const xData = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`)

const buildChart = () => {
  if (!chart) return
  const ds = datasets[activeTab.value]
  chart.setOption({
    grid: { top: 8, left: 32, right: 8, bottom: 18, containLabel: false },
    xAxis: {
      type: 'category', data: xData,
      axisLabel: { color: 'rgba(180,211,255,0.42)', fontSize: 9,
        interval: 5,
        formatter: (v: string) => v.slice(0,2)
      },
      axisLine: { lineStyle: { color: 'rgba(111,166,255,0.12)' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'rgba(180,211,255,0.42)', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(111,166,255,0.1)', type: 'dashed' } },
      axisLine: { show: false }, axisTick: { show: false }
    },
    series: [{
      type: 'line', smooth: true, symbol: 'none',
      data: ds.data,
      lineStyle: { width: 1.5, color: ds.color },
      itemStyle: { color: ds.color },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0,0,0,1,[
          { offset: 0, color: ds.color + '44' },
          { offset: 1, color: ds.color + '00' }
        ])
      }
    }]
  }, true)
}

const resize = () => chart?.resize()

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  buildChart()
  window.addEventListener('resize', resize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
watch(activeTab, buildChart)
</script>

<template>
  <PanelBox title="Trends (24h)">
    <div class="trends-wrap">
      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'captures' }" @click="activeTab = 'captures'">Captures</button>
        <button class="tab" :class="{ active: activeTab === 'alarms' }" @click="activeTab = 'alarms'">Alarms</button>
        <button class="tab" :class="{ active: activeTab === 'ai' }" @click="activeTab = 'ai'">AI Warnings</button>
      </div>
      <div class="chart" ref="chartRef"></div>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.trends-wrap {
  display: flex; flex-direction: column; gap: 8px; height: 100%;
}
.tabs {
  display: flex; gap: 4px; flex-shrink: 0;
}
.tab {
  padding: 3px 10px; border-radius: 5px;
  font-size: 10px; cursor: pointer; outline: none;
  color: rgba(180,211,255,0.55);
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.15s;
  &:hover { color: #dceeff; background: rgba(71,139,255,0.1); }
  &.active { color: #60e0ff; background: rgba(71,139,255,0.18); border-color: rgba(96,224,255,0.22); }
}
.chart { flex: 1; min-height: 0; width: 100%; }
</style>
