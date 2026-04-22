<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, shallowRef } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'
import { Style, Circle, Fill, Stroke, Text } from 'ol/style'
import 'ol/ol.css'

interface TrajPoint {
  lon: number;
  lat: number;
  time: string;
  label: string;
}

const props = defineProps<{
  points: TrajPoint[];
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<Map | null>(null)
const vectorSource = new VectorSource()

const createPointStyle = (label: string, isLast: boolean) => {
  return new Style({
    image: new Circle({
      radius: isLast ? 8 : 5,
      fill: new Fill({ color: isLast ? '#ef4444' : '#38bdf8' }),
      stroke: new Stroke({ color: '#fff', width: 2 })
    }),
    text: new Text({
      text: label,
      offsetY: -16,
      fill: new Fill({ color: '#fff' }),
      font: '10px Inter, sans-serif',
      backgroundFill: new Fill({ color: 'rgba(15, 23, 42, 0.8)' }),
      padding: [2, 4, 2, 4]
    })
  })
}

const updateMap = () => {
  if (!vectorSource) return
  vectorSource.clear()

  if (props.points.length === 0) return

  // 1. Draw Line
  const coords = props.points.map(p => fromLonLat([p.lon, p.lat]))
  const lineFeature = new Feature({
    geometry: new LineString(coords)
  })
  lineFeature.setStyle(new Style({
    stroke: new Stroke({
      color: 'rgba(56, 189, 248, 0.6)',
      width: 3,
      lineDash: [10, 10]
    })
  }))
  vectorSource.addFeature(lineFeature)

  // 2. Draw Points
  props.points.forEach((p, idx) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat([p.lon, p.lat]))
    })
    feature.setStyle(createPointStyle(p.label, idx === props.points.length - 1))
    vectorSource.addFeature(feature)
  })

  // 3. Zoom to extent
  if (map.value && coords.length > 0) {
    const extent = vectorSource.getExtent()
    if (extent) {
      map.value.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 })
    }
  }
}

onMounted(() => {
  map.value = new Map({
    target: mapContainer.value!,
    layers: [
      new TileLayer({
        source: new OSM(),
        className: 'dark-map-layer'
      }),
      new VectorLayer({
        source: vectorSource
      })
    ],
    view: new View({
      center: fromLonLat([58.4059, 23.5859]),
      zoom: 14
    }),
    controls: []
  })

  updateMap()
})

onUnmounted(() => {
  if (map.value) {
    map.value.setTarget(undefined)
    map.value = null
  }
})

watch(() => props.points, updateMap, { deep: true })
</script>

<template>
  <div ref="mapContainer" class="trajectory-map"></div>
</template>

<style scoped>
.trajectory-map {
  width: 100%;
  height: 100%;
  min-height: 250px;
  background: #0f172a;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

:deep(.dark-map-layer) {
  filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(110%) sepia(20%) saturate(150%);
}
</style>
