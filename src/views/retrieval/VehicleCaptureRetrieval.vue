<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Document, User, Link, View, Van } from '@element-plus/icons-vue'
import OlMapView from './components/OlMapView.vue'
import { mockVehicleResults, MOCK_TOTALS, type VehicleHit } from './data/mockRetrieval'
import { useClientPagination } from './composables/useClientPagination'

const canOwner = ref(true)
const canRelations = ref(true)
const canArchive = ref(true)

const plates = ref<string[]>(['SH A D12K1', '', ''])
const form = ref({
  brand: 'VW',
  color: 'White',
  country: 'CN',
  vehicleType: 'Sedan / small passenger',
  plateColor: 'Blue'
})

const results = ref<VehicleHit[]>([])
const activeId = ref<string | null>(null)
const loading = ref(false)

const { page, pageSize, total, pagedItems, resetPage } = useClientPagination(results, 8)

const active = computed(() => results.value.find((r) => r.id === activeId.value) ?? null)

const runSearch = () => {
  const list = plates.value.map((p) => p.trim()).filter(Boolean)
  if (!list.length) {
    ElMessage.warning('Enter at least one license plate')
    return
  }
  if (list.length > 3) {
    ElMessage.warning('Maximum 3 plates')
    return
  }
  loading.value = true
  setTimeout(() => {
    results.value = mockVehicleResults()
    resetPage()
    activeId.value = results.value[0]?.id ?? null
    loading.value = false
    ElMessage.success(`Vehicle retrieval (mock): ${MOCK_TOTALS.vehicle} hits`)
  }, 450)
}

const showOwner = (t: string) => (canOwner.value ? t : '****')

const openArchive = () => {
  if (!canArchive.value) {
    ElMessage.warning('No permission to open vehicle dossier')
    return
  }
  ElMessage.info('Open vehicle dossier (mock)')
}

const vehAttrRows = computed(() => {
  if (!active.value) return [] as { k: string; v: string }[]
  const a = active.value
  return [
    { k: 'Plate', v: a.plate },
    { k: 'Brand', v: a.brand },
    { k: 'Color', v: a.color },
    { k: 'Country', v: a.country },
    { k: 'Type', v: a.vehicleType },
    { k: 'Plate color', v: a.plateColor }
  ]
})
</script>

<template>
  <div class="ret-page">
    <header class="ret-hero">
      <div>
        <h1>Vehicle capture retrieval</h1>
        <p>
          Up to 3 plates and full vehicle attributes. Hits show pass image, crop, map and LPR fields; owner and relations appear when
          permitted.
        </p>
      </div>
      <div class="perm-bar">
        <span class="label">Permissions</span>
        <el-switch v-model="canOwner" active-text="Owner" />
        <el-switch v-model="canRelations" active-text="Relations" />
        <el-switch v-model="canArchive" active-text="Dossier" />
      </div>
    </header>

    <div class="ret-grid">
      <div class="ret-panel">
        <h2><el-icon><Van /></el-icon> Vehicle filters</h2>
        <p class="ret-hint">Multiple plates: OR (demo). Production would call vehicle data services.</p>

        <el-form label-position="top" size="small">
          <el-form-item v-for="(_p, i) in plates" :key="i" :label="'Plate ' + (i + 1) + ' (optional)'">
            <el-input v-model="plates[i]" placeholder="e.g. SH A D12K1" clearable />
          </el-form-item>
          <el-form-item label="Brand">
            <el-input v-model="form.brand" />
          </el-form-item>
          <el-form-item label="Body color">
            <el-input v-model="form.color" />
          </el-form-item>
          <el-form-item label="Country / reg.">
            <el-input v-model="form.country" />
          </el-form-item>
          <el-form-item label="Vehicle type">
            <el-select v-model="form.vehicleType" style="width: 100%">
              <el-option label="Sedan / small passenger" value="Sedan / small passenger" />
              <el-option label="Bus / large passenger" value="Bus / large passenger" />
              <el-option label="Truck" value="Truck" />
              <el-option label="Other" value="Other" />
            </el-select>
          </el-form-item>
          <el-form-item label="Plate color">
            <el-select v-model="form.plateColor" style="width: 100%">
              <el-option label="Blue" value="Blue" />
              <el-option label="Yellow" value="Yellow" />
              <el-option label="Green (new energy)" value="Green (new energy)" />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="ret-actions">
          <button type="button" class="btn-primary" :disabled="loading" @click="runSearch">
            <el-icon><Search /></el-icon> Search
          </button>
        </div>
      </div>

      <div class="ret-panel" style="min-height: 520px">
        <h2>Results &amp; detail</h2>
        <p v-if="!results.length" class="ret-hint">Run a search to load hits and detail.</p>

        <div v-else class="split-detail">
          <div>
            <p class="ret-hint" style="margin-top: 0">
              <strong>{{ total }}</strong> mock LPR events — use paginator to browse.
            </p>
            <div class="hit-list">
            <div
              v-for="h in pagedItems"
              :key="h.id"
              class="hit-card"
              :class="{ active: h.id === activeId }"
              @click="activeId = h.id"
            >
              <img :src="h.vehicleCropUrl" alt="" />
              <div class="hit-meta">
                <div class="id"><span class="badge badge-veh">Veh</span> {{ h.plate }}</div>
                <div class="sub">{{ h.time }} · {{ h.device }}</div>
              </div>
              <div class="score-pill">{{ h.score.toFixed(1) }}</div>
            </div>
            </div>
            <div class="ret-pagination">
              <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[8, 12, 16]"
                size="small"
                background
                layout="total, sizes, prev, pager, next, jumper"
              />
            </div>
          </div>

          <div v-if="active">
            <div class="panorama-box">
              <img :src="active.panoramaUrl" alt="Pass panorama" />
            </div>
            <h2 style="margin: 12px 0 8px; font-size: 13px; color: #94a3b8">
              <el-icon><View /></el-icon> Vehicle crop
            </h2>
            <img
              :src="active.vehicleCropUrl"
              alt=""
              style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 12px; border: 1px solid #1f2937"
            />
            <h2 style="margin: 12px 0 8px; font-size: 13px; color: #94a3b8">Map (OpenLayers)</h2>
            <div class="map-box">
              <OlMapView :lon-lat="active.lonLat" :label="active.address.slice(0, 16)" />
            </div>

            <h2 style="margin: 12px 0 8px; font-size: 13px; color: #94a3b8">LPR &amp; vehicle</h2>
            <div class="attr-grid">
              <div v-for="row in vehAttrRows" :key="row.k" class="attr-row">
                <span class="k">{{ row.k }}</span>
                <span class="v">{{ row.v }}</span>
              </div>
            </div>

            <h2 style="margin: 12px 0 8px; font-size: 13px; color: #94a3b8">
              <el-icon><User /></el-icon> Owner (policy)
            </h2>
            <div v-if="canOwner" class="attr-grid">
              <div class="attr-row">
                <span class="k">Name</span>
                <span class="v">{{ showOwner(active.ownerName) }}</span>
              </div>
              <div class="attr-row">
                <span class="k">ID</span>
                <span class="v">{{ showOwner(active.ownerIdMask) }}</span>
              </div>
              <div class="attr-row">
                <span class="k">Phone</span>
                <span class="v">{{ showOwner(active.ownerPhoneMask) }}</span>
              </div>
            </div>
            <p v-else class="ret-hint">Owner fields are masked; pass and vehicle attributes stay visible for triage.</p>

            <div v-if="canRelations" style="margin-top: 10px">
              <h2 style="margin: 0 0 8px; font-size: 13px; color: #94a3b8">
                <el-icon><Link /></el-icon> Owner links
              </h2>
              <div v-for="(r, i) in active.relations" :key="i" class="attr-row" style="grid-column: 1 / -1; margin-bottom: 6px">
                <div>
                  <span class="badge badge-body" style="margin-right: 6px">{{ r.type }}</span>
                  <strong>{{ r.name }}</strong> — <span class="k">{{ r.desc }}</span>
                </div>
              </div>
            </div>

            <div class="ret-actions" style="margin-top: 14px">
              <button type="button" class="btn-primary" :disabled="!canArchive" @click="openArchive">
                <el-icon><Document /></el-icon> Vehicle dossier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './styles/retrieval-panel.scss' as *;
.ret-pagination {
  margin-top: 12px;
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
