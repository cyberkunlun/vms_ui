<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import OmanMap from './OmanMap.vue'
import AlertInformation from './AlertInformation.vue'
import ResourceOverview from './ResourceOverview.vue'
import WeeklyTrends from './WeeklyTrends.vue'
import LiveCameraFeeds from './LiveCameraFeeds.vue'
import StormWarning from './StormWarning.vue'
import AlarmHandling from './AlarmHandling.vue'

/* ─── Clock ─── */
const clockTime = ref('--:--:--')
const clockDate = ref('')
const updateClock = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  clockTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  clockDate.value = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}  •  Muscat (GMT+4)`
}

/* ─── Stat cards ─── */
const statCards = [
  { label: 'Online Devices', value: '2,356',  color: '#22d3ee', type: 'camera' },
  { label: 'Active Alarms',  value: '196.6 K', color: '#f59e0b', type: 'bell' },
  { label: 'Active Alerts',  value: '156',     color: '#ef4444', type: 'alert' },
  { label: 'AI Warnings',    value: '28',      color: '#8b5cf6', type: 'ai' },
]

/* ─── Today's summary ─── */
const summaryItems = [
  { label: 'Captures',        value: '196.6 K', color: '#22d3ee', type: 'camera' },
  { label: 'AI Warnings',     value: '28',      color: '#8b5cf6', type: 'ai' },
  { label: 'Resolved Alerts', value: '104',     color: '#22c55e', type: 'shield' },
  { label: 'Pending',         value: '52',      color: '#f59e0b', type: 'clock' },
]

/* ─── Alert trend chart ─── */
const trendRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null

const initTrend = () => {
  if (!trendRef.value) return
  trendChart = echarts.init(trendRef.value)
  trendChart.setOption({
    grid: { top: 20, left: 32, right: 14, bottom: 20 },
    legend: {
      right: 8, top: 2, itemWidth: 14, itemHeight: 2,
      data: ['Face', 'Vehicle', 'Other'],
      textStyle: { color: 'rgba(180,211,255,0.6)', fontSize: 10 }
    },
    xAxis: {
      type: 'category',
      data: ['May 2','May 3','May 4','May 5','May 6','May 7','May 8'],
      axisLabel: { color: 'rgba(180,211,255,0.5)', fontSize: 9 },
      axisLine: { lineStyle: { color: 'rgba(111,166,255,0.12)' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'rgba(180,211,255,0.45)', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(111,166,255,0.1)', type: 'dashed' } },
      axisLine: { show: false }, axisTick: { show: false }
    },
    series: [
      { name: 'Face', type: 'line', smooth: true, symbolSize: 4, symbol: 'circle',
        data: [20,35,28,40,32,45,38],
        itemStyle: { color: '#22d3ee' }, lineStyle: { width: 1.5, color: '#22d3ee' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(34,211,238,0.2)'},{offset:1,color:'rgba(34,211,238,0)'}]) }
      },
      { name: 'Vehicle', type: 'line', smooth: true, symbolSize: 4, symbol: 'circle',
        data: [15,22,18,30,25,35,28],
        itemStyle: { color: '#f59e0b' }, lineStyle: { width: 1.5, color: '#f59e0b' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(245,158,11,0.15)'},{offset:1,color:'rgba(245,158,11,0)'}]) }
      },
      { name: 'Other', type: 'line', smooth: true, symbolSize: 4, symbol: 'circle',
        data: [8,12,15,10,18,14,20],
        itemStyle: { color: '#a78bfa' }, lineStyle: { width: 1.5, color: '#a78bfa' }
      }
    ]
  })
}

/* ─── Fullscreen ─── */
const rootRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)
const onFsChange = () => { isFullscreen.value = !!document.fullscreenElement }
const toggleFullscreen = async () => {
  const el = rootRef.value
  if (!el) return
  document.fullscreenElement ? await document.exitFullscreen() : await el.requestFullscreen()
}

const resize = () => trendChart?.resize()

let clockTimer: number
onMounted(() => {
  updateClock()
  clockTimer = window.setInterval(updateClock, 1000)
  initTrend()
  window.addEventListener('resize', resize)
  document.addEventListener('fullscreenchange', onFsChange)
})
onBeforeUnmount(() => {
  clearInterval(clockTimer)
  trendChart?.dispose()
  window.removeEventListener('resize', resize)
  document.removeEventListener('fullscreenchange', onFsChange)
})
</script>

<template>
  <div class="dash-root" ref="rootRef" :class="{ fullscreen: isFullscreen }">

    <!-- ─── Nav bar ─── -->
    <nav class="nav-bar">
      <div class="nav-brand">Dashboard</div>
      <div class="nav-actions">
        <button class="nav-icon-btn" title="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="nav-badge">3</span>
        </button>
        <button class="nav-icon-btn" title="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.1 12c0-.36-.03-.72-.08-1.06l2.29-1.79a.5.5 0 0 0 .12-.64l-2.17-3.76a.5.5 0 0 0-.61-.22l-2.7 1.09a7.9 7.9 0 0 0-1.82-1.06l-.41-2.87A.49.49 0 0 0 13.25 2h-2.5a.49.49 0 0 0-.49.42l-.41 2.87a7.9 7.9 0 0 0-1.82 1.06L5.33 5.26a.5.5 0 0 0-.61.22L2.55 9.24a.49.49 0 0 0 .12.64l2.29 1.79A8.2 8.2 0 0 0 4.88 12c0 .36.03.72.08 1.06l-2.29 1.79a.5.5 0 0 0-.12.64l2.17 3.76c.13.23.4.32.61.22l2.7-1.09c.56.41 1.17.75 1.82 1.06l.41 2.87c.06.24.27.42.49.42h2.5c.22 0 .43-.18.49-.42l.41-2.87a7.9 7.9 0 0 0 1.82-1.06l2.7 1.09c.21.09.48 0 .61-.22l2.17-3.76a.49.49 0 0 0-.12-.64L19.18 13.06c.05-.34.08-.7.08-1.06z"/>
          </svg>
        </button>
        <button class="nav-icon-btn" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'" @click="toggleFullscreen">
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H4v4M16 3h4v4M8 21H4v-4M20 21h-4v-4"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5"/>
          </svg>
        </button>
        <div class="nav-avatar">A</div>
      </div>
    </nav>

    <!-- ─── Main grid ─── -->
    <div class="main-grid">

      <!-- Left column -->
      <section class="col-left">
        <AlertInformation />
        <ResourceOverview />
      </section>

      <!-- Center map with floating info bar -->
      <section class="col-center">
        <OmanMap />
        <!-- Floating bar: clock + stat cards -->
        <div class="map-float-bar">
          <div class="float-clock">
            <div class="float-time">{{ clockTime }}</div>
            <div class="float-date">{{ clockDate }}</div>
          </div>
          <div v-for="card in statCards" :key="card.label" class="float-stat">
            <div class="float-stat-icon" :style="{ color: card.color, background: card.color + '18', borderColor: card.color + '44' }">
              <svg v-if="card.type === 'camera'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
              <svg v-else-if="card.type === 'bell'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <svg v-else-if="card.type === 'alert'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div class="float-stat-info">
              <div class="float-stat-value" :style="{ color: card.color }">{{ card.value }}</div>
              <div class="float-stat-label">{{ card.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Right column -->
      <section class="col-right">
        <StormWarning />
        <LiveCameraFeeds />
      </section>

    </div>

    <!-- ─── Bottom bar ─── -->
    <div class="bottom-bar">

      <!-- 1. Trends (24h) -->
      <WeeklyTrends />

      <!-- 2. Today's Summary -->
      <div class="bottom-panel">
        <div class="bp-header">
          <span class="bp-knot"></span>
          <span class="bp-title">TODAY'S SUMMARY</span>
        </div>
        <div class="summary-cards">
          <div v-for="item in summaryItems" :key="item.label" class="sum-card">
            <div class="sum-icon" :style="{ color: item.color, borderColor: item.color + '44', background: item.color + '18' }">
              <svg v-if="item.type === 'camera'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
              <svg v-else-if="item.type === 'ai'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <svg v-else-if="item.type === 'shield'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <div class="sum-value" :style="{ color: item.color }">{{ item.value }}</div>
              <div class="sum-label">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Alert Trend -->
      <div class="bottom-panel">
        <div class="bp-header">
          <span class="bp-knot"></span>
          <span class="bp-title">ALERT TREND</span>
          <span class="bp-badge">Last 7 Days</span>
        </div>
        <div class="trend-chart" ref="trendRef"></div>
      </div>

      <!-- 4. Quick Actions -->
      <AlarmHandling />

    </div>
  </div>
</template>

<style scoped lang="scss">
/* ─── Root ─── */
.dash-root {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  gap: 6px; padding: 8px;
  overflow: hidden; color: #f4f8ff;
  background:
    radial-gradient(ellipse at 50% -10%, rgba(71,125,255,0.22), transparent 42%),
    radial-gradient(ellipse at -5% 110%, rgba(41,91,255,0.16), transparent 32%),
    radial-gradient(ellipse at 108% 108%, rgba(71,202,255,0.14), transparent 30%),
    linear-gradient(175deg, #020b1c 0%, #060f22 100%);
}

/* ─── Nav bar ─── */
.nav-bar {
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 14px; height: 38px;
  background: rgba(6,14,34,0.85);
  border: 1px solid rgba(97,151,255,0.2);
  border-radius: 10px;
  backdrop-filter: blur(8px);
}
.nav-brand {
  font-size: 15px; font-weight: 700; color: #edf5ff;
  letter-spacing: 0.06em; flex-shrink: 0;
}
.nav-actions { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
.nav-icon-btn {
  position: relative;
  width: 30px; height: 30px;
  display: grid; place-items: center;
  border-radius: 8px; border: 1px solid rgba(97,151,255,0.2);
  background: rgba(7,14,32,0.7); color: #94b8e0;
  cursor: pointer; outline: none;
  transition: all 0.15s;
  svg { width: 14px; height: 14px; }
  &:hover { border-color: rgba(96,224,255,0.4); color: #dceeff; }
}
.nav-badge {
  position: absolute; top: -4px; right: -4px;
  background: #ef4444; color: #fff;
  font-size: 9px; font-weight: 700;
  min-width: 14px; height: 14px;
  border-radius: 7px; padding: 0 3px;
  display: flex; align-items: center; justify-content: center;
}
.nav-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, #5b9bff, #60e0ff);
  display: flex; align-items: center; justify-content: center;
  color: #020b1c; font-weight: 700; font-size: 13px; cursor: pointer;
}

/* ─── Map floating bar ─── */
.col-center { position: relative; }
.map-float-bar {
  position: absolute; top: 10px; left: 10px; right: 10px;
  z-index: 20;
  display: flex; align-items: center; gap: 8px;
  pointer-events: none;
}
.float-clock {
  flex-shrink: 0;
  padding: 5px 12px;
  background: rgba(4,9,24,0.78);
  border: 1px solid rgba(97,151,255,0.28);
  border-radius: 9px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 16px rgba(0,0,0,0.35);
}
.float-time {
  font-size: 20px; font-weight: 700; font-family: 'Consolas', monospace;
  color: #edf5ff; line-height: 1;
  text-shadow: 0 0 16px rgba(96,224,255,0.3);
  letter-spacing: 0.05em;
}
.float-date {
  font-size: 9px; color: rgba(180,211,255,0.5);
  font-family: 'Consolas', monospace; margin-top: 2px;
}
.float-stat {
  display: flex; align-items: center; gap: 7px;
  padding: 5px 10px;
  background: rgba(4,9,24,0.78);
  border: 1px solid rgba(97,151,255,0.22);
  border-radius: 9px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  flex-shrink: 0;
}
.float-stat-icon {
  width: 26px; height: 26px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid; flex-shrink: 0;
  svg { width: 12px; height: 12px; }
}
.float-stat-info { min-width: 0; }
.float-stat-value { font-size: 16px; font-weight: 700; font-family: 'Consolas', monospace; line-height: 1; }
.float-stat-label { font-size: 8.5px; color: rgba(180,211,255,0.48); margin-top: 1px; white-space: nowrap; }

/* ─── Main grid ─── */
.main-grid {
  flex: 1; min-height: 0;
  display: grid;
  grid-template-columns: minmax(200px, 0.78fr) minmax(380px, 1.60fr) minmax(220px, 0.92fr);
  gap: 6px;
}

/* ─── Columns ─── */
.col-left, .col-right {
  display: flex; flex-direction: column; gap: 6px; min-height: 0;
}
.col-center {
  min-height: 0; border-radius: 14px; overflow: hidden;
  border: 1px solid rgba(97,151,255,0.26);
  box-shadow: 0 0 30px rgba(47,108,255,0.1), inset 0 0 24px rgba(47,108,255,0.06);
}

/* Left: 2 flex panels */
.col-left {
  > :nth-child(1) { flex: 2.5; min-height: 0; }
  > :nth-child(2) { flex: 1.5; min-height: 0; }
}
/* Right: 2 flex panels */
.col-right {
  > :nth-child(1) { flex: 1.2; min-height: 0; }
  > :nth-child(2) { flex: 1.8; min-height: 0; }
}


/* ─── Bottom bar ─── */
.bottom-bar {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  height: 136px;
}
.bottom-panel {
  display: flex; flex-direction: column;
  background: rgba(7,14,32,0.72);
  border: 1px solid rgba(97,151,255,0.18);
  border-radius: 10px;
  padding: 8px 10px;
  overflow: hidden;
}
.bp-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 6px; flex-shrink: 0;
}
.bp-knot {
  width: 7px; height: 7px;
  border: 1px solid rgba(178,219,255,0.8);
  transform: rotate(45deg);
  background: rgba(90,150,255,0.18);
  box-shadow: 0 0 8px rgba(120,177,255,0.5);
  flex-shrink: 0;
}
.bp-title {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.14em; color: #dceeff; text-transform: uppercase;
}
.bp-badge {
  font-size: 9px; color: #8fd2ff;
  padding: 1px 7px;
  border: 1px solid rgba(143,210,255,0.25);
  border-radius: 8px; font-family: 'Consolas', monospace;
}

/* Summary cards — 2×2 grid to fit the narrower panel */
.summary-cards {
  flex: 1; min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 4px;
}
.sum-card {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 7px;
  background: rgba(4,9,24,0.55);
  border: 1px solid rgba(97,151,255,0.12);
  border-radius: 7px;
}
.sum-icon {
  width: 22px; height: 22px; border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid; flex-shrink: 0;
  svg { width: 11px; height: 11px; }
}
.sum-value { font-size: 13px; font-weight: 700; font-family: 'Consolas', monospace; line-height: 1; }
.sum-label { font-size: 8.5px; color: rgba(180,211,255,0.5); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Trend chart */
.trend-chart { flex: 1; min-height: 0; width: 100%; }

/* ─── Responsive ─── */
@media (max-width: 1600px) {
  .main-grid { grid-template-columns: minmax(190px, 0.76fr) minmax(340px, 1.55fr) minmax(210px, 0.9fr); }
  .nav-tab { font-size: 10px; padding: 3px 7px; }
}
@media (max-width: 1440px) {
  .main-grid { grid-template-columns: minmax(180px, 0.74fr) minmax(300px, 1.5fr) minmax(200px, 0.88fr); }
}
</style>
