<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
  VideoCamera
} from '@element-plus/icons-vue'
import OlMapView from './components/OlMapView.vue'
import FamilyRelationGraph from './components/FamilyRelationGraph.vue'
import type { UploadFile } from 'element-plus'
import { mockCaptureResults, MOCK_TOTALS, type CaptureHit, type IdentityMatch } from './data/mockRetrieval'
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
const selectedIdentityIdx = ref(0)

const { page, pageSize, total, pagedItems, resetPage } = useClientPagination(results, 8)

const active = computed(() => results.value.find((r) => r.id === activeId.value) ?? null)

const selectedIdMatch = computed<IdentityMatch | null>(() => {
  const a = active.value
  if (!a?.identityMatches?.length) return null
  return a.identityMatches[selectedIdentityIdx.value] ?? a.identityMatches[0] ?? null
})

watch(activeId, () => {
  selectedIdentityIdx.value = 0
})

const runSearch = () => {
  loading.value = true
  setTimeout(() => {
    results.value = mockCaptureResults()
    resetPage()
    activeId.value = results.value[0]?.id ?? null
    selectedIdentityIdx.value = 0
    loading.value = false
    ElMessage.success(`Search completed (mock): ${MOCK_TOTALS.capture} scene hits — each with 7+1:N id rows`)
  }, 500)
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

function pickIdentity(idx: number) {
  selectedIdentityIdx.value = idx
}
</script>

<template>
  <div class="cap-alarm">
    <aside class="filter-panel">
      <div class="panel-inner">
        <div class="panel-header">
          <el-icon><Search /></el-icon>
          <span>Search &amp; attributes</span>
        </div>

        <div class="form-group">
          <span class="cyber-label">Upload (max 3)</span>
        </div>
        <el-upload
          v-model:file-list="fileList"
          class="uploader-ep"
          drag
          multiple
          :limit="3"
          :on-exceed="() => ElMessage.warning('Maximum 3 images')"
          list-type="picture"
          :auto-upload="false"
          accept="image/*"
        >
          <el-icon class="el-icon--upload"><Plus /></el-icon>
          <div class="el-upload__text">Drop images here or click</div>
        </el-upload>

        <div class="form-group">
          <span class="cyber-label">Face</span>
        </div>
        <div v-for="(opts, k) in faceOptions" :key="String(k)" class="form-group">
          <span class="cyber-label small">{{ k }}</span>
          <el-select v-model="faceForm[k as string]" class="ep-full" size="small">
            <el-option v-for="o in opts" :key="o" :label="o" :value="o" />
          </el-select>
        </div>

        <div class="form-group">
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

    <div class="main-col">
      <header class="content-header">
        <div class="header-left">
          <h2 class="title">Person capture retrieval</h2>
          <p v-if="total" class="subtitle">
            <span class="highlight-num">{{ total }}</span> scene hits (mock) · 7-way identity table per event
          </p>
          <p v-else class="subtitle">Set filters, upload up to 3 images, then run search.</p>
        </div>
        <div class="header-right perm-inline">
          <el-switch v-model="canIdentity" size="small" active-text="Identity" inactive-text="Mask" />
          <el-switch v-model="canRelations" size="small" active-text="Household" inactive-text="Hide" />
          <el-switch v-model="canArchive" size="small" active-text="Dossier" inactive-text="Off" />
        </div>
      </header>

      <div v-if="!results.length" class="empty-state">
        <p>No data yet. Use <strong>Search</strong> in the left panel.</p>
      </div>

      <div v-else class="result-workspace">
        <div class="list-column">
          <p class="list-title">Scene hits</p>
          <div class="alarm-list-container">
            <article
              v-for="h in pagedItems"
              :key="h.id"
              class="hit-alarm-card"
              :class="{ active: h.id === activeId }"
              @click="activeId = h.id"
            >
              <div class="col-thumb">
                <div class="img-box sm">
                  <img :src="h.cropUrl" alt="" />
                  <div class="score-badge">★ {{ h.score.toFixed(1) }}</div>
                </div>
                <span class="type-pill" :class="h.type === 'face' ? 'p-face' : 'p-body'">{{
                  h.type === 'face' ? 'Face' : h.type === 'body' ? 'Body' : 'Mix'
                }}</span>
              </div>
              <div class="col-meta">
                <div class="id-line">{{ h.id }}</div>
                <div class="data-group">
                  <span class="data-label">Time</span>
                  <span class="data-value">{{ h.time }}</span>
                </div>
                <div class="data-group">
                  <span class="data-label">Device</span>
                  <span class="data-value">{{ h.device }}</span>
                </div>
                <div class="data-group">
                  <span class="data-label">Top id score</span>
                  <span class="data-value accent">{{ h.identityMatches[0]?.score?.toFixed(1) ?? '—' }}</span>
                </div>
              </div>
            </article>
          </div>
          <footer class="pagination-footer">
            <el-pagination
              v-model:current-page="page"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[8, 12, 24]"
              size="small"
              background
              layout="total, sizes, prev, pager, next, jumper"
              class="cap-pager"
            />
          </footer>
        </div>

        <div v-if="active" class="detail-column">
          <div class="detail-scroll">
            <section class="alarm-card detail-section">
              <h3 class="section-title">Scene imagery</h3>
              <div class="col-images cap-row">
                <div class="image-section">
                  <span class="img-title">Panorama</span>
                  <div class="img-box panorama">
                    <img :src="active.panoramaUrl" alt="Panorama" />
                  </div>
                  <div class="pan-tools">
                    <button type="button" class="btn-ghost" @click="mockAction('Draw ROI → face')">
                      <el-icon><Scissor /></el-icon> ROI face
                    </button>
                    <button type="button" class="btn-ghost" @click="mockAction('Draw ROI → body')">
                      <el-icon><Scissor /></el-icon> ROI body
                    </button>
                    <button type="button" class="btn-ghost watch" @click="mockAction('Watch draft')">
                      <el-icon><Aim /></el-icon> Watch
                    </button>
                  </div>
                </div>
                <div class="image-section">
                  <span class="img-title">Target crop</span>
                  <div class="img-box cap">
                    <img :src="active.cropUrl" alt="Crop" />
                    <div class="score-badge" v-if="selectedIdMatch">Id {{ selectedIdMatch.score.toFixed(1) }}</div>
                  </div>
                  <div class="img-footer">
                    <p><el-icon><Location /></el-icon> {{ active.address }}</p>
                    <p><el-icon><VideoCamera /></el-icon> {{ active.device }}</p>
                    <div class="crop-actions">
                      <button type="button" class="action-btn detail" @click="mockAction('Search by crop')">Crop search</button>
                      <button type="button" class="action-btn reject" @click="mockAction('Watch by crop')">Crop watch</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section class="alarm-card detail-section">
              <h3 class="section-title">Map</h3>
              <div class="map-box">
                <OlMapView :lon-lat="active.lonLat" :label="active.address.slice(0, 18)" />
              </div>
            </section>

            <section class="alarm-card detail-section id-section">
              <h3 class="section-title">
                <el-icon><Postcard /></el-icon> Real identity 1:N (sorted by score)
              </h3>
              <p class="section-desc">
                Each capture is matched to <strong>{{ active.identityMatches.length }}</strong> library identities (mock). Click a row
                to set the <em>household center</em> for the family map below.
              </p>
              <div class="id-table">
                <div class="id-thead">
                  <span>#</span>
                  <span>Score</span>
                  <span>Lib face</span>
                  <span>Name / ID</span>
                  <span>Data source</span>
                </div>
                <div
                  v-for="(row, idx) in active.identityMatches"
                  :key="row.rank + '-' + row.idMask"
                  class="id-trow"
                  :class="{ active: selectedIdentityIdx === idx }"
                  @click="pickIdentity(idx)"
                >
                  <span class="c-rank">{{ row.rank }}</span>
                  <span class="c-score">
                    <span class="bar-wrap" :title="String(row.score)">
                      <i class="bar" :style="{ width: Math.min(100, row.score) + '%' }" />
                    </span>
                    <b>{{ row.score.toFixed(1) }}</b>
                  </span>
                  <span class="c-thumb">
                    <img :src="row.sampleFaceUrl" alt="" />
                  </span>
                  <span class="c-name">
                    <em>{{ maskOrShow(row.name) }}</em>
                    <small>{{ maskOrShow(row.idMask) }}</small>
                  </span>
                  <span class="c-src">{{ row.dataSource }}</span>
                </div>
              </div>
            </section>

            <section v-if="canRelations" class="alarm-card detail-section fam-section">
              <h3 class="section-title">
                <el-icon><User /></el-icon> Household (selected identity) + graph
              </h3>
              <p v-if="selectedIdMatch" class="section-desc">
                Center: <span class="accent">{{ maskOrShow(selectedIdMatch.name) }}</span> — edges are illustrative (mock).
              </p>
              <div class="fam-block">
                <div class="attr-rows">
                  <div
                    v-for="(f, i) in active.family"
                    :key="i"
                    class="data-group flat"
                  >
                    <span class="data-label">{{ f.relation }}</span>
                    <span class="data-value">{{ maskOrShow(f.name + ' ' + f.idMask) }}</span>
                  </div>
                </div>
                <FamilyRelationGraph
                  v-if="selectedIdMatch"
                  :center-name="selectedIdMatch.name"
                  :center-id-mask="selectedIdMatch.idMask"
                  :members="active.familyGraph.members"
                  :mask-identity="!canIdentity"
                />
                <p v-if="active.familyGraph.centerLabel" class="graph-cap">{{ active.familyGraph.centerLabel }}</p>
              </div>
            </section>

            <p v-else class="mask-note">Household and graph are hidden by policy.</p>

            <section class="alarm-card detail-section">
              <h3 class="section-title">Vehicles</h3>
              <div v-if="active.vehicleLinks.length" class="data-grid">
                <div v-for="(v, i) in active.vehicleLinks" :key="i" class="data-group flat">
                  <span class="data-label"> <el-icon><Link /></el-icon> {{ v.relation }}</span>
                  <span class="data-value mono">{{ v.plate }}</span>
                </div>
              </div>
            </section>

            <section class="alarm-card detail-section">
              <h3 class="section-title">Structured attributes</h3>
              <div class="attr-two">
                <div>
                  <p class="sub-h">Face</p>
                  <div v-for="(v, k) in active.faceAttrs" :key="'f' + k" class="data-group flat">
                    <span class="data-label">{{ k }}</span>
                    <span class="data-value">{{ v }}</span>
                  </div>
                </div>
                <div>
                  <p class="sub-h">Body</p>
                  <div v-for="(v, k) in active.bodyAttrs" :key="'b' + k" class="data-group flat">
                    <span class="data-label">{{ k }}</span>
                    <span class="data-value">{{ v }}</span>
                  </div>
                </div>
              </div>
            </section>

            <div class="detail-footer-actions">
              <button type="button" class="btn-primary search-btn" :disabled="!canArchive" @click="openArchive">
                <el-icon><Document /></el-icon> Open dossier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cap-alarm {
  display: flex;
  height: 100%;
  min-height: 0;
  color: #e2e8f0;
  overflow: hidden;
  background: transparent;
}

/* —— left filter: align Face Alarm —— */
.filter-panel {
  width: 280px;
  flex-shrink: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  margin-right: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-inner {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.2);
    border-radius: 4px;
  }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #38bdf8;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.form-group {
  margin-bottom: 12px;
  .cyber-label {
    display: block;
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 6px;
    &.small {
      font-size: 11px;
    }
  }
}

.ep-full {
  width: 100%;
}
:deep(.ep-full .el-input__wrapper) {
  background: rgba(10, 15, 30, 0.5) !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  box-shadow: none !important;
  border-radius: 8px;
}
:deep(.ep-full .el-input__inner) {
  color: #e2e8f0;
}

.uploader-ep {
  :deep(.el-upload-dragger) {
    background: rgba(10, 15, 30, 0.5) !important;
    border: 1px dashed rgba(148, 163, 184, 0.25) !important;
    border-radius: 12px;
    padding: 16px 8px;
  }
  :deep(.el-upload__text) {
    color: #94a3b8;
    font-size: 12px;
  }
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-primary,
.search-btn {
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
  color: #0a0f1a;
  border: none;
  padding: 8px 16px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  transition: all 0.2s;
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(34, 211, 238, 0.3);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* —— main —— */
.main-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 12px;
  padding: 0 4px 10px 4px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  .title {
    font-size: 22px;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0;
    letter-spacing: 0.3px;
  }
  .subtitle {
    font-size: 13px;
    color: #94a3b8;
    margin: 4px 0 0;
  }
  .highlight-num {
    color: #38bdf8;
    font-weight: 700;
  }
}
.perm-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  align-items: center;
  :deep(.el-switch__label) {
    color: #94a3b8;
    font-size: 11px;
  }
  :deep(.is-checked .el-switch__label--right) {
    color: #38bdf8;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 14px;
  border: 1px dashed rgba(148, 163, 184, 0.15);
  border-radius: 20px;
  margin: 8px 0;
}

.result-workspace {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  gap: 12px;
  min-height: 0;
}

@media (max-width: 1100px) {
  .result-workspace {
    grid-template-columns: 1fr;
  }
  .list-column {
    max-height: 40vh;
  }
}

.list-column {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.25);
  padding: 12px 12px 0;
}
.list-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin: 0 0 10px 4px;
}
.alarm-list-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  padding-right: 4px;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.2);
    border-radius: 4px;
  }
}

.hit-alarm-card {
  display: flex;
  gap: 12px;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
  &:hover {
    border-color: rgba(56, 189, 248, 0.35);
  }
  &.active {
    border-color: rgba(56, 189, 248, 0.55);
    box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.15);
  }
}
.col-thumb {
  position: relative;
  flex-shrink: 0;
}
.img-box {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: #000;
  &.sm {
    width: 88px;
    height: 88px;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.type-pill {
  display: block;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  &.p-face {
    color: #38bdf8;
  }
  &.p-body {
    color: #34d399;
  }
}
.score-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
  color: #0f172a;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
}
.col-meta {
  min-width: 0;
  flex: 1;
  .id-line {
    font-size: 12px;
    font-weight: 600;
    color: #f1f5f9;
    margin-bottom: 6px;
    word-break: break-all;
  }
}
.data-group {
  margin-bottom: 6px;
  display: flex;
  flex-direction: column;
  .data-label {
    font-size: 10px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .data-value {
    font-size: 12px;
    color: #e2e8f0;
    font-weight: 500;
    margin-top: 1px;
    line-height: 1.3;
    &.accent {
      color: #38bdf8;
    }
  }
  &.flat {
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.06);
    padding: 4px 0;
    margin: 0;
  }
}
.accent {
  color: #38bdf8;
}
.mono {
  font-family: ui-monospace, monospace;
  font-size: 12px;
}

.pagination-footer {
  margin-top: auto;
  padding: 10px 4px 10px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}
:deep(.cap-pager) {
  --el-pagination-bg-color: rgba(15, 23, 42, 0.8);
  --el-pagination-text-color: #94a3b8;
  --el-pagination-button-color: #94a3b8;
  --el-pagination-button-disabled-bg-color: transparent;
  justify-content: flex-end;
  flex-wrap: wrap;
  .el-pagination__total,
  .el-pagination__jump {
    color: #64748b;
  }
  .el-pager li.is-active {
    background: linear-gradient(135deg, #0ea5e9, #38bdf8) !important;
    color: #0f172a !important;
  }
}

.detail-column {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;
  background: rgba(8, 12, 24, 0.35);
}
.detail-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px 20px;
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.2);
    border-radius: 4px;
  }
}
.detail-section {
  margin-bottom: 14px;
}
.alarm-card {
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;
  padding: 16px 18px;
  transition: border-color 0.2s;
  &:hover {
    border-color: rgba(56, 189, 248, 0.15);
  }
}
.section-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 8px;
  .el-icon {
    color: #38bdf8;
  }
}
.section-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 12px;
  strong {
    color: #94a3b8;
  }
}
.sub-h {
  font-size: 11px;
  text-transform: uppercase;
  color: #38bdf8;
  letter-spacing: 0.06em;
  margin: 0 0 6px;
}

.col-images {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.col-images.cap-row .image-section {
  flex: 1;
  min-width: 200px;
  max-width: 100%;
}
.image-section {
  .img-title {
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 6px;
    display: block;
  }
  .img-box {
    width: 100%;
    max-width: 100%;
    aspect-ratio: 16/9;
    &.panorama {
      max-height: 220px;
    }
    &.cap {
      max-width: 280px;
      aspect-ratio: 1;
      border: 1px solid rgba(56, 189, 248, 0.25);
    }
  }
  .img-footer p {
    margin: 0;
    font-size: 11px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
  }
}
.pan-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.crop-actions {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
}
.btn-ghost {
  background: rgba(30, 41, 59, 0.7);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  &:hover {
    background: #334155;
    color: #fff;
  }
  &.watch {
    color: #fbbf24;
    border-color: rgba(251, 191, 36, 0.35);
  }
}
.action-btn {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  &.detail {
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.25);
  }
  &.reject {
    background: transparent;
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }
}

.map-box {
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.15);
}

/* identity table */
.id-table {
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  overflow: hidden;
  font-size: 12px;
}
.id-thead,
.id-trow {
  display: grid;
  grid-template-columns: 32px 120px 56px 1fr 1.1fr;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
}
.id-thead {
  background: rgba(10, 15, 30, 0.75);
  color: #64748b;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}
.id-trow {
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: rgba(56, 189, 248, 0.06);
  }
  &.active {
    background: rgba(56, 189, 248, 0.1);
    box-shadow: inset 2px 0 0 #38bdf8;
  }
}
.c-rank {
  color: #94a3b8;
  font-weight: 600;
}
.c-score {
  display: flex;
  align-items: center;
  gap: 6px;
  b {
    color: #38bdf8;
    min-width: 40px;
    font-size: 12px;
  }
}
.bar-wrap {
  flex: 1;
  height: 6px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
  overflow: hidden;
  min-width: 0;
  .bar {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #0ea5e9, #22d3ee);
    border-radius: 4px;
  }
}
.c-thumb img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.c-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
  em {
    font-style: normal;
    color: #f1f5f9;
    font-size: 12px;
  }
  small {
    color: #64748b;
    font-size: 10px;
  }
}
.c-src {
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.3;
  word-break: break-word;
}
@media (max-width: 700px) {
  .id-thead,
  .id-trow {
    grid-template-columns: 28px 100px 48px 1fr;
    .c-src {
      display: none;
    }
  }
  .id-thead span:nth-child(5) {
    display: none;
  }
}

.fam-section .fam-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.attr-rows {
  max-width: 100%;
}
.graph-cap {
  font-size: 10px;
  color: #64748b;
  margin: 0;
  text-align: center;
}
.mask-note {
  font-size: 12px;
  color: #64748b;
  padding: 0 4px 12px;
}
.attr-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 600px) {
  .attr-two {
    grid-template-columns: 1fr;
  }
}
.data-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.detail-footer-actions {
  padding: 4px 0 8px;
  display: flex;
  justify-content: flex-end;
}
</style>
