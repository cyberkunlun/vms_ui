<template>
  <div class="video-wall-view">
    <!-- 全局网格纹理与扫描线（视觉装饰） -->
    <div class="grid-texture" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    <main class="wall-main">
      <!-- 顶部工具栏（仿第一页风格） -->
      <div class="toolbar">
        <div class="filter-group">
          <div class="filter-item">
            <span class="filter-label">DEVICE NAME</span>
            <input type="text" v-model="deviceName" placeholder="INPUT NODE ID" class="neo-input" />
          </div>
          <div class="filter-item">
            <span class="filter-label">IP ADDRESS</span>
            <input type="text" v-model="deviceIp" placeholder="ENTER IP" class="neo-input" />
          </div>
          <div class="filter-item">
            <span class="filter-label">STATUS</span>
            <select v-model="runningStatus" class="neo-select">
              <option value="">ALL</option>
              <option value="online">ONLINE</option>
              <option value="offline">OFFLINE</option>
            </select>
          </div>
        </div>

        <div class="action-group">
          <button class="cmd-btn" @click="handleSearch">
            <span class="cb-icon">⌕</span>
            <span>SEARCH</span>
          </button>
          <button class="cmd-btn" @click="handleReset">
            <span class="cb-icon">↺</span>
            <span>RESET</span>
          </button>
          <!-- 布局切换 -->
          <div class="layout-switch">
            <button class="cmd-btn" :class="{ active: currentLayout === 'list' }" @click="currentLayout = 'list'">
              <span class="cb-icon">☰</span>
              <span>LIST</span>
            </button>
            <button class="cmd-btn" :class="{ active: currentLayout === 'map' }" @click="currentLayout = 'map'">
              <span class="cb-icon">🗺</span>
              <span>MAP</span>
            </button>
          </div>
          <button
            ref="selectDeviceBtnRef"
            class="cmd-btn accent"
            :class="{ active: showDeviceDialog }"
            @click="toggleDialog"
          >
            <span class="cb-icon">◈</span>
            <span>DEVICE</span>
            <span v-if="onlineCount > 0" class="online-pill">{{ onlineCount }}</span>
          </button>
        </div>
      </div>

      <!-- 列表布局 -->
      <div v-if="currentLayout === 'list'" class="camera-grid-container">
        <div class="camera-grid">
          <div
            v-for="cam in filteredCameras"
            :key="cam.id"
            class="camera-card"
            :data-id="cam.id"
            @click="goToMonitor(cam)"
          >
            <div class="card-thumb">
              <img :src="cam.thumbnail" :alt="cam.name" />
              <div class="overlay">
                <span class="play-icon">▶</span>
              </div>
              <div class="status-badge" :class="cam.status">{{ cam.status.toUpperCase() }}</div>
              <div class="card-corner tl"></div>
              <div class="card-corner tr"></div>
              <div class="card-corner bl"></div>
              <div class="card-corner br"></div>
            </div>
            <div class="card-info">
              <div class="name">{{ cam.name }}</div>
              <div class="details">
                <span class="ip">{{ cam.ip }}</span>
                <span class="loc">{{ cam.location }}</span>
                <span class="cap">Snapshot</span>
              </div>
            </div>
          </div>
          <div v-if="filteredCameras.length === 0" class="empty-grid">
            <span class="empty-icon">◻</span>
            <span>NO DEVICES MATCH FILTERS</span>
          </div>
        </div>
      </div>

      <!-- 地图布局 -->
      <div v-else class="map-container-wrapper">
        <div id="cameraMap" class="camera-map"></div>
        <!-- 地图工具栏 -->
        <div class="map-toolbar">
          <button class="map-btn" :class="{ active: isSelectMode }" @click="toggleSelectMode">
            <span>⎚</span> {{ isSelectMode ? 'EXIT SELECTION' : 'BOX SELECT' }}
          </button>
          <button class="map-btn" :class="{ active: selectedCamerasIds.size > 0 }" @click="viewSelectedSnapshots">
            <span>📸</span> SNAPSHOTS ({{ selectedCamerasIds.size }})
          </button>
          <button class="map-btn" @click="clearMapSelection">
            <span>✕</span> CLEAR
          </button>
        </div>
      </div>

      <!-- 底部分页（简化的科技感分页） -->
      <div class="pagination-bar">
        <div class="total">TOTAL {{ filteredCameras.length }}</div>
        <div class="pager">
          <button class="page-arrow">‹</button>
          <span class="page-num active">1</span>
          <span class="page-num">2</span>
          <span class="page-num">3</span>
          <button class="page-arrow">›</button>
        </div>
        <div class="goto">
          <span>GOTO</span>
          <input type="text" value="1" />
        </div>
      </div>
    </main>

    <!-- 抓拍记录弹窗 -->
    <Teleport to="body">
      <div v-if="showSnapshotsPanel" class="snapshots-panel" @click.self="showSnapshotsPanel = false">
        <div class="snapshots-container">
          <div class="snapshots-header">
            <span class="snapshots-title">📸 CAPTURE RECORDS</span>
            <button class="snapshots-close" @click="showSnapshotsPanel = false">✕</button>
          </div>
          <div class="snapshots-content">
            <div v-if="selectedCamerasList.length === 0" class="no-selection">NO CAMERAS SELECTED</div>
            <div v-for="cam in selectedCamerasList" :key="cam.id" class="camera-snapshot-group">
              <div class="group-header">
                <span class="cam-name">{{ cam.name }}</span>
                <span class="cam-ip">{{ cam.ip }}</span>
              </div>
              <div class="snapshots-grid">
                <div v-for="(snap, idx) in getCameraSnapshots(cam.id)" :key="idx" class="snapshot-card">
                  <img :src="snap.url" :alt="`snapshot ${idx}`" />
                  <div class="snapshot-time">{{ snap.time }}</div>
                </div>
                <div v-if="getCameraSnapshots(cam.id).length === 0" class="no-snapshots">NO RECENT CAPTURES</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 设备注册弹窗（保留原样式） -->
    <Teleport to="body">
      <div v-if="showDeviceDialog" ref="deviceDialogRef" class="device-popup" :style="dialogStyle">
        <div class="dp-header">
          <div class="dp-title"><span class="dp-icon">◈</span><span>DEVICE REGISTRY</span></div>
          <div class="dp-stats"><span class="dp-stat online">{{ onlineCount }} ONLINE</span></div>
          <button class="dp-close" @click="closeDialog">✕</button>
        </div>
        <div class="dp-search">
          <span class="ds-icon">⌕</span>
          <input v-model="searchKeyword" placeholder="SEARCH NODES..." class="ds-input" />
          <span v-if="searchKeyword" class="ds-clear" @click="searchKeyword = ''">✕</span>
        </div>
        <div class="dp-toolbar">
          <button class="dp-tb-btn" @click="expandAll">▶ EXPAND ALL</button>
          <button class="dp-tb-btn" @click="collapseAll">▼ COLLAPSE</button>
        </div>
        <div class="dp-tree">
          <div v-if="!topLevelNodes.length" class="dp-loading"><span class="dp-spin"></span><span>INITIALIZING NODES…</span></div>
          <TreeItem v-for="node in filteredTree" :key="node.id" :node="node" :level="0" :selected-id="selectedCameraNodeId" @toggle="toggleNode" @select="onSelectCamera" />
        </div>
        <div class="dp-footer"><span>⌖ DBL-CLICK TO SELECT · ASSIGN TO VIEW</span></div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch, h, defineComponent, type PropType } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 修复leaflet默认图标
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ================== 扩展摄像头数据类型（增加经纬度） ==================
interface Camera {
  id: number
  name: string
  ip: string
  status: 'online' | 'offline'
  location: string
  thumbnail: string
  lastUpdate: string
  lat: number
  lng: number
}

// ================== 模拟抓拍记录数据 ==================
interface Snapshot {
  cameraId: number
  url: string
  time: string
}

const mockSnapshots: Snapshot[] = [
  { cameraId: 1, url: 'https://picsum.photos/id/20/300/200', time: '2026-04-16 08:23:11' },
  { cameraId: 1, url: 'https://picsum.photos/id/21/300/200', time: '2026-04-16 09:45:22' },
  { cameraId: 2, url: 'https://picsum.photos/id/22/300/200', time: '2026-04-16 10:12:05' },
  { cameraId: 2, url: 'https://picsum.photos/id/23/300/200', time: '2026-04-16 11:30:17' },
  { cameraId: 3, url: 'https://picsum.photos/id/24/300/200', time: '2026-04-16 12:05:44' },
  { cameraId: 4, url: 'https://picsum.photos/id/25/300/200', time: '2026-04-16 13:22:09' },
  { cameraId: 5, url: 'https://picsum.photos/id/26/300/200', time: '2026-04-16 07:50:33' },
  { cameraId: 5, url: 'https://picsum.photos/id/27/300/200', time: '2026-04-16 14:17:56' },
  { cameraId: 6, url: 'https://picsum.photos/id/28/300/200', time: '2026-04-16 15:40:21' },
  { cameraId: 7, url: 'https://picsum.photos/id/29/300/200', time: '2026-04-16 16:55:48' },
  { cameraId: 8, url: 'https://picsum.photos/id/30/300/200', time: '2026-04-16 09:09:13' },
  { cameraId: 9, url: 'https://picsum.photos/id/31/300/200', time: '2026-04-16 17:28:34' },
  { cameraId: 10, url: 'https://picsum.photos/id/32/300/200', time: '2026-04-16 06:14:27' },
  { cameraId: 11, url: 'https://picsum.photos/id/33/300/200', time: '2026-04-16 18:42:59' },
  { cameraId: 12, url: 'https://picsum.photos/id/34/300/200', time: '2026-04-16 19:33:01' },
]

const getCameraSnapshots = (cameraId: number): Snapshot[] => {
  return mockSnapshots.filter(s => s.cameraId === cameraId).slice(0, 4)
}

// ================== 生成摄像头坐标（模拟机场区域） ==================
const generateCoordinates = (id: number, index: number): { lat: number; lng: number } => {
  const baseLat = 40.6413
  const baseLng = -73.7781
  const angle = (index * 37) % 360
  const radius = 0.008 + (id % 7) * 0.0015
  const lat = baseLat + Math.sin(angle * Math.PI / 180) * radius
  const lng = baseLng + Math.cos(angle * Math.PI / 180) * radius
  return { lat, lng }
}

// ================== 摄像头数据（带坐标） ==================
const cameras = ref<Camera[]>([
  { id: 1, name: 'VIP Arrivals-24', ip: '10.7.17.24', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16', lat: 0, lng: 0 },
  { id: 2, name: 'Transfer Domestic-26', ip: '10.7.17.26', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1542350327-4636dc45719b?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16', lat: 0, lng: 0 },
  { id: 3, name: 'Departure Domestic-50', ip: '10.7.17.50', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1590333746438-2834503f5573?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16', lat: 0, lng: 0 },
  { id: 4, name: 'Departure Employee-60', ip: '10.7.17.60', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1531058021387-39322098616e?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16', lat: 0, lng: 0 },
  { id: 5, name: 'Departure Economy Left-54', ip: '10.7.17.54', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16', lat: 0, lng: 0 },
  { id: 6, name: 'Departure Economy Right-62', ip: '10.7.17.62', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16', lat: 0, lng: 0 },
  { id: 7, name: 'Gate B Arrival Middle-58', ip: '10.7.17.58', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16', lat: 0, lng: 0 },
  { id: 8, name: 'Departure Economy Middle-51', ip: '10.7.17.51', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16', lat: 0, lng: 0 },
  { id: 9, name: 'Gate A Arrival Right-56', ip: '10.7.17.56', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16', lat: 0, lng: 0 },
  { id: 10, name: 'Gate C3 Left-31', ip: '10.7.17.31', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16', lat: 0, lng: 0 },
  { id: 11, name: 'Transfer Domestic to Intl-30', ip: '10.7.17.30', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16', lat: 0, lng: 0 },
  { id: 12, name: 'Gate C3 Right-29', ip: '10.7.17.29', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1542350327-4636dc45719b?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16', lat: 0, lng: 0 }
])

// 分配坐标
cameras.value.forEach((cam, idx) => {
  const { lat, lng } = generateCoordinates(cam.id, idx)
  cam.lat = lat
  cam.lng = lng
})

// ================== 布局状态 ==================
const currentLayout = ref<'list' | 'map'>('list')

// 筛选相关
const deviceName = ref('')
const deviceIp = ref('')
const runningStatus = ref('')

const filteredCameras = computed(() => {
  return cameras.value.filter(cam => {
    if (deviceName.value && !cam.name.toLowerCase().includes(deviceName.value.toLowerCase())) return false
    if (deviceIp.value && !cam.ip.includes(deviceIp.value)) return false
    if (runningStatus.value && cam.status !== runningStatus.value) return false
    return true
  })
})

const onlineCount = computed(() => cameras.value.filter(c => c.status === 'online').length)

const handleSearch = () => { /* 过滤由computed自动响应 */ }
const handleReset = () => {
  deviceName.value = ''
  deviceIp.value = ''
  runningStatus.value = ''
}

const goToMonitor = (camera: Camera) => {
  window.dispatchEvent(new CustomEvent('switch-view', { detail: 'monitor' }))
}

// ================== 地图相关逻辑（优化版：流畅框选，空白清除，事件防抖） ==================
let mapInstance: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
let currentRectangle: L.Rectangle | null = null
// 框选过程状态
let selectionInProgress = false
let startLatLng: L.LatLng | null = null
let tempRect: L.Rectangle | null = null
let rafId: number | null = null
let lastMoveLatLng: L.LatLng | null = null

const isSelectMode = ref(false)
const selectedCamerasIds = ref<Set<number>>(new Set())
const selectedCamerasList = computed(() => {
  return Array.from(selectedCamerasIds.value)
    .map(id => cameras.value.find(c => c.id === id))
    .filter((c): c is Camera => !!c)
})

// 切换框选模式
const toggleSelectMode = () => {
  isSelectMode.value = !isSelectMode.value
  if (!isSelectMode.value && currentRectangle) {
    mapInstance?.removeLayer(currentRectangle)
    currentRectangle = null
  }
  // 退出选择模式时，如果有未完成的框选则取消
  if (!isSelectMode.value && selectionInProgress) {
    abortSelection()
  }
}

// 清除地图选择
const clearMapSelection = () => {
  selectedCamerasIds.value.clear()
  updateMarkersHighlight()
  if (currentRectangle) {
    mapInstance?.removeLayer(currentRectangle)
    currentRectangle = null
  }
  // 同时退出框选模式（如果处于框选模式，保持模式但清除矩形）
  if (selectionInProgress) abortSelection()
}

// 中止当前未完成的框选
const abortSelection = () => {
  if (tempRect) {
    mapInstance?.removeLayer(tempRect)
    tempRect = null
  }
  if (rafId) cancelAnimationFrame(rafId)
  if (mapInstance) {
    mapInstance.off('mousemove', onMouseMoveHandler)
    mapInstance.off('mouseup', onMouseUpHandler)
  }
  selectionInProgress = false
  startLatLng = null
  lastMoveLatLng = null
}

// 节流更新矩形（使用RAF）
const updateRectangleThrottled = (endPoint: L.LatLng) => {
  lastMoveLatLng = endPoint
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    if (tempRect && startLatLng && lastMoveLatLng) {
      const bounds = L.latLngBounds(startLatLng, lastMoveLatLng)
      tempRect.setBounds(bounds)
    }
    rafId = null
  })
}

// 鼠标移动处理
const onMouseMoveHandler = (moveEvent: L.LeafletMouseEvent) => {
  if (!selectionInProgress || !startLatLng) return
  updateRectangleThrottled(moveEvent.latlng)
}

// 鼠标抬起处理（完成框选）
const onMouseUpHandler = (upEvent: L.LeafletMouseEvent) => {
  if (!selectionInProgress || !startLatLng) {
    abortSelection()
    return
  }
  const endPoint = upEvent.latlng
  const distance = startLatLng.distanceTo(endPoint)
  // 最小移动距离大于2米才认为是有效框选，避免误触
  if (distance > 2 && mapInstance) {
    const bounds = L.latLngBounds(startLatLng, endPoint)
    performBoxSelection(bounds)
    // 保留最终矩形框
    if (currentRectangle) mapInstance.removeLayer(currentRectangle)
    currentRectangle = L.rectangle(bounds, { color: '#00c8ff', weight: 2, opacity: 0.6, fillOpacity: 0.15 }).addTo(mapInstance)
  }
  abortSelection()
}

// 执行框选
const performBoxSelection = (bounds: L.LatLngBounds) => {
  const selectedIds: number[] = []
  if (!markersLayer) return
  markersLayer.eachLayer((layer: any) => {
    const latlng = layer.getLatLng?.()
    const camId = layer.options?.cameraId
    if (latlng && camId && bounds.contains(latlng)) {
      selectedIds.push(camId)
    }
  })
  if (selectedIds.length > 0) {
    selectedCamerasIds.value = new Set(selectedIds)
    updateMarkersHighlight()
    showToast(`SELECTED ${selectedIds.length} CAMERA(S)`)
  } else {
    showToast('NO CAMERAS IN SELECTION AREA')
  }
}

// 更新地图标记的高亮状态
const updateMarkersHighlight = () => {
  if (!markersLayer) return
  markersLayer.eachLayer((layer: any) => {
    const camId = layer.options?.cameraId
    if (camId && selectedCamerasIds.value.has(camId)) {
      if (layer.setIcon) {
        const highlightIcon = L.divIcon({
          html: `<div style="background:#00c8ff; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px #00c8ff;"></div>`,
          iconSize: [12, 12],
          className: 'highlight-marker'
        })
        layer.setIcon(highlightIcon)
      }
    } else {
      if (layer.setIcon) {
        const defaultIcon = L.divIcon({
          html: `<div style="background:${layer.options?.cameraStatus === 'online' ? '#10b981' : '#64748b'}; width:10px; height:10px; border-radius:50%; border:1px solid white;"></div>`,
          iconSize: [10, 10],
          className: 'default-marker'
        })
        layer.setIcon(defaultIcon)
      }
    }
  })
}

// 初始化地图
const initMap = () => {
  const container = document.getElementById('cameraMap')
  if (!container) return
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
  mapInstance = L.map('cameraMap').setView([40.6413, -73.7781], 16)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> & CartoDB',
    subdomains: 'abcd',
    maxZoom: 19,
    minZoom: 14
  }).addTo(mapInstance)

  markersLayer = L.layerGroup().addTo(mapInstance)

  // 添加摄像头标记
  updateMapMarkers()

  // 地图点击处理：框选模式启动新矩形，非框选模式则清除所有选中（点击空白处）
  mapInstance.on('click', (e: L.LeafletMouseEvent) => {
    if (!isSelectMode.value) {
      // 非框选模式：点击空白区域清除所有选择
      clearMapSelection()
      return
    }
    // 框选模式：如果正在进行其他选择则中止，重新开始
    if (selectionInProgress) abortSelection()
    // 移除旧的矩形
    if (currentRectangle) {
      mapInstance?.removeLayer(currentRectangle)
      currentRectangle = null
    }
    // 开始新框选
    selectionInProgress = true
    startLatLng = e.latlng
    tempRect = L.rectangle([startLatLng, startLatLng], { color: '#00c8ff', weight: 2, opacity: 0.6, fillOpacity: 0.1 }).addTo(mapInstance!)
    // 绑定全局移动和抬起事件
    mapInstance!.on('mousemove', onMouseMoveHandler)
    mapInstance!.on('mouseup', onMouseUpHandler)
  })
}

// 更新地图标记（基于筛选后的摄像头）
const updateMapMarkers = () => {
  if (!markersLayer || !mapInstance) return
  markersLayer.clearLayers()
  filteredCameras.value.forEach(cam => {
    const isOnline = cam.status === 'online'
    const markerColor = isOnline ? '#10b981' : '#64748b'
    const customIcon = L.divIcon({
      html: `<div style="background:${markerColor}; width:10px; height:10px; border-radius:50%; border:1px solid white; box-shadow:0 0 4px ${markerColor};"></div>`,
      iconSize: [10, 10],
      className: 'custom-marker'
    })
    const marker = L.marker([cam.lat, cam.lng], { icon: customIcon })
    marker.bindTooltip(cam.name, { sticky: true, className: 'cam-tooltip' })
    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e)
      if (!isSelectMode.value) {
        // 普通模式下点击单选
        if (selectedCamerasIds.value.has(cam.id)) {
          selectedCamerasIds.value.delete(cam.id)
        } else {
          selectedCamerasIds.value.add(cam.id)
        }
        updateMarkersHighlight()
      }
    })
    ;(marker as any).options.cameraId = cam.id
    ;(marker as any).options.cameraStatus = cam.status
    marker.addTo(markersLayer!)
  })
  updateMarkersHighlight()
}

// 查看框选摄像头的抓拍记录
const showSnapshotsPanel = ref(false)
const viewSelectedSnapshots = () => {
  if (selectedCamerasIds.value.size === 0) {
    showToast('NO CAMERAS SELECTED')
    return
  }
  showSnapshotsPanel.value = true
}

// 监听筛选变化，刷新地图标记
watch([filteredCameras, currentLayout], async () => {
  if (currentLayout.value === 'map') {
    await nextTick()
    if (mapInstance && markersLayer) {
      updateMapMarkers()
    } else {
      initMap()
    }
  }
})

// 监听布局切换，确保地图初始化
watch(currentLayout, async (newVal) => {
  if (newVal === 'map') {
    await nextTick()
    if (!mapInstance) {
      initMap()
    } else {
      mapInstance.invalidateSize()
      updateMapMarkers()
    }
  }
})

// ================== 设备弹窗逻辑（保持不变） ==================
// ...（原设备树相关代码保持不变）
interface TreeNode {
  id: string
  name: string
  type: 'region' | 'camera'
  children?: TreeNode[]
  isLeaf: boolean
  loaded: boolean
  loading: boolean
  hasChildren: boolean
  cameraStatus?: 'online' | 'offline'
  cameraId?: number
}

const showDeviceDialog = ref(false)
const deviceDialogRef = ref<HTMLElement | null>(null)
const selectDeviceBtnRef = ref<HTMLElement | null>(null)
const dialogStyle = ref({ top: '0px', left: '0px' })
const searchKeyword = ref('')
const topLevelNodes = ref<TreeNode[]>([])
const selectedCameraNodeId = ref<string | null>(null)

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

const buildFullDeviceTree = async (): Promise<TreeNode[]> => {
  await delay(200)
  const regions = ['EAST TERMINAL', 'WEST TERMINAL', 'SOUTH ARRIVAL', 'NORTH DEPARTURE', 'CENTRAL HALL', 'PARKING', 'PERIMETER', 'ADMIN']
  const camerasPerRegion = Math.ceil(cameras.value.length / regions.length)
  const tree: TreeNode[] = []
  for (let rIdx = 0; rIdx < regions.length; rIdx++) {
    const regionName = regions[rIdx]
    const startIdx = rIdx * camerasPerRegion
    const endIdx = Math.min(startIdx + camerasPerRegion, cameras.value.length)
    const regionCameras = cameras.value.slice(startIdx, endIdx)
    const children: TreeNode[] = regionCameras.map(cam => ({
      id: `cam_${cam.id}`,
      name: cam.name,
      type: 'camera',
      isLeaf: true,
      loaded: true,
      loading: false,
      hasChildren: false,
      cameraStatus: cam.status,
      cameraId: cam.id,
    }))
    tree.push({
      id: `region_${rIdx}`,
      name: regionName,
      type: 'region',
      children,
      isLeaf: false,
      loaded: true,
      loading: false,
      hasChildren: children.length > 0,
    })
  }
  return tree
}

const toggleNode = async (node: TreeNode) => { if (node.type === 'camera') return }
const expandAll = async () => { await nextTick() }
const collapseAll = async () => { topLevelNodes.value = await buildFullDeviceTree() }

const filteredTree = computed(() => {
  if (!searchKeyword.value) return topLevelNodes.value
  const kw = searchKeyword.value.toLowerCase()
  const filter = (n: TreeNode): TreeNode | null => {
    const match = n.name.toLowerCase().includes(kw)
    const filteredChildren = n.children?.map(c => filter(c)).filter((c): c is TreeNode => c !== null) ?? []
    if (match || filteredChildren.length) {
      return { ...n, children: filteredChildren.length ? filteredChildren : n.children }
    }
    return null
  }
  return topLevelNodes.value.map(n => filter(n)).filter((n): n is TreeNode => n !== null)
})

const initTree = async () => { topLevelNodes.value = await buildFullDeviceTree() }

watch(searchKeyword, async (v) => {
  if (v?.trim()) {
    await expandAll()
  } else {
    await collapseAll()
  }
})

const updateDialogPosition = () => {
  if (!showDeviceDialog.value || !selectDeviceBtnRef.value) return
  const rect = selectDeviceBtnRef.value.getBoundingClientRect()
  let left = rect.left
  let top = rect.bottom + 8
  if (left + 380 > window.innerWidth - 10) left = window.innerWidth - 380 - 10
  if (left < 10) left = 10
  dialogStyle.value = { top: `${top}px`, left: `${left}px` }
}

let resizeObs: ResizeObserver | null = null
let scrollHandler: (() => void) | null = null

watch(showDeviceDialog, v => {
  if (v) {
    nextTick(() => {
      updateDialogPosition()
      scrollHandler = () => updateDialogPosition()
      window.addEventListener('scroll', scrollHandler, true)
      window.addEventListener('resize', updateDialogPosition)
      resizeObs = new ResizeObserver(updateDialogPosition)
      if (selectDeviceBtnRef.value) resizeObs.observe(selectDeviceBtnRef.value)
    })
  } else {
    if (scrollHandler) window.removeEventListener('scroll', scrollHandler, true)
    window.removeEventListener('resize', updateDialogPosition)
    if (resizeObs) resizeObs.disconnect()
  }
})

const toggleDialog = () => { showDeviceDialog.value = !showDeviceDialog.value; if (showDeviceDialog.value) nextTick(updateDialogPosition) }
const closeDialog = () => { showDeviceDialog.value = false }
const handleClickOutside = (e: MouseEvent) => {
  if (!showDeviceDialog.value) return
  if (!deviceDialogRef.value?.contains(e.target as Node) && !selectDeviceBtnRef.value?.contains(e.target as Node)) showDeviceDialog.value = false
}

const onSelectCamera = (node: TreeNode) => {
  if (node.type !== 'camera') return
  selectedCameraNodeId.value = node.id
  const camId = node.cameraId
  if (camId) {
    const targetCard = document.querySelector(`.camera-card[data-id='${camId}']`) as HTMLElement
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
      targetCard.classList.add('highlight-pulse')
      setTimeout(() => targetCard.classList.remove('highlight-pulse'), 1500)
    }
  }
  showDeviceDialog.value = false
  showToast(`SELECTED: ${node.name}`)
}

const showToast = (msg: string) => {
  const toast = document.createElement('div')
  toast.className = 'custom-toast'
  toast.innerText = msg
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 2000)
}

const TreeItem = defineComponent({
  name: 'TreeItem',
  props: { node: Object as PropType<TreeNode>, level: Number, selectedId: String },
  emits: ['toggle', 'select'],
  setup(props, { emit }) {
    const expanded = ref(false)
    const toggleExpand = async () => {
      if (props.node!.type === 'region') {
        if (!props.node!.loaded && props.node!.hasChildren) await emit('toggle', props.node)
        expanded.value = !expanded.value
      }
    }
    const handleDblClick = () => { if (props.node!.type === 'camera') emit('select', props.node) }
    return () => {
      const indent = { paddingLeft: `${(props.level || 0) * 14 + 8}px` }
      const isCamera = props.node!.type === 'camera'
      const isSelected = props.selectedId === props.node!.id && isCamera
      const isOnline = props.node!.cameraStatus === 'online'
      return h('div', { class: 'tr-item' }, [
        h('div', { class: ['tr-row', { 'tr-selected': isSelected, 'tr-region': !isCamera }], style: indent, onClick: () => { if (!isCamera) toggleExpand() }, onDblclick: handleDblClick }, [
          isCamera ? h('span', { class: ['tr-dot', isOnline ? 'tr-on' : 'tr-off'] }) : h('span', { class: 'tr-chevron' }, expanded.value ? '▾' : '▸'),
          h('span', { class: 'tr-name' }, props.node!.name),
          props.node!.loading && h('span', { class: 'tr-spin' }),
          isCamera && h('span', { class: ['tr-badge', isOnline ? 'tr-badge-on' : 'tr-badge-off'] }, isOnline ? 'LIVE' : 'LOST'),
        ]),
        expanded.value && props.node!.children && h('div', { class: 'tr-children' }, props.node!.children.map(child => h(TreeItem, { node: child, level: (props.level || 0) + 1, selectedId: props.selectedId, onToggle: (n: TreeNode) => emit('toggle', n), onSelect: (n: TreeNode) => emit('select', n) })))
      ])
    }
  },
})

onMounted(() => {
  initTree()
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  if (mapInstance) mapInstance.remove()
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler, true)
  window.removeEventListener('resize', updateDialogPosition)
  if (resizeObs) resizeObs?.disconnect()
  // 清理框选资源
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=DM+Mono:wght@400;500&family=Barlow:wght@400;500;600&display=swap');

$bg: #02050c;
$panel: #040810;
$border: #0e2235;
$accent: #00c8ff;
$accent2: #00c8ff;
$red: #ff3a3a;
$amber: #ffb020;
$text: #a8c8e0;
$dim: #3a5a6e;
$mono: 'DM Mono', monospace;
$display: 'Orbitron', sans-serif;
$body: 'Barlow', sans-serif;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.video-wall-view {
  position: relative;
  height: 86vh;
  display: flex;
  background: $bg;
  color: $text;
  font-family: $body;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,80,120,0.12) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 90% 90%, rgba(0,212,255,0.04) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
}

.grid-texture {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px);
  pointer-events: none;
  z-index: 1;
}

.wall-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 24px 18px;
  gap: 20px;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(4, 8, 16, 0.75);
  border: 1px solid $border;
  border-radius: 3px;
  padding: 8px 20px;
  backdrop-filter: blur(2px);

  .filter-group {
    display: flex;
    gap: 20px;
  }

  .filter-item {
    display: flex;
    align-items: center;
    gap: 12px;
    .filter-label {
      font-family: $mono;
      font-size: 10px;
      letter-spacing: 1.5px;
      color: $dim;
    }
  }

  .neo-input, .neo-select {
    background: rgba(0,0,0,0.6);
    border: 1px solid $border;
    padding: 6px 12px;
    font-family: $mono;
    font-size: 10px;
    color: $text;
    border-radius: 2px;
    outline: none;
    transition: all 0.12s;
    &:focus {
      border-color: rgba($accent, 0.5);
      box-shadow: 0 0 0 1px rgba($accent, 0.1);
    }
  }
}

.action-group {
  display: flex;
  gap: 10px;
  .layout-switch {
    display: flex;
    gap: 4px;
    background: rgba(0,0,0,0.3);
    padding: 2px;
    border-radius: 4px;
  }
}

.cmd-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid $border;
  border-radius: 3px;
  padding: 6px 16px;
  font-family: $mono;
  font-size: 10px;
  letter-spacing: 1.5px;
  color: $text;
  cursor: pointer;
  transition: all 0.15s;

  &:hover, &.active {
    border-color: rgba($accent, 0.5);
    background: rgba($accent, 0.06);
    color: $accent;
    box-shadow: 0 0 10px rgba($accent, 0.1);
  }
  &.accent {
    border-color: rgba($accent2, 0.3);
    color: rgba($accent2, 0.9);
    &:hover { border-color: $accent2; background: rgba($accent2, 0.06); color: $accent2; }
  }
  .cb-icon { font-size: 12px; }
  .online-pill {
    background: rgba($accent2, 0.15);
    border: 1px solid rgba($accent2, 0.4);
    color: $accent2;
    font-size: 9px;
    padding: 1px 7px;
    border-radius: 2px;
  }
}

.camera-grid-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: $panel; }
  &::-webkit-scrollbar-thumb { background: $border; border-radius: 4px; }
}

.camera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 18px;
}

.empty-grid {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
  font-family: $mono;
  font-size: 12px;
  color: $dim;
  .empty-icon { font-size: 28px; display: block; margin-bottom: 12px; opacity: 0.5; }
}

.camera-card {
  background: rgba(4, 8, 16, 0.7);
  backdrop-filter: blur(4px);
  border: 1px solid $border;
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba($accent, 0.6);
    box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 0 1px rgba($accent, 0.2);
    .card-thumb .overlay { opacity: 1; }
  }

  .card-thumb {
    position: relative;
    aspect-ratio: 16/9;
    background: #000;
    img {
      width: 100%; height: 100%; object-fit: cover;
      filter: brightness(0.8) contrast(1.05);
    }
    .overlay {
      position: absolute; inset: 0;
      background: rgba($accent, 0.1);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: 0.2s;
      .play-icon { font-size: 32px; color: $accent; text-shadow: 0 0 20px rgba($accent, 0.8); }
    }
    .status-badge {
      position: absolute; top: 12px; right: 12px;
      padding: 2px 10px; border-radius: 2px;
      font-family: $mono; font-size: 9px; font-weight: bold; letter-spacing: 1px;
      backdrop-filter: blur(4px);
      &.online { background: rgba(16, 185, 129, 0.8); color: #fff; }
      &.offline { background: rgba(100, 116, 139, 0.8); color: #cbd5e1; }
    }
    .card-corner {
      position: absolute; width: 12px; height: 12px; z-index: 2;
      &.tl { top: 4px; left: 4px; border-top: 1px solid $accent; border-left: 1px solid $accent; }
      &.tr { top: 4px; right: 4px; border-top: 1px solid $accent; border-right: 1px solid $accent; }
      &.bl { bottom: 4px; left: 4px; border-bottom: 1px solid $accent; border-left: 1px solid $accent; }
      &.br { bottom: 4px; right: 4px; border-bottom: 1px solid $accent; border-right: 1px solid $accent; }
    }
  }

  .card-info {
    padding: 12px;
    .name {
      font-size: 13px; font-weight: 600; color: #f1f5f9; margin-bottom: 6px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .details {
      display: flex; gap: 12px; font-size: 10px; font-family: $mono;
      .ip { color: $accent; }
      .loc { color: $dim; }
      .cap { color: $amber; }
    }
  }
}

.map-container-wrapper {
  flex: 1;
  position: relative;
  border: 1px solid $border;
  border-radius: 3px;
  overflow: hidden;
  background: #000;
}

.camera-map {
  width: 100%;
  height: 100%;
}

.map-toolbar {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 1000;
  background: rgba(4, 8, 16, 0.9);
  backdrop-filter: blur(8px);
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid $border;
}

.map-btn {
  background: rgba(0,0,0,0.6);
  border: 1px solid $border;
  padding: 6px 12px;
  font-family: $mono;
  font-size: 9px;
  color: $dim;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.12s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover, &.active {
    border-color: $accent;
    color: $accent;
    background: rgba($accent, 0.1);
  }
}

.pagination-bar {
  display: flex; align-items: center; justify-content: flex-end; gap: 24px;
  padding-top: 10px; border-top: 1px solid $border; font-family: $mono; font-size: 10px;
  .total { color: $dim; letter-spacing: 1px; margin-right: auto; }
  .pager {
    display: flex; gap: 6px;
    .page-num, .page-arrow {
      width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: 1px solid $border; border-radius: 2px; cursor: pointer;
      color: $dim; transition: all 0.1s;
      &:hover { border-color: $accent; color: $accent; }
      &.active { background: rgba($accent, 0.1); border-color: $accent; color: $accent; }
    }
  }
  .goto {
    display: flex; align-items: center; gap: 6px; color: $dim;
    input { width: 40px; background: rgba(0,0,0,0.6); border: 1px solid $border; color: $accent; text-align: center; border-radius: 2px; }
  }
}

/* 抓拍记录面板 */
.snapshots-panel {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.snapshots-container {
  width: 80vw;
  max-width: 1100px;
  max-height: 80vh;
  background: $panel;
  border: 1px solid rgba($accent, 0.4);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: panelIn 0.2s ease;
}

.snapshots-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid $border;
  .snapshots-title {
    font-family: $display;
    font-size: 12px;
    letter-spacing: 2px;
    color: $accent;
  }
  .snapshots-close {
    background: transparent;
    border: 1px solid $border;
    color: $dim;
    width: 28px;
    height: 28px;
    cursor: pointer;
    border-radius: 2px;
    &:hover { border-color: $red; color: $red; }
  }
}

.snapshots-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  .no-selection {
    text-align: center;
    color: $dim;
    padding: 40px;
    font-family: $mono;
  }
}

.camera-snapshot-group {
  margin-bottom: 24px;
  background: rgba(0,0,0,0.3);
  border: 1px solid $border;
  border-radius: 3px;
  padding: 12px;

  .group-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba($accent, 0.2);
    .cam-name {
      font-family: $display;
      font-size: 11px;
      color: $accent;
      letter-spacing: 1px;
    }
    .cam-ip {
      font-family: $mono;
      font-size: 9px;
      color: $dim;
    }
  }
}

.snapshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.snapshot-card {
  background: #000;
  border: 1px solid $border;
  border-radius: 2px;
  overflow: hidden;
  img {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
  }
  .snapshot-time {
    padding: 6px;
    font-family: $mono;
    font-size: 8px;
    color: $dim;
    text-align: center;
  }
}

.no-snapshots {
  color: $dim;
  font-family: $mono;
  font-size: 9px;
  text-align: center;
  padding: 12px;
}

/* 设备弹窗样式（原样） */
.device-popup {
  position: fixed;
  width: 380px;
  max-height: 70vh;
  background: rgba(4, 8, 20, 0.98);
  border: 1px solid rgba($accent, 0.4);
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1200;
  box-shadow: 0 25px 50px rgba(0,0,0,0.6);
  .dp-header { display: flex; align-items: center; padding: 12px 14px; border-bottom: 1px solid $border; background: rgba(0,0,0,0.4); }
  .dp-title { display: flex; align-items: center; gap: 8px; font-family: $display; font-size: 11px; letter-spacing: 2px; color: $accent; }
  .dp-stats { margin-left: auto; }
  .dp-stat.online { font-family: $mono; font-size: 9px; color: $accent2; border: 1px solid rgba($accent2,0.3); padding: 2px 8px; border-radius: 2px; }
  .dp-close { background: transparent; border: 1px solid $border; border-radius: 2px; color: $dim; width: 24px; height: 24px; margin-left: 12px; cursor: pointer; }
  .dp-search { position: relative; margin: 12px; .ds-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); } .ds-input { width: 100%; background: rgba(0,0,0,0.6); border: 1px solid $border; padding: 8px 30px 8px 32px; font-family: $mono; font-size: 10px; color:#fff; } }
  .dp-toolbar { display: flex; gap: 8px; margin: 0 12px 8px; .dp-tb-btn { flex:1; background:rgba(0,0,0,0.4); border:1px solid $border; padding: 6px 0; font-family: $mono; font-size:9px; cursor:pointer; &:hover { color:$accent; } } }
  .dp-tree { flex:1; overflow-y: auto; padding:4px 0; }
  .dp-footer { padding:8px; text-align:center; font-size:9px; color:$dim; border-top:1px solid $border; }
}

.tr-row {
  display: flex; align-items: center; gap: 8px; padding: 6px 10px; cursor: pointer;
  &:hover { background: rgba($accent, 0.08); }
  &.tr-selected { background: rgba($accent,0.12); border-left:2px solid $accent; .tr-name { color:$accent; } }
  .tr-dot { width:6px; height:6px; border-radius:50%; &.tr-on { background:$accent2; } &.tr-off { background:#5a5a5a; } }
  .tr-name { font-family:$mono; font-size:10px; }
  .tr-badge { font-size:8px; padding:1px 6px; border-radius:2px; &.tr-badge-on { color:$accent2; background:rgba($accent2,0.1); } }
}
.tr-children { border-left:1px solid rgba($accent,0.2); margin-left:14px; }

.custom-toast {
  position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
  background: rgba($accent,0.92); color: $bg; font-family: $mono; font-size: 11px;
  padding: 8px 24px; border-radius: 2px; z-index: 1300;
}

@keyframes panelIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

:global(.cam-tooltip) {
  font-family: $mono;
  font-size: 9px;
  background: rgba(0,0,0,0.8);
  border: 1px solid $accent;
  color: $accent;
}
</style>