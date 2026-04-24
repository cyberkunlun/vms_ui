<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import PanelBox from './PanelBox.vue'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const items = [
  { label: 'Online',      value: 2112, color: '#22d3ee' },
  { label: 'Offline',     value: 162,  color: '#f59e0b' },
  { label: 'Maintenance', value: 38,   color: '#8b5cf6' },
  { label: 'Fault',       value: 44,   color: '#ef4444' },
]
const total = items.reduce((s, i) => s + i.value, 0)

const resize = () => chart?.resize()

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(2,6,23,0.92)',
      borderColor: 'rgba(97,151,255,0.3)',
      textStyle: { color: '#e0f2fe', fontSize: 11 }
    },
    graphic: [{
      type: 'group', left: 'center', top: 'middle',
      children: [
        { type: 'text', style: { text: total.toLocaleString(), fill: '#edf5ff', font: 'bold 15px Consolas', textAlign: 'center' }, top: -10 },
        { type: 'text', style: { text: 'Total', fill: 'rgba(180,211,255,0.5)', font: '9px sans-serif', textAlign: 'center' }, top: 10 }
      ]
    }],
    series: [{
      type: 'pie',
      radius: ['52%', '76%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      labelLine: { show: false },
      data: items.map(i => ({
        name: i.label, value: i.value,
        itemStyle: { color: i.color, borderColor: '#040912', borderWidth: 2 }
      }))
    }]
  })
  window.addEventListener('resize', resize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<template>
  <PanelBox title="Device Status">
    <div class="ds-wrap">
      <div class="donut" ref="chartRef"></div>
      <div class="legend">
        <div v-for="item in items" :key="item.label" class="leg-item">
          <span class="leg-dot" :style="{ background: item.color, boxShadow: '0 0 6px ' + item.color }"></span>
          <span class="leg-label">{{ item.label }}</span>
          <span class="leg-value" :style="{ color: item.color }">{{ item.value.toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.ds-wrap {
  display: flex; align-items: center;
  gap: 8px; height: 100%;
}
.donut {
  flex: 0 0 50%; height: 100%;
}
.legend {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; justify-content: center; gap: 7px;
}
.leg-item {
  display: flex; align-items: center; gap: 7px;
}
.leg-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.leg-label { flex: 1; font-size: 10.5px; color: rgba(201,222,255,0.72); }
.leg-value { font-size: 13px; font-weight: 600; font-family: 'Consolas', monospace; }
</style>
