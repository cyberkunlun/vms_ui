<script setup lang="ts">
import { ref, onMounted } from 'vue'

const devices = [
  { id: 1, name: 'Gate3-Exit', status: 'online', type: 'camera' },
  { id: 2, name: 'Gate C2 Right-32', status: 'online', type: 'camera' },
  { id: 3, name: 'Arrival Domestic-49', status: 'online', type: 'camera' },
  { id: 4, name: 'Arrival International-46', status: 'online', type: 'camera' },
  { id: 5, name: 'Gate C2 Left-33', status: 'online', type: 'camera' },
  { id: 6, name: 'Arrival Employee Exit-48', status: 'online', type: 'camera' },
  { id: 7, name: 'VIP Arrivals-24', status: 'online', type: 'camera' }
]

const searchQuery = ref('')
const startTime = ref('2026-04-16 00:00:00')
const endTime = ref('2026-04-16 23:59:59')
const selectedDevice = ref(devices[0])

const timelineHours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0') + ':00')

const handleSearch = () => {
  console.log('Searching for:', startTime.value, endTime.value)
}

const handleReset = () => {
  startTime.value = '2026-04-16 00:00:00'
  endTime.value = '2026-04-16 23:59:59'
}
</script>

<template>
  <div class="video-playback-view">
    <!-- Left Sidebar: Device List -->
    <aside class="device-sidebar">
      <div class="sidebar-header">
        <span class="title">📁 Device List</span>
      </div>
      <div class="search-box">
        <input type="text" v-model="searchQuery" placeholder="Search devices..." />
      </div>
      <div class="device-list">
        <div 
          v-for="device in devices" 
          :key="device.id" 
          class="device-item"
          :class="{ active: selectedDevice?.id === device.id }"
          @click="selectedDevice = device"
        >
          <div class="status-indicator" :class="device.status"></div>
          <span class="icon">📹</span>
          <div class="info">
            <div class="name">{{ device.name }}</div>
            <div class="status-text">{{ device.status }}</div>
          </div>
        </div>
      </div>
      <div class="pagination-footer">
        <button class="page-btn">‹</button>
        <span class="page-info">1 / 13</span>
        <button class="page-btn">›</button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="playback-main">
      <!-- Top Query Bar -->
      <div class="query-bar">
        <div class="filter-item">
          <span class="label">Query time</span>
          <div class="date-range">
            <input type="text" v-model="startTime" />
            <span class="sep">-</span>
            <input type="text" v-model="endTime" />
          </div>
        </div>
        <div class="actions">
          <button class="btn search-btn" @click="handleSearch">🔍 Search</button>
          <button class="btn reset-btn" @click="handleReset">🔄 Reset</button>
        </div>
      </div>

      <!-- Video Player Area -->
      <div class="player-container">
        <div class="player-wrapper">
          <div class="player-header">
            <span class="cam-name">{{ selectedDevice?.name }} - Playback</span>
            <div class="player-controls">
              <span>HD</span>
              <span>🔈</span>
              <span>⛶</span>
            </div>
          </div>
          <!-- Mock Playback Video -->
          <img src="https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=1200&auto=format&fit=crop" class="mock-video" />
          
          <!-- Playback Overlay -->
          <div class="playback-controls">
            <button class="ctrl-btn">⏪</button>
            <button class="ctrl-btn play-btn">▶️</button>
            <button class="ctrl-btn">⏩</button>
            <div class="speed-select">1.0x</div>
          </div>
        </div>
      </div>

      <!-- Bottom Timeline -->
      <div class="timeline-container">
        <div class="timeline-ruler">
          <div v-for="hour in timelineHours" :key="hour" class="hour-mark">
            <div class="line"></div>
            <span class="label">{{ hour }}</span>
          </div>
          <!-- Current Pointer -->
          <div class="current-pointer" style="left: 35%;">
            <div class="time-tooltip">15:27:14</div>
          </div>
          <!-- Recorded Data Blocks -->
          <div class="data-block" style="left: 10%; width: 40%;"></div>
          <div class="data-block" style="left: 60%; width: 20%;"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.video-playback-view {
  height: 100%;
  display: flex;
  background: #010816;
  color: #fff;
  overflow: hidden;
}

/* Sidebar Styles */
.device-sidebar {
  width: 260px;
  background: rgba(15, 23, 42, 0.4);
  border-right: 1px solid rgba(56, 189, 248, 0.1);
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: 15px 20px;
    border-bottom: 1px solid rgba(56, 189, 248, 0.05);
    .title { font-weight: bold; color: #38bdf8; font-size: 14px; }
  }

  .search-box {
    padding: 12px;
    input {
      width: 100%;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(56, 189, 248, 0.2);
      color: #fff;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 13px;
      outline: none;
      &::placeholder { color: #475569; }
    }
  }

  .device-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 10px;

    .device-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 4px;
      transition: all 0.2s;

      &:hover { background: rgba(56, 189, 248, 0.05); }
      &.active {
        background: rgba(56, 189, 248, 0.15);
        border: 1px solid rgba(56, 189, 248, 0.3);
      }

      .status-indicator {
        width: 8px; height: 8px; border-radius: 50%;
        &.online { background: #10b981; box-shadow: 0 0 8px #10b981; }
        &.offline { background: #64748b; }
      }

      .icon { font-size: 18px; }
      .info {
        .name { font-size: 13px; font-weight: 500; color: #e2e8f0; }
        .status-text { font-size: 11px; color: #94a3b8; text-transform: capitalize; }
      }
    }
  }

  .pagination-footer {
    padding: 12px;
    border-top: 1px solid rgba(56, 189, 248, 0.05);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    .page-btn {
      background: transparent; border: 1px solid rgba(148, 163, 184, 0.2);
      color: #94a3b8; width: 24px; height: 24px; border-radius: 4px; cursor: pointer;
      &:hover { border-color: #00f7ff; color: #00f7ff; }
    }
    .page-info { font-size: 12px; color: #64748b; }
  }
}

/* Main Content Styles */
.playback-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 15px;
  background: radial-gradient(circle at 50% 50%, #0a1a3a 0%, #010816 100%);
}

.query-bar {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.1);
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 15px;
    .label { font-size: 13px; color: #94a3b8; }
    .date-range {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 4px;
      padding: 0 10px;
      input {
        background: transparent; border: none; color: #fff;
        padding: 6px 0; font-size: 12px; width: 140px; text-align: center; outline: none;
      }
      .sep { color: #475569; margin: 0 5px; }
    }
  }

  .actions {
    display: flex;
    gap: 10px;
    .btn {
      padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; transition: all 0.2s;
      &.search-btn { background: #3b82f6; color: #fff; border: none; &:hover { background: #2563eb; } }
      &.reset-btn { background: transparent; color: #94a3b8; border: 1px solid #334155; &:hover { border-color: #94a3b8; color: #fff; } }
    }
  }
}

.player-container {
  flex: 1;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.1);
  position: relative;

  .player-wrapper {
    width: 100%; height: 100%; position: relative;
    .mock-video { width: 100%; height: 100%; object-fit: contain; opacity: 0.8; }
    
    .player-header {
      position: absolute; top: 0; left: 0; right: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
      padding: 15px 20px; display: flex; justify-content: space-between;
      .cam-name { font-size: 14px; color: #38bdf8; font-weight: 500; }
      .player-controls { display: flex; gap: 15px; color: #94a3b8; font-size: 14px; cursor: pointer; }
    }

    .playback-controls {
      position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 20px;
      background: rgba(15, 23, 42, 0.9); padding: 10px 24px; border-radius: 30px;
      border: 1px solid rgba(56, 189, 248, 0.2);
      .ctrl-btn {
        background: transparent; border: none; color: #fff; font-size: 18px; cursor: pointer;
        &.play-btn { font-size: 24px; color: #38bdf8; }
        &:hover { transform: scale(1.1); }
      }
      .speed-select { font-size: 12px; color: #38bdf8; font-weight: bold; border: 1px solid #38bdf8; padding: 2px 6px; border-radius: 4px; }
    }
  }
}

.timeline-container {
  height: 80px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 8px;
  position: relative;
  overflow: hidden;

  .timeline-ruler {
    width: 100%; height: 100%; position: relative;
    display: flex; justify-content: space-between; padding: 0 10px;
    
    .hour-mark {
      height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
      .line { width: 1px; height: 15px; background: rgba(56, 189, 248, 0.3); margin-bottom: 5px; }
      .label { font-size: 10px; color: #64748b; margin-bottom: 8px; }
    }

    .current-pointer {
      position: absolute; top: 0; bottom: 0; width: 2px; background: #ef4444; z-index: 20;
      &::after { content: ''; position: absolute; top: 0; left: -4px; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid #ef4444; }
      .time-tooltip {
        position: absolute; top: -25px; left: 50%; transform: translateX(-50%);
        background: #ef4444; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 3px; white-space: nowrap;
      }
    }

    .data-block {
      position: absolute; top: 20px; height: 20px; background: rgba(16, 185, 129, 0.3);
      border-top: 1px solid #10b981; border-bottom: 1px solid #10b981;
    }
  }
}
</style>
