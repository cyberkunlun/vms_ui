<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Connection, InfoFilled, Picture } from '@element-plus/icons-vue'
import { mockFusionResults, MOCK_TOTALS, type FusionHit } from './data/mockRetrieval'
import { useClientPagination } from './composables/useClientPagination'

const loading = ref(false)
const list = ref<FusionHit[]>([])

const { page, pageSize, total, pagedItems, resetPage } = useClientPagination(list, 10)

const faceNote = ref({ lib: 'Static portrait (demo)', sim: 85 })
const bodyNote = ref({ color: 'Grey top / black bottom' })
const vehNote = ref({ plate: 'SH A D12K1', timeRange: 'Last 7 days' })
const nmNote = ref({ type: 'Delivery box', color: 'Yellow' })

const typeLabel: Record<FusionHit['targetType'], string> = {
  face: 'Face',
  body: 'Body',
  vehicle: 'Vehicle',
  nonmotor: 'Non-motor'
}

const run = () => {
  loading.value = true
  setTimeout(() => {
    list.value = mockFusionResults()
    resetPage()
    loading.value = false
    ElMessage.success(`Fusion search (mock): ${MOCK_TOTALS.fusion} rows`)
  }, 500)
}
</script>

<template>
  <div class="ret-page">
    <header class="ret-hero">
      <div>
        <h1>Fusion retrieval</h1>
        <p>
          Face, body, motor vehicle, and non-motor filters in one flow. The notice below states YITU limitations on image search for
          vehicles and non-motor — use attributes + time-space collision in production.
        </p>
      </div>
    </header>

    <div class="alert-cyan" style="display: flex; gap: 10px; align-items: flex-start; max-width: 960px">
      <el-icon :size="18" style="margin-top: 2px; flex-shrink: 0"><InfoFilled /></el-icon>
      <span
        >Platform: YITU <strong>does not support image-to-image search for motor vehicles and non-motor vehicles</strong> today.
        Vehicle and non-motor columns here are <strong>structured / feature</strong> filters only. Fusion results are mock
        aggregations by target type.</span
      >
    </div>

    <div
      class="ret-grid fusion-four"
      style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); align-items: stretch"
    >
      <div class="ret-panel">
        <h2>
          <el-icon><Connection /></el-icon> Face
        </h2>
        <el-form size="small" label-position="top">
          <el-form-item label="Library / list">
            <el-input v-model="faceNote.lib" />
          </el-form-item>
          <el-form-item label="Similarity ≥">
            <el-slider v-model="faceNote.sim" :min="50" :max="100" show-input />
          </el-form-item>
        </el-form>
        <p class="ret-hint">Image upload is available on the person capture page (same pattern).</p>
      </div>
      <div class="ret-panel">
        <h2>Body</h2>
        <el-form size="small" label-position="top">
          <el-form-item label="Outfit">
            <el-input v-model="bodyNote.color" />
          </el-form-item>
        </el-form>
      </div>
      <div class="ret-panel">
        <h2>Motor</h2>
        <el-form size="small" label-position="top">
          <el-form-item label="Plate / window">
            <el-input v-model="vehNote.plate" />
            <el-input v-model="vehNote.timeRange" style="margin-top: 8px" />
          </el-form-item>
        </el-form>
        <p class="ret-hint" style="color: #fbbf24">Image → vehicle: not supported</p>
      </div>
      <div class="ret-panel">
        <h2>Non-motor</h2>
        <el-form size="small" label-position="top">
          <el-form-item label="Industry (delivery, etc.)">
            <el-input v-model="nmNote.type" />
          </el-form-item>
          <el-form-item label="Color / sticker">
            <el-input v-model="nmNote.color" />
          </el-form-item>
        </el-form>
        <p class="ret-hint" style="color: #fbbf24">Image → non-motor: not supported</p>
      </div>
    </div>

    <div class="ret-actions" style="margin: 0 0 16px">
      <button type="button" class="btn-primary" :disabled="loading" @click="run">
        <el-icon><Search /></el-icon> Run fusion
      </button>
    </div>

    <div class="ret-panel" v-if="list.length">
      <h2>Fusion results (by target)</h2>
      <p class="ret-hint">Aggregated mock rows: <strong>{{ total }}</strong> total — paged for readability.</p>
      <div class="hit-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))">
        <div v-for="h in pagedItems" :key="h.id" class="hit-card" style="grid-template-columns: 64px 1fr; cursor: default">
          <div style="position: relative">
            <img :src="h.thumb" alt="" style="width: 64px; height: 64px" />
            <el-icon
              v-if="h.targetType === 'vehicle' || h.targetType === 'nonmotor'"
              style="position: absolute; bottom: 2px; right: 2px; color: #38bdf8; background: rgba(0, 0, 0, 0.5); border-radius: 4px; padding: 2px"
              ><Picture
            /></el-icon>
          </div>
          <div class="hit-meta">
            <div class="id">
              <span
                :class="{
                  badge: true,
                  'badge-face': h.targetType === 'face',
                  'badge-body': h.targetType === 'body',
                  'badge-veh': h.targetType === 'vehicle',
                  'badge-nm': h.targetType === 'nonmotor'
                }"
                >{{ typeLabel[h.targetType] }}</span
              >
              {{ h.id }}
            </div>
            <div class="sub">{{ h.time }} · {{ h.extra }}</div>
            <div style="margin-top: 4px; font-size: 12px; color: #94a3b8">{{ h.title }}</div>
          </div>
        </div>
      </div>
      <div class="ret-pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 40]"
          size="small"
          background
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './styles/retrieval-panel.scss' as *;
.ret-pagination {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  :deep(.el-pagination) {
    --el-pagination-bg-color: #0f172a;
    --el-pagination-text-color: #94a3b8;
  }
  :deep(.el-pagination__total) {
    color: #94a3b8;
  }
}
</style>
