<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, User, Link, View, Van, VideoCamera, Calendar, Aim, Location } from '@element-plus/icons-vue'
import OlMapView from './components/OlMapView.vue'
import { mockVehicleResults, type VehicleHit } from './data/mockRetrieval'
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
const detailVisible = ref(false)
const detailActiveTab = ref('detail')

const { page, pageSize, total, pagedItems, resetPage } = useClientPagination(results, 48)

const active = computed(() => results.value.find((r) => r.id === activeId.value) ?? null)

const runSearch = () => {
  loading.value = true
  setTimeout(() => {
    results.value = mockVehicleResults()
    resetPage()
    loading.value = false
    ElMessage.success(`Vehicle Search completed: Found ${total.value} results`)
  }, 450)
}

const showDetail = (hit: VehicleHit) => {
  activeId.value = hit.id
  detailActiveTab.value = 'detail'
  detailVisible.value = true
}

const showOwner = (t: string) => (canOwner.value ? t : '****')

const openArchive = () => {
  if (!canArchive.value) {
    ElMessage.warning('No permission to open vehicle dossier')
    return
  }
  ElMessage.info('Open vehicle dossier (mock)')
}

onMounted(() => {
  runSearch()
})
</script>

<template>
  <div class="cap-alarm">
    <!-- 过滤面板 -->
    <aside class="filter-panel">
      <div class="panel-header">
        <el-icon><Van /></el-icon>
        <span>Vehicle Filters</span>
      </div>

      <div class="panel-inner">
        <div class="form-group">
          <span class="cyber-label">License Plates</span>
          <div v-for="(p, i) in plates" :key="i" style="margin-bottom: 8px">
             <el-input v-model="plates[i]" placeholder="Enter plate..." size="small" class="ep-full" />
          </div>
        </div>

        <div class="divider-text">
          <span class="cyber-label">Attributes</span>
        </div>
        <div class="form-group">
          <span class="cyber-label small">Brand</span>
          <el-select v-model="form.brand" class="ep-full" size="small">
            <el-option label="VW" value="VW" />
            <el-option label="Tesla" value="Tesla" />
            <el-option label="BMW" value="BMW" />
          </el-select>
        </div>
        <div class="form-group">
          <span class="cyber-label small">Color</span>
          <el-select v-model="form.color" class="ep-full" size="small">
            <el-option label="White" value="White" />
            <el-option label="Black" value="Black" />
            <el-option label="Red" value="Red" />
          </el-select>
        </div>

        <div class="filter-actions">
          <button type="button" class="btn-primary" :disabled="loading" @click="runSearch">
            <el-icon><Search /></el-icon> Search Vehicles
          </button>
        </div>
      </div>
    </aside>

    <!-- 内容区 -->
    <div class="main-col">
      <header class="content-header">
        <div class="header-left">
          <h2 class="title">Vehicle capture retrieval</h2>
          <p v-if="total" class="subtitle">
            Found <span class="highlight-num">{{ total }}</span> vehicle records · Multi-dimensional tracking enabled
          </p>
        </div>
        <div class="header-right perm-inline">
          <el-switch v-model="canOwner" size="small" active-text="Owner" />
          <el-switch v-model="canRelations" size="small" active-text="Relations" />
          <el-switch v-model="canArchive" size="small" active-text="Dossier" />
        </div>
      </header>

      <div v-if="!results.length" class="empty-state">
        <p>No records found. Click <strong>Search</strong> to query vehicle data.</p>
      </div>

      <div v-else class="result-workspace-grid">
        <div class="grid-scroll-area">
          <div class="grid-container">
            <div
              v-for="h in pagedItems"
              :key="h.id"
              class="capture-card-v2"
              @click="showDetail(h)"
            >
              <div class="card-image-box veh">
                <img :src="h.passUrl" alt="Pass" />
                <div class="card-badges">
                   <span class="score-badge">PLATE: {{ h.plate }}</span>
                   <span class="type-badge face">{{ h.color }}</span>
                </div>
              </div>
              <div class="card-info">
                <div class="info-row"><el-icon><Calendar /></el-icon> <span>{{ h.time }}</span></div>
                <div class="info-row"><el-icon><VideoCamera /></el-icon> <span>{{ h.device }}</span></div>
              </div>
            </div>
          </div>
        </div>

        <footer class="pagination-footer">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[12, 24, 48, 96]"
            size="default"
            background
            layout="total, sizes, prev, pager, next, jumper"
          />
        </footer>
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      width="1200px"
      class="cyber-detail-dialog"
      destroy-on-close
      align-center
    >
      <template #header>
        <div class="dialog-custom-header">
          <div class="header-icon"><el-icon><Van /></el-icon></div>
          <div class="header-text">
            <h3>Vehicle Intelligence Center</h3>
            <p>Plate: {{ active?.plate }} | Record ID: {{ active?.id }}</p>
          </div>
        </div>
      </template>

      <div v-if="active" class="dialog-content-layout">
        <el-tabs v-model="detailActiveTab" class="custom-tabs-v2">
          <el-tab-pane label="Vehicle Detail" name="detail">
            <div class="tab-pane-content detail-tab">
              <div class="pane-left">
                <div class="image-showcase">
                  <div class="img-frame">
                    <img :src="active.cropUrl" alt="Crop" />
                    <span class="label">Vehicle Crop</span>
                  </div>
                  <div class="img-frame panorama">
                    <img :src="active.passUrl" alt="Panorama" />
                    <span class="label">Pass Panorama</span>
                  </div>
                </div>
                <div class="map-integration">
                  <div class="section-title-v2"><el-icon><Location /></el-icon> Pass Geography</div>
                  <div class="map-box-v2">
                    <OlMapView :lon-lat="active.lonLat" :label="active.address" />
                  </div>
                </div>
              </div>
              <div class="pane-right">
                <div class="attr-group">
                  <div class="section-title-v2">Pass Metadata</div>
                  <div class="metadata-list">
                    <div class="m-item"><label>Time</label><span>{{ active.time }}</span></div>
                    <div class="m-item"><label>Location</label><span>{{ active.address }}</span></div>
                    <div class="m-item"><label>Device</label><span>{{ active.device }}</span></div>
                    <div class="m-item"><label>Specs</label><span>{{ active.brand }} / {{ active.color }}</span></div>
                  </div>
                </div>
                <div class="attr-group" v-if="canOwner">
                  <div class="section-title-v2">Ownership</div>
                  <div class="metadata-list">
                    <div class="m-item"><label>Owner</label><span>{{ showOwner(active.ownerName) }}</span></div>
                    <div class="m-item"><label>ID Number</label><span>{{ showOwner(active.ownerIdMask) }}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Pass History" name="history">
            <div class="tab-pane-content similarity-tab">
               <div class="empty-mini">Scanning pass logs for {{ active.plate }} (Past 30 days)...</div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
/* --- 布局核心 --- */
.cap-alarm { display: flex; height: 100%; width: 100%; overflow: hidden; background: transparent; padding: 12px; box-sizing: border-box; }
.filter-panel { width: 300px; min-width: 300px; height: 100%; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(12px); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 24px; display: flex; flex-direction: column; margin-right: 16px; overflow: hidden; }
.panel-header { padding: 20px 24px; display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; color: #38bdf8; border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
.panel-inner { flex: 1; overflow-y: auto; padding: 24px; &::-webkit-scrollbar { width: 4px; } &::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.2); border-radius: 4px; } }
.form-group { margin-bottom: 20px; .cyber-label { display: block; font-size: 13px; color: #94a3b8; margin-bottom: 8px; &.small { font-size: 11px; } } }
.divider-text { margin: 24px 0 12px; display: flex; align-items: center; gap: 12px; &::after { content: ''; flex: 1; height: 1px; background: rgba(148, 163, 184, 0.1); } }
.ep-full { width: 100%; }
:deep(.el-input__wrapper), :deep(.el-select__wrapper) { background: rgba(10, 15, 30, 0.6) !important; border: 1px solid rgba(148, 163, 184, 0.2) !important; box-shadow: none !important; border-radius: 10px; }
.filter-actions { margin-top: 32px; }
.btn-primary { background: linear-gradient(135deg, #0ea5e9, #38bdf8); color: #000; border: none; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; }

.main-col { flex: 1; display: flex; flex-direction: column; min-width: 0; height: 100%; }
.content-header { padding: 0 12px 16px; display: flex; justify-content: space-between; align-items: center; .title { font-size: 24px; font-weight: 800; color: #fff; margin: 0; } .subtitle { font-size: 14px; color: #64748b; .highlight-num { color: #38bdf8; font-weight: 800; } } }
.perm-inline { display: flex; gap: 20px; }

.result-workspace-grid { flex: 1; display: flex; flex-direction: column; min-height: 0; background: rgba(15, 23, 42, 0.2); border-radius: 24px; border: 1px solid rgba(148, 163, 184, 0.1); overflow: hidden; }
.grid-scroll-area { 
  flex: 1; overflow-y: auto; padding: 24px; 
  &::-webkit-scrollbar { width: 10px; } 
  &::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.3); border-radius: 5px; } 
  &::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.3); border-radius: 5px; border: 2px solid transparent; background-clip: padding-box; &:hover { background-color: #38bdf8; } } 
}
/* 车辆卡片稍宽，因为是16:9比例 */
.grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }

.capture-card-v2 {
  background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 20px; overflow: hidden; cursor: pointer; transition: 0.4s;
  &:hover { border-color: #38bdf8; transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }
  .card-image-box { 
    position: relative; aspect-ratio: 16/9; background: #000; overflow: hidden; 
    img { width: 100%; height: 100%; object-fit: contain; background: radial-gradient(circle at center, #1e293b 0%, #000 100%); transition: 0.6s; } 
  }
  &:hover .card-image-box img { transform: scale(1.05); }
  .card-badges { position: absolute; top: 12px; left: 12px; right: 12px; display: flex; justify-content: space-between; align-items: flex-start; }
  .score-badge { background: #38bdf8; color: #000; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; }
  .type-badge { background: rgba(0,0,0,0.6); color: #fff; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 900; }
  .card-info { padding: 10px; background: rgba(15, 23, 42, 0.5); .info-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: #94a3b8; font-size: 11px; .el-icon { color: #38bdf8; } } .info-row:first-child { color: #fff; font-weight: 600; } }
}

.pagination-footer { padding: 16px 24px; display: flex; justify-content: center; border-top: 1px solid rgba(148, 163, 184, 0.1); }

/* --- 详情对话框样式 (高密度同步) --- */
:deep(.cyber-detail-dialog) {
  background: rgba(10, 15, 25, 0.96) !important; backdrop-filter: blur(40px); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 20px;
  .el-dialog__header { padding: 16px 30px; margin: 0; } .el-dialog__body { padding: 0; } .el-dialog__headerbtn { top: 20px; right: 30px; }
}
.dialog-custom-header { display: flex; gap: 16px; align-items: center; .header-icon { width: 42px; height: 42px; background: linear-gradient(135deg, #0ea5e9, #38bdf8); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #000; } h3 { margin: 0; color: #fff; font-size: 18px; font-weight: 800; letter-spacing: 0.5px; } p { margin: 2px 0 0; color: #64748b; font-size: 11px; font-family: monospace; opacity: 0.7; } }
.custom-tabs-v2 { :deep(.el-tabs__header) { margin: 0; padding: 0 30px; background: rgba(15, 23, 42, 0.4); border-bottom: 1px solid rgba(148, 163, 184, 0.05); } :deep(.el-tabs__item) { height: 50px; color: #64748b; font-weight: 700; font-size: 14px; &.is-active { color: #38bdf8; } } :deep(.el-tabs__active-bar) { background: #38bdf8; height: 3px; } }
.tab-pane-content { height: 620px; padding: 24px 30px; overflow-y: auto; }
.detail-tab { display: grid; grid-template-columns: 1fr 340px; gap: 30px; }
.image-showcase { display: grid; grid-template-columns: 340px 1fr; gap: 20px; margin-bottom: 24px; }
.img-frame { position: relative; border-radius: 16px; overflow: hidden; background: #000; border: 1px solid rgba(148, 163, 184, 0.1); img { width: 100%; height: 100%; object-fit: contain; } .label { position: absolute; top: 8px; left: 8px; background: rgba(56, 189, 248, 0.85); color: #000; padding: 3px 8px; border-radius: 6px; font-size: 9px; font-weight: 900; } &.panorama { aspect-ratio: 16/9; } }
.img-frame:not(.panorama) { aspect-ratio: 4/3; }
.section-title-v2 { font-size: 13px; font-weight: 900; color: #38bdf8; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; text-transform: uppercase; }
.map-box-v2 { height: 260px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.1); }
.metadata-list { display: flex; flex-direction: column; gap: 10px; .m-item { background: rgba(15, 23, 42, 0.5); padding: 12px 16px; border-radius: 12px; label { display: block; font-size: 9px; color: #64748b; margin-bottom: 4px; } span { font-size: 13px; color: #f1f5f9; font-weight: 700; } } }
.empty-mini { text-align: center; padding: 100px; color: #475569; font-size: 14px; }
.empty-state { flex: 1; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 14px; }
</style>
