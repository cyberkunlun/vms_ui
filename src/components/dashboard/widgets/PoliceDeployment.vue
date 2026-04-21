<script setup lang="ts">
import ChartBox from '../ChartBox.vue';

const forceStats = [
  { name: 'Muscat HQ', total: 500, active: 420, rate: 84 },
  { name: 'Seeb Station', total: 350, active: 280, rate: 80 },
  { name: 'Mutrah Unit', total: 200, active: 185, rate: 92 }
];
</script>

<template>
  <ChartBox title="Police Deployment" icon="🚔">
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
</template>

<style scoped lang="scss">
.force-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  justify-content: center;
  padding: 0 10px;
  .force-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    .info { display: flex; justify-content: space-between; font-size: 13px; .name { color: #fff; font-weight: 500; } .val { color: rgba(224, 242, 255, 0.7); } }
    .progress-bg { height: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; overflow: hidden; .progress-bar { height: 100%; background: linear-gradient(to right, #0078ff, #00f7ff); box-shadow: 0 0 12px rgba(0, 247, 255, 0.5); } }
    .rate { position: absolute; right: 0; top: -2px; font-size: 11px; color: #00f7ff; font-weight: bold; }
  }
}
</style>
