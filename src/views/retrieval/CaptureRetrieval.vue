<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Plus,
  User,
  Link,
  Document,
  Scissor,
  Aim,
  Postcard,
  Location,
  VideoCamera,
  Calendar
} from '@element-plus/icons-vue'
import OlMapView from './components/OlMapView.vue'
import FamilyRelationGraph from './components/FamilyRelationGraph.vue'
import type { UploadFile } from 'element-plus'
import { mockCaptureResults, type CaptureHit, type IdentityMatch } from './data/mockRetrieval'
import { useClientPagination } from './composables/useClientPagination'

const canIdentity = ref(true)
const canRelations = ref(true)
const canArchive = ref(true)

const faceOptions = {
  Gender: ['Male', 'Female', 'Any'],
  'Age group': ['Child', 'Young', 'Middle', 'Senior', 'Any'],
  Mask: ['On', 'Off', 'Any'],
  Glasses: ['Yes', 'No', 'Any'],
  Hat: ['No', 'Cap', 'Helmet', 'Any']
}
const bodyOptions = {
  'Top color': ['Black', 'White', 'Grey', 'Red', 'Blue', 'Any'],
  'Bottom / pants': ['Long', 'Short', 'Skirt', 'Any'],
  Bag: ['None', 'Backpack', 'Shoulder', 'Any'],
  Cycling: ['Yes', 'No', 'Any']
}

const faceForm = ref<Record<string, string>>({
  Gender: 'Any',
  'Age group': 'Young',
  Mask: 'Any',
  Glasses: 'Any',
  Hat: 'Any'
})
const bodyForm = ref<Record<string, string>>({
  'Top color': 'Grey',
  'Bottom / pants': 'Long',
  Bag: 'Any',
  Cycling: 'No'
})

const fileList = ref<UploadFile[]>([])
const loading = ref(false)
const results = ref<CaptureHit[]>([])
const activeId = ref<string | null>(null)
const detailVisible = ref(false)
const detailActiveTab = ref('detail')
const selectedMatchIdx = ref(0)
const selectedCompanionIdx = ref(0)
const selectedCompanionCandidateIdx = ref(0)

const selectedMatch = computed(() => {
  if (!active.value?.identityMatches) return null
  return active.value.identityMatches[selectedMatchIdx.value] || active.value.identityMatches[0]
})

const selectedCompanion = computed(() => {
  const comps = active.value?.companions || active.value?.family || []
  return comps[selectedCompanionIdx.value] || null
})

const selectedCompanionCandidate = computed(() => {
  if (!selectedCompanion.value?.candidates) return null
  return selectedCompanion.value.candidates[selectedCompanionCandidateIdx.value] || selectedCompanion.value.candidates[0]
})

const { page, pageSize, total, pagedItems, resetPage } = useClientPagination(results, 48)

const active = computed(() => results.value.find((r) => r.id === activeId.value) ?? null)

watch(activeId, () => {
  selectedMatchIdx.value = 0
  selectedCompanionIdx.value = 0
  selectedCompanionCandidateIdx.value = 0
})

const runSearch = () => {
  loading.value = true
  setTimeout(() => {
    results.value = mockCaptureResults()
    resetPage()
    loading.value = false
    ElMessage.success(`Search completed: Found ${total.value} results`)
  }, 500)
}

const showDetail = (hit: CaptureHit) => {
  activeId.value = hit.id
  detailActiveTab.value = 'detail'
  detailVisible.value = true
}

const openArchive = () => {
  if (!canArchive.value) {
    ElMessage.warning('No permission to open dossier page')
    return
  }
  ElMessage.info('Open dossier (mock): ' + (active.value?.id ?? ''))
}

const maskOrShow = (text: string) => {
  if (!canIdentity.value) return '****'
  return text
}

const mockAction = (msg: string) => {
  ElMessage.info(msg + ' (mock — wire to live API)')
}

onMounted(() => {
  runSearch()
})
</script>

<template>
  <div class="cap-alarm">
    <!-- 左侧过滤面板 -->
    <aside class="filter-panel">
      <div class="panel-header">
        <el-icon><Search /></el-icon>
        <span>Retrieval Filters</span>
      </div>

      <div class="panel-inner">
        <div class="form-group">
          <span class="cyber-label">Upload Target</span>
          <el-upload
            class="uploader-ep"
            drag
            multiple
            :auto-upload="false"
            v-model:file-list="fileList"
          >
            <el-icon class="el-icon--upload"><Plus /></el-icon>
            <div class="el-upload__text">Drop face/body images here</div>
          </el-upload>
        </div>

        <div class="divider-text">
          <span class="cyber-label">Face</span>
        </div>
        <div v-for="(opts, k) in faceOptions" :key="String(k)" class="form-group">
          <span class="cyber-label small">{{ k }}</span>
          <el-select v-model="faceForm[k as string]" class="ep-full" size="small">
            <el-option v-for="o in opts" :key="o" :label="o" :value="o" />
          </el-select>
        </div>

        <div class="divider-text">
          <span class="cyber-label">Body</span>
        </div>
        <div v-for="(opts, k) in bodyOptions" :key="String(k)" class="form-group">
          <span class="cyber-label small">{{ k }}</span>
          <el-select v-model="bodyForm[k as string]" class="ep-full" size="small">
            <el-option v-for="o in opts" :key="o" :label="o" :value="o" />
          </el-select>
        </div>

        <div class="filter-actions">
          <button type="button" class="btn-primary search-btn" :disabled="loading" @click="runSearch">
            <el-icon><Search /></el-icon> Search
          </button>
        </div>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <div class="main-col">
      <header class="content-header">
        <div class="header-left">
          <h2 class="title">Person capture retrieval</h2>
          <p v-if="total" class="subtitle">
            Found <span class="highlight-num">{{ total }}</span> results · Full analysis available on click
          </p>
        </div>
        <div class="header-right perm-inline">
          <el-switch v-model="canIdentity" size="small" active-text="Identity" />
          <el-switch v-model="canRelations" size="small" active-text="Household" />
          <el-switch v-model="canArchive" size="small" active-text="Dossier" />
        </div>
      </header>

      <div v-if="!results.length" class="empty-state">
        <p>No data. Click <strong>Search</strong> to load mock results.</p>
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
              <div class="card-image-box">
                <img :src="h.cropUrl" alt="Capture" />
                <div class="card-badges">
                   <span class="score-badge">★ {{ h.score.toFixed(1) }}</span>
                   <span class="type-badge" :class="h.type">{{ h.type }}</span>
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
      width="1350px"
      class="cyber-detail-dialog"
      destroy-on-close
      align-center
    >
      <template #header>
        <div class="dialog-custom-header">
          <div class="header-icon"><el-icon><Aim /></el-icon></div>
          <div class="header-text">
            <h3>Capture Analysis Center</h3>
            <p>ID: {{ active?.id }} | Time: {{ active?.time }}</p>
          </div>
        </div>
      </template>

      <div v-if="active" class="dialog-content-layout">
        <el-tabs v-model="detailActiveTab" class="custom-tabs-v2">
          <el-tab-pane label="Basic Detail" name="detail">
            <div class="tab-pane-content detail-tab">
              <div class="pane-left">
                <div class="image-showcase">
                  <div class="img-frame">
                    <img :src="active.cropUrl" alt="Crop" />
                    <span class="label">Crop</span>
                  </div>
                  <div class="img-frame panorama">
                    <img :src="active.panoramaUrl" alt="Panorama" />
                    <span class="label">Panorama</span>
                  </div>
                </div>
                <div class="map-integration">
                  <div class="section-title-v2"><el-icon><Location /></el-icon> Location Tracking</div>
                  <div class="map-box-v2">
                    <OlMapView :lon-lat="active.lonLat" :label="active.address" />
                  </div>
                </div>
              </div>
              <div class="pane-right">
                <div class="attr-group">
                  <div class="section-title-v2">Core Metadata</div>
                  <div class="metadata-list">
                    <div class="m-item"><label>Capture Time</label><span>{{ active.time }}</span></div>
                    <div class="m-item"><label>Capture Location</label><span>{{ active.address }}</span></div>
                    <div class="m-item"><label>Device Name</label><span>{{ active.device }}</span></div>
                  </div>
                </div>
                <div class="attr-group">
                  <div class="section-title-v2">Visual Features</div>
                  <div class="chips-grid">
                    <div v-for="(v, k) in active.faceAttrs" :key="k" class="feature-chip">
                      <label>{{ k }}</label><span>{{ v }}</span>
                    </div>
                    <div v-for="(v, k) in active.bodyAttrs" :key="k" class="feature-chip">
                      <label>{{ k }}</label><span>{{ v }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="Library Matches" name="similarity">
            <div class="tab-pane-content similarity-tab-v3">
              <div class="similarity-main">
                <div class="comparison-header">
                  <div class="comp-box">
                    <img :src="active.cropUrl" alt="Capture" />
                    <span>Captured</span>
                  </div>
                  <div class="similarity-gauge">
                    <div class="gauge-ring">
                      <span class="val">{{ selectedMatch?.score }}%</span>
                      <span class="lab">Match</span>
                    </div>
                  </div>
                  <div class="comp-box">
                    <img :src="selectedMatch?.sampleFaceUrl" alt="Library" />
                    <span>Library</span>
                  </div>
                </div>

                <div class="oman-id-card">
                  <div class="id-card-header">
                    <div class="emblem">🛡️</div>
                    <div class="id-title">PERSONNEL IDENTITY CARD</div>
                  </div>
                  <div class="id-card-body">
                    <div class="id-photo">
                       <img :src="selectedMatch?.sampleFaceUrl" alt="Photo" />
                    </div>
                    <div class="id-details">
                       <div class="id-field"><label>Full Name</label><span>{{ maskOrShow(selectedMatch?.name || 'N/A') }}</span></div>
                       <div class="id-field"><label>Nationality</label><span>Oman / Domestic</span></div>
                       <div class="id-field"><label>Document ID</label><span>{{ selectedMatch?.idMask }}</span></div>
                       <div class="id-field"><label>Source Library</label><span>{{ selectedMatch?.dataSource }}</span></div>
                       <div class="id-field signature"><label>Digital Signature</label><span class="sig-font">Verified System Signature</span></div>
                    </div>
                  </div>
                  <div class="id-card-footer">
                    <span>SECURITY CLEARANCE: LEVEL 2</span>
                    <span class="barcode">|||||||||||||||||||||||</span>
                  </div>
                </div>
              </div>

              <div class="candidates-panel">
                <div class="panel-label">TOP 10 CANDIDATES</div>
                <div class="candidates-list">
                  <div 
                    v-for="(m, idx) in active.identityMatches.slice(0, 10)" 
                    :key="m.rank" 
                    class="candidate-item"
                    :class="{ active: selectedMatchIdx === idx }"
                    @click="selectedMatchIdx = idx"
                  >
                    <div class="c-rank">{{ m.rank }}</div>
                    <img :src="m.sampleFaceUrl" alt="Match" class="c-img" />
                    <div class="c-meta">
                      <div class="c-name">{{ maskOrShow(m.name) }}</div>
                      <div class="c-score">{{ m.score }}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- Tab 3: Companions (Full Redesign V5) -->
          <el-tab-pane label="Companions" name="companion">
            <div class="tab-pane-content companion-tab-v5">
              <!-- TOP SECTION: Analysis Center -->
              <div class="companion-analysis-top">
                <!-- LEFT: Captures List -->
                <div class="column-left">
                   <div class="target-capture-box">
                      <div class="box-label">Target Capture</div>
                      <img :src="active.cropUrl" alt="Target" />
                   </div>
                   <div class="companions-mini-list">
                      <div class="box-label">Companions Found</div>
                      <div class="mini-scroll">
                        <div 
                          v-for="(comp, idx) in (active.companions || active.family)" 
                          :key="idx" 
                          class="mini-comp-item"
                          :class="{ active: selectedCompanionIdx === idx }"
                          @click="selectedCompanionIdx = idx; selectedCompanionCandidateIdx = 0"
                        >
                          <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${comp.name}`" alt="Comp" />
                          <span>{{ comp.name }}</span>
                        </div>
                      </div>
                   </div>
                </div>

                <!-- CENTER: Comparison & Large View -->
                <div class="column-center">
                   <div class="comp-comparison">
                      <div class="comp-side">
                         <img :src="active.cropUrl" alt="Target" />
                         <span class="label">Target</span>
                      </div>
                      <div class="comp-vs">VS</div>
                      <div class="comp-side">
                         <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCompanion?.name}`" alt="Comp" />
                         <span class="label">Companion</span>
                      </div>
                   </div>
                   <div class="companion-large-view">
                      <div class="box-label">Selected Companion Snapshot</div>
                      <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCompanion?.name}`" alt="Large" />
                   </div>
                </div>

                <!-- RIGHT: Companion Library ID Card -->
                <div class="column-right">
                   <div v-if="selectedCompanionCandidate" class="oman-id-card mini-id">
                      <div class="id-card-header">
                        <div class="emblem">🛡️</div>
                        <div class="id-title">COMPANION ID CARD</div>
                      </div>
                      <div class="id-card-body">
                        <div class="id-photo">
                           <img :src="selectedCompanionCandidate.sampleFaceUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCompanion.name}`" alt="Photo" />
                        </div>
                        <div class="id-details">
                           <div class="id-field"><label>Full Name</label><span>{{ selectedCompanionCandidate.name }}</span></div>
                           <div class="id-field"><label>Relation</label><span>{{ selectedCompanion.relation }}</span></div>
                           <div class="id-field"><label>ID Number</label><span>{{ selectedCompanionCandidate.idMask || '6325**********' }}</span></div>
                           <div class="id-field signature"><label>Security Level</label><span class="sig-font">Restricted</span></div>
                        </div>
                      </div>
                   </div>
                   <div v-else class="no-candidate-info">Select a library match below to see identity details</div>
                </div>
              </div>

              <!-- BOTTOM SECTION: Library Match Strip -->
              <div class="companion-candidates-bottom">
                 <div class="box-label">Library Candidates for Selected Companion</div>
                 <div class="candidates-strip">
                    <div 
                      v-for="(cand, cIdx) in (selectedCompanion?.candidates || [])" 
                      :key="cIdx" 
                      class="mini-id-card-item"
                      :class="{ active: selectedCompanionCandidateIdx === cIdx }"
                      @click="selectedCompanionCandidateIdx = cIdx"
                    >
                       <div class="mini-id-header">
                         <span class="rank">#{{ cIdx + 1 }}</span>
                         <span class="score">{{ cand.score }}%</span>
                       </div>
                       <div class="mini-id-body">
                          <img :src="cand.sampleFaceUrl" alt="Face" />
                          <div class="mini-meta">
                             <div class="m-name">{{ cand.name }}</div>
                             <div class="m-id">{{ cand.idMask }}</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
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
.grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }

.capture-card-v2 {
  background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 20px; overflow: hidden; cursor: pointer; transition: all 0.4s;
  &:hover { border-color: #38bdf8; transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }
  .card-image-box { 
    position: relative; aspect-ratio: 1; background: #000; overflow: hidden; 
    img { width: 100%; height: 100%; object-fit: contain; background: radial-gradient(circle at center, #1e293b 0%, #000 100%); } 
  }
  .card-badges { position: absolute; top: 12px; left: 12px; right: 12px; display: flex; justify-content: space-between; align-items: flex-start; }
  .score-badge { background: #10b981; color: #fff; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; }
  .type-badge { background: rgba(0,0,0,0.6); color: #fff; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 900; }
  .card-info { padding: 10px; background: rgba(15, 23, 42, 0.5); .info-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; color: #94a3b8; font-size: 11px; .el-icon { color: #38bdf8; } } .info-row:first-child { color: #fff; font-weight: 600; } }
}

.pagination-footer { padding: 16px 24px; display: flex; justify-content: center; border-top: 1px solid rgba(148, 163, 184, 0.1); }

/* --- 详情对话框样式 (高密度) --- */
:deep(.cyber-detail-dialog) {
  background: rgba(10, 15, 25, 0.96) !important; backdrop-filter: blur(40px); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 20px;
  .el-dialog__header { padding: 16px 30px; margin: 0; } .el-dialog__body { padding: 0; } .el-dialog__headerbtn { top: 20px; right: 30px; }
}
.dialog-custom-header { display: flex; gap: 16px; align-items: center; .header-icon { width: 42px; height: 42px; background: linear-gradient(135deg, #0ea5e9, #38bdf8); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #000; } h3 { margin: 0; color: #fff; font-size: 18px; font-weight: 800; letter-spacing: 0.5px; } p { margin: 2px 0 0; color: #64748b; font-size: 11px; font-family: monospace; opacity: 0.7; } }
.custom-tabs-v2 { :deep(.el-tabs__header) { margin: 0; padding: 0 30px; background: rgba(15, 23, 42, 0.4); border-bottom: 1px solid rgba(148, 163, 184, 0.05); } :deep(.el-tabs__item) { height: 50px; color: #64748b; font-weight: 700; font-size: 14px; transition: 0.3s; &.is-active { color: #38bdf8; } } :deep(.el-tabs__active-bar) { background: #38bdf8; height: 3px; } }
.tab-pane-content { height: 620px; padding: 24px 30px; overflow-y: auto; }
.detail-tab { display: grid; grid-template-columns: 1fr 340px; gap: 30px; }
.image-showcase { display: grid; grid-template-columns: 280px 1fr; gap: 20px; margin-bottom: 24px; }
.img-frame { position: relative; border-radius: 16px; overflow: hidden; background: #000; border: 1px solid rgba(148, 163, 184, 0.1); img { width: 100%; height: 100%; object-fit: contain; } .label { position: absolute; top: 8px; left: 8px; background: rgba(56, 189, 248, 0.85); color: #000; padding: 3px 8px; border-radius: 6px; font-size: 9px; font-weight: 900; } &.panorama { aspect-ratio: 16/9; } }
.img-frame:not(.panorama) { aspect-ratio: 1; }
.section-title-v2 { font-size: 13px; font-weight: 900; color: #38bdf8; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
.map-box-v2 { height: 240px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.1); }
.metadata-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; .m-item { background: rgba(15, 23, 42, 0.5); padding: 12px 16px; border-radius: 12px; label { display: block; font-size: 9px; color: #64748b; margin-bottom: 4px; } span { font-size: 13px; color: #f1f5f9; font-weight: 700; } } }
.chips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; .feature-chip { background: rgba(56, 189, 248, 0.04); border: 1px solid rgba(56, 189, 248, 0.08); padding: 10px; border-radius: 10px; label { display: block; font-size: 9px; color: #38bdf8; margin-bottom: 3px; } span { font-size: 12px; color: #e2e8f0; font-weight: 500; } } }

/* 比对 Tab V3 密度优化 */
.similarity-tab-v3 { display: grid; grid-template-columns: 1fr 300px; gap: 30px; height: 620px; padding: 24px 30px; }
.similarity-main { display: flex; flex-direction: column; gap: 24px; }
.comparison-header {
  display: flex; align-items: center; justify-content: center; gap: 30px; background: rgba(15, 23, 42, 0.4); padding: 20px; border-radius: 20px;
  .comp-box { display: flex; flex-direction: column; align-items: center; gap: 8px; img { width: 110px; height: 110px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(56, 189, 248, 0.3); } span { font-size: 10px; color: #38bdf8; font-weight: 800; } }
  .similarity-gauge .gauge-ring {
    width: 90px; height: 90px; border-radius: 50%; border: 3px solid rgba(56, 189, 248, 0.1); border-top-color: #10b981; display: flex; flex-direction: column; align-items: center; justify-content: center;
    .val { font-size: 22px; font-weight: 900; color: #10b981; } .lab { font-size: 9px; color: #64748b; font-weight: 700; }
  }
}
.oman-id-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 16px; width: 500px; align-self: center; overflow: hidden; position: relative;
  &::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(to right, #0ea5e9, #10b981, #0ea5e9); }
  .id-card-header { background: rgba(56, 189, 248, 0.1); padding: 12px 20px; display: flex; align-items: center; gap: 12px; .id-title { font-size: 12px; font-weight: 900; color: #e2e8f0; letter-spacing: 1.5px; } }
  .id-card-body { padding: 20px; display: grid; grid-template-columns: 130px 1fr; gap: 24px; .id-photo { width: 130px; height: 150px; border-radius: 10px; overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; } } .id-details { display: flex; flex-direction: column; gap: 12px; .id-field { label { font-size: 9px; color: #64748b; } span { font-size: 13px; color: #f1f5f9; font-weight: 700; } } } }
  .id-card-footer { padding: 8px 20px; background: rgba(0,0,0,0.3); display: flex; justify-content: space-between; align-items: center; .barcode { font-size: 20px; color: #334155; } }
}
.candidates-panel {
  background: rgba(15, 23, 42, 0.3); border-radius: 20px; border: 1px solid rgba(148, 163, 184, 0.1); display: flex; flex-direction: column; overflow: hidden;
  .panel-label { padding: 16px; font-size: 11px; font-weight: 900; color: #64748b; letter-spacing: 1.5px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
  .candidates-list { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
  .candidate-item {
    display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 12px; cursor: pointer; transition: 0.2s;
    &:hover { background: rgba(56, 189, 248, 0.05); } &.active { background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); }
    .c-img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; } .c-meta { .c-name { font-size: 12px; font-weight: 700; color: #fff; } .c-score { font-size: 10px; color: #10b981; } }
  }
}

/* Companion V5: Complex Analysis Layout */
.companion-tab-v5 {
  display: flex;
  flex-direction: column;
  height: 620px;
  padding: 16px;
  gap: 16px;
  overflow: hidden;
}

.box-label {
  font-size: 10px; font-weight: 900; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; opacity: 0.8;
}

.companion-analysis-top {
  flex: 1;
  display: grid;
  grid-template-columns: 200px 1fr 380px;
  gap: 16px;
  min-height: 0;
}

.column-left {
  display: flex; flex-direction: column; gap: 16px; min-height: 0;
  .target-capture-box {
    background: rgba(15, 23, 42, 0.4); border-radius: 12px; padding: 10px; border: 1px solid rgba(148, 163, 184, 0.1);
    img { width: 100%; aspect-ratio: 1; border-radius: 8px; object-fit: cover; }
  }
  .companions-mini-list {
    flex: 1; display: flex; flex-direction: column; min-height: 0;
    .mini-scroll { 
      flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; 
      &::-webkit-scrollbar { width: 4px; }
    }
  }
  .mini-comp-item {
    display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s;
    background: rgba(15, 23, 42, 0.3); border: 1px solid transparent;
    &:hover { background: rgba(56, 189, 248, 0.05); }
    &.active { background: rgba(56, 189, 248, 0.1); border-color: rgba(56, 189, 248, 0.3); }
    img { width: 32px; height: 32px; border-radius: 50%; background: #1e293b; }
    span { font-size: 12px; color: #fff; font-weight: 600; }
  }
}

.column-center {
  display: flex; flex-direction: column; gap: 16px; min-height: 0;
  .comp-comparison {
    height: 140px; background: rgba(15, 23, 42, 0.4); border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 30px;
    border: 1px solid rgba(148, 163, 184, 0.1);
    .comp-side {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      img { width: 80px; height: 80px; border-radius: 10px; object-fit: cover; border: 2px solid rgba(56, 189, 248, 0.3); }
      .label { font-size: 9px; color: #64748b; font-weight: 800; text-transform: uppercase; }
    }
    .comp-vs { font-size: 20px; font-weight: 900; color: #38bdf8; font-style: italic; opacity: 0.5; }
  }
  .companion-large-view {
    flex: 1; background: #000; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid rgba(148, 163, 184, 0.1);
    img { width: 100%; height: 100%; object-fit: contain; }
    .box-label { position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: 6px; }
  }
}

.column-right {
  .mini-id { 
    width: 100%; box-shadow: none; border-color: rgba(56, 189, 248, 0.2); align-self: flex-start;
    .id-photo { width: 110px; height: 130px; }
    .id-card-body { gap: 16px; padding: 16px; grid-template-columns: 110px 1fr; }
    .id-details .id-field { margin-bottom: 8px; label { font-size: 8px; } span { font-size: 12px; } }
  }
  .no-candidate-info { height: 100%; display: flex; align-items: center; justify-content: center; color: #475569; font-size: 13px; text-align: center; border: 1px dashed rgba(148, 163, 184, 0.2); border-radius: 20px; padding: 40px; }
}

.companion-candidates-bottom {
  height: 140px; display: flex; flex-direction: column;
  .candidates-strip {
    flex: 1; display: flex; gap: 12px; overflow-x: auto; padding: 4px 0 10px;
    &::-webkit-scrollbar { height: 6px; }
    &::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.1); border-radius: 3px; }
  }
}

.mini-id-card-item {
  min-width: 180px; background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 10px; padding: 10px; cursor: pointer; transition: 0.2s; position: relative;
  &.active { border-color: #38bdf8; box-shadow: 0 0 15px rgba(56, 189, 248, 0.2); }
  .mini-id-header { display: flex; justify-content: space-between; font-size: 9px; font-weight: 800; margin-bottom: 6px; .rank { color: #38bdf8; } .score { color: #10b981; } }
  .mini-id-body {
    display: flex; gap: 10px;
    img { width: 44px; height: 50px; border-radius: 4px; object-fit: cover; }
    .mini-meta { flex: 1; .m-name { font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 2px; } .m-id { font-size: 10px; color: #64748b; } }
  }
}



.empty-mini { text-align: center; padding: 100px; color: #475569; font-size: 14px; }
.empty-state { flex: 1; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 14px; }
</style>
