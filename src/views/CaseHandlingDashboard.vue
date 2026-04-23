<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import draggable from 'vuedraggable'

// ==================== 常用功能卡片数据 ====================
interface FuncCard {
  id: number
  title: string
  description: string
  icon: string
  lastUsed: string
  todayCalls?: number
  isStarred: boolean
  path: string
  gradient: string
}

// 默认卡片数据
const defaultCards: FuncCard[] = [
  {
    id: 1,
    title: '实时监控',
    description: '多路实时视频预览',
    icon: '📹',
    lastUsed: '2分钟前',
    todayCalls: 28,
    isStarred: true,
    path: '/live-monitor',
    gradient: 'linear-gradient(135deg, rgba(56,189,248,0.35), rgba(59,130,246,0.25))'
  },
  {
    id: 2,
    title: '人员检索',
    description: '以图搜人 / 属性检索',
    icon: '👤',
    lastUsed: '5分钟前',
    todayCalls: 15,
    isStarred: true,
    path: '/person-search',
    gradient: 'linear-gradient(135deg, rgba(129,140,248,0.35), rgba(99,102,241,0.25))'
  },
  {
    id: 3,
    title: '车辆检索',
    description: '车牌识别 / 车辆特征',
    icon: '🚗',
    lastUsed: '12分钟前',
    todayCalls: 22,
    isStarred: true,
    path: '/vehicle-search',
    gradient: 'linear-gradient(135deg, rgba(52,211,153,0.35), rgba(16,185,129,0.25))'
  },
  {
    id: 4,
    title: '行为轨迹分析',
    description: '目标轨迹追踪',
    icon: '🗺️',
    lastUsed: '1小时前',
    todayCalls: 9,
    isStarred: false,
    path: '/trajectory',
    gradient: 'linear-gradient(135deg, rgba(244,114,182,0.35), rgba(236,72,153,0.25))'
  },
  {
    id: 5,
    title: '告警中心',
    description: '实时告警及处置',
    icon: '⚠️',
    lastUsed: '刚刚',
    todayCalls: 31,
    isStarred: true,
    path: '/alerts',
    gradient: 'linear-gradient(135deg, rgba(251,146,60,0.35), rgba(249,115,22,0.25))'
  },
  {
    id: 6,
    title: '历史回放',
    description: '录像检索与回放',
    icon: '⏪',
    lastUsed: '20分钟前',
    todayCalls: 18,
    isStarred: false,
    path: '/playback',
    gradient: 'linear-gradient(135deg, rgba(167,139,250,0.35), rgba(139,92,246,0.25))'
  },
  {
    id: 7,
    title: '多屏巡逻',
    description: '多画面轮巡',
    icon: '🖥️',
    lastUsed: '昨天',
    todayCalls: 7,
    isStarred: false,
    path: '/multi-patrol',
    gradient: 'linear-gradient(135deg, rgba(45,212,191,0.35), rgba(20,184,166,0.25))'
  },
  {
    id: 8,
    title: '地图布控',
    description: 'GIS实时布控',
    icon: '🗺️',
    lastUsed: '3小时前',
    todayCalls: 12,
    isStarred: false,
    path: '/map-control',
    gradient: 'linear-gradient(135deg, rgba(248,113,113,0.35), rgba(239,68,68,0.25))'
  }
]

const allFuncCards = ref<FuncCard[]>([])

// 分页相关
const currentPage = ref(0)
const pageSize = ref(2) // 默认每页4个卡片（2x2）

// 根据屏幕宽度调整每页数量
const updatePageSize = () => {
  const width = window.innerWidth
  if (width < 640) pageSize.value = 2
  else if (width < 900) pageSize.value = 3
  else pageSize.value = 2
}

const totalPages = computed(() => Math.ceil(allFuncCards.value.length / pageSize.value))

const paginatedCards = computed(() => {
  const start = currentPage.value * pageSize.value
  const end = start + pageSize.value
  return allFuncCards.value.slice(start, end)
})

const goToPage = (page: number) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page
  }
}

// 加载本地排序
const loadCardOrder = () => {
  const stored = localStorage.getItem('funcCardsOrder')
  if (stored) {
    const ids = JSON.parse(stored) as number[]
    const ordered = ids.map(id => defaultCards.find(c => c.id === id)).filter(Boolean) as FuncCard[]
    const missing = defaultCards.filter(c => !ordered.some(oc => oc.id === c.id))
    allFuncCards.value = [...ordered, ...missing]
  } else {
    allFuncCards.value = [...defaultCards]
  }
}

// 保存排序
const saveCardOrder = () => {
  const ids = allFuncCards.value.map(c => c.id)
  localStorage.setItem('funcCardsOrder', JSON.stringify(ids))
}

// 编辑排序弹窗
const showSortModal = ref(false)
const tempCards = ref<FuncCard[]>([])

const openSortModal = () => {
  tempCards.value = [...allFuncCards.value]
  showSortModal.value = true
}

const closeSortModal = () => {
  showSortModal.value = false
}

const confirmSort = () => {
  allFuncCards.value = [...tempCards.value]
  saveCardOrder()
  // 确保当前页不越界
  if (currentPage.value >= totalPages.value) {
    currentPage.value = Math.max(0, totalPages.value - 1)
  }
  closeSortModal()
}

// 切换收藏
const toggleStar = (card: FuncCard, event: Event) => {
  event.stopPropagation()
  card.isStarred = !card.isStarred
  // 收藏状态不改变顺序，但持久化可选，这里不保存顺序只保存状态？但可以存到localStorage
  localStorage.setItem('funcCardsOrder', JSON.stringify(allFuncCards.value.map(c => c.id)))
}

// 监听窗口大小变化，调整每页数量
const handleResize = () => {
  updatePageSize()
  // 确保当前页不越界
  if (currentPage.value >= totalPages.value) {
    currentPage.value = Math.max(0, totalPages.value - 1)
  }
}

onMounted(() => {
  loadCardOrder()
  updatePageSize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// ==================== 今日态势数据 ====================
const stats = ref({
  onlineCameras: 248,
  offlineCameras: 7,
  todayCaptures: 3421,
  todayVehicles: 1856,
  todayAlerts: 47,
  onlineUsers: 23
})

const alertTrend = [12, 8, 15, 22, 18, 27, 31]

// ==================== 重点告警 ====================
interface Alert {
  id: number
  type: string
  location: string
  time: string
  level: 'high' | 'medium' | 'low'
}

const criticalAlerts = ref<Alert[]>([
  { id: 1, type: '黑名单人员出现', location: '东门入口', time: '10:32:21', level: 'high' },
  { id: 2, type: '夜间异常徘徊', location: '西门停车场', time: '02:15:07', level: 'high' },
  { id: 3, type: '人群聚集', location: '南广场', time: '09:48:33', level: 'medium' },
  { id: 4, type: '翻越围栏', location: '北侧围墙', time: '08:22:15', level: 'high' },
  { id: 5, type: '可疑车辆停留过久', location: 'VIP通道', time: '07:55:42', level: 'medium' },
])

const handleAlert = (alert: Alert, action: string) => {
  console.log(`告警 ${alert.id} 执行 ${action}`)
}

// ==================== 最近任务 & 记录 ====================
interface RecentTask {
  id: number
  name: string
  type: string
  status: 'processing' | 'completed' | 'pending'
}

const recentTasks = ref<RecentTask[]>([
  { id: 1, name: '张三轨迹追踪', type: '人员轨迹', status: 'processing' },
  { id: 2, name: '红色车辆布控', type: '车辆布控', status: 'completed' },
  { id: 3, name: '商场偷盗案件研判', type: '案件研判', status: 'pending' },
])

interface RecentRecord {
  id: number
  title: string
  type: string
  time: string
}

const recentRecords = ref<RecentRecord[]>([
  { id: 1, title: '东门摄像头A', type: '监控点位', time: '10分钟前' },
  { id: 2, title: '嫌疑人李四', type: '分析对象', time: '半小时前' },
  { id: 3, title: '2025-03-21 回放', type: '录像', time: '2小时前' },
])

const notifications = ref([
  { id: 1, content: '系统升级至 v3.2.0，新增AI行为分析', time: '10:00' },
  { id: 2, content: '新增15路4K摄像头接入', time: '昨天' },
  { id: 3, content: 'AI识别准确率提升至98.5%', time: '昨天' },
])

const userWorkspace = ref({
  pendingAlerts: 12,
  myTasks: 5,
  dutyStatus: '值班中',
  favoritesCount: 8
})

// 顶部时间
const currentTime = ref('')
let timer: number
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', { hour12: false })
}
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})
onUnmounted(() => {
  clearInterval(timer)
})

const navigateTo = (path: string) => {
  console.log('导航到:', path)
}

const mapPoints = ref([
  { x: 30, y: 40, name: '东门', alert: true },
  { x: 70, y: 25, name: '南门', alert: false },
  { x: 45, y: 65, name: '西门', alert: true },
  { x: 80, y: 70, name: '北门', alert: false },
])
</script>

<template>
  <div class="workbench-container">
    <!-- 顶部栏 
    <div class="top-bar">
      <div class="logo-area">
        <div class="logo-icon">🎥</div>
        <span class="logo-text">智能作战中心</span>
        <span class="badge">AI 指挥平台</span>
      </div>
      <div class="top-right">
        <div class="time">{{ currentTime }}</div>
        <div class="user-info">
          <span class="user-name">研判员 · 张警官</span>
          <div class="avatar">👮</div>
        </div>
      </div>
    </div>
-->
    <!-- 常用功能：分页 + 底部圆点 + 编辑排序 -->
    <div class="func-section">
      <div class="section-header">
        <h3>⚡ 常用功能</h3>
        <button class="edit-sort-btn" @click="openSortModal">
          <span class="edit-icon">✎</span> 编辑排序
        </button>
      </div>
      
      <!-- 分页卡片容器 -->
      <div class="func-grid" :style="{ gridTemplateColumns: `repeat(${Math.min(pageSize, 2)}, 1fr)` }">
        <div
          v-for="card in paginatedCards"
          :key="card.id"
          class="func-card"
          @click="navigateTo(card.path)"
        >
          <div class="card-glow" :style="{ background: card.gradient }"></div>
          <div class="card-icon">
            <span class="icon-emoji">{{ card.icon }}</span>
          </div>
          <div class="card-content">
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <div class="card-meta">
              <span class="last-used">🕒 {{ card.lastUsed }}</span>
              <span class="calls" v-if="card.todayCalls">📊 {{ card.todayCalls }}次</span>
            </div>
          </div>
          <div class="card-actions">
            <span
              class="star"
              :class="{ active: card.isStarred }"
              @click.stop="toggleStar(card, $event)"
            >{{ card.isStarred ? '★' : '☆' }}</span>
          </div>
          <div class="card-enter">→</div>
        </div>
      </div>

      <!-- 底部圆点分页器 -->
      <div class="pagination-dots" v-if="totalPages > 1">
        <span
          v-for="page in totalPages"
          :key="page"
          class="dot"
          :class="{ active: currentPage === page - 1 }"
          @click="goToPage(page - 1)"
        ></span>
      </div>
    </div>

    <!-- 今日态势总览 -->
    <div class="stats-section">
      <div class="section-header">
        <h3>📊 今日态势总览</h3>
        <span class="update-badge">实时更新</span>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📹</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.onlineCameras }}</span>
            <span class="stat-label">在线摄像头</span>
          </div>
          <div class="stat-sub">离线 {{ stats.offlineCameras }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.todayCaptures }}</span>
            <span class="stat-label">今日抓拍人数</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🚗</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.todayVehicles }}</span>
            <span class="stat-label">车辆识别数</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.todayAlerts }}</span>
            <span class="stat-label">今日告警数</span>
          </div>
        </div>
        <div class="stat-card trend-card">
          <div class="trend-mini">
            <div class="trend-bars">
              <div v-for="(val, idx) in alertTrend" :key="idx" class="bar" :style="{ height: val * 2 + 'px' }"></div>
            </div>
            <span class="trend-label">近7h告警趋势</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👤</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.onlineUsers }}</span>
            <span class="stat-label">当前在线用户</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 双栏：重点告警 + 地图态势 -->
    <div class="double-column">
      <div class="alerts-panel">
        <div class="panel-header">
          <h3>🔔 重点告警 <span class="alert-badge">{{ criticalAlerts.length }}</span></h3>
          <button class="more-btn">查看更多 →</button>
        </div>
        <div class="alerts-list">
          <div v-for="alert in criticalAlerts" :key="alert.id" class="alert-item" :class="alert.level">
            <div class="alert-icon">{{ alert.level === 'high' ? '🔴' : '🟡' }}</div>
            <div class="alert-details">
              <div class="alert-title">{{ alert.type }}</div>
              <div class="alert-meta">{{ alert.location }} · {{ alert.time }}</div>
            </div>
            <div class="alert-actions">
              <button class="action-btn" @click.stop="handleAlert(alert, 'view')">查看</button>
              <button class="action-btn dispatch" @click.stop="handleAlert(alert, 'dispatch')">派发</button>
            </div>
          </div>
        </div>
      </div>

      <div class="map-panel">
        <div class="panel-header">
          <h3>🗺️ 实时地图态势</h3>
          <span class="legend">● 告警点 ● 正常点位</span>
        </div>
        <div class="map-container">
          <div class="map-svg">
            <svg viewBox="0 0 200 120" style="width:100%; height:100%">
              <rect width="200" height="120" fill="rgba(15,23,42,0.6)" stroke="#334155" stroke-width="1" />
              <line x1="20" y1="60" x2="180" y2="60" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3" />
              <line x1="100" y1="10" x2="100" y2="110" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3" />
              <circle v-for="point in mapPoints" :cx="point.x" :cy="point.y" r="4" :fill="point.alert ? '#ef4444' : '#3b82f6'" stroke="#0f172a" stroke-width="1.5" />
              <text v-for="point in mapPoints" :x="point.x-6" :y="point.y-6" fill="#94a3b8" font-size="6">{{ point.name }}</text>
            </svg>
          </div>
          <div class="map-stats">
            <div class="map-stat"><span class="dot-red"></span> 告警点位: 2</div>
            <div class="map-stat"><span class="dot-blue"></span> 正常点位: 2</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部三栏 -->
    <div class="bottom-row">
      <div class="tasks-panel">
        <div class="panel-header">
          <h3>📋 最近任务</h3>
          <button class="more-btn">全部任务 →</button>
        </div>
        <div class="task-list">
          <div v-for="task in recentTasks" :key="task.id" class="task-item">
            <!-- <div class="task-icon">{{ task.type === '人员轨迹' ? '👤' : task.type === '车辆布控' ? '🚗' : '📁' }}</div> -->
            <div class="task-info">
              <div class="task-name">{{ task.name }}</div>
              <div class="task-status" :class="task.status">{{ task.status === 'processing' ? '分析中' : task.status === 'completed' ? '已完成' : '待处理' }}</div>
            </div>
            <button class="task-action" @click="navigateTo(`/task/${task.id}`)">{{ task.status === 'processing' ? '继续分析' : '查看报告' }}</button>
          </div>
        </div>
      </div>

      <div class="records-panel">
        <div class="panel-header">
          <h3>🕘 最近使用记录</h3>
        </div>
        <div class="record-list">
          <div v-for="record in recentRecords" :key="record.id" class="record-item" @click="navigateTo(`/record/${record.id}`)">
            <span class="record-type">{{ record.type === '监控点位' ? '📍' : record.type === '分析对象' ? '👤' : '🎞️' }}</span>
            <span class="record-title">{{ record.title }}</span>
            <span class="record-time">{{ record.time }}</span>
          </div>
        </div>
      </div>

      <div class="workspace-panel">
        <div class="panel-header">
          <h3>👨‍💻 我的工作台</h3>
        </div>
        <div class="workspace-stats">
          <div class="ws-item">
            <span class="ws-value">{{ userWorkspace.pendingAlerts }}</span>
            <span class="ws-label">待处理告警</span>
          </div>
          <div class="ws-item">
            <span class="ws-value">{{ userWorkspace.myTasks }}</span>
            <span class="ws-label">我的任务</span>
          </div>
          <div class="ws-item">
            <span class="ws-value">{{ userWorkspace.favoritesCount }}</span>
            <span class="ws-label">收藏功能</span>
          </div>
          <div class="ws-item duty">
            <span class="ws-value">{{ userWorkspace.dutyStatus }}</span>
            <span class="ws-label">值班状态</span>
          </div>
        </div>
        <div class="notifications">
          <div class="panel-header mini">
            <h4>📢 系统通知</h4>
          </div>
          <div class="notif-list">
            <div v-for="notif in notifications" :key="notif.id" class="notif-item">
              <span class="notif-dot"></span>
              <span class="notif-text">{{ notif.content }}</span>
              <span class="notif-time">{{ notif.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑排序弹窗 -->
    <Teleport to="body">
      <div v-if="showSortModal" class="modal-overlay" @click.self="closeSortModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>编排常用功能顺序</h3>
            <button class="close-btn" @click="closeSortModal">✕</button>
          </div>
          <div class="modal-body">
            <p class="modal-tip">拖拽卡片调整顺序，靠前的卡片将在首页优先显示</p>
            <draggable
              v-model="tempCards"
              item-key="id"
              class="sortable-list"
              :animation="300"
              ghost-class="dragging-ghost"
              chosen-class="dragging-chosen"
            >
              <template #item="{ element: card }">
                <div class="sortable-card">
                  <div class="drag-handle">⋮⋮</div>
                  <div class="sort-icon">{{ card.icon }}</div>
                  <div class="sort-info">
                    <div class="sort-title">{{ card.title }}</div>
                    <div class="sort-desc">{{ card.description }}</div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="closeSortModal">取消</button>
            <button class="confirm-btn" @click="confirmSort">保存顺序</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.workbench-container {
  flex: 1;
  border-radius: 26px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.06), transparent 55%),
              radial-gradient(circle at 90% 80%, rgba(129, 140, 248, 0.08), #020617 75%);
  padding: 20px 28px;
  overflow-y: auto;
  backdrop-filter: blur(2px);
  color: #e2e8f0;
}

.workbench-container::-webkit-scrollbar { width: 6px; }
.workbench-container::-webkit-scrollbar-track { background: transparent; }
.workbench-container::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 99px; }

/* 顶部栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}
.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-icon { font-size: 28px; }
.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #38bdf8, #a78bfa);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.badge {
  font-size: 10px;
  padding: 2px 8px;
  background: rgba(56, 189, 248, 0.2);
  border-radius: 20px;
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}
.top-right {
  display: flex;
  align-items: center;
  gap: 24px;
}
.time {
  font-family: monospace;
  font-size: 14px;
  background: rgba(0,0,0,0.4);
  padding: 6px 12px;
  border-radius: 24px;
  letter-spacing: 1px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(15,23,42,0.6);
  padding: 5px 12px 5px 16px;
  border-radius: 40px;
  border: 1px solid rgba(148,163,184,0.2);
}
.user-name { font-size: 13px; font-weight: 500; }
.avatar { font-size: 20px; }

/* 公用头部 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
}
.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #cbd5e1;
}
.edit-sort-btn {
  background: rgba(56,189,248,0.15);
  border: 1px solid rgba(56,189,248,0.4);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: #38bdf8;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.edit-sort-btn:hover {
  background: rgba(56,189,248,0.3);
  transform: translateY(-1px);
}
.edit-icon { font-size: 12px; }

/* 分页卡片网格 */
.func-grid {
  display: grid;
  gap: 18px;
  margin-bottom: 24px;
}
.func-card {
  position: relative;
  background: rgba(12, 20, 35, 0.75);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  border: 1px solid rgba(56, 189, 248, 0.2);
  padding: 20px 18px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}
.func-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  padding: 1px;
  background: linear-gradient(125deg, rgba(56,189,248,0.4), rgba(129,140,248,0.1));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.func-card:hover {
  transform: translateY(-5px) scale(1.02);
  border-color: rgba(56, 189, 248, 0.6);
  box-shadow: 0 20px 35px -12px rgba(56,189,248,0.2);
}
.func-card:hover::before {
  opacity: 1;
}
.card-glow {
  position: absolute;
  top: -20%;
  left: -20%;
  width: 140%;
  height: 140%;
  opacity: 0.15;
  filter: blur(20px);
  z-index: 0;
  transition: opacity 0.3s;
}
.func-card:hover .card-glow {
  opacity: 0.3;
}
.card-icon {
  font-size: 36px;
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
}
.card-content {
  position: relative;
  z-index: 1;
}
.card-content h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
  letter-spacing: -0.2px;
}
.card-content p {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 12px;
}
.card-meta {
  display: flex;
  gap: 12px;
  font-size: 10px;
  color: #5b6e8c;
}
.card-actions {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
}
.star {
  font-size: 20px;
  color: #475569;
  cursor: pointer;
  transition: 0.2s;
  text-shadow: 0 0 2px rgba(0,0,0,0.5);
}
.star.active {
  color: #fbbf24;
  text-shadow: 0 0 6px #f59e0b;
}
.card-enter {
  position: absolute;
  bottom: 18px;
  right: 18px;
  color: #475569;
  font-size: 16px;
  transition: 0.25s;
  opacity: 0.6;
}
.func-card:hover .card-enter {
  color: #38bdf8;
  transform: translateX(6px);
  opacity: 1;
}

/* 底部圆点分页器 */
.pagination-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}
.dot.active {
  width: 24px;
  border-radius: 4px;
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
}

/* 态势统计 */
.stats-section {
  margin-bottom: 32px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
}
.stat-card {
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148,163,184,0.1);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(4px);
  transition: 0.2s;
}
.stat-card:hover {
  border-color: rgba(56,189,248,0.3);
  background: rgba(15,23,42,0.7);
}
.stat-icon { font-size: 28px; }
.stat-info { flex: 1; }
.stat-value { font-size: 24px; font-weight: 700; line-height: 1.2; color: #f1f5f9; }
.stat-label { font-size: 11px; color: #64748b; }
.stat-sub { font-size: 10px; color: #94a3b8; margin-top: 4px; }
.trend-card { justify-content: center; }
.trend-mini { display: flex; flex-direction: column; align-items: center; width: 100%; }
.trend-bars { display: flex; gap: 4px; align-items: flex-end; height: 40px; margin-bottom: 6px; }
.bar { width: 6px; background: #3b82f6; border-radius: 3px; transition: 0.2s; }
.trend-label { font-size: 10px; color: #94a3b8; }

/* 双栏布局 */
.double-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 28px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.more-btn {
  background: none;
  border: none;
  color: #38bdf8;
  font-size: 12px;
  cursor: pointer;
  opacity: 0.7;
}
.more-btn:hover { opacity: 1; }
.alert-badge {
  background: #ef4444;
  color: white;
  border-radius: 20px;
  padding: 0px 8px;
  font-size: 11px;
  margin-left: 8px;
}
.alerts-panel, .map-panel, .tasks-panel, .records-panel, .workspace-panel {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 20px;
  border: 1px solid rgba(148,163,184,0.1);
  padding: 16px;
  backdrop-filter: blur(8px);
}
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(0,0,0,0.3);
  border-radius: 14px;
  border-left: 3px solid;
}
.alert-item.high { border-left-color: #ef4444; }
.alert-item.medium { border-left-color: #f59e0b; }
.alert-icon { font-size: 14px; }
.alert-details { flex: 1; }
.alert-title { font-size: 13px; font-weight: 500; }
.alert-meta { font-size: 10px; color: #64748b; margin-top: 2px; }
.alert-actions { display: flex; gap: 6px; }
.action-btn {
  background: rgba(30,41,59,0.8);
  border: none;
  padding: 4px 8px;
  border-radius: 8px;
  color: #cbd5e1;
  font-size: 10px;
  cursor: pointer;
}
.action-btn.dispatch { background: #3b82f6; color: white; }
.map-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.map-svg {
  background: #0f172a;
  border-radius: 16px;
  height: 140px;
}
.map-stats { display: flex; gap: 16px; justify-content: center; }
.dot-red, .dot-blue { display: inline-block; width: 8px; height: 8px; border-radius: 8px; margin-right: 6px; }
.dot-red { background: #ef4444; box-shadow: 0 0 4px red; }
.dot-blue { background: #3b82f6; }

/* 底部三栏 */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}
.task-list, .record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(148,163,184,0.1);
}
.task-icon { font-size: 20px; }
.task-info { flex: 1; }
.task-name { font-size: 13px; }
.task-status { font-size: 10px; color: #f59e0b; }
.task-status.completed { color: #10b981; }
.task-status.pending { color: #ef4444; }
.task-action {
  background: none;
  border: 1px solid #38bdf8;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 10px;
  color: #38bdf8;
  cursor: pointer;
}
.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  cursor: pointer;
  font-size: 13px;
  border-bottom: 1px solid rgba(148,163,184,0.08);
}
.record-time { margin-left: auto; font-size: 10px; color: #64748b; }
.workspace-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}
.ws-item {
  background: rgba(0,0,0,0.3);
  border-radius: 14px;
  padding: 10px;
  text-align: center;
}
.ws-value { font-size: 22px; font-weight: 700; display: block; }
.ws-label { font-size: 10px; color: #94a3b8; }
.duty .ws-value { color: #10b981; }
.notifications { margin-top: 12px; }
.notif-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.notif-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}
.notif-dot {
  width: 5px;
  height: 5px;
  background: #38bdf8;
  border-radius: 5px;
}
.notif-text { flex: 1; color: #cbd5e1; }
.notif-time { font-size: 9px; color: #475569; }

/* 编辑排序弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-container {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 28px;
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(148,163,184,0.2);
}
.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
}
.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  transition: 0.2s;
}
.close-btn:hover { color: #ef4444; }
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}
.modal-tip {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 16px;
  text-align: center;
}
.sortable-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sortable-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148,163,184,0.2);
  border-radius: 16px;
  padding: 12px 16px;
  cursor: grab;
  transition: all 0.2s;
}
.sortable-card:active { cursor: grabbing; }
.drag-handle {
  font-size: 20px;
  color: #5b6e8c;
  cursor: grab;
  user-select: none;
}
.sort-icon { font-size: 28px; }
.sort-info { flex: 1; }
.sort-title { font-size: 15px; font-weight: 500; }
.sort-desc { font-size: 11px; color: #64748b; }
.dragging-ghost {
  opacity: 0.4;
  background: #1e293b;
  border: 1px dashed #38bdf8;
}
.dragging-chosen {
  box-shadow: 0 0 0 2px #38bdf8;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(148,163,184,0.2);
}
.cancel-btn, .confirm-btn {
  padding: 8px 20px;
  border-radius: 40px;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
}
.cancel-btn {
  background: transparent;
  border: 1px solid #64748b;
  color: #cbd5e1;
}
.cancel-btn:hover { background: rgba(100,116,139,0.2); }
.confirm-btn {
  background: #3b82f6;
  border: none;
  color: white;
}
.confirm-btn:hover { background: #2563eb; transform: translateY(-1px); }

/* 响应式 */
@media (max-width: 900px) {
  .func-grid { gap: 14px; }
  .func-card { padding: 16px; }
  .card-icon { font-size: 30px; }
  .card-content h4 { font-size: 16px; }
}
@media (max-width: 640px) {
  .double-column, .bottom-row { grid-template-columns: 1fr; gap: 16px; }
  .stats-grid { grid-template-columns: repeat(2,1fr); }
  .workbench-container { padding: 16px; }
  .func-grid { gap: 12px; }
}
</style>