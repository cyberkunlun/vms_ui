<script setup lang="ts">
import { ref, reactive } from 'vue'
import CameraSelectionMap from '@/components/CameraSelectionMap.vue'
import {
  Search,
  Plus,
  Filter,
  View,
  Edit,
  Delete,
  SwitchButton,
  DataAnalysis,
  Camera,
  Compass,
  Location,
  Monitor,
  VideoCamera,
  Van,
  Calendar
} from '@element-plus/icons-vue'

interface VehicleTask {
  id: string
  name: string
  plateNumber: string
  type: 'Long-term' | 'Short-term'
  status: 'Active' | 'Paused' | 'Expired'
  cameraCount: number
  createTime: string
}

const tasks = ref<VehicleTask[]>([
  {
    id: '#VT-1024',
    name: 'Stolen White Toyota Search',
    plateNumber: 'OM-1234, OM-5678',
    type: 'Short-term',
    status: 'Active',
    cameraCount: 15,
    createTime: '2026-04-20 09:00:00'
  },
  {
    id: '#VT-1025',
    name: 'Illegal Taxi Monitoring',
    plateNumber: 'OM-9988, OM-7766',
    type: 'Long-term',
    status: 'Paused',
    cameraCount: 42,
    createTime: '2026-04-18 14:30:00'
  },
  {
    id: '#VT-1026',
    name: 'VIP Convoy Route Protection',
    plateNumber: 'VIP-001, VIP-002',
    type: 'Short-term',
    status: 'Active',
    cameraCount: 120,
    createTime: '2026-04-21 11:20:00'
  }
])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return '#10b981'
    case 'Paused': return '#f59e0b'
    case 'Expired': return '#ef4444'
    default: return '#94a3b8'
  }
}

const dialogVisible = ref(false)
const dialogTitle = ref('Create Vehicle Task')
const form = reactive({
  name: '',
  plates: '',
  type: 'Short-term',
  dateRange: [],
  remark: '',
  selectedCameras: 0
})

const handleSelectionChange = (count: number) => {
  form.selectedCameras = count
}

const handleAdd = () => {
  dialogTitle.value = 'Create New Vehicle Task'
  dialogVisible.value = true
}

const handleEdit = (task: VehicleTask) => {
  dialogTitle.value = 'Edit Vehicle Task'
  form.name = task.name
  form.plates = task.plateNumber
  form.type = task.type
  dialogVisible.value = true
}

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const totalTasks = ref(38)
</script>

<template>
  <div class="task-list-layout">
    <!-- Header Area -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="title">Vehicle Surveillance Task</h1>
        <p class="subtitle">License Plate Recognition · Traffic Anomaly Detection</p>
      </div>
      <div class="header-right">
        <div class="stats-pill">
          <el-icon class="stats-icon"><DataAnalysis /></el-icon>
          <div class="stat-item">
            <span class="dot active-dot"></span>
            <span>3 Active</span>
          </div>
          <div class="stat-item">
            <span class="dot paused-dot"></span>
            <span>1 Paused</span>
          </div>
        </div>
        <button class="btn-create" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          Create New Task
        </button>
      </div>
    </header>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-label">
        <el-icon><Filter /></el-icon>
        Filters:
      </div>
      
      <div class="search-input-wrap">
        <el-icon class="search-icon"><Search /></el-icon>
        <input type="text" class="search-input" placeholder="Search by task name or plate..." />
      </div>

      <select class="cyber-select">
        <option>All Status</option>
        <option>Active</option>
        <option>Paused</option>
        <option>Expired</option>
      </select>

      <select class="cyber-select">
        <option>All Types</option>
        <option>Short-term</option>
        <option>Long-term</option>
      </select>
    </div>

    <!-- Task Card List -->
    <div class="task-grid">
      <article class="task-card" v-for="task in tasks" :key="task.id">
        <div class="card-main">
          <div class="task-info">
            <div class="task-name-row">
              <span class="status-indicator" :style="{ backgroundColor: getStatusColor(task.status) }"></span>
              <h3 class="task-name">{{ task.name }}</h3>
            </div>
            <div class="task-meta">
              <span class="meta-item id-text">{{ task.id }}</span>
              <span class="divider">|</span>
              <span class="plate-info">
                <el-icon><Van /></el-icon> {{ task.plateNumber }}
              </span>
              <span class="divider">|</span>
              <span class="meta-item">{{ task.type }}</span>
            </div>
          </div>
          
          <div class="task-stats">
            <div class="stat-group">
              <el-icon><VideoCamera /></el-icon>
              <span>{{ task.cameraCount }} Cameras</span>
            </div>
            <div class="stat-group">
              <el-icon><Calendar /></el-icon>
              <span>{{ task.createTime }}</span>
            </div>
          </div>
        </div>

        <div class="task-actions">
          <div class="status-badge" :class="task.status.toLowerCase()">
            {{ task.status }}
          </div>
          <div class="btn-group">
            <button class="action-btn btn-detail">
              <el-icon><View /></el-icon> Detail
            </button>
            <button class="action-btn btn-edit" @click="handleEdit(task)">
              <el-icon><Edit /></el-icon> Edit
            </button>
            <button class="action-btn btn-delete">
              <el-icon><Delete /></el-icon>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Pagination -->
    <div class="cyber-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalTasks"
        background
      />
    </div>

    <!-- Unified Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1200px"
      class="cyber-dialog-premium"
      destroy-on-close
    >
      <div class="dialog-split-layout">
        <!-- Left: Conditions Form -->
        <div class="params-section">
          <div class="section-title">
            <el-icon><Monitor /></el-icon> Task Configuration
          </div>
          
          <el-form :model="form" label-position="top" class="premium-form">
            <el-form-item label="Task Designation">
              <el-input v-model="form.name" placeholder="E.g. VIP Vehicle Tracking" />
            </el-form-item>
            
            <el-form-item label="Target Plate IDs">
              <el-input 
                v-model="form.plates" 
                type="textarea" 
                :rows="2"
                placeholder="Separate multiple plates with commas..." 
              />
            </el-form-item>

            <div class="form-row">
              <el-form-item label="Duration Strategy" class="flex-1">
                <el-radio-group v-model="form.type" class="glass-radio">
                  <el-radio-button label="Short-term" />
                  <el-radio-button label="Long-term" />
                </el-radio-group>
              </el-form-item>
            </div>

            <el-form-item label="Operation Timeline">
              <el-date-picker
                v-model="form.dateRange"
                type="datetimerange"
                range-separator="-"
                start-placeholder="Commence"
                end-placeholder="Complete"
                class="glass-date-picker"
              />
            </el-form-item>

            <el-form-item label="Additional Directives">
              <el-input v-model="form.remark" type="textarea" placeholder="Operational comments..." />
            </el-form-item>
          </el-form>
        </div>

        <!-- Right: Map Selection Area -->
        <div class="map-selection-section">
          <div class="section-title">
            <el-icon><Location /></el-icon> Deployment Perimeter
          </div>
          
          <div class="map-container">
            <CameraSelectionMap 
              :visible="dialogVisible" 
              @selection-change="handleSelectionChange" 
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="premium-footer">
          <button class="btn-cancel" @click="dialogVisible = false">Cancel</button>
          <button class="btn-submit" @click="dialogVisible = false">
            Validate & Deploy Task
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.task-list-layout {
  padding: 12px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: #e2e8f0;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .title { font-size: 26px; font-weight: 700; color: #fff; margin: 0 0 6px 0; }
  .subtitle { font-size: 13px; color: #94a3b8; margin: 0; }

  .header-right { display: flex; gap: 24px; align-items: center; }
}

.stats-pill {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 10px 20px;
  gap: 20px;
  font-size: 13px;

  .stats-icon { font-size: 18px; color: #38bdf8; }
  .stat-item {
    display: flex; align-items: center; gap: 8px; color: #cbd5e1;
    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      &.active-dot { background: #10b981; box-shadow: 0 0 10px #10b981; }
      &.paused-dot { background: #f59e0b; box-shadow: 0 0 10px #f59e0b; }
    }
  }
}

.btn-create {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);
  transition: all 0.3s;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(14, 165, 233, 0.6); }
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(26, 32, 53, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 14px 20px;
  margin-bottom: 24px;

  .filter-label { display: flex; align-items: center; gap: 8px; color: #38bdf8; font-weight: 600; font-size: 14px; }
}

.search-input-wrap {
  flex: 1; position: relative;
  .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b; }
  .search-input {
    width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 10px; padding: 10px 16px 10px 45px; color: #fff; font-size: 14px; outline: none;
    &:focus { border-color: #38bdf8; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.1); }
  }
}

.cyber-select {
  width: 160px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px; color: #fff; padding: 10px 16px; font-size: 13px; outline: none; cursor: pointer;
  &:hover { border-color: #38bdf8; }
}

/* Task Cards */
.task-grid { display: flex; flex-direction: column; gap: 16px; }

.task-card {
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    background: rgba(30, 41, 59, 0.5);
    border-color: rgba(56, 189, 248, 0.3);
    transform: translateX(4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  }
}

.card-main { display: flex; align-items: center; gap: 60px; flex: 1; }

.task-info {
  width: 300px;
  .task-name-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
    .status-indicator { width: 10px; height: 10px; border-radius: 50%; }
    .task-name { margin: 0; font-size: 20px; font-weight: 700; color: #f8fafc; }
  }
  .task-meta {
    display: flex; align-items: center; gap: 12px; font-size: 13px; color: #64748b;
    .id-text { font-family: monospace; font-weight: 600; color: #94a3b8; }
    .plate-info { color: #38bdf8; display: flex; align-items: center; gap: 6px; font-weight: 600; }
    .divider { color: rgba(148, 163, 184, 0.2); }
  }
}

.task-stats {
  display: flex; gap: 40px;
  .stat-group {
    display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 13px;
    .el-icon { font-size: 18px; color: #38bdf8; margin-bottom: 4px; }
  }
}

.task-actions {
  display: flex; align-items: center; gap: 24px;
  .status-badge {
    padding: 6px 18px; border-radius: 30px; font-size: 11px; font-weight: 800; text-transform: uppercase;
    &.active { color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.1); }
    &.paused { color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.1); }
  }
  .btn-group { display: flex; gap: 12px; }
}

.action-btn {
  display: flex; align-items: center; gap: 8px; background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.15); border-radius: 10px; padding: 10px 18px;
  font-size: 13px; color: #cbd5e1; cursor: pointer; transition: 0.2s;
  &:hover { border-color: #38bdf8; color: #fff; background: rgba(56, 189, 248, 0.1); }
  &.btn-delete:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
}

/* Custom Pagination Styling */
.cyber-pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding-bottom: 20px;

  :deep(.el-pagination) {
    --el-pagination-bg-color: rgba(30, 41, 59, 0.4);
    --el-pagination-text-color: #94a3b8;
    --el-pagination-button-color: #94a3b8;
    --el-pagination-hover-color: #38bdf8;
    
    .el-pagination__total, .el-pagination__jump {
      color: #64748b;
    }
    
    .el-input__wrapper {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.2);
      box-shadow: none;
      .el-input__inner { color: #cbd5e1; }
    }

    .el-pager li {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 6px;
      margin: 0 4px;
      font-weight: 600;
      &.is-active {
        background: rgba(14, 165, 233, 0.2);
        border-color: #38bdf8;
        color: #38bdf8;
      }
      &:hover { color: #38bdf8; }
    }
    
    .btn-prev, .btn-next {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 6px;
      margin: 0 4px;
      &:hover { color: #38bdf8; }
      &:disabled { background: rgba(15, 23, 42, 0.4); color: #475569; border-color: transparent; }
    }
  }
}

/* Dialog Styling */
:deep(.el-dialog.cyber-dialog-premium) {
  background: rgba(15, 23, 42, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 24px;
  .el-dialog__header { padding: 24px 32px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
  .el-dialog__title { color: #fff; font-weight: 700; font-size: 20px; }
  .el-dialog__body { padding: 32px; }
}

.dialog-split-layout { display: flex; gap: 40px; height: 600px; }

.params-section { flex: 1; display: flex; flex-direction: column; gap: 24px; }
.section-title {
  font-size: 15px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 10px;
  margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;
}

.premium-form {
  :deep(.el-form-item__label) { color: #94a3b8; font-size: 12px; font-weight: 600; padding: 0 0 8px 0; }
  :deep(.el-input__wrapper), :deep(.el-textarea__inner) {
    background: rgba(10, 15, 30, 0.6) !important; border: 1px solid rgba(148, 163, 184, 0.15); box-shadow: none; border-radius: 12px; color: #fff;
    &:hover, &.is-focus { border-color: #38bdf8; }
  }
}

.map-selection-section { width: 650px; display: flex; flex-direction: column; gap: 24px; }
.map-container { flex: 1; display: flex; flex-direction: column; gap: 16px; }



/* Footer Actions */
.premium-footer {
  display: flex; justify-content: flex-end; gap: 16px;
  button { padding: 12px 32px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
  .btn-cancel { background: transparent; border: 1px solid rgba(148, 163, 184, 0.2); color: #94a3b8; &:hover { color: #fff; border-color: #fff; } }
  .btn-submit { background: linear-gradient(135deg, #0ea5e9, #38bdf8); border: none; color: #fff; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4); &:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(14, 165, 233, 0.6); } }
}
</style>
