<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import ChartBox from '../ChartBox.vue';

const chartRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value);
    chart.setOption({
      radar: {
        indicator: [
          { name: 'Public Order', max: 100 },
          { name: 'Criminal', max: 100 },
          { name: 'Traffic', max: 100 },
          { name: 'Fire Hazard', max: 100 },
          { name: 'Assistance', max: 100 }
        ],
        center: ['50%', '50%'],
        radius: '65%',
        axisName: { color: 'rgba(0, 247, 255, 0.8)', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(0, 247, 255, 0.2)' } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: 'rgba(0, 247, 255, 0.2)' } }
      },
      series: [{
        type: 'radar',
        data: [{
          value: [75, 40, 85, 25, 70],
          name: 'Incident Dist.',
          itemStyle: { color: '#00f7ff' },
          areaStyle: { color: 'rgba(0, 247, 255, 0.3)' }
        }]
      }]
    });
    window.addEventListener('resize', () => chart.resize());
  }
});
</script>

<template>
  <ChartBox title="Incident Type Analysis" icon="📊">
    <div ref="chartRef" class="chart"></div>
  </ChartBox>
</template>

<style scoped lang="scss">
.chart { width: 100%; height: 100%; }
</style>
