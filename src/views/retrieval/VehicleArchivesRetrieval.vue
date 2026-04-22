<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Van, User, Link, Odometer } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import OlMapView from './components/OlMapView.vue'
import { mockVehicleArchive } from './data/mockRetrieval'
import { useClientPagination } from './composables/useClientPagination'

const canOwner = ref(true)
const canRelations = ref(true)
const plate = ref('SH A D12K1')
const data = ref<ReturnType<typeof mockVehicleArchive> | null>(null)

const trackList = computed(() => data.value?.trackPoints ?? [])
const lairRows = computed(() => data.value?.lairs ?? [])

const { page, pageSize, total: trackTotal, pagedItems: pagedTrack, resetPage: resetTrk } = useClientPagination(
  trackList,
  6
)
const {
  page: lairPage,
  pageSize: lairSize,
  total: lairListTotal,
  pagedItems: pagedLairs,
  resetPage: resetLair
} = useClientPagination(lairRows, 5)

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const run = () => {
  if (!plate.value.trim()) {
    ElMessage.warning('Enter a license plate')
    return
  }
  data.value = mockVehicleArchive()
  resetTrk()
  resetLair()
  if (data.value.plate !== plate.value.trim()) {
    ElMessage.info('Sample data is fixed; view refreshed (mock trigger)')
  }
  nextTick(() => renderChart())
}

const renderChart = () => {
  if (!chartRef.value || !data.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  const lairs = data.value.lairs
  chart.setOption({
    backgroundColor: 'transparent',
    grid: { left: 12, right: 12, top: 28, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: lairs.map((x) => (x.name.length > 20 ? x.name.slice(0, 18) + '…' : x.name)),
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 10, rotate: 20 }
    },
    yAxis: {
      type: 'value',
      name: 'Weight',
      nameTextStyle: { color: '#64748b', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)' } },
      axisLabel: { color: '#94a3b8' }
    },
    series: [
      {
        name: 'Lair weight',
        type: 'bar',
        data: lairs.map((x) => x.weight),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#38bdf8' },
            { offset: 1, color: 'rgba(14, 165, 233, 0.2)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  })
}

onMounted(() => {
  run()
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
function onResize() {
  chart?.resize()
}
</script>

<template>
  <div class="ret-page">
    <header class="ret-hero">
      <div>
        <h1>Vehicle — archive search</h1>
        <p>
          Search by plate for track, registered owner, relations, and <strong>lair statistics</strong> (aggregated from pass &amp;
          parking). Chart and map are mock.
        </p>
      </div>
      <div class="perm-bar">
        <span class="label">Permissions</span>
        <el-switch v-model="canOwner" active-text="Owner" />
        <el-switch v-model="canRelations" active-text="Links" />
      </div>
    </header>

    <div class="ret-panel" style="max-width: 480px; margin-bottom: 16px">
      <h2>
        <el-icon><Search /></el-icon> Query
      </h2>
      <el-form size="small" label-position="top">
        <el-form-item label="License plate">
          <el-input v-model="plate" placeholder="e.g. SH A D12K1" clearable style="max-width: 360px" @keyup.enter="run" />
        </el-form-item>
      </el-form>
      <div class="ret-actions" style="margin-top: 0">
        <button type="button" class="btn-primary" @click="run">
          <el-icon><Search /></el-icon> Search dossier
        </button>
      </div>
    </div>

    <div v-if="data" class="va-grid">
      <div class="ret-panel">
        <h2>
          <el-icon><Van /></el-icon> Track
        </h2>
        <p class="ret-hint">Mock trail: <strong>{{ trackTotal }}</strong> LPR events — paged (first row = “last” reference).</p>
        <el-timeline>
          <el-timeline-item v-for="(t, i) in pagedTrack" :key="t.t + '-' + i" :timestamp="t.t">
            {{ t.place }}
          </el-timeline-item>
        </el-timeline>
        <div class="ret-pagination" style="margin: 8px 0 12px">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="trackTotal"
            :page-sizes="[6, 10, 16]"
            size="small"
            background
            layout="total, sizes, prev, pager, next"
          />
        </div>
        <h2 style="margin: 16px 0 8px; font-size: 13px; color: #94a3b8">Map (OpenLayers)</h2>
        <div class="map-box" style="height: 220px">
          <OlMapView :lon-lat="data.trackPoints[0]?.lonLat" label="Last seen" />
        </div>
      </div>

      <div class="ret-panel">
        <h2>
          <el-icon><Odometer /></el-icon> Lair stats
        </h2>
        <p class="ret-hint">Top areas from pass + parking mock aggregation. Bar values are weights for the chart theme only.</p>
        <div ref="chartRef" class="echart-b"></div>
        <p class="ret-hint" style="margin-top: 0">Lair list: <strong>{{ lairListTotal }}</strong> — paged (chart uses full set).</p>
        <ul class="lair-list">
          <li v-for="(l, i) in pagedLairs" :key="l.name + i">
            <span class="idx">{{ (lairPage - 1) * lairSize + i + 1 }}</span>
            <div>
              <div class="name">{{ l.name }}</div>
              <div class="cnt">{{ l.count }} · w {{ l.weight.toFixed(1) }}</div>
            </div>
          </li>
        </ul>
        <div class="ret-pagination" style="margin-top: 8px">
          <el-pagination
            v-model:current-page="lairPage"
            v-model:page-size="lairSize"
            :total="lairListTotal"
            :page-sizes="[5, 8, 12]"
            size="small"
            background
            layout="total, sizes, prev, pager, next"
          />
        </div>
      </div>

      <div class="ret-panel">
        <h2>
          <el-icon><User /></el-icon> Owner
        </h2>
        <div v-if="canOwner" class="attr-grid">
          <div class="attr-row" style="grid-column: 1 / -1">
            <span class="k">Registered</span>
            <span class="v">{{ data.owner }} / {{ data.ownerMask }}</span>
          </div>
          <div
            v-for="(s, si) in data.passStats ?? []"
            :key="si"
            class="attr-row"
            style="grid-column: 1 / -1"
          >
            <span class="k">{{ s.label }}</span>
            <span class="v">{{ s.value }}</span>
          </div>
        </div>
        <p v-else class="ret-hint">Owner masked; pass and lair remain for analysis.</p>

        <h2 v-if="canRelations" style="margin: 16px 0 8px; font-size: 13px; color: #94a3b8">
          <el-icon><Link /></el-icon> Vehicle links
        </h2>
        <div v-if="canRelations" class="attr-grid">
          <div v-for="(r, i) in data.relations" :key="i" class="attr-row" style="grid-column: 1 / -1; flex-direction: column; align-items: flex-start">
            <div>
              <el-tag type="info" size="small">{{ r.type }}</el-tag>
              <strong style="color: #e2e8f0; margin-left: 6px">{{ r.name }}</strong>
            </div>
            <div class="k" style="margin-top: 4px">{{ r.note }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './styles/retrieval-panel.scss' as *;
.va-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 1200px) {
  .va-grid {
    grid-template-columns: 1fr;
  }
}
.echart-b {
  width: 100%;
  height: 200px;
  border-radius: 10px;
  border: 1px solid #1f2937;
  background: rgba(15, 23, 42, 0.5);
}
.lair-list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  li {
    display: flex;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(31, 41, 55, 0.8);
    .idx {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .name {
      color: #e2e8f0;
      font-size: 13px;
    }
    .cnt {
      color: #64748b;
      font-size: 11px;
      margin-top: 2px;
    }
  }
}
:deep(.el-timeline-item__node) {
  background: #38bdf8;
}
.ret-pagination {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  :deep(.el-pagination) {
    --el-pagination-bg-color: #0f172a;
    --el-pagination-text-color: #94a3b8;
  }
  :deep(.el-pagination__total) {
    color: #94a3b8;
  }
}
</style>
