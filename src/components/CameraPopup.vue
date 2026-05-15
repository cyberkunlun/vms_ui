<template>
  <div class="popup-wrapper">
    <el-card class="camera-card" shadow="hover" :body-style="{ padding: '0px' }">
      <div class="image-container" @click="popPlay(camera)">
        <el-image :src="getImageUrl(camera.cameraIp)" fit="cover" class="preview-image" lazy>
          <template #placeholder>
            <div class="image-skeleton">
              <el-icon :size="40"><Picture /></el-icon>
              <p>loading...</p>
            </div>
          </template>
          <template #error>
            <div class="image-error">
              <el-icon :size="40"><Warning /></el-icon>
              <p></p>
            </div>
          </template>
        </el-image>
        <div class="hover-overlay">
          <el-icon :size="40"><VideoPlay /></el-icon>
        </div>
      </div>

      <div class="card-footer">
        <div class="camera-info">
          <h4>{{ camera.cameraName }}</h4>
          <div class="meta-info">
            <el-tooltip content="IP">
              <el-tag size="small">{{ camera.cameraIp }}</el-tag>
            </el-tooltip>
            <el-tooltip content="Status">
              <el-tag size="small" :type="camera.runningStatus ? 'success' : 'danger'">
                {{ camera.runningStatus ? 'Online' : 'Offline' }}
              </el-tag>
            </el-tooltip>
            <el-tooltip content="Capture Record">
              <el-link type="success" size="small" :href="getCaptureUrl(camera)" target="_blank">
                <el-icon><Expand /></el-icon>
              </el-link>
            </el-tooltip>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { Picture, Warning, VideoPlay, Expand } from '@element-plus/icons-vue'
import { config } from '@/utils/runtimeConfig'

const props = defineProps({
  camera: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['play'])

const getImageUrl = (path) => {
  return `${config.VITE_CAPTURE_URL || ''}/img/${path}.png`
}

const getCaptureUrl = (camera) => {
  if (camera.ctype === '10') {
    return `https://192.168.80.185:8443/vms/#/vehicleSearch?platform=20&cid=${camera.cid}&gid=${camera.gid}`
  } else if (camera.ctype === '20') {
    return `http://192.168.80.185:8080/vms/#/captureSearch?cid=${camera.cid}&gid=${camera.gid}`
  } else {
    return '#'
  }
}

const popPlay = (camera) => {
  emit('play', camera)
}
</script>

<style scoped>
.video-container {
  position: relative;
  height: 80vh;
  background: black;
}

.camera-card {
  margin-bottom: 0;
  transition: transform 0.3s;
}

.camera-card:hover {
  transform: translateY(-5px);
}

.image-container {
  position: relative;
  height: 150px;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.hover-overlay .el-icon {
  color: white;
}

.image-container:hover .hover-overlay {
  opacity: 1;
}

.image-skeleton,
.image-error {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
}

.image-skeleton p,
.image-error p {
  margin: 8px 0 0;
  font-size: 12px;
}

.card-footer {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.camera-info h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #303133;
}

.meta-info {
  display: flex;
  gap: 8px;
}
</style>
