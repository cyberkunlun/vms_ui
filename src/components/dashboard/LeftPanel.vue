<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import ChartBox from './ChartBox.vue';

const highFreqChart = ref<HTMLElement | null>(null);
const sentimentChart = ref<HTMLElement | null>(null);

onMounted(() => {
  const commonAxisLabel = { color: 'rgba(224, 242, 255, 0.7)', fontSize: 10 };
  
  if (highFreqChart.value) {
    const chart = echarts.init(highFreqChart.value);
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
  }

  if (sentimentChart.value) {
    const chart = echarts.init(sentimentChart.value);
    chart.setOption({
      grid: { top: 20, left: 35, right: 10, bottom: 25 },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        axisLabel: commonAxisLabel,
        axisLine: { lineStyle: { color: 'rgba(0, 247, 255, 0.2)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: commonAxisLabel,
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
  }
});
</script>

<template>
  <div class="left-panel">
    <ChartBox title="Muscat Security Grid" height="180px" icon="🌐">
      <div class="grid-stats">
        <div class="grid-item danger">
          <div class="name">Level 1 Zone</div>
          <div class="num">8 <small>zones</small></div>
        </div>
        <div class="grid-item warning">
          <div class="name">Level 2 Zone</div>
          <div class="num">32 <small>zones</small></div>
        </div>
        <div class="grid-item normal">
          <div class="name">Level 3 Zone</div>
          <div class="num">94 <small>zones</small></div>
        </div>
      </div>
    </ChartBox>

    <ChartBox title="Incident Type Analysis" height="220px" icon="📊">
      <div ref="highFreqChart" class="chart"></div>
    </ChartBox>

    <ChartBox title="Public Sentiment" height="220px" icon="📢">
      <template #header-right>
        <span class="status-tag">Stable</span>
      </template>
      <div ref="sentimentChart" class="chart"></div>
    </ChartBox>

    <ChartBox title="Key Site Dynamics" height="220px" icon="📍">
      <div class="place-list">
        <div class="place-item">
          <span class="icon">🛍️</span>
          <span class="name">Muscat Grand Mall</span>
          <span class="status danger">Crowded</span>
        </div>
        <div class="place-item">
          <span class="icon">✈️</span>
          <span class="name">Muscat Int'l Airport</span>
          <span class="status normal">Smooth</span>
        </div>
        <div class="place-item">
          <span class="icon">🏰</span>
          <span class="name">Al Alam Palace</span>
          <span class="status normal">Secure</span>
        </div>
      </div>
    </ChartBox>
  </div>
</template>

<style scoped lang="scss">
.left-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  padding: 10px 0 10px 10px;

  .status-tag {
    font-size: 10px;
    background: rgba(105, 219, 124, 0.2);
    color: #69db7c;
    padding: 2px 8px;
    border-radius: 10px;
    border: 1px solid rgba(105, 219, 124, 0.4);
  }

  .grid-stats {
    display: flex;
    gap: 10px;
    height: 100%;
    align-items: center;
    .grid-item {
      flex: 1;
      padding: 12px 8px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 4px;
      text-align: center;
      border: 1px solid transparent;
      .name { font-size: 10px; color: rgba(224, 242, 255, 0.6); margin-bottom: 5px; }
      .num { font-size: 18px; font-weight: bold; font-family: 'Digital-7'; }
      &.danger { border-color: rgba(255, 75, 75, 0.3); .num { color: #ff4b4b; } }
      &.warning { border-color: rgba(255, 169, 77, 0.3); .num { color: #ffa94d; } }
      &.normal { border-color: rgba(105, 219, 124, 0.3); .num { color: #69db7c; } }
    }
  }

  .place-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    .place-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: rgba(0, 247, 255, 0.05);
      border-radius: 4px;
      font-size: 13px;
      .icon { font-size: 16px; }
      .name { color: #fff; flex: 1; }
      .status {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 2px;
        &.danger { background: rgba(255, 75, 75, 0.2); color: #ff4b4b; }
        &.normal { background: rgba(105, 219, 124, 0.2); color: #69db7c; }
      }
    }
  }

  .chart { width: 100%; height: 100%; }
}
</style>
