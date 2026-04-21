<script setup lang="ts">
import { ref, computed } from 'vue'

interface Snapshot {
  id: number;
  type: 'person' | 'vehicle' | 'non-motor';
  time: string;
  image: string;
  name?: string;
  licensePlate?: string;
}

const windowMode = ref(4) // 1, 4, 9
const activeWindow = ref(0)
const selectedSnapshot = ref<Snapshot | null>(null)
const showProfile = ref(false)

const stats = [
  { label: '今日行人', value: '2,251', icon: '👤', color: '#a855f7' },
  { label: '今日车辆', value: '1,120', icon: '🚗', color: '#eab308' },
  { label: '今日非机动车', value: '458', icon: '🚲', color: '#06b6d4' },
  { label: '今日事件', value: '12', icon: '🚨', color: '#ef4444' }
]

const snapshots = ref<Snapshot[]>([
  { id: 1, type: 'person', time: '15:26:40', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', name: '张三' },
  { id: 2, type: 'person', time: '15:25:03', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', name: '李四' },
  { id: 3, type: 'person', time: '15:23:26', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', name: '王五' },
  { id: 4, type: 'person', time: '15:22:33', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop', name: '赵六' },
  { id: 5, type: 'vehicle', time: '15:21:10', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=200&auto=format&fit=crop', licensePlate: '京A·88888' },
  { id: 6, type: 'non-motor', time: '15:20:05', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=200&auto=format&fit=crop' }
])

const openProfile = (snap: Snapshot) => {
  selectedSnapshot.value = snap
  showProfile.value = true
}

const goToPlayback = () => {
  // Logic to navigate to playback page
  window.dispatchEvent(new CustomEvent('switch-view', { detail: 'playback' }))
}
</script>

<template>
  <div class="live-monitor-view">
    <!-- Top Stats Bar -->
    <div class="top-header">
      <div class="camera-info">
        <span class="label">卡口订阅：</span>
        <select class="camera-select">
          <option>Camera_001 (Gate 1)</option>
          <option selected>Camera_004 (Main Entrance)</option>
          <option>Camera_007 (Parking Lot)</option>
        </select>
      </div>

      <div class="stats-group">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <div class="icon" :style="{ color: stat.color }">{{ stat.icon }}</div>
          <div class="info">
            <div class="value">{{ stat.value }}</div>
            <div class="label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button class="action-btn">➕ 新建任务</button>
        <button class="action-btn">🔲 全屏展示</button>
      </div>
    </div>

    <div class="main-content">
      <!-- Video Grid Area -->
      <div class="video-grid-container">
        <div class="video-grid" :class="`grid-${windowMode}`">
          <div 
            v-for="i in windowMode" 
            :key="i" 
            class="video-window"
            :class="{ active: activeWindow === i-1 }"
            @click="activeWindow = i-1"
          >
            <div class="video-placeholder">
              <div class="video-overlay">
                <span class="cam-name">Camera_00{{ i }}</span>
                <span class="rec-dot"></span>
              </div>
              <!-- Mock Video Stream Image -->
              <img src="https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=1200&auto=format&fit=crop" class="mock-stream" />
            </div>
          </div>
        </div>

        <!-- Grid Controls -->
        <div class="grid-controls">
          <button @click="windowMode = 1" :class="{ active: windowMode === 1 }">1</button>
          <button @click="windowMode = 4" :class="{ active: windowMode === 4 }">4</button>
          <button @click="windowMode = 9" :class="{ active: windowMode === 9 }">9</button>
        </div>
      </div>

      <!-- Right Snapshot Sidebar -->
      <div class="snapshot-sidebar">
        <div class="sidebar-header">
          <span class="title">抓拍记录</span>
          <div class="filter-icons">
            <button class="icon-btn active">🔳</button>
            <button class="icon-btn">👤</button>
            <button class="icon-btn">🚗</button>
            <button class="icon-btn">🚲</button>
          </div>
        </div>

        <div class="snapshot-list">
          <div class="section-title">👤 行人抓拍</div>
          <div class="grid-2">
            <div v-for="snap in snapshots.filter(s => s.type === 'person')" :key="snap.id" class="snap-item" @click="openProfile(snap)">
              <div class="img-wrapper">
                <img :src="snap.image" />
                <div class="time-tag">{{ snap.time }}</div>
              </div>
            </div>
          </div>

          <div class="section-title">🚗 车辆抓拍</div>
          <div class="grid-2">
            <div v-for="snap in snapshots.filter(s => s.type === 'vehicle')" :key="snap.id" class="snap-item" @click="openProfile(snap)">
              <div class="img-wrapper">
                <img :src="snap.image" />
                <div class="time-tag">{{ snap.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Personal Profile Modal -->
    <div v-if="showProfile" class="modal-overlay" @click.self="showProfile = false">
      <div class="profile-modal">
        <div class="modal-header">
          <span class="title">个人档案 - {{ selectedSnapshot?.name || '未知人员' }}</span>
          <button class="close-btn" @click="showProfile = false">×</button>
        </div>
        
        <div class="modal-body">
          <div class="profile-main">
            <img :src="selectedSnapshot?.image" class="avatar" />
            <div class="info-list">
              <div class="info-item"><span class="label">性别：</span> 男</div>
              <div class="info-item"><span class="label">年龄：</span> 约 35 岁</div>
              <div class="info-item"><span class="label">特征：</span> 黑色夹克, 蓝色牛仔裤</div>
              <div class="info-item"><span class="label">发现地点：</span> 主入口 004 号摄像机</div>
            </div>
          </div>

          <div class="analysis-tabs">
            <div class="tab-header">
              <button class="active">📍 轨迹分析</button>
              <button>👥 伴随分析</button>
            </div>
            <div class="tab-content">
              <div class="trajectory-list">
                <div class="traj-item">
                  <div class="dot"></div>
                  <div class="time">15:26:40</div>
                  <div class="loc">主入口 - 进入</div>
                </div>
                <div class="traj-item">
                  <div class="dot"></div>
                  <div class="time">15:28:15</div>
                  <div class="loc">A区走廊 - 通过</div>
                </div>
                <div class="traj-item">
                  <div class="dot"></div>
                  <div class="time">15:30:05</div>
                  <div class="loc">B区电梯口 - 停留</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="playback-btn" @click="goToPlayback">🎥 历史数据回放</button>
          <button class="close-btn-main" @click="showProfile = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.live-monitor-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #010816;
  color: #fff;
  overflow: hidden;
}

.top-header {
  padding: 15px 24px;
  background: rgba(15, 23, 42, 0.6);
  border-bottom: 1px solid rgba(56, 189, 248, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .camera-info {
    display: flex;
    align-items: center;
    gap: 10px;
    .label { color: #94a3b8; font-size: 14px; }
    .camera-select {
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(56, 189, 248, 0.2);
      color: #fff;
      padding: 6px 12px;
      border-radius: 4px;
      outline: none;
    }
  }

  .stats-group {
    display: flex;
    gap: 30px;
    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      .icon { font-size: 20px; }
      .value { font-size: 20px; font-weight: bold; line-height: 1; }
      .label { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    .action-btn {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      color: #e2e8f0;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      &:hover { border-color: #00f7ff; color: #00f7ff; }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 15px;
  gap: 15px;
}

.video-grid-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;

  .video-grid {
    flex: 1;
    display: grid;
    gap: 10px;
    &.grid-1 { grid-template-columns: 1fr; }
    &.grid-4 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); }
    &.grid-9 { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); }
  }

  .video-window {
    background: #000;
    border: 2px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    &.active { border-color: #00f7ff; box-shadow: 0 0 15px rgba(0, 247, 255, 0.3); }

    .video-placeholder {
      width: 100%;
      height: 100%;
      position: relative;
      .mock-stream { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; }
      .video-overlay {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 10;
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(0,0,0,0.5);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        .rec-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: blink 1s infinite; }
      }
    }
  }

  .grid-controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    button {
      width: 36px; height: 36px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      color: #94a3b8;
      border-radius: 4px;
      cursor: pointer;
      &.active { background: #00f7ff; color: #010816; border-color: #00f7ff; }
    }
  }
}

.snapshot-sidebar {
  width: 320px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .sidebar-header {
    padding: 15px;
    border-bottom: 1px solid rgba(56, 189, 248, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title { font-weight: bold; color: #e2e8f0; }
    .filter-icons {
      display: flex;
      gap: 5px;
      .icon-btn {
        background: transparent; border: none; color: #64748b; cursor: pointer; padding: 4px;
        &.active { color: #00f7ff; }
      }
    }
  }

  .snapshot-list {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    .section-title { font-size: 12px; color: #94a3b8; margin: 15px 0 10px; &:first-child { margin-top: 0; } }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    
    .snap-item {
      cursor: pointer;
      transition: transform 0.2s;
      &:hover { transform: scale(1.05); }
      .img-wrapper {
        position: relative;
        aspect-ratio: 1;
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.1);
        img { width: 100%; height: 100%; object-fit: cover; }
        .time-tag {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: rgba(0,0,0,0.6); color: #fff; font-size: 10px;
          text-align: center; padding: 2px 0;
        }
      }
    }
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

.profile-modal {
  width: 600px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  .modal-header {
    padding: 15px 20px;
    background: #1e293b;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title { font-weight: bold; color: #38bdf8; }
    .close-btn { background: transparent; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; }
  }

  .modal-body {
    padding: 24px;
    .profile-main {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      .avatar { width: 120px; height: 120px; border-radius: 8px; object-fit: cover; border: 2px solid #38bdf8; }
      .info-list {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        .info-item { font-size: 14px; color: #e2e8f0; .label { color: #94a3b8; } }
      }
    }

    .analysis-tabs {
      .tab-header {
        display: flex; border-bottom: 1px solid #334155; margin-bottom: 15px;
        button {
          background: transparent; border: none; color: #94a3b8; padding: 8px 16px; cursor: pointer;
          &.active { color: #00f7ff; border-bottom: 2px solid #00f7ff; }
        }
      }
      .trajectory-list {
        display: flex; flex-direction: column; gap: 12px;
        .traj-item {
          display: flex; align-items: center; gap: 15px; font-size: 13px;
          .dot { width: 8px; height: 8px; background: #00f7ff; border-radius: 50%; box-shadow: 0 0 8px #00f7ff; }
          .time { color: #94a3b8; width: 60px; }
          .loc { color: #e2e8f0; }
        }
      }
    }
  }

  .modal-footer {
    padding: 15px 24px;
    background: #1e293b;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    .playback-btn {
      background: #0ea5e9; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;
      &:hover { background: #0284c7; }
    }
    .close-btn-main {
      background: #334155; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;
      &:hover { background: #475569; }
    }
  }
}

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
