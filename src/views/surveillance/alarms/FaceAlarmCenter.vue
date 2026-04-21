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
  VideoCamera
} from '@element-plus/icons-vue'

interface FaceAlarm {
  id: string
  time: string
  taskType: string
  library: string
  score: string
  capImg: string
  libImg: string
  location: string
  device: string
  personName: string
}

const alarms = ref<FaceAlarm[]>([
  {
    id: '1',
    time: '2026-04-13 10:15:33',
    taskType: 'Blacklist Alert',
    library: 'Criminal DB',
    score: '94%',
    capImg: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300',
    libImg: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=300&h=300',
    location: 'Muscat City Center',
    device: 'CAM-MCT-001',
    personName: 'Ahmed Al-Rashid'
  },
  {
    id: '2',
    time: '2026-04-13 14:18:42',
    taskType: 'Suspicious Activity',
    library: 'Watchlist',
    score: '87%',
    capImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300',
    libImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300',
    location: 'North Gate Entrance',
    device: 'CAM-NGE-004',
    personName: 'Saleh Malik'
  }
])
</script>

<template>
  <div class="face-alarm-layout">
    <!-- 左侧过滤器面板 -->
    <aside class="filter-panel">
      <div class="panel-inner">
        <div class="panel-header">
          <el-icon><Search /></el-icon>
          <span>Search Filters</span>
        </div>
        
        <div class="form-group">
          <label class="cyber-label">Task Type</label>
          <select class="cyber-select">
            <option>All Tasks</option>
          </select>
        </div>

        <div class="form-group">
          <label class="cyber-label">Date Range</label>
          <div class="cyber-input-wrap">
            <input type="text" class="cyber-input" value="2026/04/13 00:00" />
            <el-icon class="append-icon"><Calendar /></el-icon>
          </div>
          <div class="cyber-input-wrap mt-2">
            <input type="text" class="cyber-input" value="2026/04/13 23:59" />
            <el-icon class="append-icon"><Calendar /></el-icon>
          </div>
        </div>

        <div class="form-group">
          <label class="cyber-label">Handling Status</label>
          <select class="cyber-select">
            <option>All Status</option>
          </select>
        </div>

        <div class="form-group">
          <label class="cyber-label">Alarm Level</label>
          <select class="cyber-select">
            <option>All Levels</option>
          </select>
        </div>

        <div class="form-group">
          <label class="cyber-label">Library</label>
          <select class="cyber-select">
            <option>All Libraries</option>
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
          <h2 class="title">Face Alarm Center</h2>
          <p class="subtitle"><span class="highlight-num">6</span> active face alarms requiring attention</p>
        </div>
        <div class="header-right">
          <button class="btn-ghost"><el-icon><Files /></el-icon> Batch Process</button>
          <button class="btn-ghost"><el-icon><Download /></el-icon> Export Report</button>
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
                <el-icon><Warning /></el-icon> HIGH
              </span>
              <span class="status-tag verified">
                <el-icon><Check /></el-icon> VERIFIED
              </span>
            </div>
            <div class="meta-data">
              <div class="data-group">
                <span class="data-label">Alarm Time</span>
                <span class="data-value">{{ alarm.time }}</span>
              </div>
              <div class="data-group">
                <span class="data-label">Task Type</span>
                <span class="data-value">{{ alarm.taskType }}</span>
              </div>
              <div class="data-group">
                <span class="data-label">Library</span>
                <span class="data-value">{{ alarm.library }}</span>
              </div>
            </div>
          </div>

          <!-- 图片展示列 -->
          <div class="col-images">
            <!-- 抓拍图像 -->
            <div class="image-section capture">
              <span class="img-title">Captured Image</span>
              <div class="img-box capture-box">
                <img :src="alarm.capImg" alt="Captured" />
                <div class="score-badge">★ {{ alarm.score }}</div>
              </div>
              <div class="img-footer capture-footer">
                <p><el-icon><Location /></el-icon> {{ alarm.location }}</p>
                <p><el-icon><VideoCamera /></el-icon> {{ alarm.device }}</p>
              </div>
            </div>

            <!-- 库内图像 -->
            <div class="image-section library">
              <span class="img-title">Library Image</span>
              <div class="img-box library-box">
                <img :src="alarm.libImg" alt="Library" />
              </div>
              <div class="img-footer library-footer">
                <h4>{{ alarm.personName }}</h4>
                <p>Match Score: {{ alarm.score }}</p>
              </div>
            </div>
          </div>

          <!-- 操作按钮列 -->
          <div class="col-actions">
            <button class="action-btn confirm">Confirm</button>
            <button class="action-btn detail">Detail</button>
            <button class="action-btn reject">Reject</button>
            <button class="btn-icon-ghost"><el-icon><UserFilled /></el-icon></button>
          </div>
        </article>
      </div>

      <!-- 分页底栏 -->
      <footer class="pagination-footer">
        <span class="page-info">Showing 1 to 6 of 6 alarms</span>
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
.face-alarm-layout {
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
  border-radius: 24px;
  margin-right: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #38bdf8;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  }
}

.form-group {
  margin-bottom: 18px;
  .cyber-label {
    display: block;
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 6px;
  }
}

.cyber-select, .cyber-input {
  width: 100%;
  background: rgba(10, 15, 30, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #fff;
  padding: 8px 12px;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
  &:focus { border-color: #38bdf8; }
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
.mt-2 { margin-top: 8px; }

.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

/* =========== 右侧主内容区 =========== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 4px; /* Scrollbar space */

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 4px; }
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  .title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0; }
  .subtitle { font-size: 13px; color: #94a3b8; margin: 4px 0 0; }
  .highlight-num { color: #38bdf8; font-weight: 700; }
  .header-right { display: flex; gap: 12px; }
}

/* 告警列表区 */
.alarm-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alarm-card {
  display: flex;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;
  padding: 20px;
  gap: 24px;
  transition: transform 0.2s, border-color 0.2s;
  &:hover {
    border-color: rgba(56, 189, 248, 0.3);
    transform: translateY(-2px);
  }
}

.col-info {
  width: 180px;
  flex-shrink: 0;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 40px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 8px;
  margin-bottom: 8px;
  &.high { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
  &.verified { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
}

.meta-data {
  .data-group {
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    .data-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .data-value { font-size: 13px; color: #e2e8f0; font-weight: 500; margin-top: 2px; }
  }
}

.col-images {
  flex: 1;
  display: flex;
  gap: 20px;
}

.image-section {
  flex: 1;
  max-width: 260px;
  .img-title { font-size: 11px; color: #94a3b8; margin-bottom: 6px; display: block; }
  .img-box {
    width: 100%;
    aspect-ratio: 4/3;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.05);
    img { width: 100%; height: 100%; object-fit: cover; }
    &.capture-box { border: 1px solid rgba(239, 68, 68, 0.4); }
  }
}

.score-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
  color: #0f172a;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.img-footer {
  margin-top: 8px;
  p { margin: 0; font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 4px; margin-bottom: 2px; }
  h4 { margin: 0; font-size: 14px; font-weight: 600; color: #f1f5f9; }
}

.col-actions {
  width: 120px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

/* 按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
  color: #0a0f1a;
  border: none;
  padding: 8px 16px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  transition: all 0.2s;
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(34, 211, 238, 0.3); }
}

.btn-ghost {
  background: rgba(30, 41, 59, 0.7);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 6px 14px;
  border-radius: 40px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  &:hover { background: #334155; color: white; }
}

.action-btn {
  width: 100%;
  padding: 6px 0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  &.confirm { background: #10b981; color: white; }
  &.detail { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); }
  &.reject { background: transparent; color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.2); }
}

.btn-icon-ghost {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 auto;
}

.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 8px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  .page-info { font-size: 12px; color: #64748b; }
}

.pagination {
  display: flex;
  gap: 8px;
  .page-btn {
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.1);
    color: #94a3b8;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    &.active { background: #38bdf8; border-color: #38bdf8; color: #0f172a; font-weight: 600; }
  }
}
</style>
