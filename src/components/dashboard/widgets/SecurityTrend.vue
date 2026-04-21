<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import ChartBox from '../ChartBox.vue';

const chartRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value);
    chart.setOption({
      legend: { data: ['Today', 'Yesterday'], textStyle: { color: '#fff', fontSize: 10 }, right: 10 },
      grid: { top: 30, left: 35, right: 10, bottom: 25 },
      xAxis: {
        type: 'category',
        data: ['00', '04', '08', '12', '16', '20', '24'],
        axisLabel: { color: 'rgba(224, 242, 255, 0.7)', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(0, 247, 255, 0.2)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'rgba(224, 242, 255, 0.7)', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(0, 247, 255, 0.05)', type: 'dashed' } }
      },
      series: [
        { name: 'Today', data: [80, 95, 120, 150, 110, 140, 130], type: 'line', smooth: true, itemStyle: { color: '#00f7ff' } },
        { name: 'Yesterday', data: [100, 110, 130, 140, 120, 110, 105], type: 'line', smooth: true, itemStyle: { color: 'rgba(0, 247, 255, 0.3)' }, lineStyle: { type: 'dashed' } }
      ]
    });
    window.addEventListener('resize', () => chart.resize());
  }
});
</script>

<template>
  <ChartBox title="Security Trend" icon="📈">
    <div ref="chartRef" class="chart"></div>
  </ChartBox>
</template>

<style scoped lang="scss">
.chart { width: 100%; height: 100%; }
</style>
