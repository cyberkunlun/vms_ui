<script setup lang="ts">
import { ref, markRaw, computed, onMounted, onBeforeUnmount } from 'vue'
import draggable from 'vuedraggable'
import LiveCameraFeeds from './LiveCameraFeeds.vue'
import WeeklyTrends from './WeeklyTrends.vue'
import StormWarning from './StormWarning.vue'
import TodayOverview from './TodayOverview.vue'
import OmanMap from './OmanMap.vue'
import ResourceOverview from './ResourceOverview.vue'
import AlertInformation from './AlertInformation.vue'
import AlarmHandling from './AlarmHandling.vue'
import AlarmHandlingTypes from './AlarmHandlingTypes.vue'
import EventHandling from './EventHandling.vue'

/* ─── fullscreen ─── */
const rootRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)
const onFullscreenChange = () => { isFullscreen.value = document.fullscreenElement === rootRef.value }
const toggleFullscreen = async () => {
  const el = rootRef.value
  if (!el) return
  document.fullscreenElement === el ? await document.exitFullscreen() : await el.requestFullscreen()
}

/* ─── clock ─── */
const now = ref('')
const fmtTime = () => {
  const d = new Date()
  now.value = `${d.toLocaleDateString('en-US', { weekday: 'long' })}, ${d.toLocaleDateString('en-US', { month: 'long' })} ${d.getDate()}  •  ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
}

/* ─── widget model ─── */
interface Widget { id: string; label: string; desc: string; visible: boolean; component: any }

const leftWidgets = ref<Widget[]>([
  { id: 'cameras',       label: 'Live Camera Feeds',  desc: '256 live camera thumbnails',   visible: true, component: markRaw(LiveCameraFeeds) },
  { id: 'trends',        label: 'Weekly Trends',      desc: 'Weekly incidents & alarm chart',visible: true, component: markRaw(WeeklyTrends) },
  { id: 'storm',         label: 'Storm Warning',      desc: 'Weather alert & wind metrics',  visible: true, component: markRaw(StormWarning) },
])

const centerWidgets = ref<Widget[]>([
  { id: 'map',           label: 'Oman Map',           desc: 'Real-time incident map',        visible: true, component: null },
  { id: 'resources',     label: 'Resource Overview',  desc: 'System / staffing utilisation', visible: true, component: markRaw(ResourceOverview) },
])

const rightWidgets = ref<Widget[]>([
  { id: 'alerts',        label: 'Alert Information',  desc: '226 active alerts',             visible: true, component: markRaw(AlertInformation) },
  { id: 'alarmHandling', label: 'Alarm Handling',     desc: 'Camera & alarm stats',          visible: true, component: markRaw(AlarmHandling) },
  { id: 'alarmTypes',    label: 'Alarm Types',        desc: 'Traffic / Fire / Health',       visible: true, component: markRaw(AlarmHandlingTypes) },
  { id: 'events',        label: 'Event Handling',     desc: 'Pie chart event processing',    visible: true, component: markRaw(EventHandling) },
])

const todayOverviewVisible = ref(true)

// all widgets for the settings panel
const allWidgets = computed(() => [
  ...leftWidgets.value,
  { id: 'todayOverview', label: "Today's Overview", desc: 'Floating stats on map', visible: todayOverviewVisible.value, component: null },
  ...centerWidgets.value.filter(w => w.id !== 'map'),
  ...rightWidgets.value,
])
const findWidget = (id: string): Widget | undefined => {
  if (id === 'todayOverview') return undefined
  return [...leftWidgets.value, ...centerWidgets.value, ...rightWidgets.value].find(w => w.id === id)
}
const toggleById = (id: string) => {
  if (id === 'todayOverview') { todayOverviewVisible.value = !todayOverviewVisible.value; return }
  const w = findWidget(id)
  if (w) w.visible = !w.visible
}
const isVisibleById = (id: string) => {
  if (id === 'todayOverview') return todayOverviewVisible.value
  return findWidget(id)?.visible ?? true
}

/* ─── edit mode ─── */
const editMode = ref(false)
const enterEdit = () => { editMode.value = true }
const saveEdit = () => { editMode.value = false }
const resetAll = () => {
  ;[...leftWidgets.value, ...centerWidgets.value, ...rightWidgets.value].forEach(w => { w.visible = true })
  todayOverviewVisible.value = true
}

// drag options
const dragOptions = computed(() => ({
  animation: 200,
  disabled: !editMode.value,
  ghostClass: 'drag-ghost',
  chosenClass: 'drag-chosen',
  dragClass: 'drag-dragging',
  handle: '.drag-handle',
}))

let timer: number | undefined
onMounted(() => {
  fmtTime(); timer = window.setInterval(fmtTime, 30_000)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<template>
  <div class="occ-root" ref="rootRef" :class="{ fullscreen: isFullscreen, 'edit-mode': editMode }">
    <!-- Background -->
    <div class="bg-glow top"          aria-hidden="true"></div>
    <div class="bg-glow bottom-left"  aria-hidden="true"></div>
    <div class="bg-glow bottom-right" aria-hidden="true"></div>
    <div class="screen-noise"         aria-hidden="true"></div>
    <div class="border-frame"         aria-hidden="true"></div>
    <div class="edge-scan"            aria-hidden="true"></div>

    <!-- ─── Header ─── -->
    <header class="top-shell">
      <div class="top-left-group">
        <div class="top-date">{{ now }}</div>
        <div class="sys-status">
          <span class="sys-dot active"></span>
          <span class="sys-label">SYSTEM ONLINE</span>
          <span class="sys-sep"></span>
          <span class="sys-dot warning"></span>
          <span class="sys-label">226 ALERTS</span>
        </div>
      </div>

      <div class="top-title">
        <span class="wedge left"></span>
        <div class="title-inner">
          <h1>Emergency Command Center</h1>
          <div class="title-sub">
            <span class="title-sub-dot"></span>
            <span>REAL-TIME OPERATIONAL INTELLIGENCE</span>
            <span class="title-sub-dot"></span>
          </div>
        </div>
        <span class="wedge right"></span>
      </div>

      <div class="top-actions">
        <!-- Save (edit mode only) -->
        <button v-if="editMode" class="top-action save-btn" type="button" @click="saveEdit">
          <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
          Save
        </button>

        <!-- Fullscreen (normal mode only) -->
        <button v-if="!editMode" class="top-action action-btn" type="button"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
          @click="toggleFullscreen">
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 3H4v4M16 3h4v4M8 21H4v-4M20 21h-4v-4"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5"/>
          </svg>
        </button>

        <!-- Config -->
        <button class="top-action action-btn" :class="{ active: editMode }" type="button"
          title="Panel Configuration" @click="enterEdit">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.1 12c0-.36-.03-.72-.08-1.06l2.29-1.79a.5.5 0 0 0 .12-.64l-2.17-3.76a.5.5 0 0 0-.61-.22l-2.7 1.09a7.9 7.9 0 0 0-1.82-1.06l-.41-2.87A.49.49 0 0 0 13.25 2h-2.5a.49.49 0 0 0-.49.42l-.41 2.87a7.9 7.9 0 0 0-1.82 1.06L5.33 5.26a.5.5 0 0 0-.61.22L2.55 9.24a.49.49 0 0 0 .12.64l2.29 1.79A8.2 8.2 0 0 0 4.88 12c0 .36.03.72.08 1.06l-2.29 1.79a.5.5 0 0 0-.12.64l2.17 3.76c.13.23.4.32.61.22l2.7-1.09c.56.41 1.17.75 1.82 1.06l.41 2.87c.06.24.27.42.49.42h2.5c.22 0 .43-.18.49-.42l.41-2.87a7.9 7.9 0 0 0 1.82-1.06l2.7 1.09c.21.09.48 0 .61-.22l2.17-3.76a.49.49 0 0 0-.12-.64L19.18 13.06c.05-.34.08-.7.08-1.06z"/>
          </svg>
        </button>

        <span v-if="!editMode" class="top-action">◔</span>
      </div>
    </header>

    <!-- ─── Drag banner (edit mode) ─── -->
    <div v-if="editMode" class="drag-banner">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>
      </svg>
      Drag widgets to reorder modules
    </div>

    <!-- ─── Main grid ─── -->
    <main class="dashboard-grid">

      <!-- Left column (draggable) -->
      <draggable
        v-model="leftWidgets"
        v-bind="dragOptions"
        class="left-column"
        tag="section"
        item-key="id"
      >
        <template #item="{ element }">
          <div
            class="widget-slot"
            :class="{ 'widget-hidden': !element.visible, 'has-handle': editMode }"
          >
            <div v-if="editMode" class="drag-handle" title="Drag to reorder">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="9"  cy="5"  r="1.2"/><circle cx="15" cy="5"  r="1.2"/>
                <circle cx="9"  cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/>
                <circle cx="9"  cy="19" r="1.2"/><circle cx="15" cy="19" r="1.2"/>
              </svg>
            </div>
            <div v-if="editMode" class="widget-label-overlay">{{ element.label }}</div>
            <component :is="element.component" v-if="element.visible" />
            <div v-else class="widget-hidden-placeholder">
              <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>
              <span>{{ element.label }}</span>
            </div>
          </div>
        </template>
      </draggable>

      <!-- Center column (draggable) -->
      <draggable
        v-model="centerWidgets"
        v-bind="dragOptions"
        class="center-column"
        tag="section"
        item-key="id"
      >
        <template #item="{ element }">
          <div
            class="widget-slot"
            :class="['slot-'+element.id, { 'widget-hidden': !element.visible, 'has-handle': editMode }]"
          >
            <div v-if="editMode" class="drag-handle" title="Drag to reorder">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="9"  cy="5"  r="1.2"/><circle cx="15" cy="5"  r="1.2"/>
                <circle cx="9"  cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/>
                <circle cx="9"  cy="19" r="1.2"/><circle cx="15" cy="19" r="1.2"/>
              </svg>
            </div>

            <!-- Map widget (special) -->
            <template v-if="element.id === 'map'">
              <div v-if="element.visible" class="map-stage">
                <OmanMap />
                <TodayOverview v-if="todayOverviewVisible" class="floating-overview" />
              </div>
              <div v-else class="widget-hidden-placeholder">
                <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>
                <span>{{ element.label }}</span>
              </div>
            </template>
            <!-- Other center widgets -->
            <template v-else>
              <component :is="element.component" v-if="element.visible" />
              <div v-else class="widget-hidden-placeholder">
                <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>
                <span>{{ element.label }}</span>
              </div>
            </template>

            <div v-if="editMode" class="widget-label-overlay">{{ element.label }}</div>
          </div>
        </template>
      </draggable>

      <!-- Right column — normal view OR widget settings -->
      <template v-if="!editMode">
        <section class="right-column">
          <AlertInformation   v-if="rightWidgets.find(w=>w.id==='alerts')?.visible" />
          <AlarmHandling      v-if="rightWidgets.find(w=>w.id==='alarmHandling')?.visible" />
          <AlarmHandlingTypes v-if="rightWidgets.find(w=>w.id==='alarmTypes')?.visible" />
          <EventHandling      v-if="rightWidgets.find(w=>w.id==='events')?.visible" />
        </section>
      </template>

      <!-- ─── Widget Settings panel (edit mode) ─── -->
      <template v-else>
        <section class="widget-settings">
          <div class="ws-header">
            <svg class="ws-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span class="ws-title">WIDGET SETTINGS</span>
          </div>

          <div class="ws-list">
            <div
              v-for="w in allWidgets"
              :key="w.id"
              class="ws-item"
              :class="{ 'ws-on': isVisibleById(w.id) }"
              @click="toggleById(w.id)"
            >
              <div class="ws-check">
                <svg v-if="isVisibleById(w.id)" viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div class="ws-info">
                <span class="ws-name">{{ w.label }}</span>
                <span class="ws-desc">{{ w.desc }}</span>
              </div>
            </div>
          </div>

          <div class="ws-footer">
            <button class="ws-btn add" type="button">
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Add Widget
            </button>
            <button class="ws-btn reset" type="button" @click="resetAll">
              Reset All
            </button>
            <button class="ws-btn exit" type="button" @click="saveEdit">
              Exit Setup
            </button>
          </div>
        </section>
      </template>

    </main>
  </div>
</template>

<style scoped lang="scss">
/* ─── Root ─── */
.occ-root {
  --c-bg:   #020b1c;
  --c-bg2:  #060f22;
  --c-line: rgba(92, 149, 255, 0.22);
  --c-text: rgba(201, 222, 255, 0.78);
  --c-cyan: #60e0ff;

  width: 100%; height: 100%; min-height: 100%;
  position: relative; display: flex; flex-direction: column;
  padding: 8px; gap: 6px; overflow: hidden; color: #f4f8ff;
  background:
    radial-gradient(ellipse at 50% -10%, rgba(71, 125, 255, 0.22), transparent 42%),
    radial-gradient(ellipse at -5% 110%, rgba(41, 91, 255, 0.16), transparent 32%),
    radial-gradient(ellipse at 108% 108%, rgba(71, 202, 255, 0.14), transparent 30%),
    linear-gradient(175deg, var(--c-bg) 0%, var(--c-bg2) 100%);
}

/* ─── Background ─── */
.bg-glow {
  position: absolute; pointer-events: none; z-index: 0;
  border-radius: 50%; filter: blur(80px);
  &.top          { top: -120px; left: 50%; transform: translateX(-50%); width: 700px; height: 280px; background: radial-gradient(ellipse, rgba(71,139,255,.16), transparent 70%); }
  &.bottom-left  { bottom: -80px; left: -80px; width: 360px; height: 260px; background: radial-gradient(ellipse, rgba(41,91,255,.12), transparent 70%); }
  &.bottom-right { bottom: -80px; right: -80px; width: 320px; height: 240px; background: radial-gradient(ellipse, rgba(71,202,255,.10), transparent 70%); }
}
.screen-noise { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.border-frame {
  position: absolute; inset: 8px;
  border: 1px solid rgba(108,161,255,.16); border-radius: 14px;
  box-shadow: 0 0 30px rgba(74,139,248,.1), inset 0 0 30px rgba(74,139,248,.05);
  pointer-events: none; z-index: 0;
}
.edge-scan {
  position: absolute; inset: 8px; border-radius: 14px;
  pointer-events: none; z-index: 1; overflow: hidden;
  &::before {
    content: ''; position: absolute; top: -1px; left: -20%; width: 40%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(100,180,255,.9), transparent);
    box-shadow: 0 0 18px rgba(100,180,255,.8);
    animation: edgeSweep 6s linear infinite;
  }
}
@keyframes edgeSweep {
  0%   { left: -40%; opacity: 0; }
  8%   { opacity: 1; }
  92%  { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}

/* ─── Header ─── */
.top-shell {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center; gap: 12px;
  flex-shrink: 0;
}
/* horizontal row: date | separator | status dots */
.top-left-group {
  justify-self: start;
  display: flex; flex-direction: row; align-items: center; gap: 8px;
}
.top-date {
  padding: 6px 14px; color: #d6e6ff; font-size: 12px; letter-spacing: .04em;
  border: 1px solid var(--c-line); border-radius: 10px; font-family: 'Consolas', monospace;
  white-space: nowrap;
  background: linear-gradient(180deg, rgba(10,20,42,.95), rgba(6,13,30,.95)), linear-gradient(90deg, rgba(80,129,255,.1), transparent);
  box-shadow: inset 0 0 20px rgba(69,132,255,.06), 0 0 0 1px rgba(108,161,255,.06);
}
.sys-status {
  display: flex; align-items: center; gap: 6px; padding: 4px 10px;
  border: 1px solid var(--c-line); border-radius: 8px;
  background: rgba(6,13,30,.8); backdrop-filter: blur(4px);
}
.sys-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  &.active  { background: #4cffb8; box-shadow: 0 0 8px #4cffb8; animation: blink 2s ease-in-out infinite; }
  &.warning { background: #ffc859; box-shadow: 0 0 8px #ffc859; animation: blink 1.4s ease-in-out infinite; }
}
@keyframes blink { 50% { opacity: .35; } }
.sys-sep   { width: 1px; height: 12px; background: var(--c-line); margin: 0 4px; }
.sys-label { font-size: 9.5px; letter-spacing: .1em; color: var(--c-text); font-family: 'Consolas', monospace; text-transform: uppercase; }

.top-title  { position: relative; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 4px 8px; width: 360px; max-width: 100%; justify-self: center; }
.title-inner { display: flex; flex-direction: column; align-items: center; gap: 2px; max-width: 240px; }
.top-title h1 {
  margin: 0; font-size: clamp(16px, 1.2vw, 22px); font-weight: 600;
  letter-spacing: .05em; white-space: nowrap; color: #eaf3ff;
  text-shadow: 0 0 30px rgba(116,180,255,.45), 0 0 60px rgba(116,180,255,.2);
}
.title-sub {
  display: flex; align-items: center; gap: 8px;
  font-size: 8px; letter-spacing: .16em; color: rgba(180,214,255,.55);
  font-family: 'Consolas', monospace; text-transform: uppercase;
}
.title-sub-dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--c-cyan); box-shadow: 0 0 6px var(--c-cyan);
  flex-shrink: 0; animation: blink 3s ease-in-out infinite;
}
.wedge {
  width: 34px; height: 18px; opacity: .9; flex-shrink: 0;
  border-top: 1px solid rgba(124,176,255,.44);
  border-bottom: 1px solid rgba(124,176,255,.12);
  background: linear-gradient(90deg, transparent 0%, rgba(73,129,255,.22) 40%, transparent 100%);
  clip-path: polygon(0 100%, 8% 0, 100% 0, 92% 100%);
}

.top-actions { justify-self: end; display: flex; align-items: center; gap: 8px; }
.top-action {
  width: 36px; height: 36px;
  display: grid; place-items: center;
  border-radius: 9px; border: 1px solid var(--c-line);
  background: linear-gradient(180deg, rgba(12,22,46,.94), rgba(7,14,32,.94));
  color: #c8e0ff;
  box-shadow: inset 0 0 16px rgba(73,129,255,.08), 0 0 0 1px rgba(108,161,255,.06);
  font-size: 15px; transition: all .18s ease;
  &:hover { border-color: rgba(143,210,255,.5); color: #eaf3ff; background: linear-gradient(180deg, rgba(47,108,255,.28), rgba(12,22,46,.94)); }
  &.active { border-color: rgba(96,224,255,.5); color: var(--c-cyan); }
}
.action-btn {
  cursor: pointer; outline: none;
  svg { width: 15px; height: 15px; stroke: currentColor; stroke-width: 1.8; fill: none; stroke-linecap: round; stroke-linejoin: round; }
}
.save-btn {
  display: flex !important; align-items: center; gap: 6px;
  width: auto !important; padding: 0 16px;
  cursor: pointer; outline: none;
  font-size: 12.5px; font-weight: 600; letter-spacing: .06em;
  color: #060f22 !important;
  background: linear-gradient(135deg, #5b9bff, #60e0ff) !important;
  border-color: transparent !important;
  box-shadow: 0 0 16px rgba(96,224,255,.35) !important;
  &:hover { filter: brightness(1.1); box-shadow: 0 0 24px rgba(96,224,255,.55) !important; }
  svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; color: #060f22; }
}

/* ─── Drag banner ─── */
.drag-banner {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 5px 20px;
  background: rgba(71,139,255,.12);
  border: 1px dashed rgba(96,224,255,.35);
  border-radius: 10px; color: rgba(180,220,255,.8);
  font-size: 12px; letter-spacing: .08em;
  animation: bannerPulse 3s ease-in-out infinite;
  svg { width: 16px; height: 16px; stroke: var(--c-cyan); stroke-width: 1.6; fill: none; stroke-linecap: round; stroke-linejoin: round; }
}
@keyframes bannerPulse {
  0%, 100% { border-color: rgba(96,224,255,.35); background: rgba(71,139,255,.12); }
  50%       { border-color: rgba(96,224,255,.55); background: rgba(71,139,255,.18); }
}

/* ─── Main grid ─── */
.dashboard-grid {
  position: relative; z-index: 2; flex: 1; min-height: 0;
  display: grid;
  grid-template-columns: minmax(248px, 0.84fr) minmax(560px, 1.62fr) minmax(236px, 0.74fr);
  gap: 8px;
}
/* Edit mode: shrink right area for settings panel */
.edit-mode .dashboard-grid {
  grid-template-columns: minmax(238px, 0.82fr) minmax(540px, 1.58fr) 264px;
}

/* ─── Columns ─── */
.left-column, .right-column {
  min-width: 0; min-height: 0; display: grid; gap: 8px;
}
.left-column  { grid-template-rows: 1.52fr .84fr .88fr; }
/* right: 4 panels — give more even share, last two panels get enough room */
.right-column { grid-template-rows: 1.08fr .86fr .72fr .92fr; }

.center-column {
  min-width: 0; min-height: 0; display: grid; gap: 8px;
  grid-template-rows: minmax(0, 1fr) 165px;
}

/* In edit mode columns become flex so draggable can reorder freely */
.edit-mode .left-column,
.edit-mode .center-column {
  display: flex; flex-direction: column;
  grid-template-rows: unset;
}

/* ─── Widget slot ─── */
/* Normal mode: slot is transparent — its child participates directly in the parent grid */
.widget-slot {
  display: contents;
}

/* Edit mode: slot becomes a real flex item so draggable can reorder */
.edit-mode .left-column .widget-slot,
.edit-mode .center-column .widget-slot {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  min-height: 0;
  transition: opacity .2s;
}

/* map slot gets more flex space in edit mode */
.edit-mode .center-column .slot-map { flex: 2.2; }

/* drag handle */
.drag-handle {
  position: absolute; top: 8px; right: 8px; z-index: 20;
  width: 28px; height: 28px; display: grid; place-items: center;
  background: rgba(7,14,32,.85); border: 1px solid rgba(97,151,255,.3);
  border-radius: 7px; cursor: grab; color: #8eb8ff;
  backdrop-filter: blur(4px); transition: all .15s;
  &:hover { background: rgba(47,108,255,.25); border-color: rgba(96,224,255,.5); color: #eaf3ff; }
  &:active { cursor: grabbing; }
  svg { width: 14px; height: 14px; fill: currentColor; stroke: none; }
}

/* drag ghost / chosen states */
:deep(.drag-ghost) {
  opacity: .35;
  background: rgba(71,139,255,.08) !important;
  border: 1px dashed rgba(96,224,255,.4) !important;
  border-radius: 14px;
}
:deep(.drag-chosen) {
  outline: 2px solid rgba(96,224,255,.5);
  outline-offset: -2px;
  border-radius: 14px;
}
:deep(.drag-dragging) {
  opacity: .92;
  box-shadow: 0 8px 40px rgba(71,139,255,.35), 0 0 0 2px rgba(96,224,255,.4) !important;
  border-radius: 14px;
}

/* edit mode panel highlight on hover */
.edit-mode .widget-slot:hover > :not(.drag-handle):not(.widget-label-overlay) {
  outline: 1px solid rgba(96,224,255,.25);
  outline-offset: -1px;
  border-radius: 14px;
}

/* hidden widget placeholder */
.widget-hidden { opacity: .45; }
.widget-hidden-placeholder {
  flex: 1; min-height: 80px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  border: 1px dashed rgba(97,151,255,.22); border-radius: 14px;
  color: rgba(180,210,255,.35); font-size: 11px; letter-spacing: .06em;
  svg { width: 22px; height: 22px; stroke: currentColor; stroke-width: 1.4; fill: none; stroke-linecap: round; }
}

/* widget label overlay (edit mode) */
.widget-label-overlay {
  position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
  z-index: 15; pointer-events: none;
  font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
  color: rgba(180,220,255,.7); font-family: 'Consolas', monospace;
  background: rgba(3,8,22,.65); border: 1px solid rgba(97,151,255,.18);
  padding: 3px 10px; border-radius: 4px; backdrop-filter: blur(4px);
  white-space: nowrap;
}

/* ─── Map stage ─── */
.map-stage {
  position: relative; flex: 1; min-height: 0; height: 100%;
  overflow: hidden; border-radius: 14px;
  border: 1px solid rgba(97,151,255,.26);
  box-shadow: 0 0 0 1px rgba(145,194,255,.06), inset 0 0 30px rgba(47,108,255,.08), 0 16px 40px rgba(0,0,0,.36);
  &::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; z-index: 10;
    background: linear-gradient(90deg, transparent, rgba(100,180,255,.5) 30%, rgba(96,224,255,.8) 50%, rgba(100,180,255,.5) 70%, transparent);
    box-shadow: 0 0 14px rgba(96,224,255,.4); pointer-events: none;
  }
}
.floating-overview {
  position: absolute; top: 14px; left: 16px; z-index: 20; width: min(248px, 34%);
}

/* ─── Widget Settings panel ─── */
.widget-settings {
  display: flex; flex-direction: column;
  background:
    linear-gradient(180deg, rgba(6,14,34,.98), rgba(4,9,24,.99)),
    radial-gradient(circle at top right, rgba(71,139,255,.1), transparent 50%);
  border: 1px solid rgba(97,151,255,.22); border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0,0,0,.3), inset 0 0 20px rgba(71,139,255,.04);
  min-height: 0;
}

.ws-header {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid rgba(97,151,255,.14);
  background: linear-gradient(90deg, rgba(71,139,255,.1), transparent);
  flex-shrink: 0;
}
.ws-icon {
  width: 16px; height: 16px; flex-shrink: 0;
  stroke: none; fill: rgba(100,180,255,.6);
}
.ws-title {
  font-size: 11px; font-weight: 700; letter-spacing: .16em;
  color: #dceeff; text-transform: uppercase;
}

.ws-list {
  flex: 1; overflow-y: auto; padding: 8px;
  scrollbar-width: thin; scrollbar-color: rgba(97,151,255,.2) transparent;
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb { background: rgba(97,151,255,.22); border-radius: 3px; }
}

.ws-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 8px; cursor: pointer;
  transition: background .15s, border-color .15s;
  border: 1px solid transparent;
  & + .ws-item { margin-top: 3px; }
  &:hover { background: rgba(12,24,52,.7); border-color: rgba(97,151,255,.14); }
  &.ws-on .ws-check { background: rgba(91,155,255,.22); border-color: rgba(96,224,255,.5); }
}

.ws-check {
  width: 16px; height: 16px; flex-shrink: 0;
  display: grid; place-items: center;
  border: 1px solid rgba(97,151,255,.3); border-radius: 4px;
  background: rgba(7,14,32,.7); transition: all .18s;
  svg { width: 10px; height: 10px; stroke: #60e0ff; stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }
}

.ws-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ws-name { font-size: 11.5px; font-weight: 500; color: #dceeff; letter-spacing: .02em; }
.ws-desc { font-size: 9.5px; color: rgba(180,210,255,.42); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.ws-footer {
  display: flex; flex-direction: column; gap: 6px;
  padding: 10px 10px 12px;
  border-top: 1px solid rgba(97,151,255,.14); flex-shrink: 0;
}
.ws-btn {
  width: 100%; padding: 8px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  font-size: 11.5px; font-weight: 500; letter-spacing: .06em; cursor: pointer;
  transition: all .18s;
  svg { width: 13px; height: 13px; stroke: currentColor; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
  &.add {
    border: 1px solid rgba(97,151,255,.28); color: #8eb8ff;
    background: rgba(7,14,32,.8);
    &:hover { border-color: rgba(143,210,255,.5); color: #eaf3ff; background: rgba(47,108,255,.18); }
  }
  &.reset {
    border: 1px solid rgba(97,151,255,.16); color: rgba(180,210,255,.55);
    background: transparent;
    &:hover { color: #eaf3ff; border-color: rgba(97,151,255,.3); }
  }
  &.exit {
    border: 1px solid rgba(96,224,255,.35); color: #060f22;
    background: linear-gradient(135deg, #5b9bff, #60e0ff);
    box-shadow: 0 0 14px rgba(96,224,255,.3);
    &:hover { box-shadow: 0 0 20px rgba(96,224,255,.5); filter: brightness(1.08); }
  }
}

/* ─── Responsive ─── */
@media (max-width: 1680px) {
  .dashboard-grid { grid-template-columns: minmax(236px, .82fr) minmax(500px, 1.5fr) minmax(226px, .72fr); }
  .edit-mode .dashboard-grid { grid-template-columns: minmax(228px, .8fr) minmax(488px, 1.48fr) 252px; }
}
@media (max-width: 1440px) {
  .dashboard-grid { grid-template-columns: minmax(224px, .8fr) minmax(420px, 1.42fr) minmax(214px, .68fr); }
  .edit-mode .dashboard-grid { grid-template-columns: minmax(218px, .78fr) minmax(410px, 1.38fr) 242px; }
}
@media (max-width: 1360px) {
  .occ-root { overflow: auto; }
  .dashboard-grid, .edit-mode .dashboard-grid { min-height: 1380px; grid-template-columns: 1fr; }
  .left-column  { grid-template-rows: none; grid-auto-rows: minmax(200px, auto); }
  .center-column { grid-template-rows: none; grid-auto-rows: minmax(200px, auto); }
  .right-column  { grid-template-rows: none; grid-auto-rows: minmax(160px, auto); }
  .map-stage { min-height: 420px; }
  .widget-settings { min-height: 400px; }
}
@media (max-width: 920px) {
  .top-shell { grid-template-columns: 1fr; }
  .top-left-group { flex-wrap: wrap; }
  .top-title, .top-actions { justify-self: stretch; }
  .top-actions { justify-content: flex-end; }
}
</style>
