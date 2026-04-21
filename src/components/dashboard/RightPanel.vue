<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import ChartBox from './ChartBox.vue';

const alarmTrendChart = ref<HTMLElement | null>(null);
const districtRankChart = ref<HTMLElement | null>(null);

onMounted(() => {
  const commonAxisLabel = { color: 'rgba(224, 242, 255, 0.7)', fontSize: 10 };
  const commonSplitLine = { lineStyle: { color: 'rgba(0, 247, 255, 0.05)', type: 'dashed' } };

  if (alarmTrendChart.value) {
    const chart = echarts.init(alarmTrendChart.value);
    chart.setOption({
      legend: { data: ['Today', 'Yesterday'], textStyle: { color: '#fff', fontSize: 10 }, right: 10 },
      grid: { top: 30, left: 35, right: 10, bottom: 25 },
      xAxis: {
        type: 'category',
        data: ['00', '04', '08', '12', '16', '20', '24'],
        axisLabel: commonAxisLabel,
        axisLine: { lineStyle: { color: 'rgba(0, 247, 255, 0.2)' } }
      },
      yAxis: { type: 'value', axisLabel: commonAxisLabel, splitLine: commonSplitLine },
      series: [
        { name: 'Today', data: [80, 95, 120, 150, 110, 140, 130], type: 'line', smooth: true, itemStyle: { color: '#00f7ff' } },
        { name: 'Yesterday', data: [100, 110, 130, 140, 120, 110, 105], type: 'line', smooth: true, itemStyle: { color: 'rgba(0, 247, 255, 0.3)' }, lineStyle: { type: 'dashed' } }
      ]
    });
  }

  if (districtRankChart.value) {
    const chart = echarts.init(districtRankChart.value);
    chart.setOption({
      grid: { top: 10, left: 60, right: 30, bottom: 20 },
      xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
      yAxis: {
        type: 'category',
        data: ['Seeb', 'Bawshar', 'Mutrah', 'Amerat', 'Qurayyat'],
        axisLabel: commonAxisLabel,
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
  }
});

const forceStats = [
  { name: 'Muscat HQ', total: 500, active: 420, rate: 84 },
  { name: 'Seeb Station', total: 350, active: 280, rate: 80 },
  { name: 'Mutrah Unit', total: 200, active: 185, rate: 92 }
];
</script>

<template>
  <div class="right-panel">
    <ChartBox title="Security Trend" height="220px" icon="📈">
      <div ref="alarmTrendChart" class="chart"></div>
    </ChartBox>

    <ChartBox title="Regional Risk Rank" height="220px" icon="🏆">
      <div ref="districtRankChart" class="chart"></div>
    </ChartBox>

    <ChartBox title="Police Deployment" height="240px" icon="🚔">
      <div class="force-list">
        <div v-for="item in forceStats" :key="item.name" class="force-item">
          <div class="info">
            <span class="name">{{ item.name }}</span>
            <span class="val">{{ item.active }}/{{ item.total }}</span>
          </div>
          <div class="progress-bg">
            <div class="progress-bar" :style="{ width: item.rate + '%' }"></div>
          </div>
          <div class="rate">{{ item.rate }}%</div>
        </div>
      </div>
    </ChartBox>

    <ChartBox title="Live Surveillance" height="200px" icon="📹" bgColor="rgba(255, 75, 75, 0.05)" borderColor="rgba(255, 75, 75, 0.2)">
      <div class="video-grid">
        <div class="video-item">
          <img src="https://picsum.photos/200/150?random=30" alt="v1" />
          <div class="tag">MCT-CAM-01</div>
        </div>
        <div class="video-item">
          <img src="https://picsum.photos/200/150?random=31" alt="v2" />
          <div class="tag">MCT-CAM-02</div>
        </div>
      </div>
    </ChartBox>
  </div>
</template>

<style scoped lang="scss">
.right-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  padding: 10px 10px 10px 0;

  .force-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 10px 5px;
    .force-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      position: relative;
      .info { display: flex; justify-content: space-between; font-size: 12px; .name { color: #fff; } .val { color: rgba(224, 242, 255, 0.6); } }
      .progress-bg { height: 6px; background: rgba(255, 255, 255, 0.05); border-radius: 3px; overflow: hidden; .progress-bar { height: 100%; background: linear-gradient(to right, #0078ff, #00f7ff); box-shadow: 0 0 10px rgba(0, 247, 255, 0.5); } }
      .rate { position: absolute; right: 0; top: -2px; font-size: 10px; color: #00f7ff; font-weight: bold; }
    }
  }

  .video-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    height: 100%;
    .video-item {
      position: relative;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid rgba(0, 247, 255, 0.2);
      img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
      .tag { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0, 0, 0, 0.5); color: #00f7ff; font-size: 10px; padding: 2px 5px; }
    }
  }

  .chart { width: 100%; height: 100%; }
}
</style>
