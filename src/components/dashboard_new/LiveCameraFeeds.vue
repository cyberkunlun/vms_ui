<script setup lang="ts">
import PanelBox from './PanelBox.vue'

const cameras = [
  { id: 'CAM-001', name: 'Port Sultan Qaboos', label: 'Harbor Gate', image: '/oman01.jpg' },
  { id: 'CAM-002', name: 'Muscat International Airport', label: 'Runway East', image: '/Picture1.png' },
  { id: 'CAM-003', name: 'Sohar Port', label: 'Cargo Pier', image: '/Picture2.png' },
  { id: 'CAM-004', name: 'Nizwa Port', label: 'Transit Yard', image: '/oman01.jpg' },
  { id: 'CAM-005', name: 'Salalah Port', label: 'Terminal North', image: '/Picture1.png' },
  { id: 'CAM-006', name: 'Buraimi Border Crossing', label: 'Border Lane', image: '/Picture2.png' }
]
</script>

<template>
  <PanelBox title="Live Camera Feeds" badge="256 / 512">
    <div class="cam-grid">
      <article v-for="cam in cameras" :key="cam.id" class="cam-card">
        <div
          class="thumb"
          :style="{ backgroundImage: `linear-gradient(rgba(4, 9, 24, 0.18), rgba(4, 9, 24, 0.55)), url(${cam.image})` }"
        >
          <div class="live-dot"></div>
        </div>
        <div class="meta">
          <span class="name">{{ cam.name }}</span>
          <strong class="code">{{ cam.id }}</strong>
        </div>
        <div class="sub">{{ cam.label }}</div>
      </article>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.cam-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  height: 100%;
}
.cam-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
}
.thumb {
  position: relative;
  flex: 1;
  min-height: 48px;
  border: 1px solid rgba(109, 161, 255, 0.22);
  border-radius: 10px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  box-shadow: inset 0 0 22px rgba(11, 18, 36, 0.5);
}
.thumb::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(127, 190, 255, 0.1), transparent 22%, transparent 78%, rgba(127, 190, 255, 0.08));
  pointer-events: none;
}
.thumb::after {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 42px;
  height: 12px;
  border: 1px solid rgba(164, 208, 255, 0.36);
  border-radius: 999px;
  background: rgba(7, 14, 33, 0.48);
}
.live-dot {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ff808c;
  box-shadow: 0 0 8px #ff808c;
  animation: blink 1.4s ease-in-out infinite;
  z-index: 2;
}
@keyframes blink {
  50% { opacity: 0.3; }
}
.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 10px;
  .name {
    color: #edf5ff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .code {
    color: rgba(201, 222, 255, 0.76);
    font-weight: 500;
    font-family: 'Consolas', monospace;
    flex-shrink: 0;
  }
}
.sub {
  display: none;
}
</style>
