<script setup lang="ts">
import { ref } from 'vue'
import {
  Search,
  Refresh,
  Calendar,
  Warning,
  Check,
  Close,
  View,
  UserFilled,
  Download,
  Files,
  Location,
  VideoCamera,
  Bicycle,
  Van
} from '@element-plus/icons-vue'

interface VehicleAlarm {
  id: string
  time: string
  plateNumber: string
  vehicleInfo: string // e.g. White Toyota Camry
  score: string
  capImg: string
  plateImg: string
  location: string
  device: string
  taskType: string
}

const alarms = ref<VehicleAlarm[]>([
  {
    id: 'V1',
    time: '2024-04-13 11:25:08',
    plateNumber: 'AU 93821',
    vehicleInfo: 'White Mercedes-Benz C-Class',
    score: '98%',
    capImg: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&h=400',
    plateImg: 'https://images.unsplash.com/photo-1594070319944-7c0c638966a9?auto=format&fit=crop&w=200&h=100',
    location: 'Downtown Intersection-A4',
    device: 'CAM-DT-LPR-01',
    taskType: 'Blacklist Recovery'
  },
  {
    id: 'V2',
    time: '2024-04-13 13:42:15',
    plateNumber: 'DX 44210',
    vehicleInfo: 'Silver BMW X5',
    score: '95%',
    capImg: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&h=400',
    plateImg: 'https://images.unsplash.com/photo-1594070319944-7c0c638966a9?auto=format&fit=crop&w=200&h=100',
    location: 'North Bypass Entrance',
    device: 'CAM-NB-LPR-05',
    taskType: 'Stolen Vehicle Match'
  }
])
</script>

<template>
  <div class="vehicle-alarm-layout">
    <!-- 左侧过滤器面板 -->
    <aside class="filter-panel">
      <div class="panel-inner">
        <div class="panel-header">
          <el-icon><Search /></el-icon>
          <span>Vehicle Filter</span>
        </div>
        
        <div class="form-group">
          <label class="cyber-label">Plate Number</label>
          <input type="text" class="cyber-input" placeholder="e.g. AU 93821" />
        </div>

        <div class="form-group">
          <label class="cyber-label">Date Range</label>
          <div class="cyber-input-wrap">
            <input type="text" class="cyber-input" value="2024/04/13 00:00" />
            <el-icon class="append-icon"><Calendar /></el-icon>
          </div>
          <div class="cyber-input-wrap mt-2">
            <input type="text" class="cyber-input" value="2024/04/13 23:59" />
            <el-icon class="append-icon"><Calendar /></el-icon>
          </div>
        </div>

        <div class="form-group">
          <label class="cyber-label">Vehicle Type</label>
          <select class="cyber-select">
            <option>All Types</option>
            <option>Sedan</option>
            <option>SUV</option>
            <option>Truck</option>
          </select>
        </div>

        <div class="form-group">
          <label class="cyber-label">Vehicle Color</label>
          <select class="cyber-select">
            <option>All Colors</option>
            <option>White</option>
            <option>Black</option>
            <option>Silver</option>
          </select>
        </div>

        <div class="filter-actions">
          <button class="btn-primary search-btn">
            <el-icon><Search /></el-icon> Search
          </button>
          <button class="btn-ghost reset-btn">
            <el-icon><Refresh /></el-icon>
          </button>
        </div>
      </div>
    </aside>

    <!-- 右侧内容区域 -->
    <main class="main-content">
      <!-- 头部信息 -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="title">Vehicle Alarm Center</h2>
          <p class="subtitle"><span class="highlight-num">{{ alarms.length }}</span> vehicle alerts detected by intelligent LPR</p>
        </div>
        <div class="header-right">
          <button class="btn-ghost"><el-icon><Files /></el-icon> Batch Process</button>
          <button class="btn-ghost"><el-icon><Download /></el-icon> Export CSV</button>
        </div>
      </header>

      <!-- 告警列表区 -->
      <div class="alarm-list-container">
        <!-- 单个告警卡片 -->
        <article class="alarm-card" v-for="alarm in alarms" :key="alarm.id">
          <!-- 信息列 -->
          <div class="col-info">
            <div class="tag-row">
              <span class="status-tag high">
                <el-icon><Warning /></el-icon> CRITICAL
              </span>
            </div>
            <div class="meta-data">
              <div class="data-group">
                <span class="data-label">Detection Time</span>
                <span class="data-value">{{ alarm.time }}</span>
              </div>
              <div class="data-group">
                <span class="data-label">Plate Number</span>
                <span class="plate-highlight">{{ alarm.plateNumber }}</span>
              </div>
              <div class="data-group">
                <span class="data-label">Task Context</span>
                <span class="data-value">{{ alarm.taskType }}</span>
              </div>
            </div>
          </div>

          <!-- 图片展示列 -->
          <div class="col-images">
            <!-- 车辆全景抓拍 -->
            <div class="image-section vehicle-context">
              <span class="img-title">Vehicle Snapshot</span>
              <div class="img-box context-box">
                <img :src="alarm.capImg" alt="Vehicle" />
                <div class="recognition-badge">Recognized: {{ alarm.vehicleInfo }}</div>
              </div>
              <div class="img-footer context-footer">
                <p><el-icon><Location /></el-icon> {{ alarm.location }}</p>
                <p><el-icon><VideoCamera /></el-icon> {{ alarm.device }}</p>
              </div>
            </div>

            <!-- 车牌细节图 -->
            <div class="image-section plate-detail">
              <span class="img-title">LPR Detail</span>
              <div class="img-box plate-box">
                <img :src="alarm.plateImg" alt="Plate" />
                <div class="score-overlay">{{ alarm.score }} Confidence</div>
              </div>
              <div class="img-footer plate-footer">
                <div class="plate-text-render">{{ alarm.plateNumber }}</div>
                <p>System Match Score: {{ alarm.score }}</p>
              </div>
            </div>
          </div>

          <!-- 操作按钮列 -->
          <div class="col-actions">
            <button class="action-btn confirm">Intercept</button>
            <button class="action-btn detail">Archive</button>
            <button class="action-btn reject">False Alert</button>
            <button class="btn-icon-ghost"><el-icon><UserFilled /></el-icon></button>
          </div>
        </article>
      </div>

      <!-- 分页底栏 -->
      <footer class="pagination-footer">
        <span class="page-info">Total {{ alarms.length }} vehicle alarms in current shift</span>
        <div class="pagination">
          <button class="page-btn">Previous</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">Next</button>
        </div>
      </footer>
    </main>
  </div>
</template>

<style scoped lang="scss">
.vehicle-alarm-layout {
  display: flex;
  height: 100%;
  background: transparent;
  color: #e2e8f0;
  overflow: hidden;
}

/* =========== 左侧过滤器面板 =========== */
.filter-panel {
  width: 280px;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  margin-right: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #38bdf8;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  }
}

.form-group {
  margin-bottom: 16px;
  .cyber-label {
    display: block;
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 4px;
  }
}

.cyber-select, .cyber-input {
  width: 100%;
  background: rgba(10, 15, 30, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  color: #fff;
  padding: 8px 12px;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
  &:focus { border-color: #38bdf8; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.1); }
}

.cyber-input-wrap {
  position: relative;
  .append-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-size: 14px;
  }
}
.mt-2 { margin-top: 6px; }

.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

/* =========== 右侧主内容区 =========== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 4px; }
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
  .title { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0; }
  .subtitle { font-size: 12px; color: #94a3b8; margin: 4px 0 0; }
  .highlight-num { color: #f87171; font-weight: 700; }
  .header-right { display: flex; gap: 10px; }
}

/* 告警卡片列表 */
.alarm-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alarm-card {
  display: flex;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 16px;
  gap: 20px;
  transition: all 0.2s;
  &:hover {
    border-color: rgba(56, 189, 248, 0.3);
    background: rgba(15, 23, 42, 0.6);
  }
}

.col-info {
  width: 170px;
  flex-shrink: 0;
}

.plate-highlight {
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(251, 191, 36, 0.2);
  display: inline-block;
  margin-top: 4px;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  margin-bottom: 12px;
  &.high { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
}

.meta-data {
  .data-group {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    .data-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .data-value { font-size: 12px; color: #e2e8f0; font-weight: 500; margin-top: 2px; }
  }
}

.col-images {
  flex: 1;
  display: flex;
  gap: 16px;
}

.image-section {
  flex: 1;
  max-width: 250px;
  .img-title { font-size: 10px; color: #64748b; margin-bottom: 4px; display: block; }
  .img-box {
    width: 100%;
    aspect-ratio: 16/10;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.05);
    img { width: 100%; height: 100%; object-fit: cover; }
  }
}

.recognition-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  font-size: 11px;
  backdrop-filter: blur(4px);
}

.score-overlay {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(16, 185, 129, 0.8);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.plate-text-render {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2px;
}

.img-footer {
  margin-top: 6px;
  p { margin: 0; font-size: 10px; color: #64748b; display: flex; align-items: center; gap: 4px; margin-bottom: 2px; }
}

.col-actions {
  width: 110px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
}

/* 按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
  color: #0a0f1a;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  transition: all 0.2s;
  &:hover { box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
}

.btn-ghost {
  background: rgba(30, 41, 59, 0.5);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  &:hover { background: rgba(56, 189, 248, 0.1); color: #fff; border-color: #38bdf8; }
}

.action-btn {
  width: 100%;
  padding: 6px 0;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &.confirm { background: #10b981; color: white; border: none; &:hover { background: #059669; } }
  &.detail { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); &:hover { background: rgba(56, 189, 248, 0.2); } }
  &.reject { background: transparent; color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.2); &:hover { border-color: #f87171; color: #f87171; } }
}

.btn-icon-ghost {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #64748b;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 auto;
  &:hover { color: #38bdf8; border-color: #38bdf8; }
}

.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  .page-info { font-size: 11px; color: #64748b; }
}

.pagination {
  display: flex;
  gap: 6px;
  .page-btn {
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.1);
    color: #94a3b8;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
    &.active { background: #38bdf8; border-color: #38bdf8; color: #0f172a; font-weight: 600; }
  }
}
</style>
