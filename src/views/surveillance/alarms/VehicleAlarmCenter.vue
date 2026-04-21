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
      <header class="main-header">
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
  background: #020617;
  color: #fff;
  overflow: hidden;
}

/* Sidebar */
.alarm-filters-sidebar {
  width: 240px;
  background: #0f172a;
  border-right: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
}

.filter-sections {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    label { font-size: 12px; color: #94a3b8; }
  }
}

.cyber-input, .cyber-select {
  width: 100%;
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-size: 13px;
  outline: none;
  &:focus { border-color: #38bdf8; }
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
.mt-2 { margin-top: 4px; }

.sidebar-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;

  .btn-search {
    flex: 1;
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    &:hover { background: #2563eb; }
  }

  .btn-reset {
    width: 42px;
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.2);
    color: #cbd5e1;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover { background: rgba(148, 163, 184, 0.1); }
  }
}

/* Main Content */
.alarm-content-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.2); border-radius: 3px; }
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .title { font-size: 24px; font-weight: 600; margin: 0; }
  .subtitle { font-size: 14px; color: #94a3b8; margin: 6px 0 0; }
  .count { color: #f87171; font-weight: 700; }

  .header-btns {
    display: flex;
    gap: 12px;
  }
}

.btn-header-ghost {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  &:hover { background: rgba(148, 163, 184, 0.1); border-color: #38bdf8; }
}

/* Alarm Card */
.alarm-cards-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.alarm-card {
  display: flex;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  &:hover { border-color: rgba(56, 189, 248, 0.3); }
}

.card-image-wrap {
  width: 320px;
  position: relative;
  img { width: 100%; height: 100%; object-fit: cover; }

  .plate-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: #3b82f6;
    color: #fff;
    padding: 4px 12px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }

  .status-badges-overlay {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid currentColor;
  
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  &.critical { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
  &.high { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
  &.pending { background: rgba(234, 179, 8, 0.2); color: #eab308; }
  &.verified { background: rgba(16, 185, 129, 0.2); color: #10b981; }
}

.card-info-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alarm-title { font-size: 18px; font-weight: 600; margin: 0; color: #f8fafc; }
.meta-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #94a3b8;
  margin-top: 6px;
  .meta-item { display: flex; align-items: center; gap: 6px; }
  .ml-4 { margin-left: 24px; }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  .grid-cell {
    .label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    .value { font-size: 14px; font-weight: 600; color: #e2e8f0; }
  }
}

.alarm-details-box {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid rgba(148, 163, 184, 0.1);

  .box-label { font-size: 11px; color: #64748b; margin-bottom: 6px; }
  .box-text { font-size: 13px; color: #cbd5e1; margin: 0; line-height: 1.5; }
}

.card-actions-rail {
  width: 140px;
  border-left: 1px solid rgba(148, 163, 184, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.btn-action {
  width: 100%;
  border: none;
  border-radius: 6px;
  padding: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &.confirm { background: #10b981; color: #fff; &:hover { background: #059669; } }
  &.reject { background: #ef4444; color: #fff; &:hover { background: #dc2626; } }
}

.btn-action-outline {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #cbd5e1;
  border-radius: 6px;
  padding: 8px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover { background: rgba(148, 163, 184, 0.1); border-color: #38bdf8; color: #fff; }
}

/* Pagination */
.pagination-area {
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #94a3b8;
}

.pager-btns {
  display: flex;
  gap: 8px;

  .btn-pager {
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.2);
    color: #fff;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    &.active { background: #3b82f6; border-color: #3b82f6; }
    &:hover:not(.active) { background: rgba(148, 163, 184, 0.1); }
  }
}
</style>
