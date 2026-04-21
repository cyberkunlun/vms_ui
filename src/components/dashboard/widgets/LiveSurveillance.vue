<script setup lang="ts">
import ChartBox from '../ChartBox.vue';
</script>

<template>
  <ChartBox title="Live Surveillance" icon="📹" bgColor="rgba(255, 75, 75, 0.05)" borderColor="rgba(255, 75, 75, 0.2)">
    <div class="video-grid">
      <div class="video-item">
        <img src="https://picsum.photos/400/300?random=30" alt="v1" />
        <div class="tag">MCT-CAM-01</div>
        <div class="scan-line"></div>
      </div>
      <div class="video-item">
        <img src="https://picsum.photos/400/300?random=31" alt="v2" />
        <div class="tag">MCT-CAM-02</div>
        <div class="scan-line"></div>
      </div>
    </div>
  </ChartBox>
</template>

<style scoped lang="scss">
.video-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  height: 100%;
  .video-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(0, 247, 255, 0.2);
    img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; transition: opacity 0.3s; &:hover { opacity: 1; } }
    .tag { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0, 0, 0, 0.6); color: #00f7ff; font-size: 11px; padding: 5px 10px; font-weight: 500; }
    .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(0, 247, 255, 0.3); box-shadow: 0 0 10px rgba(0, 247, 255, 0.5); animation: scan 3s linear infinite; pointer-events: none; }
  }
}
@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
</style>
