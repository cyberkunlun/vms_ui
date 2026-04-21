<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title?: string;
  height?: string;
  icon?: string;
  bgColor?: string;
  borderColor?: string;
  showDecoration?: boolean;
}>();

const boxStyle = computed(() => ({
  height: props.height || '100%',
  background: props.bgColor || 'rgba(0, 20, 40, 0.55)',
  borderColor: props.borderColor || 'rgba(0, 247, 255, 0.2)'
}));
</script>

<template>
  <div class="chart-box" :style="boxStyle">
    <!-- Corner Borders with Glow -->
    <div class="corner top-left"></div>
    <div class="corner top-right"></div>
    <div class="corner bottom-left"></div>
    <div class="corner bottom-right"></div>
    
    <!-- Animated Border Lines -->
    <div class="border-line top"></div>
    <div class="border-line right"></div>
    <div class="border-line bottom"></div>
    <div class="border-line left"></div>

    <div v-if="title || $slots.header" class="chart-header">
      <slot name="header">
        <div class="title-wrapper">
          <span v-if="icon" class="title-icon">{{ icon }}</span>
          <span v-else-if="showDecoration !== false" class="title-decoration"></span>
          <span class="title-text">{{ title }}</span>
        </div>
      </slot>
      <div class="header-right">
        <slot name="header-right"></slot>
      </div>
    </div>
    
    <div class="chart-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chart-box {
  backdrop-filter: blur(12px);
  border: 1px solid;
  box-shadow: 
    inset 0 0 30px rgba(0, 247, 255, 0.05),
    0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 14px;
  width: 100%;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &:hover {
    box-shadow: 
      inset 0 0 40px rgba(0, 247, 255, 0.15),
      0 15px 40px rgba(0, 0, 0, 0.7);
    transform: translateY(-2px);
    border-color: rgba(0, 247, 255, 0.4);
  }

  .corner {
    position: absolute;
    width: 12px;
    height: 12px;
    border: 2px solid transparent;
    z-index: 5;
    filter: drop-shadow(0 0 5px #00f7ff);

    &.top-left { top: -1px; left: -1px; border-top-color: #00f7ff; border-left-color: #00f7ff; }
    &.top-right { top: -1px; right: -1px; border-top-color: #00f7ff; border-right-color: #00f7ff; }
    &.bottom-left { bottom: -1px; left: -1px; border-bottom-color: #00f7ff; border-left-color: #00f7ff; }
    &.bottom-right { bottom: -1px; right: -1px; border-bottom-color: #00f7ff; border-right-color: #00f7ff; }
  }

  /* Animated flow borders */
  .border-line {
    position: absolute;
    background: linear-gradient(to right, transparent, #00f7ff, transparent);
    opacity: 0.3;
    z-index: 1;

    &.top { top: 0; left: 0; width: 100%; height: 1px; animation: borderFlowX 4s linear infinite; }
    &.bottom { bottom: 0; left: 0; width: 100%; height: 1px; animation: borderFlowX 4s linear infinite reverse; }
    &.left { top: 0; left: 0; width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, #00f7ff, transparent); animation: borderFlowY 4s linear infinite; }
    &.right { top: 0; right: 0; width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, #00f7ff, transparent); animation: borderFlowY 4s linear infinite reverse; }
  }

  @keyframes borderFlowX {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes borderFlowY {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }

  .chart-header {
    margin-bottom: 15px;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
    
    .title-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .title-icon { font-size: 20px; filter: drop-shadow(0 0 8px rgba(0, 247, 255, 0.6)); }
      
      .title-decoration {
        width: 4px;
        height: 18px;
        background: linear-gradient(to bottom, #00f7ff, #0078ff);
        box-shadow: 0 0 10px rgba(0, 247, 255, 0.9);
        border-radius: 2px;
      }
      
      .title-text {
        font-size: 17px;
        font-weight: 700;
        color: #fff;
        text-shadow: 0 0 15px rgba(0, 247, 255, 0.4);
        letter-spacing: 1.5px;
        font-family: 'Segoe UI', sans-serif;
      }
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(to right, rgba(0, 247, 255, 0.5), transparent);
      border-radius: 1px;
    }
  }

  .chart-content {
    flex: 1;
    overflow: hidden;
    position: relative;
    z-index: 10;
  }
}
</style>
