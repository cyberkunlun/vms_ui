<script setup lang="ts">
import ChartBox from '../ChartBox.vue';
</script>

<template>
  <ChartBox title="Muscat Security Grid" icon="🌐">
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
</template>

<style scoped lang="scss">
.grid-stats {
  display: flex;
  gap: 12px;
  height: 100%;
  align-items: center;
  .grid-item {
    flex: 1;
    padding: 15px 10px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    text-align: center;
    border: 1px solid transparent;
    transition: transform 0.3s;
    &:hover { transform: scale(1.05); }
    .name { font-size: 11px; color: rgba(224, 242, 255, 0.6); margin-bottom: 8px; }
    .num { font-size: 22px; font-weight: bold; font-family: 'Digital-7'; }
    &.danger { border-color: rgba(255, 75, 75, 0.3); .num { color: #ff4b4b; text-shadow: 0 0 10px #ff4b4b; } }
    &.warning { border-color: rgba(255, 169, 77, 0.3); .num { color: #ffa94d; text-shadow: 0 0 10px #ffa94d; } }
    &.normal { border-color: rgba(105, 219, 124, 0.3); .num { color: #69db7c; text-shadow: 0 0 10px #69db7c; } }
  }
}
</style>
