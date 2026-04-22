<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Style, Circle, Fill, Stroke, Text } from 'ol/style'
import { defaults as defaultControls, Attribution } from 'ol/control'
import 'ol/ol.css'
import { MAP_CENTER_LON_LAT } from '../data/mockRetrieval'

const props = withDefaults(
  defineProps<{
    lonLat?: [number, number]
    zoom?: number
    label?: string
  }>(),
  {
    zoom: 15,
    label: 'Point'
  }
)

const el = ref<HTMLElement | null>(null)
let map: Map | null = null
let vectorSource: VectorSource | null = null

function addPoint(coord: [number, number], text: string) {
  if (!vectorSource) return
  vectorSource.clear()
  const f = new Feature({ geometry: new Point(fromLonLat(coord)) })
  f.setStyle(
    new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: 'rgba(56, 189, 248, 0.85)' }),
        stroke: new Stroke({ color: '#0ea5e9', width: 2 })
      }),
      text: new Text({
        text,
        offsetY: -16,
        fill: new Fill({ color: '#e2e8f0' }),
        font: '12px system-ui, sans-serif',
        backgroundFill: new Fill({ color: 'rgba(15, 23, 42, 0.9)' }),
        padding: [4, 6, 4, 6]
      })
    })
  )
  vectorSource.addFeature(f)
}

function initMap() {
  if (!el.value) return
  vectorSource = new VectorSource()
  const vectorLayer = new VectorLayer({ source: vectorSource, zIndex: 10 })
  const darkBasemap = new TileLayer({
    source: new XYZ({
      url: 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      attributions: '© OpenStreetMap © CARTO'
    })
  })
  const center = fromLonLat(props.lonLat ?? MAP_CENTER_LON_LAT)
  map = new Map({
    target: el.value,
    layers: [darkBasemap, vectorLayer],
    view: new View({ center, zoom: props.zoom, minZoom: 3, maxZoom: 19 }),
    controls: defaultControls({ attribution: false }).extend([new Attribution({ collapsible: true })])
  })
  if (props.lonLat) addPoint(props.lonLat, props.label)
}

function dispose() {
  if (map) {
    map.setTarget(undefined)
    map = null
  }
  vectorSource = null
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  dispose()
})

watch(
  () => [props.lonLat, props.label, props.zoom] as const,
  ([c, , z]) => {
    if (!map || !c) return
    const view = map.getView()
    view.setCenter(fromLonLat(c))
    view.setZoom(z ?? 15)
    addPoint(c, props.label)
  }
)
</script>

<template>
  <div ref="el" class="ol-wrap" role="img" :aria-label="label" />
</template>

<style scoped>
.ol-wrap {
  width: 100%;
  height: 100%;
  min-height: 200px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.2);
  background: #0b1120;
}
:deep(.ol-control) {
  background: rgba(15, 23, 42, 0.85);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
:deep(.ol-control button) {
  background: rgba(30, 41, 59, 0.9);
  color: #94a3b8;
}
</style>
