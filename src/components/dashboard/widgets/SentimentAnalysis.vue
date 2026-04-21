<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import ChartBox from '../ChartBox.vue';

const chartRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value);
    chart.setOption({
      grid: { top: 20, left: 35, right: 10, bottom: 25 },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        axisLabel: { color: 'rgba(224, 242, 255, 0.7)', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(0, 247, 255, 0.2)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'rgba(224, 242, 255, 0.7)', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(0, 247, 255, 0.05)', type: 'dashed' } }
      },
      series: [
        {
          name: 'Positive',
          data: [60, 68, 65, 80, 88],
          type: 'line',
          smooth: true,
          lineStyle: { color: '#69db7c' },
          areaStyle: { color: 'rgba(105, 219, 124, 0.1)' }
        },
        {
          name: 'Negative',
          data: [20, 15, 18, 10, 5],
          type: 'line',
          smooth: true,
          lineStyle: { color: '#ff4b4b' },
          areaStyle: { color: 'rgba(255, 75, 75, 0.1)' }
        }
      ]
    });
    window.addEventListener('resize', () => chart.resize());
  }
});
</script>

<template>
  <ChartBox title="Public Sentiment" icon="📢">
    <template #header-right>
      <span class="status-tag">Stable</span>
    </template>
    <div ref="chartRef" class="chart"></div>
  </ChartBox>
</template>

<style scoped lang="scss">
.status-tag {
  font-size: 10px;
  background: rgba(105, 219, 124, 0.2);
  color: #69db7c;
  padding: 2px 10px;
  border-radius: 12px;
  border: 1px solid rgba(105, 219, 124, 0.4);
}
.chart { width: 100%; height: 100%; }
</style>
