<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const currentTime = ref("");
const timer = ref<any>(null);

const updateTime = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Muscat'
  };
  currentTime.value = new Intl.DateTimeFormat('en-GB', options).format(now).replace(/\//g, '-');
};

onMounted(() => {
  updateTime();
  timer.value = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
});

const tabs = ['Overview', 'Security', 'Monitoring', 'Traffic', 'Events'];
const activeTab = ref('Monitoring');
</script>

<template>
  <div class="header-container">
    <div class="header-decoration left"></div>
    
    <div class="left-tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab" 
        :class="['tab-item', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ tab }}
      </div>
    </div>
    
    <div class="header-title-container">
      <div class="title-bg"></div>
      <h1 class="header-title">MUSCAT SMART COMMAND CENTER</h1>
      <div class="title-sub">INTEGRATED PUBLIC SAFETY PLATFORM - OMAN</div>
    </div>

    <div class="right-info">
      <div class="info-item">
        <span class="weather-icon">☀️</span>
        <span class="weather-text">Muscat 32℃</span>
      </div>
      <div class="divider"></div>
      <div class="time-container">
        {{ currentTime }}
      </div>
    </div>

    <div class="header-decoration right"></div>
  </div>
</template>

<style scoped lang="scss">
.header-container {
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  position: relative;
  background: linear-gradient(to bottom, rgba(1, 12, 34, 1) 0%, rgba(1, 12, 34, 0.8) 70%, transparent 100%);
  z-index: 100;

  .header-decoration {
    position: absolute;
    bottom: 0;
    width: 30%;
    height: 2px;
    background: linear-gradient(to right, transparent, #00f7ff, transparent);
    &.left { left: 0; }
    &.right { right: 0; }
  }

  .left-tabs {
    display: flex;
    gap: 8px;
    flex: 1;
    .tab-item {
      padding: 6px 18px;
      cursor: pointer;
      color: rgba(0, 247, 255, 0.6);
      background: rgba(0, 247, 255, 0.05);
      border: 1px solid rgba(0, 247, 255, 0.15);
      clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);
      transition: all 0.4s ease;
      font-size: 13px;
      &:hover, &.active {
        color: #fff;
        background: rgba(0, 247, 255, 0.2);
        border-color: #00f7ff;
        text-shadow: 0 0 10px rgba(0, 247, 255, 0.8);
      }
    }
  }

  .header-title-container {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    text-align: center;
    width: 700px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .title-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 80%;
      background: url('https://img.alicdn.com/tfs/TB1.v3hX.z1gK0jSZLeXXb9SXXa-1920-100.png') no-repeat center top;
      background-size: contain;
      opacity: 0.6;
      z-index: -1;
    }
    .header-title {
      margin: 0;
      font-size: 32px;
      font-weight: 800;
      color: #fff;
      text-shadow: 0 0 20px rgba(0, 247, 255, 0.6);
      letter-spacing: 4px;
      background: linear-gradient(to bottom, #fff 40%, #00f7ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .title-sub { font-size: 10px; color: rgba(0, 247, 255, 0.6); letter-spacing: 2px; margin-top: 4px; }
  }

  .right-info {
    display: flex;
    align-items: center;
    gap: 20px;
    flex: 1;
    justify-content: flex-end;
    color: #00f7ff;
    .info-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
    .divider { width: 1px; height: 20px; background: rgba(0, 247, 255, 0.3); }
    .time-container { font-family: 'Digital-7', monospace; font-size: 20px; font-weight: bold; }
  }
}
</style>
