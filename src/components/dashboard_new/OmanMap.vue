<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'

const mapTarget = ref<HTMLElement | null>(null)
let olMap: Map | null = null

// Camera & incident markers across Oman
const markers = [
  // Cameras (type: cam)
  { lon: 58.593, lat: 23.588, type: 'cam',   label: 'Muscat - Port Gate' },
  { lon: 58.410, lat: 23.586, type: 'cam',   label: 'Muscat Intl Airport' },
  { lon: 58.520, lat: 23.610, type: 'cam',   label: 'Ruwi Junction' },
  { lon: 58.480, lat: 23.560, type: 'cam',   label: 'Al Qurum' },
  { lon: 58.560, lat: 23.530, type: 'cam',   label: 'Mutrah Corniche' },
  { lon: 56.703, lat: 24.347, type: 'cam',   label: 'Sohar Port' },
  { lon: 54.090, lat: 17.019, type: 'cam',   label: 'Salalah Port' },
  { lon: 59.530, lat: 22.567, type: 'cam',   label: 'Sur Coast' },
  { lon: 57.530, lat: 22.933, type: 'cam',   label: 'Nizwa Centre' },
  { lon: 56.260, lat: 24.083, type: 'cam',   label: 'Buraimi Border' },
  { lon: 57.510, lat: 21.460, type: 'cam',   label: 'Duqm Port' },
  { lon: 58.200, lat: 23.680, type: 'cam',   label: 'Seeb' },
  // Alerts / incidents (type: alert)
  { lon: 58.550, lat: 23.600, type: 'alert', label: 'High Wind Warning' },
  { lon: 57.000, lat: 23.100, type: 'alert', label: 'Sandstorm Warning' },
  { lon: 55.800, lat: 23.200, type: 'alert', label: 'Traffic Incident' },
  // Active pulse incidents (type: pulse)
  { lon: 58.593, lat: 23.588, type: 'pulse', label: 'Active: Muscat' },
  { lon: 56.703, lat: 24.347, type: 'pulse', label: 'Active: Sohar' },
  { lon: 57.510, lat: 21.460, type: 'pulse', label: 'Active: Duqm' },
]

const markerPositions = ref<Array<{
  x: number; y: number; type: string; label: string
}>>([])

const updateMarkers = () => {
  if (!olMap) return
  markerPositions.value = markers.map(m => {
    const coord = fromLonLat([m.lon, m.lat])
    const pixel = olMap!.getPixelFromCoordinate(coord)
    if (!pixel) return { x: -999, y: -999, type: m.type, label: m.label }
    return { x: Math.round(pixel[0]!), y: Math.round(pixel[1]!), type: m.type, label: m.label }
  })
}

onMounted(() => {
  if (!mapTarget.value) return
  olMap = new Map({
    target: mapTarget.value,
    layers: [new TileLayer({ source: new OSM({ attributions: [] }) })],
    view: new View({
      center: fromLonLat([57.5, 21.8]),
      zoom: 5.6,
      minZoom: 4,
      maxZoom: 14,
    }),
    controls: [],
  })
  olMap.on('postrender', updateMarkers)
  olMap.on('moveend', updateMarkers)
  updateMarkers()
})

onBeforeUnmount(() => {
  olMap?.dispose()
  olMap = null
})
</script>

<template>
  <div class="oman-map">
    <!-- Map canvas -->
    <div class="ol-map-canvas" ref="mapTarget"></div>

    <!-- Markers -->
    <template v-for="(m, i) in markerPositions" :key="i">
      <div
        v-if="m.x > 0"
        class="marker"
        :class="m.type"
        :style="{ left: m.x + 'px', top: m.y + 'px' }"
      >
        <!-- Camera icon -->
        <template v-if="m.type === 'cam'">
          <svg class="marker-icon" viewBox="0 0 24 24">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </template>
        <!-- Alert icon -->
        <template v-else-if="m.type === 'alert'">
          <svg class="marker-icon" viewBox="0 0 24 24">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </template>
        <!-- Pulse dot -->
        <template v-else>
          <span class="pulse-dot"></span>
          <span class="pulse-ring"></span>
        </template>
        <span class="marker-tip">{{ m.label }}</span>
      </div>
    </template>

    <!-- HUD corners -->
    <div class="hud tl"><span class="hud-bracket tl"></span><span class="hud-txt">LAT 23.5859° N</span></div>
    <div class="hud tr"><span class="hud-bracket tr"></span><span class="hud-txt">LON 58.4059° E</span></div>
    <div class="hud bl"><span class="hud-bracket bl"></span><span class="hud-txt">SCALE 1:2,500,000</span></div>
    <div class="hud br"><span class="hud-bracket br"></span><span class="hud-txt">UTM 40Q</span></div>

  </div>
</template>

<style scoped lang="scss">
.oman-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #010711;
  border-radius: inherit;
}

/* ─── Map canvas: dark military style ─── */
.ol-map-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: invert(1) hue-rotate(188deg) saturate(1.8) brightness(0.44) contrast(1.1);
}

/* ─── Markers ─── */
.marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;

  &:hover .marker-tip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Tooltip */
.marker-tip {
  position: absolute;
  bottom: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%) translateY(3px);
  white-space: nowrap;
  font-size: 9px;
  letter-spacing: 0.08em;
  color: rgba(220, 240, 255, 0.95);
  background: rgba(2, 8, 22, 0.88);
  border: 1px solid rgba(100, 160, 255, 0.35);
  padding: 2px 7px;
  border-radius: 3px;
  opacity: 0;
  transition: all 0.18s ease;
  pointer-events: none;
  font-family: 'Consolas', monospace;
  backdrop-filter: blur(4px);
}

/* ── Camera marker ── */
.marker.cam {
  width: 22px;
  height: 22px;
  background: rgba(71, 175, 255, 0.18);
  border: 1px solid rgba(71, 175, 255, 0.7);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px rgba(71, 175, 255, 0.5), inset 0 0 6px rgba(71, 175, 255, 0.12);
  transition: all 0.18s;

  &:hover {
    background: rgba(71, 175, 255, 0.35);
    box-shadow: 0 0 14px rgba(71, 175, 255, 0.8);
    border-color: #47afff;
  }

  .marker-icon {
    width: 11px;
    height: 11px;
    stroke: #7ed4ff;
    stroke-width: 1.6;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

/* ── Alert marker ── */
.marker.alert {
  width: 20px;
  height: 20px;
  background: rgba(251, 146, 60, 0.15);
  border: 1px solid rgba(251, 146, 60, 0.7);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px rgba(251, 146, 60, 0.45);

  .marker-icon {
    width: 11px;
    height: 11px;
    stroke: #fb923c;
    stroke-width: 1.8;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

/* ── Pulse incident marker ── */
.marker.pulse {
  width: 14px;
  height: 14px;
}

.pulse-dot {
  display: block;
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: #60e0ff;
  box-shadow: 0 0 10px rgba(96, 224, 255, 0.9);
  animation: pulseGlow 2s ease-in-out infinite;
}

.pulse-ring {
  display: block;
  position: absolute;
  inset: 0;
  border: 1.5px solid rgba(96, 224, 255, 0.7);
  border-radius: 50%;
  animation: pingRing 2s ease-out infinite;
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 10px rgba(96, 224, 255, .9); }
  50%       { box-shadow: 0 0 18px rgba(96, 224, 255, 1), 0 0 30px rgba(96, 224, 255, .6); }
}

@keyframes pingRing {
  0%   { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(2.6); opacity: 0; }
}

/* ─── HUD corners ─── */
.hud {
  position: absolute;
  z-index: 8;
  display: flex;
  align-items: center;
  gap: 6px;
  pointer-events: none;

  &.tl { top: 12px; left: 12px; }
  &.tr { top: 12px; right: 12px; flex-direction: row-reverse; }
  &.bl { bottom: 12px; left: 12px; }
  &.br { bottom: 12px; right: 12px; flex-direction: row-reverse; }
}

.hud-bracket {
  display: block;
  width: 14px;
  height: 14px;
  border-color: rgba(118, 177, 255, 0.65);
  border-style: solid;
  border-width: 0;

  &.tl { border-top-width: 1.5px; border-left-width: 1.5px; }
  &.tr { border-top-width: 1.5px; border-right-width: 1.5px; }
  &.bl { border-bottom-width: 1.5px; border-left-width: 1.5px; }
  &.br { border-bottom-width: 1.5px; border-right-width: 1.5px; }
}

.hud-txt {
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(200, 225, 255, 0.65);
  font-family: 'Consolas', monospace;
  background: rgba(2, 8, 20, 0.5);
  padding: 2px 7px;
  border: 1px solid rgba(100, 160, 255, 0.14);
}

</style>
