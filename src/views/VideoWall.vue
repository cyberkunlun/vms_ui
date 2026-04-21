<script setup lang="ts">
import { ref } from 'vue'

interface Camera {
  id: number;
  name: string;
  ip: string;
  status: 'online' | 'offline';
  location: string;
  thumbnail: string;
  lastUpdate: string;
}

const locations = [
  { name: 'Oman(127)', count: 127, children: [
    { name: 'Muscat(108)', count: 108 },
    { name: 'Al Batinah North(0)', count: 0 },
    { name: 'Al Batinah South(0)', count: 0 },
    { name: 'Ash Sharqiyah North(0)', count: 0 },
    { name: 'Ad Dakhiliyah(1)', count: 1 },
    { name: 'Dhofar(1)', count: 1 }
  ]}
]

const cameras = ref<Camera[]>([
  { id: 1, name: 'VIP Arrivals-24', ip: '10.7.17.24', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16' },
  { id: 2, name: 'Transfer Domestic-26', ip: '10.7.17.26', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1542350327-4636dc45719b?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16' },
  { id: 3, name: 'Departure Domestic-50', ip: '10.7.17.50', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1590333746438-2834503f5573?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16' },
  { id: 4, name: 'Departure Employee-60', ip: '10.7.17.60', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1531058021387-39322098616e?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16' },
  { id: 5, name: 'Departure Economy Left-54', ip: '10.7.17.54', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16' },
  { id: 6, name: 'Departure Economy Right-62', ip: '10.7.17.62', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16' },
  { id: 7, name: 'Gate B Arrival Middle-58', ip: '10.7.17.58', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16' },
  { id: 8, name: 'Departure Economy Middle-51', ip: '10.7.17.51', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16' },
  { id: 9, name: 'Gate A Arrival Right-56', ip: '10.7.17.56', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16' },
  { id: 10, name: 'Gate C3 Left-31', ip: '10.7.17.31', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16' },
  { id: 11, name: 'Transfer Domestic to Intl-30', ip: '10.7.17.30', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16' },
  { id: 12, name: 'Gate C3 Right-29', ip: '10.7.17.29', status: 'online', location: 'MCT Airport', thumbnail: 'https://images.unsplash.com/photo-1542350327-4636dc45719b?q=80&w=400&auto=format&fit=crop', lastUpdate: '2026-04-16' }
])

const deviceName = ref('')
const deviceIp = ref('')
const runningStatus = ref('')

const handleSearch = () => {
  console.log('Searching for:', deviceName.value, deviceIp.value, runningStatus.value)
}

const handleReset = () => {
  deviceName.value = ''
  deviceIp.value = ''
  runningStatus.value = ''
}

const goToMonitor = (camera: Camera) => {
  window.dispatchEvent(new CustomEvent('switch-view', { detail: 'monitor' }))
}
</script>

<template>
  <div class="video-wall-view">
    <!-- Left Sidebar: Device Location -->
    <aside class="location-sidebar">
      <div class="sidebar-header">
        <span class="title">Device Location</span>
        <button class="grid-btn">🔳</button>
      </div>
      <div class="search-box">
        <input type="text" placeholder="search" />
      </div>
      <div class="location-tree">
        <div v-for="loc in locations" :key="loc.name" class="tree-root">
          <div class="tree-item active">
            <span class="arrow">▼</span>
            <span class="folder">📂</span>
            <span class="name">{{ loc.name }}</span>
          </div>
          <div class="tree-children">
            <div v-for="child in loc.children" :key="child.name" class="tree-item child">
              <span class="arrow">▶</span>
              <span class="folder">📁</span>
              <span class="name">{{ child.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="wall-main">
      <!-- Top Filter Bar -->
      <div class="filter-bar">
        <div class="filter-item">
          <span class="label">Device Name</span>
          <input type="text" v-model="deviceName" placeholder="Please enter device name" />
        </div>
        <div class="filter-item">
          <span class="label">Device IP</span>
          <input type="text" v-model="deviceIp" placeholder="Please enter device IP" />
        </div>
        <div class="filter-item">
          <span class="label">Running Status</span>
          <select v-model="runningStatus">
            <option value="">Select running status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div class="actions">
          <button class="btn search-btn" @click="handleSearch">Search</button>
          <button class="btn reset-btn" @click="handleReset">Reset</button>
        </div>
      </div>

      <!-- Camera Grid Area -->
      <div class="camera-grid-container">
        <div class="camera-grid">
          <div v-for="cam in cameras" :key="cam.id" class="camera-card" @click="goToMonitor(cam)">
            <div class="card-thumb">
              <img :src="cam.thumbnail" :alt="cam.name" />
              <div class="overlay">
                <span class="play-icon">▶</span>
              </div>
            </div>
            <div class="card-info">
              <div class="name">{{ cam.name }}</div>
              <div class="details">
                <span class="ip">{{ cam.ip }}</span>
                <span class="status-tag" :class="cam.status">{{ cam.status }}</span>
                <span class="loc">{{ cam.location }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-bar">
        <div class="total">Total 123</div>
        <div class="page-size">
          <select>
            <option>20/page</option>
          </select>
        </div>
        <div class="pager">
          <button class="arrow">‹</button>
          <span class="page-num active">1</span>
          <span class="page-num">2</span>
          <span class="page-num">3</span>
          <span class="page-num">4</span>
          <span class="page-num">5</span>
          <button class="arrow">›</button>
        </div>
        <div class="goto">
          Go to <input type="text" value="1" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.video-wall-view {
  height: 100%;
  display: flex;
  background: #010816;
  color: #fff;
  overflow: hidden;
}

/* Sidebar Styles */
.location-sidebar {
  width: 260px;
  background: rgba(15, 23, 42, 0.4);
  border-right: 1px solid rgba(56, 189, 248, 0.1);
  display: flex; flex-direction: column;

  .sidebar-header {
    padding: 15px 20px;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid rgba(56, 189, 248, 0.05);
    .title { font-weight: bold; color: #38bdf8; font-size: 14px; }
    .grid-btn { background: transparent; border: none; color: #64748b; cursor: pointer; }
  }

  .search-box {
    padding: 12px;
    input {
      width: 100%; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(56, 189, 248, 0.2);
      color: #fff; padding: 6px 10px; border-radius: 4px; font-size: 12px; outline: none;
    }
  }

  .location-tree {
    flex: 1; overflow-y: auto; padding: 10px;
    .tree-item {
      display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 4px; cursor: pointer;
      font-size: 13px; color: #94a3b8;
      &:hover { background: rgba(56, 189, 248, 0.05); color: #e2e8f0; }
      &.active { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
      .arrow { font-size: 10px; width: 12px; }
      .folder { font-size: 14px; }
    }
    .tree-children { padding-left: 20px; }
  }
}

/* Main Area Styles */
.wall-main {
  flex: 1; display: flex; flex-direction: column; padding: 15px; gap: 15px;
  background: radial-gradient(circle at 50% 50%, #0a1a3a 0%, #010816 100%);
}

.filter-bar {
  background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.1);
  padding: 12px 20px; border-radius: 8px; display: flex; align-items: center; gap: 20px;
  flex-wrap: wrap;

  .filter-item {
    display: flex; align-items: center; gap: 10px;
    .label { font-size: 13px; color: #94a3b8; white-space: nowrap; }
    input, select {
      background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(148, 163, 184, 0.2);
      color: #fff; padding: 6px 12px; border-radius: 4px; font-size: 12px; outline: none;
      min-width: 180px;
      &:focus { border-color: #00f7ff; }
    }
  }

  .actions {
    display: flex; gap: 10px; margin-left: auto;
    .btn {
      padding: 6px 20px; border-radius: 4px; font-size: 13px; cursor: pointer;
      &.search-btn { background: #3b82f6; color: #fff; border: none; &:hover { background: #2563eb; } }
      &.reset-btn { background: transparent; color: #94a3b8; border: 1px solid #334155; &:hover { color: #fff; border-color: #94a3b8; } }
    }
  }
}

.camera-grid-container {
  flex: 1; overflow-y: auto;
  .camera-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;
  }
}

.camera-card {
  background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 6px; overflow: hidden; cursor: pointer; transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px); border-color: #00f7ff;
    box-shadow: 0 10px 20px rgba(0,0,0,0.5);
    .card-thumb .overlay { opacity: 1; }
  }

  .card-thumb {
    position: relative; width: 100%; aspect-ratio: 16/9; background: #000;
    img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
    .overlay {
      position: absolute; inset: 0; background: rgba(0, 247, 255, 0.1);
      display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s;
      .play-icon { font-size: 32px; color: #00f7ff; text-shadow: 0 0 15px rgba(0, 247, 255, 0.5); }
    }
  }

  .card-info {
    padding: 12px;
    .name { font-size: 14px; font-weight: 600; color: #f1f5f9; margin-bottom: 8px; }
    .details {
      display: flex; align-items: center; gap: 10px; font-size: 11px;
      .ip { color: #3b82f6; }
      .status-tag {
        padding: 1px 6px; border-radius: 2px; text-transform: capitalize;
        &.online { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        &.offline { background: rgba(100, 116, 139, 0.1); color: #64748b; }
      }
      .loc { color: #64748b; }
    }
  }
}

.pagination-bar {
  display: flex; align-items: center; gap: 20px; padding: 10px 0; font-size: 13px; color: #94a3b8;
  border-top: 1px solid rgba(56, 189, 248, 0.05);

  .pager {
    display: flex; align-items: center; gap: 8px; margin-left: auto;
    .page-num {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      border: 1px solid #334155; border-radius: 4px; cursor: pointer;
      &.active { background: #3b82f6; border-color: #3b82f6; color: #fff; }
      &:hover:not(.active) { border-color: #38bdf8; color: #38bdf8; }
    }
    .arrow { background: transparent; border: 1px solid #334155; color: #94a3b8; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; }
  }

  .goto input {
    width: 40px; background: rgba(0,0,0,0.3); border: 1px solid #334155; color: #fff;
    padding: 2px 4px; text-align: center; border-radius: 4px;
  }
  
  select { background: rgba(0,0,0,0.3); border: 1px solid #334155; color: #fff; padding: 2px 8px; border-radius: 4px; }
}
</style>
