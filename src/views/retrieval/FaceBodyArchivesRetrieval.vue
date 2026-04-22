<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, User, Postcard, Link, Plus, MapLocation, Clock } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import OlMapView from './components/OlMapView.vue'
import { mockArchiveLibMatches, mockArchiveDetail, MOCK_TOTALS, type ArchiveDetail, type ArchiveLibMatch } from './data/mockRetrieval'
import { useClientPagination } from './composables/useClientPagination'

const canIdentity = ref(true)
const canRelations = ref(true)

const fileList = ref<UploadFile[]>([])
const loading = ref(false)
const libHits = ref<ArchiveLibMatch[]>([])
const selectedLib = ref<ArchiveLibMatch | null>(null)
const detail = ref<ArchiveDetail | null>(null)
const mapCenter = ref<[number, number] | undefined>(undefined)

const { page, pageSize, total: libTotal, pagedItems: libRows, resetPage: resetLibPage } = useClientPagination(libHits, 8)

const trackList = computed(() => detail.value?.trackPoints ?? [])
const lairList = computed(() => detail.value?.lairs ?? [])
const compList = computed(() => detail.value?.companions ?? [])

const {
  page: trkPage,
  pageSize: trkSize,
  total: trkTotal,
  pagedItems: pagedTrack,
  resetPage: resetTrk
} = useClientPagination(trackList, 5)
const {
  page: lairPage,
  pageSize: lairSize,
  total: lairTotal,
  pagedItems: pagedLairs,
  resetPage: resetLair
} = useClientPagination(lairList, 6)
const {
  page: compPage,
  pageSize: compSize,
  total: compTotal,
  pagedItems: pagedComps,
  resetPage: resetComp
} = useClientPagination(compList, 5)

watch(detail, () => {
  resetTrk()
  resetLair()
  resetComp()
})

const openDetail = (row: ArchiveLibMatch) => {
  selectedLib.value = row
  detail.value = mockArchiveDetail()
  const p = detail.value.trackPoints[0]
  mapCenter.value = p ? p.lonLat : undefined
}

const run = () => {
  loading.value = true
  setTimeout(() => {
    libHits.value = mockArchiveLibMatches()
    resetLibPage()
    selectedLib.value = libHits.value[0] ?? null
    if (selectedLib.value) openDetail(selectedLib.value)
    loading.value = false
    ElMessage.success(`Archive cross-match (mock): ${MOCK_TOTALS.archiveLib} libraries`)
  }, 500)
}

const nameShow = (t: string) => (canIdentity.value ? t : '***')

const onChangeFiles = () => {
  if (fileList.value.length > 3) {
    fileList.value = fileList.value.slice(0, 3)
    ElMessage.warning('Maximum 3 images')
  }
}

const activeMapLon = computed(() => mapCenter.value)
</script>

<template>
  <div class="ret-page">
    <header class="ret-hero">
      <div>
        <h1>Face &amp; body — archive search</h1>
        <p>
          Up to 3 face or body images, ranked across multiple mock archives. Pick a row to see track, lairs, day/night pattern, identity,
          family, and companions.
        </p>
      </div>
      <div class="perm-bar">
        <span class="label">Permissions</span>
        <el-switch v-model="canIdentity" active-text="Identity" />
        <el-switch v-model="canRelations" active-text="Rel. / companions" />
      </div>
    </header>

    <div class="ret-grid" style="grid-template-columns: 400px 1fr">
      <div class="ret-panel">
        <h2><el-icon><User /></el-icon> Images &amp; search</h2>
        <el-upload
          v-model:file-list="fileList"
          drag
          multiple
          :limit="3"
          :auto-upload="false"
          accept="image/*"
          list-type="picture"
          @change="onChangeFiles"
        >
          <el-icon class="el-icon--upload"><Plus /></el-icon>
          <div class="el-upload__text">Archive demo — up to 3 images</div>
        </el-upload>
        <div class="ret-actions" style="margin-top: 12px">
          <button type="button" class="btn-primary" :disabled="loading" @click="run">
            <el-icon><Search /></el-icon> Search archives
          </button>
        </div>
        <p class="ret-hint" style="margin-top: 12px">
          <strong>{{ libTotal }}</strong> mock library hits — use pagination. Columns: score, size, last sync.
        </p>
        <el-table
          v-if="libHits.length"
          :data="libRows"
          size="small"
          highlight-current-row
          style="width: 100%; margin-top: 10px; --el-table-border-color: #1f2937; --el-table-bg-color: #0f172a; --el-table-tr-bg-color: #0f172a; --el-table-header-bg-color: #111827"
          @row-click="(row: ArchiveLibMatch) => openDetail(row)"
        >
          <el-table-column prop="rank" label="#" width="44" />
          <el-table-column prop="libName" label="Archive" min-width="100" show-overflow-tooltip />
          <el-table-column prop="matchScore" label="Score" width="64" />
          <el-table-column prop="personLabel" label="Tag" width="88" show-overflow-tooltip />
          <el-table-column prop="libSizeLabel" label="Size" width="100" show-overflow-tooltip />
          <el-table-column prop="lastSync" label="Sync" min-width="108" show-overflow-tooltip />
        </el-table>
        <div v-if="libHits.length" class="ret-pagination">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="libTotal"
            :page-sizes="[8, 12, 16, 32]"
            size="small"
            background
            layout="total, sizes, prev, pager, next"
          />
        </div>
      </div>

      <div v-if="detail" class="ret-panel" style="min-height: 560px">
        <h2>
          <el-icon><Postcard /></el-icon> Dossier
          <span v-if="selectedLib" style="color: #64748b; font-weight: 400; font-size: 12px; margin-left: 8px">
            {{ selectedLib.libName }} · ID {{ selectedLib.personId }}
          </span>
        </h2>

        <el-tabs>
          <el-tab-pane>
            <template #label> <el-icon><MapLocation /></el-icon> Track</template>
            <p class="ret-hint" style="margin: 0 0 8px">Track points: <strong>{{ trkTotal }}</strong> (mock) — paged</p>
            <el-timeline>
              <el-timeline-item
                v-for="(p, i) in pagedTrack"
                :key="p.t + '-' + i + '-' + p.place"
                :timestamp="p.t"
                placement="top"
              >
                <div>{{ p.place }}</div>
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="mapCenter = p.lonLat"
                  style="margin-top: 4px"
                  >Show on map</el-button
                >
              </el-timeline-item>
            </el-timeline>
            <div class="ret-pagination" style="margin: 8px 0 0">
              <el-pagination
                v-model:current-page="trkPage"
                v-model:page-size="trkSize"
                :total="trkTotal"
                :page-sizes="[5, 10, 15]"
                size="small"
                background
                layout="total, sizes, prev, pager, next"
              />
            </div>
            <div class="map-box" style="margin-top: 12px; height: 200px">
              <OlMapView v-if="activeMapLon" :lon-lat="activeMapLon" label="Track" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="Lairs">
            <p class="ret-hint" style="margin: 0 0 8px">Lair clusters: <strong>{{ lairTotal }}</strong> — paged</p>
            <div class="attr-grid" style="margin-top: 8px">
              <div v-for="(l, i) in pagedLairs" :key="i + l.name" class="attr-row" style="grid-column: 1 / -1; flex-direction: column; align-items: flex-start; gap: 4px">
                <div>
                  <el-tag :type="l.type === 'day' ? 'success' : 'info'" size="small">{{ l.type === 'day' ? 'Day' : 'Night' }}</el-tag>
                  <strong style="margin-left: 6px; color: #e2e8f0">{{ l.name }}</strong>
                </div>
                <div class="k">{{ l.count }}</div>
              </div>
            </div>
            <div class="ret-pagination" style="margin-top: 8px">
              <el-pagination
                v-model:current-page="lairPage"
                v-model:page-size="lairSize"
                :total="lairTotal"
                :page-sizes="[4, 6, 12]"
                size="small"
                background
                layout="total, sizes, prev, pager, next"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane>
            <template #label> <el-icon><Clock /></el-icon> Day / night</template>
            <div class="attr-grid">
              <div class="attr-row" style="grid-column: 1 / -1">
                <span class="k">Daytime</span>
                <span class="v">{{ detail.dayNight.daytime }}</span>
              </div>
              <div class="attr-row" style="grid-column: 1 / -1">
                <span class="k">Night</span>
                <span class="v">{{ detail.dayNight.night }}</span>
              </div>
              <div class="attr-row" style="grid-column: 1 / -1">
                <span class="k">Peak hours</span>
                <span class="v">{{ detail.dayNight.peak }}</span>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="Identity">
            <div class="attr-row" style="grid-column: 1 / -1">
              <span class="k">Name / ID</span>
              <span :class="['v', { 'blur-secret': !canIdentity }]">{{ nameShow(detail.realName) }} / {{ nameShow(detail.idCardMask) }}</span>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="canRelations" label="Family">
            <div v-for="(f, i) in detail.family" :key="i" class="attr-row" style="grid-column: 1 / -1; margin-bottom: 6px">
              <span class="k">{{ f.relation }}</span>
              <span class="v">{{ f.name }}</span>
            </div>
          </el-tab-pane>

          <el-tab-pane label="Companions" v-if="canRelations">
            <p class="ret-hint" style="margin: 0 0 8px">Co-travel: <strong>{{ compTotal }}</strong> rows (mock) — paged</p>
            <el-table
              :data="pagedComps"
              size="small"
              style="--el-table-border-color: #1f2937; --el-table-bg-color: transparent; --el-table-tr-bg-color: #0f172a; --el-table-header-bg-color: #111827"
            >
              <el-table-column prop="name" label="Name" />
              <el-table-column prop="relation" label="Link" min-width="120" show-overflow-tooltip />
              <el-table-column prop="meetCount" label="Co-occ." min-width="120" show-overflow-tooltip />
            </el-table>
            <div class="ret-pagination" style="margin-top: 8px">
              <el-pagination
                v-model:current-page="compPage"
                v-model:page-size="compSize"
                :total="compTotal"
                :page-sizes="[5, 10, 20]"
                size="small"
                background
                layout="total, sizes, prev, pager, next"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
        <div v-if="!canRelations" class="ret-hint" style="margin-top: 8px">When relations are off, those tabs are hidden in production.</div>
        <p class="ret-hint" style="margin-top: 12px">
          <el-icon><Link /></el-icon> Slot for re-search or watch from archive portrait (same as capture page).
        </p>
      </div>

      <div v-else class="ret-panel" style="display: flex; align-items: center; justify-content: center; min-height: 300px; color: #64748b">
        Run a search on the left, then pick an archive for detail
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './styles/retrieval-panel.scss' as *;
:deep(.el-upload-dragger) {
  background: #0f172a;
  border-color: #1f2937;
}
:deep(.el-table) {
  --el-table-text-color: #e2e8f0;
  --el-table-header-text-color: #94a3b8;
}
:deep(.el-timeline-item__node) {
  background: #38bdf8;
}
:deep(.el-timeline-item__tail) {
  border-color: #334155;
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
