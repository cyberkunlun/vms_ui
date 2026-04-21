<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import ChartBox from '../ChartBox.vue';

const chartRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value);
    chart.setOption({
      grid: { top: 10, left: 60, right: 30, bottom: 20 },
      xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
      yAxis: {
        type: 'category',
        data: ['Seeb', 'Bawshar', 'Mutrah', 'Amerat', 'Qurayyat'],
        axisLabel: { color: 'rgba(224, 242, 255, 0.7)', fontSize: 10 },
        axisLine: { show: false }
      },
      series: [{
        data: [420, 350, 310, 240, 180],
        type: 'bar',
        barWidth: 10,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{ offset: 0, color: '#00f7ff' }, { offset: 1, color: '#0078ff' }]),
          borderRadius: [0, 5, 5, 0]
        },
        label: { show: true, position: 'right', color: '#00f7ff', fontSize: 10 }
      }]
    });
    window.addEventListener('resize', () => chart.resize());
  }
});
</script>

<template>
  <ChartBox title="Regional Risk Rank" icon="🏆">
    <div ref="chartRef" class="chart"></div>
  </ChartBox>
</template>

<style scoped lang="scss">
.chart { width: 100%; height: 100%; }
</style>
