<script setup lang="ts">
import ChartBox from '../ChartBox.vue';
</script>

<template>
  <ChartBox title="Key Site Dynamics" icon="📍">
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
</template>

<style scoped lang="scss">
.place-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
  justify-content: center;
  .place-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px 18px;
    background: rgba(0, 247, 255, 0.03);
    border-radius: 8px;
    font-size: 14px;
    border: 1px solid rgba(0, 247, 255, 0.1);
    transition: all 0.3s;
    &:hover { background: rgba(0, 247, 255, 0.08); border-color: rgba(0, 247, 255, 0.3); }
    .icon { font-size: 18px; }
    .name { color: #fff; flex: 1; font-weight: 500; }
    .status {
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 4px;
      &.danger { background: rgba(255, 75, 75, 0.2); color: #ff4b4b; box-shadow: 0 0 8px rgba(255, 75, 75, 0.3); }
      &.normal { background: rgba(105, 219, 124, 0.2); color: #69db7c; box-shadow: 0 0 8px rgba(105, 219, 124, 0.3); }
    }
  }
}
</style>
