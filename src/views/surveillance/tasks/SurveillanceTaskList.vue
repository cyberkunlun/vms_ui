<script setup lang="ts">
import { ref } from 'vue'
import {
  Search,
  Plus,
  Filter,
  View,
  Edit,
  Delete,
  SwitchButton,
  DataAnalysis,
  Camera
} from '@element-plus/icons-vue'

interface Task {
  id: string
  name: string
  type: string
  cameras: number
  status: 'Active' | 'Pending Approval' | 'Disabled'
}

const tasks = ref<Task[]>([
  {
    id: '#2847',
    name: 'Downtown Surveillance',
    type: 'Temporary',
    cameras: 12,
    status: 'Active'
  },
  {
    id: '#2846',
    name: 'Harbor District Monitoring',
    type: 'Long-term',
    cameras: 8,
    status: 'Pending Approval'
  },
  {
    id: '#2845',
    name: 'North Quarter Watch',
    type: 'Long-term',
    cameras: 15,
    status: 'Active'
  },
  {
    id: '#2844',
    name: 'Central Station Monitor',
    type: 'Temporary',
    cameras: 6,
    status: 'Active'
  }
])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return '#10b981' // emerald-500
    case 'Pending Approval': return '#eab308' // yellow-500
    case 'Disabled': return '#ef4444' // red-500
    default: return '#94a3b8'
  }
}
</script>

<template>
  <div class="task-list-layout">
    <!-- Header Area -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="title">Surveillance Task</h1>
        <p class="subtitle">Face Recognition Monitoring · Real-time AI Security</p>
      </div>
      <div class="header-right">
        <div class="stats-pill">
          <el-icon class="stats-icon"><DataAnalysis /></el-icon>
          <div class="stat-item">
            <span class="dot active-dot"></span>
            <span>4 Active</span>
          </div>
          <div class="stat-item">
            <span class="dot disabled-dot"></span>
            <span>2 Disabled</span>
          </div>
          <div class="stat-item">
            <span class="dot pending-dot"></span>
            <span>2 Pending</span>
          </div>
        </div>
        <button class="btn-create">
          <el-icon><Plus /></el-icon>
          Create New Task
        </button>
      </div>
    </header>

    <!-- Filters Area -->
    <div class="filter-bar">
      <div class="filter-label">
        <el-icon><Filter /></el-icon>
        Filters:
      </div>
      
      <div class="search-input-wrap">
        <el-icon class="search-icon"><Search /></el-icon>
        <input type="text" class="search-input" placeholder="Search by task name or ID..." />
      </div>

      <select class="cyber-select">
        <option>All Status</option>
        <option>Active</option>
        <option>Disabled</option>
        <option>Pending</option>
      </select>

      <select class="cyber-select">
        <option>All Term Types</option>
        <option>Temporary</option>
        <option>Long-term</option>
      </select>
    </div>

    <!-- Task List Area -->
    <div class="task-list">
      <article class="task-card" v-for="task in tasks" :key="task.id">
        <div class="task-info">
          <div class="task-name-row">
            <span class="status-indicator" :style="{ backgroundColor: getStatusColor(task.status) }"></span>
            <h3 class="task-name">{{ task.name }}</h3>
          </div>
          <div class="task-meta">
            <span class="meta-item">ID: {{ task.id }}</span>
            <span class="meta-divider">|</span>
            <span class="meta-item">Type: {{ task.type }}</span>
            <span class="meta-divider">|</span>
            <span class="meta-item camera-info">
              <el-icon><Camera /></el-icon> {{ task.cameras }} cameras
            </span>
          </div>
        </div>
        
        <div class="task-actions">
          <!-- Status Badge -->
          <div class="status-badge" :class="task.status.toLowerCase().replace(' ', '-')">
            {{ task.status }}
          </div>
          
          <!-- Action Buttons -->
          <button class="action-btn btn-detail">
            <el-icon><View /></el-icon> Detail
          </button>
          
          <button class="action-btn btn-edit">
            <el-icon><Edit /></el-icon> Edit
          </button>
          
          <button class="action-btn" :class="task.status === 'Disabled' ? 'btn-enable' : 'btn-disable'">
            <el-icon><SwitchButton /></el-icon> 
            {{ task.status === 'Disabled' ? 'Enable' : 'Disable' }}
          </button>
          
          <button class="action-btn btn-delete icon-only">
            <el-icon><Delete /></el-icon>
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
.task-list-layout {
  padding: 32px 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: #e2e8f0;
  overflow-y: auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-left {
    .title {
      font-size: 28px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 8px 0;
      letter-spacing: 0.5px;
    }
    .subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }
  }

  .header-right {
    display: flex;
    gap: 20px;
    align-items: center;
  }
}

.stats-pill {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  padding: 8px 16px;
  gap: 16px;
  font-size: 13px;

  .stats-icon {
    font-size: 16px;
    color: #38bdf8;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #cbd5e1;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      &.active-dot { background: #10b981; box-shadow: 0 0 8px #10b981; }
      &.disabled-dot { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
      &.pending-dot { background: #eab308; box-shadow: 0 0 8px #eab308; }
    }
  }
}

.btn-create {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(14, 165, 233, 0.6);
  }
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(26, 32, 53, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 32px;

  .filter-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #38bdf8;
    font-size: 14px;
    font-weight: 500;
  }
}

.search-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;

  .search-icon {
    position: absolute;
    left: 16px;
    color: #64748b;
    font-size: 16px;
  }

  .search-input {
    width: 100%;
    background: #0f172a;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 8px;
    padding: 10px 16px 10px 42px;
    color: #fff;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
    }
    &::placeholder {
      color: #64748b;
    }
  }
}

.cyber-select {
  width: 180px;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #fff;
  padding: 10px 16px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover, &:focus {
    border-color: #38bdf8;
  }
  
  option {
    background: #0f172a;
    color: #fff;
  }
}

/* Task List */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 12px;
  padding: 20px 24px;
  transition: all 0.2s;

  &:hover {
    background: rgba(30, 41, 59, 0.6);
    border-color: rgba(56, 189, 248, 0.3);
    transform: translateY(-1px);
  }
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-name-row {
  display: flex;
  align-items: center;
  gap: 12px;

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .task-name {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #f8fafc;
  }
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #94a3b8;

  .meta-divider {
    color: #475569;
  }

  .camera-info {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #38bdf8;
  }
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-right: 16px;
  
  &.active {
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.4);
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.1) inset;
  }
  &.pending-approval {
    color: #eab308;
    border: 1px solid rgba(234, 179, 8, 0.4);
    box-shadow: 0 0 10px rgba(234, 179, 8, 0.1) inset;
  }
  &.disabled {
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.4);
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.1) inset;
  }
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.icon-only {
    padding: 8px;
  }

  &.btn-detail {
    color: #38bdf8;
    &:hover { background: rgba(56, 189, 248, 0.1); border-color: rgba(56, 189, 248, 0.3); }
  }

  &.btn-edit {
    color: #cbd5e1;
    &:hover { background: rgba(203, 213, 225, 0.1); border-color: rgba(203, 213, 225, 0.3); }
  }

  &.btn-disable {
    color: #ef4444;
    &:hover { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); }
  }

  &.btn-enable {
    color: #10b981;
    &:hover { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); }
  }

  &.btn-delete {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
    &:hover { background: #ef4444; color: #fff; }
  }
}
</style>
