<script setup lang="ts">
import PanelBox from './PanelBox.vue'
import { ref } from 'vue'

const page = ref(0)

const cameras = [
  [
    { id: 'CAM-001', name: 'Port Sultan Qaboos', label: 'Harbor Gate',   image: '/oman01.jpg' },
    { id: 'CAM-002', name: 'Muscat Airport',      label: 'Runway East',  image: '/Picture1.png' },
    { id: 'CAM-003', name: 'Sohar Port',          label: 'Cargo Pier',   image: '/Picture2.png' },
    { id: 'CAM-004', name: 'Nizwa Fort',          label: 'Transit Yard', image: '/oman01.jpg' },
  ],
  [
    { id: 'CAM-005', name: 'Salalah Port',        label: 'Terminal North', image: '/Picture1.png' },
    { id: 'CAM-006', name: 'Buraimi Border',      label: 'Border Lane',    image: '/Picture2.png' },
    { id: 'CAM-007', name: 'Muscat Expressway',   label: 'Interchange E',  image: '/oman01.jpg' },
    { id: 'CAM-008', name: 'Al Seeb District',    label: 'Main Junction',  image: '/Picture1.png' },
  ]
]

const prev = () => { if (page.value > 0) page.value-- }
const next = () => { if (page.value < cameras.length - 1) page.value++ }
</script>

<template>
  <PanelBox title="Live Video">
    <template #action>
      <div class="nav-btns">
        <button class="nav-btn" @click="prev" :disabled="page === 0">‹</button>
        <span class="nav-pg">{{ page + 1 }} / {{ cameras.length }}</span>
        <button class="nav-btn" @click="next" :disabled="page === cameras.length - 1">›</button>
      </div>
    </template>
    <div class="cam-grid">
      <article v-for="cam in cameras[page]" :key="cam.id" class="cam-card">
        <div class="thumb" :style="{ backgroundImage: `url(${cam.image})` }">
          <div class="live-tag"><span class="live-dot"></span>LIVE</div>
          <div class="cam-id">{{ cam.id }}</div>
        </div>
        <div class="cam-meta">
          <span class="cam-name">{{ cam.name }}</span>
          <span class="cam-label">{{ cam.label }}</span>
        </div>
      </article>
    </div>
  </PanelBox>
</template>

<style scoped lang="scss">
.nav-btns {
  display: flex; align-items: center; gap: 4px;
}
.nav-btn {
  width: 20px; height: 20px; border-radius: 4px;
  border: 1px solid rgba(97,151,255,0.28);
  background: rgba(7,14,32,0.7); color: #8fd2ff;
  cursor: pointer; font-size: 14px; line-height: 1;
  display: grid; place-items: center;
  transition: all 0.15s; outline: none;
  &:hover:not(:disabled) { border-color: #60e0ff; color: #dceeff; }
  &:disabled { opacity: 0.35; cursor: default; }
}
.nav-pg { font-size: 10px; color: rgba(180,211,255,0.5); font-family: 'Consolas', monospace; }

.cam-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 6px; height: 100%;
}
.cam-card {
  display: flex; flex-direction: column; gap: 3px; min-height: 0;
}
.thumb {
  position: relative; flex: 1; min-height: 0;
  border: 1px solid rgba(97,151,255,0.22); border-radius: 8px;
  overflow: hidden; background-size: cover; background-position: center;
  background-color: rgba(7,14,32,0.8);
  &::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(4,9,24,0.1) 0%, rgba(4,9,24,0.55) 100%);
  }
}
.live-tag {
  position: absolute; top: 5px; left: 6px; z-index: 2;
  display: flex; align-items: center; gap: 4px;
  background: rgba(4,9,24,0.65); border-radius: 4px;
  padding: 2px 5px; font-size: 8px; color: #ef4444;
  font-weight: 700; letter-spacing: 0.08em; font-family: 'Consolas', monospace;
}
.live-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #ef4444; box-shadow: 0 0 6px #ef4444;
  animation: blink 1.4s ease-in-out infinite;
}
@keyframes blink { 50% { opacity: 0.3; } }
.cam-id {
  position: absolute; top: 5px; right: 6px; z-index: 2;
  font-size: 8px; color: rgba(180,211,255,0.55);
  font-family: 'Consolas', monospace;
}
.cam-meta {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 2px;
}
.cam-name { font-size: 9.5px; color: #dceeff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 65%; }
.cam-label { font-size: 9px; color: rgba(180,211,255,0.45); white-space: nowrap; }
</style>
