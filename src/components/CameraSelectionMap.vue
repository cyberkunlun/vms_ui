<script setup lang="ts">
import { ref, watch, nextTick, shallowRef, onUnmounted, onMounted } from 'vue'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat } from 'ol/proj'
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style'
import Draw, { createBox } from 'ol/interaction/Draw'
import { Rank, FullScreen, Compass, Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'selection-change', count: number, ids: string[]): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<Map>()
const vectorSource = shallowRef<VectorSource>()
const drawSource = shallowRef<VectorSource>()
const drawInteraction = shallowRef<Draw>()

const drawMode = ref<'None' | 'Rectangle' | 'Circle'>('None')
const selectedCameraCount = ref(0)
const totalCameraCount = ref(0)
const selectedCameraIds = ref<string[]>([])

// Mock camera locations (Muscat)
const MOCK_CAMERAS = [
  { id: 'C1', name: 'Main Entrance Gate', lon: 58.4059, lat: 23.5859 },
  { id: 'C2', name: 'Parking Lot A', lon: 58.4100, lat: 23.5880 },
  { id: 'C3', name: 'Building B Lobby', lon: 58.3950, lat: 23.5900 },
  { id: 'C4', name: 'West Perimeter', lon: 58.4000, lat: 23.5800 },
  { id: 'C5', name: 'East Checkpoint', lon: 58.4150, lat: 23.5750 },
  { id: 'C6', name: 'Cafeteria', lon: 58.3900, lat: 23.5850 }
]

let resizeObserver: ResizeObserver | null = null

const initMap = () => {
  if (map.value) {
    map.value.updateSize()
    return
  }

  if (!mapContainer.value) {
    // If container isn't ready yet, try again shortly
    setTimeout(initMap, 50)
    return
  }

  const features = MOCK_CAMERAS.map(cam => {
    return new Feature({
      geometry: new Point(fromLonLat([cam.lon, cam.lat])),
      id: cam.id,
      name: cam.name,
      selected: false
    })
  })
  totalCameraCount.value = features.length
  vectorSource.value = new VectorSource({ features })
  
  const cameraStyle = (feature: any) => {
    const isSelected = feature.get('selected')
    return new Style({
      image: new CircleStyle({
        radius: isSelected ? 10 : 8,
        fill: new Fill({ color: isSelected ? '#10b981' : '#38bdf8' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      })
    })
  }

  const cameraLayer = new VectorLayer({
    source: vectorSource.value,
    style: cameraStyle
  })

  drawSource.value = new VectorSource()
  const drawLayer = new VectorLayer({
    source: drawSource.value,
    style: new Style({
      fill: new Fill({ color: 'rgba(56, 189, 248, 0.2)' }),
      stroke: new Stroke({ color: '#38bdf8', width: 2 })
    })
  })

  map.value = new Map({
    target: mapContainer.value,
    controls: [], // Disable all default OL controls (zoom, rotate, attribution) to prevent overlapping
    layers: [
      new TileLayer({ source: new OSM() }),
      drawLayer,
      cameraLayer
    ],
    view: new View({
      center: fromLonLat([58.4059, 23.5859]),
      zoom: 14
    })
  })

  // Ensure map resizes correctly when dialog animations finish or layout changes
  resizeObserver = new ResizeObserver(() => {
    if (map.value) {
      map.value.updateSize()
    }
  })
  resizeObserver.observe(mapContainer.value)
}

const updateSelection = () => {
  emit('selection-change', selectedCameraCount.value, selectedCameraIds.value)
}

const setDrawMode = (mode: 'None' | 'Rectangle' | 'Circle') => {
  drawMode.value = mode
  if (drawInteraction.value && map.value) {
    map.value.removeInteraction(drawInteraction.value)
    drawInteraction.value = undefined
  }

  if (mode === 'None') return

  drawSource.value?.clear() 

  if (mode === 'Rectangle') {
    drawInteraction.value = new Draw({
      source: drawSource.value,
      type: 'Circle',
      geometryFunction: createBox()
    })
  } else if (mode === 'Circle') {
    drawInteraction.value = new Draw({
      source: drawSource.value,
      type: 'Circle'
    })
  }

  if (drawInteraction.value) {
    drawInteraction.value.on('drawend', (e) => {
      const geometry = e.feature.getGeometry()
      if (!geometry) return

      let count = 0
      const ids: string[] = []
      
      vectorSource.value?.getFeatures().forEach(feature => {
        const pt = feature.getGeometry() as Point
        if (geometry.intersectsCoordinate(pt.getCoordinates())) {
          feature.set('selected', true)
          count++
          ids.push(feature.get('id'))
        } else {
          feature.set('selected', false)
        }
      })
      
      selectedCameraCount.value = count
      selectedCameraIds.value = ids
      updateSelection()
      
      // Revert to pan mode automatically after drawing
      setTimeout(() => setDrawMode('None'), 100)
    })
    
    map.value?.addInteraction(drawInteraction.value)
  }
}

const clearSelection = () => {
  drawSource.value?.clear()
  vectorSource.value?.getFeatures().forEach(f => f.set('selected', false))
  selectedCameraCount.value = 0
  selectedCameraIds.value = []
  setDrawMode('None')
  updateSelection()
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      initMap()
    })
  } else {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    if (map.value) {
      map.value.setTarget(undefined)
      map.value = undefined
    }
    clearSelection()
  }
})

onMounted(() => {
  if (props.visible) {
    initMap()
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (map.value) {
    map.value.setTarget(undefined)
    map.value = undefined
  }
})
</script>

<template>
  <div class="map-view-area">
    <div class="map-stats-overlay">
       <div class="stat-box"><span class="l">Selected Nodes</span><span class="v">{{ selectedCameraCount }}</span></div>
       <div class="stat-box active"><span class="l">Total Cameras</span><span class="v">{{ totalCameraCount }}</span></div>
    </div>
    
    <div class="map-toolbar">
      <button class="map-btn" :class="{active: drawMode === 'None'}" @click="setDrawMode('None')"><el-icon><Rank /></el-icon> Pan</button>
      <button class="map-btn" :class="{active: drawMode === 'Rectangle'}" @click="setDrawMode('Rectangle')"><el-icon><FullScreen /></el-icon> Rectangle</button>
      <button class="map-btn" :class="{active: drawMode === 'Circle'}" @click="setDrawMode('Circle')"><el-icon><Compass /></el-icon> Circle</button>
      <button class="map-btn danger" @click="clearSelection"><el-icon><Delete /></el-icon> Clear</button>
    </div>
    
    <!-- OpenLayers Map Container -->
    <div ref="mapContainer" class="ol-map-container"></div>
  </div>
</template>

<style scoped lang="scss">
.map-view-area {
  height: 100%; min-height: 400px; border-radius: 16px; overflow: hidden; position: relative; border: 1px solid #1f2937;
  display: flex; flex-direction: column;
  
  .ol-map-container {
    width: 100%;
    height: 100%;
    background: #0f172a;
  }

  .map-stats-overlay {
    position: absolute; top: 12px; left: 12px; display: flex; gap: 12px; z-index: 10;
    .stat-box {
      background: rgba(0,0,0,0.8); padding: 8px 16px; border-radius: 8px; border: 1px solid #1f2937; display: flex; flex-direction: column;
      .l { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
      .v { font-size: 16px; color: #f3f4f6; font-weight: bold; font-family: monospace; }
      &.active { border-color: #38bdf8; .v { color: #38bdf8; } }
    }
  }

  .map-toolbar {
    position: absolute; bottom: 16px; right: 16px; z-index: 10;
    display: flex; gap: 8px; background: rgba(0,0,0,0.8); padding: 8px; border-radius: 12px; border: 1px solid rgba(56, 189, 248, 0.3);
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }

  .map-btn {
    background: transparent; color: #cbd5e1; border: 1px solid transparent;
    padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s;
    display: flex; align-items: center; gap: 6px;
    &:hover { background: rgba(56, 189, 248, 0.1); color: #fff; border-color: #38bdf8; }
    &.active { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border-color: #38bdf8; }
    &.danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }
  }
}
</style>
