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
  MapLocation,
  Document,
  Share,
  Aim
} from '@element-plus/icons-vue'

interface VehicleAlarm {
  id: string
  title: string
  time: string
  location: string
  plateNumber: string
  vehicleType: string
  vehicleColor: string
  captureDevice: string
  captureLocation: string
  details: string
  status: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  step: 'PENDING' | 'VERIFIED'
  image: string
}

const alarms = ref<VehicleAlarm[]>([
  {
    id: '1',
    title: 'Stolen Vehicle Alert',
    time: '2026-04-13 14:25:30',
    location: 'Sultan Qaboos Highway',
    plateNumber: 'OM-1234',
    vehicleType: 'Sedan',
    vehicleColor: 'Black',
    captureDevice: 'CAM-SQH-045',
    captureLocation: 'Sultan Qaboos Highway',
    details: 'Vehicle OM-1234 detected at Sultan Qaboos Highway. Task: Stolen Vehicle Alert. Immediate action required for Level 1 alarm.',
    status: 'CRITICAL',
    step: 'PENDING',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'Suspicious Activity',
    time: '2026-04-13 14:20:15',
    location: 'Al Ghubrah Roundabout',
    plateNumber: 'OM-5678',
    vehicleType: 'SUV',
    vehicleColor: 'White',
    captureDevice: 'CAM-AGR-012',
    captureLocation: 'Al Ghubrah Roundabout',
    details: 'Vehicle OM-5678 observed circling the area multiple times. Potential unauthorized parking in restricted zone.',
    status: 'HIGH',
    step: 'VERIFIED',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
  }
])

const activeTab = ref('All Status')

defineProps<{
  hideTitle?: boolean
}>()
</script>

<template>
  <div class="vehicle-alarm-page">
    <!-- Sidebar Filters -->
    <aside class="alarm-filters-sidebar">
      <h2 class="sidebar-title">Alarm Filters</h2>
      
      <div class="filter-sections">
        <div class="filter-item">
          <label>Task Name</label>
          <select class="cyber-select">
            <option>All Tasks</option>
          </select>
        </div>

        <div class="filter-item">
          <label>Vehicle Number</label>
          <input type="text" class="cyber-input" placeholder="e.g., OM-1234" />
        </div>

        <div class="filter-item">
          <label>Handling Status</label>
          <select class="cyber-select">
            <option>All Status</option>
          </select>
        </div>

        <div class="filter-item">
          <label>Time Range</label>
          <div class="time-input-wrap">
            <input type="text" class="cyber-input" value="/2026/04/13  00:00" />
            <el-icon class="cal-icon"><Calendar /></el-icon>
          </div>
          <div class="time-input-wrap mt-2">
            <input type="text" class="cyber-input" value="/2026/04/13  23:59" />
            <el-icon class="cal-icon"><Calendar /></el-icon>
          </div>
        </div>

        <div class="filter-item">
          <label>Device</label>
          <select class="cyber-select">
            <option>All Devices</option>
          </select>
        </div>
      </div>

      <div class="sidebar-actions">
        <button class="btn-search">
          <el-icon><Search /></el-icon> Search
        </button>
        <button class="btn-reset">
          <el-icon><Refresh /></el-icon>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="alarm-content-main">
      <header class="main-header" v-if="!hideTitle">
        <div class="header-info">
          <h1 class="title">Vehicle Alarm Center</h1>
          <p class="subtitle"><span class="count">5</span> active vehicle alarms requiring attention</p>
        </div>
        <div class="header-btns">
          <button class="btn-header-ghost">Map View</button>
          <button class="btn-header-ghost">Export Report</button>
        </div>
      </header>

      <div class="alarm-cards-list">
        <article class="alarm-card" v-for="alarm in alarms" :key="alarm.id">
          <!-- Card Image Section -->
          <div class="card-image-wrap">
            <img :src="alarm.image" alt="Captured Vehicle" />
            <div class="plate-badge">{{ alarm.plateNumber }}</div>
            <div class="status-badges-overlay">
              <div class="status-tag" :class="alarm.status.toLowerCase()">
                <span class="dot"></span> {{ alarm.status }}
              </div>
              <div class="status-tag step-tag" :class="alarm.step.toLowerCase()">
                <span class="dot"></span> {{ alarm.step }}
              </div>
            </div>
          </div>

          <!-- Card Info Section -->
          <div class="card-info-content">
            <div class="info-top">
              <h3 class="alarm-title">{{ alarm.title }}</h3>
              <div class="meta-row">
                <span class="meta-item"><el-icon><Calendar /></el-icon> {{ alarm.time }}</span>
                <span class="meta-item ml-4"><el-icon><Location /></el-icon> {{ alarm.location }}</span>
              </div>
            </div>

            <div class="info-grid">
              <div class="grid-cell">
                <div class="label">Vehicle Type</div>
                <div class="value">{{ alarm.vehicleType }}</div>
              </div>
              <div class="grid-cell">
                <div class="label">Vehicle Color</div>
                <div class="value">{{ alarm.vehicleColor }}</div>
              </div>
              <div class="grid-cell">
                <div class="label">Capture Device</div>
                <div class="value">{{ alarm.captureDevice }}</div>
              </div>
              <div class="grid-cell">
                <div class="label">Capture Location</div>
                <div class="value">{{ alarm.captureLocation }}</div>
              </div>
            </div>

            <div class="alarm-details-box">
              <div class="box-label">Alarm Details</div>
              <p class="box-text">{{ alarm.details }}</p>
            </div>
          </div>

          <!-- Card Actions Section -->
          <div class="card-actions-rail">
            <button class="btn-action confirm"><el-icon><Check /></el-icon> Confirm</button>
            <button class="btn-action reject"><el-icon><Close /></el-icon> Reject</button>
            <button class="btn-action-outline"><el-icon><View /></el-icon> Detail</button>
            <button class="btn-action-outline"><el-icon><UserFilled /></el-icon> Assign</button>
            <button class="btn-action-outline"><el-icon><Aim /></el-icon> Track</button>
          </div>
        </article>
      </div>

      <!-- Footer Pagination -->
      <footer class="pagination-area">
        <div class="showing-count">Showing 1 to 5 of 5 alarms</div>
        <div class="pager-btns">
          <button class="btn-pager">Previous</button>
          <button class="btn-pager active">1</button>
          <button class="btn-pager">Next</button>
        </div>
      </footer>
    </main>
  </div>
</template>

<style scoped lang="scss">
.vehicle-alarm-page {
  display: flex;
  height: 100%;
  background: transparent;
  color: #fff;
  overflow: hidden;
}

/* Sidebar */
.alarm-filters-sidebar {
  width: 240px;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 16px;
  margin-right: 12px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-sections {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    label { font-size: 11px; color: #94a3b8; font-weight: 500; }
  }
}

.cyber-input, .cyber-select {
  width: 100%;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  padding: 8px 12px;
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
  &:focus { border-color: #38bdf8; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.1); }
  &::placeholder { color: #64748b; }
}

.time-input-wrap {
  position: relative;
  .cal-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-size: 14px;
  }
}

.sidebar-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;

  .btn-search {
    flex: 1;
    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    &:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4); }
  }

  .btn-reset {
    width: 42px;
    background: rgba(148, 163, 184, 0.05);
    border: 1px solid rgba(148, 163, 184, 0.2);
    color: #cbd5e1;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover { background: rgba(148, 163, 184, 0.1); border-color: #38bdf8; color: #38bdf8; }
  }
}

/* Main Content */
.alarm-content-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 4px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 4px; }
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);

  .title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin: 0; }
  .subtitle { font-size: 13px; color: #94a3b8; margin: 4px 0 0; }
  .count { color: #f87171; font-weight: 700; }

  .header-btns {
    display: flex;
    gap: 10px;
  }
}

.btn-header-ghost {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover { background: rgba(56, 189, 248, 0.1); border-color: #38bdf8; color: #fff; }
}

/* Alarm Card */
.alarm-cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alarm-card {
  display: flex;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover { 
    border-color: rgba(56, 189, 248, 0.4); 
    background: rgba(15, 23, 42, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }
}

.card-image-wrap {
  width: 320px;
  position: relative;
  img { width: 100%; height: 100%; object-fit: cover; }

  .plate-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    background: rgba(14, 165, 233, 0.9);
    backdrop-filter: blur(4px);
    color: #fff;
    padding: 6px 14px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .status-badges-overlay {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: flex-end;
  }
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 30px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

  &.critical { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
  &.high { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
  &.pending { background: rgba(234, 179, 8, 0.15); color: #fbbf24; border: 1px solid rgba(234, 179, 8, 0.3); }
  &.verified { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
}

.card-info-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alarm-title { font-size: 18px; font-weight: 700; margin: 0; color: #f8fafc; }
.meta-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #94a3b8;
  margin-top: 4px;
  .meta-item { display: flex; align-items: center; gap: 8px; }
  .ml-4 { margin-left: 24px; }
  .el-icon { color: #38bdf8; }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  .grid-cell {
    .label { font-size: 10px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
    .value { font-size: 14px; font-weight: 600; color: #e2e8f0; }
  }
}

.alarm-details-box {
  background: rgba(10, 15, 30, 0.4);
  border-radius: 12px;
  padding: 14px 18px;
  border: 1px solid rgba(148, 163, 184, 0.08);

  .box-label { font-size: 10px; color: #475569; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; }
  .box-text { font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.6; }
}

.card-actions-rail {
  width: 140px;
  border-left: 1px solid rgba(148, 163, 184, 0.08);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.btn-action {
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &.confirm { background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); &:hover { background: #10b981; color: #fff; } }
  &.reject { background: rgba(248, 113, 113, 0.15); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); &:hover { background: #ef4444; color: #fff; } }
}

.btn-action-outline {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border-radius: 8px;
  padding: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  &:hover { background: rgba(56, 189, 248, 0.08); border-color: #38bdf8; color: #38bdf8; }
}

/* Pagination */
.pagination-area {
  margin-top: 24px;
  padding: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #64748b;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
}

.pager-btns {
  display: flex;
  gap: 8px;

  .btn-pager {
    background: rgba(30, 41, 59, 0.3);
    border: 1px solid rgba(148, 163, 184, 0.15);
    color: #94a3b8;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    &.active { background: #38bdf8; border-color: #38bdf8; color: #020617; font-weight: 700; }
    &:hover:not(.active) { background: rgba(56, 189, 248, 0.1); color: #fff; border-color: #38bdf8; }
  }
}
</style>
