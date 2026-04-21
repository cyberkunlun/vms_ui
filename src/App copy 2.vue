<template>
  <div class="app-shell">
    <!-- 侧边栏：紧凑风格 -->
    <aside :class="['sidebar', { collapsed: sidebarCollapsed }]">
      <div class="sidebar-header">
        <div class="logo-circle">V</div>
        <div v-show="!sidebarCollapsed" class="sidebar-title">
          <h1>VMS Suite</h1>
          <p>智能视频管理</p>
        </div>
        <button @click="toggleSidebar" class="collapse-toggle" :title="sidebarCollapsed ? '展开菜单' : '收起菜单'">
          <svg v-if="sidebarCollapsed" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <el-menu
          :default-active="currentView"
          class="sidebar-menu"
          background-color="transparent"
          text-color="#94a3b8"
          active-text-color="#38bdf8"
          @select="switchView"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.id"
            :index="item.id"
            class="menu-item"
          >
            <el-tooltip
              :content="item.label"
              placement="right"
              :disabled="!sidebarCollapsed"
              popper-class="sidebar-tooltip"
            >
              <el-icon><component :is="item.icon" /></el-icon>
            </el-tooltip>
            <span v-show="!sidebarCollapsed">{{ item.label }}</span>
          </el-menu-item>
        </el-menu>
      </nav>

      <footer class="sidebar-footer">
        <div class="user-mini" :class="{ collapsed: sidebarCollapsed }">
          <div class="avatar-mini">👤</div>
          <div v-show="!sidebarCollapsed" class="user-mini-info">
            <div class="user-name">管理员</div>
            <div class="user-role">系统管理员</div>
          </div>
        </div>
        <div class="footer-actions">
          <div 
            ref="settingsBtnRef"
            class="menu-item settings-btn" 
            :class="{ active: showSubMenu }" 
            @click.stop="toggleSubMenu"
          >
            <el-tooltip content="系统管理" placement="right" :disabled="!sidebarCollapsed" popper-class="sidebar-tooltip">
              <el-icon><Setting /></el-icon>
            </el-tooltip>
            <span v-show="!sidebarCollapsed">系统管理</span>
            <i v-if="!sidebarCollapsed" class="submenu-arrow" :class="{ rotated: showSubMenu }">▼</i>
          </div>
          <div class="menu-item" @click="alert('VMS 智能视频管理系统 v2.0')">
            <el-tooltip content="关于" placement="right" :disabled="!sidebarCollapsed" popper-class="sidebar-tooltip">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
            <span v-show="!sidebarCollapsed">关于</span>
          </div>
        </div>
        <div v-show="!sidebarCollapsed" class="status-area">
          <span class="status-dot"></span>
          <span class="status-label">系统就绪</span>
        </div>
      </footer>
    </aside>

    <main class="main">
      <header class="topbar">
        <div class="topbar-left">
          <h2>{{ pageTitle }}</h2>
        </div>
        <div class="topbar-right">
          <button class="ghost-btn">文档</button>
          <button class="primary-btn">部署中心</button>
        </div>
      </header>

      <!-- 新增：历史菜单栏（最上方区域显示打开过的菜单） -->
      <div v-if="visitedMenus.length > 0" class="history-bar">
        <div class="history-label">
          <el-icon><Timer /></el-icon>
          <span>最近打开</span>
        </div>
        <div class="history-list">
          <div
            v-for="item in visitedMenus"
            :key="item.id"
            class="history-item"
            :class="{ active: currentView === item.id }"
            @click="switchView(item.id)"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span class="history-label-text">{{ item.label }}</span>
            <button 
              class="history-close" 
              @click.stop="removeFromHistory(item.id)"
              title="从历史中移除"
            >
              <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="history-bar empty">
        <div class="history-label">
          <el-icon><Timer /></el-icon>
          <span>最近打开</span>
        </div>
        <div class="history-empty">点击菜单，历史记录将显示在此处</div>
      </div>

      <div class="view-shell">
        <transition name="fade-slide" mode="out-in">
          <component :is="currentComponent" :key="currentView" />
        </transition>
      </div>
    </main>

    <!-- 子菜单浮动层 -->
    <Teleport to="body">
      <transition name="submenu-fade">
        <div v-if="showSubMenu" class="submenu-panel floating-submenu" :style="subMenuStyle">
          <div
            v-for="sub in systemSubMenus"
            :key="sub.id"
            @click="switchView(sub.id)"
            class="submenu-item"
            :class="{ active: currentView === sub.id }"
          >
            <el-icon><component :is="sub.icon" /></el-icon>
            <span>{{ sub.label }}</span>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import Dashboard from './views/Dashboard.vue'
import CaseHandlingDashboard from './views/CaseHandlingDashboard.vue'
import EventWarning from './views/EventWarning.vue'
import LiveMonitor from './views/LiveMonitor.vue'
import VideoPlayback from './views/VideoPlayback.vue'
import VideoWall from './views/VideoWall.vue'

// Element Plus 图标组件
import {
  DataLine,
  FolderOpened,
  Bell,
  VideoCamera,
  RefreshRight,
  Grid,
  Setting,
  InfoFilled,
  User,
  Lock,
  Operation,
  Document,
  Timer
} from '@element-plus/icons-vue'

// 系统管理子页面组件（简约美观）
const UserManagement = {
  name: 'UserManagement',
  template: `
    <div class="page-container">
      <div class="page-header"><h2>用户管理</h2><p>管理系统用户账号与权限</p></div>
      <div class="card-grid">
        <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-info"><div class="stat-value">24</div><div class="stat-label">总用户数</div></div></div>
        <div class="stat-card"><div class="stat-icon">🟢</div><div class="stat-info"><div class="stat-value">18</div><div class="stat-label">活跃用户</div></div></div>
        <div class="stat-card"><div class="stat-icon">🔒</div><div class="stat-info"><div class="stat-value">6</div><div class="stat-label">管理员</div></div></div>
      </div>
      <div class="data-table"><div class="table-header"><div>用户名</div><div>角色</div><div>状态</div><div>最后登录</div></div>
      <div class="table-row"><div>admin</div><div>超级管理员</div><div>🟢 正常</div><div>2024-01-15</div></div>
      <div class="table-row"><div>operator1</div><div>操作员</div><div>🟢 正常</div><div>2024-01-14</div></div>
      <div class="table-row"><div>viewer1</div><div>访客</div><div>🟡 停用</div><div>2024-01-10</div></div></div>
    </div>
  `
}
const RoleManagement = {
  name: 'RoleManagement',
  template: `<div class="page-container"><div class="page-header"><h2>角色权限</h2><p>配置角色及权限策略</p></div><div class="role-list"><div class="role-item"><span>🔑 超级管理员</span><span class="role-badge">全部权限</span></div><div class="role-item"><span>📹 监控主管</span><span class="role-badge">监控管理</span></div><div class="role-item"><span>👁️ 巡检员</span><span class="role-badge">回放/预览</span></div><div class="role-item"><span>📊 访客</span><span class="role-badge">仅查看</span></div></div></div>`
}
const SystemSettings = {
  name: 'SystemSettings',
  template: `<div class="page-container"><div class="page-header"><h2>系统设置</h2><p>全局参数与偏好配置</p></div><div class="settings-group"><div class="setting-item"><span>🌙 深色模式</span><span class="toggle-switch"></span></div><div class="setting-item"><span>🔔 消息通知</span><span class="toggle-switch active"></span></div><div class="setting-item"><span>📀 录像保留天数</span><span class="setting-value">30天</span></div><div class="setting-item"><span>🌐 API 地址</span><span class="setting-value">https://api.vms.local</span></div></div></div>`
}
const AuditLog = {
  name: 'AuditLog',
  template: `<div class="page-container"><div class="page-header"><h2>审计日志</h2><p>系统操作记录追踪</p></div><div class="log-timeline"><div class="log-entry"><span class="log-time">10:32</span> 管理员修改了用户权限</div><div class="log-entry"><span class="log-time">09:15</span> 系统配置已备份</div><div class="log-entry"><span class="log-time">昨日</span> 新增监控点位配置</div></div></div>`
}

// 主菜单项
const menuItems = [
  { id: 'main', icon: DataLine, label: '主仪表板', component: Dashboard },
  { id: 'case', icon: FolderOpened, label: '案件处理', component: CaseHandlingDashboard },
  { id: 'event', icon: Bell, label: '事件预警', component: EventWarning },
  { id: 'monitor', icon: VideoCamera, label: '实时监控', component: LiveMonitor },
  { id: 'playback', icon: RefreshRight, label: '录像回放', component: VideoPlayback },
  { id: 'wall', icon: Grid, label: '视频墙', component: VideoWall }
]

// 系统管理子菜单
const systemSubMenus = [
  { id: 'user-mgmt', label: '用户管理', icon: User, component: UserManagement },
  { id: 'role-mgmt', label: '角色权限', icon: Lock, component: RoleManagement },
  { id: 'sys-settings', label: '系统设置', icon: Operation, component: SystemSettings },
  { id: 'audit-log', label: '审计日志', icon: Document, component: AuditLog }
]

// 合并所有菜单项用于历史记录查找
const allMenuMap = new Map<string, { label: string; icon: any }>();[
  ...menuItems,
  ...systemSubMenus
].forEach(item => {
  allMenuMap.set(item.id, { label: item.label, icon: item.icon })
})

const currentView = ref('event')
const sidebarCollapsed = ref(true)
const showSubMenu = ref(false)

// 历史记录相关
const MAX_HISTORY_SIZE = 10
interface HistoryItem {
  id: string
  label: string
  icon: any
}
const visitedMenus = ref<HistoryItem[]>([])

// 添加菜单到历史记录（最近访问的放在最前面）
const addToHistory = (menuId: string) => {
  const menuInfo = allMenuMap.get(menuId)
  if (!menuInfo) return

  const existingIndex = visitedMenus.value.findIndex(item => item.id === menuId)
  const newItem: HistoryItem = { id: menuId, label: menuInfo.label, icon: menuInfo.icon }

  if (existingIndex !== -1) {
    // 已存在，移动到最前面
    visitedMenus.value.splice(existingIndex, 1)
    visitedMenus.value.unshift(newItem)
  } else {
    // 不存在，添加到最前面
    visitedMenus.value.unshift(newItem)
    if (visitedMenus.value.length > MAX_HISTORY_SIZE) {
      visitedMenus.value.pop()
    }
  }
}

// 从历史记录中移除菜单
const removeFromHistory = (menuId: string) => {
  const index = visitedMenus.value.findIndex(item => item.id === menuId)
  if (index !== -1) {
    visitedMenus.value.splice(index, 1)
  }
}

// 子菜单浮动层位置样式
const subMenuStyle = ref({
  left: '0px',
  top: '0px'
})

const settingsBtnRef = ref<HTMLElement | null>(null)

// 计算当前显示的组件
const currentComponent = computed(() => {
  const mainItem = menuItems.find(item => item.id === currentView.value)
  if (mainItem) return mainItem.component
  const subItem = systemSubMenus.find(item => item.id === currentView.value)
  if (subItem) return subItem.component
  return EventWarning
})

const pageTitle = computed(() => {
  const main = menuItems.find(item => item.id === currentView.value)
  if (main) return main.label
  const sub = systemSubMenus.find(item => item.id === currentView.value)
  if (sub) return sub.label
  return 'VMS 智能管理'
})

const switchView = (viewId: string) => {
  if (viewId === currentView.value) return
  currentView.value = viewId
  showSubMenu.value = false
  // 视图切换时记录到历史
  addToHistory(viewId)
}

const handleGlobalSwitch = (e: any) => {
  if (e.detail) switchView(e.detail)
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  showSubMenu.value = false
}

// 更新子菜单位置
const updateSubmenuPosition = () => {
  if (!settingsBtnRef.value) return
  const rect = settingsBtnRef.value.getBoundingClientRect()
  const menuWidth = 220
  const menuHeight = systemSubMenus.length * 40 + 16
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let left = rect.right + 8
  if (left + menuWidth > viewportWidth) {
    left = rect.left - menuWidth - 8
  }
  let top = rect.top
  if (top + menuHeight > viewportHeight) {
    top = viewportHeight - menuHeight - 12
  }
  if (top < 8) {
    top = 8
  }
  subMenuStyle.value = { left: `${left}px`, top: `${top}px` }
}

const handleShowSubMenuChange = async (visible: boolean) => {
  if (visible) {
    await nextTick()
    updateSubmenuPosition()
    window.addEventListener('resize', updateSubmenuPosition)
    window.addEventListener('scroll', updateSubmenuPosition, true)
    const sidebar = document.querySelector('.sidebar')
    if (sidebar) {
      sidebar.addEventListener('scroll', updateSubmenuPosition)
    }
  } else {
    window.removeEventListener('resize', updateSubmenuPosition)
    window.removeEventListener('scroll', updateSubmenuPosition, true)
    const sidebar = document.querySelector('.sidebar')
    if (sidebar) {
      sidebar.removeEventListener('scroll', updateSubmenuPosition)
    }
  }
}

watch(showSubMenu, handleShowSubMenuChange)

const toggleSubMenu = (event: Event) => {
  event.stopPropagation()
  showSubMenu.value = !showSubMenu.value
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const settingsBtn = settingsBtnRef.value
  const subMenuPanel = document.querySelector('.floating-submenu')
  if (showSubMenu.value && !settingsBtn?.contains(target) && !subMenuPanel?.contains(target)) {
    showSubMenu.value = false
  }
}

onMounted(() => {
  // 初始化历史记录（当前页面）
  addToHistory(currentView.value)
  
  window.addEventListener('switch-view', handleGlobalSwitch)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('switch-view', handleGlobalSwitch)
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateSubmenuPosition)
  window.removeEventListener('scroll', updateSubmenuPosition, true)
  const sidebar = document.querySelector('.sidebar')
  if (sidebar) {
    sidebar.removeEventListener('scroll', updateSubmenuPosition)
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: #0a0a0a;
  overflow: hidden;
}
.app-shell {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0b1120;
}

/* ========== 侧边栏样式 ========== */
.sidebar {
  width: 260px;
  min-width: 260px;
  background: linear-gradient(180deg, #020617 0%, #020617 100%);
  border-right: 1px solid rgba(148, 163, 184, 0.1);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: width 0.25s cubic-bezier(0.2, 0, 0, 1);
  border-radius: 0 20px 20px 0;
  box-shadow: 8px 0 32px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  overflow-x: visible;
}
.sidebar.collapsed {
  width: 72px;
  min-width: 72px;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  padding-right: 8px;
}
.logo-circle {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: radial-gradient(circle at 25% 0%, #22d3ee, #0ea5e9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  color: #0b1220;
  box-shadow: 0 6px 14px rgba(34, 211, 238, 0.3);
}
.sidebar-title h1 {
  font-size: 15px;
  margin: 0;
  color: #e2e8f0;
}
.sidebar-title p {
  font-size: 10px;
  margin: 2px 0 0;
  opacity: 0.7;
  color: #94a3b8;
}
.collapse-toggle {
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
  z-index: 20;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.collapse-toggle:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
  transform: translateY(-50%) scale(1.05);
}
.collapse-toggle svg {
  width: 12px;
  height: 12px;
  stroke: currentColor;
}
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
}
.sidebar-menu {
  border: none;
  border-right: none !important;
}
.sidebar-menu :deep(.el-menu-item) {
  border-radius: 10px;
  padding: 6px 8px;
  margin-bottom: 4px;
  height: 34px;
  line-height: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  transition: all 0.15s;
}
.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(30, 41, 59, 0.7);
  color: #e2e8f0;
}
.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(14, 165, 233, 0.08));
  color: #38bdf8;
  border-right: 2px solid #38bdf8;
}
.sidebar-menu :deep(.el-icon) {
  font-size: 16px;
  width: 24px;
}
.sidebar.collapsed .sidebar-menu :deep(.el-menu-item) {
  justify-content: center;
  padding: 6px;
}
.sidebar.collapsed .sidebar-menu :deep(.el-icon) {
  margin-right: 0;
}
.sidebar.collapsed .sidebar-menu :deep(.el-menu-item span) {
  display: none;
}
.sidebar-footer {
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  padding-top: 12px;
  position: relative;
}
.user-mini {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  margin-bottom: 12px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.5);
}
.avatar-mini {
  width: 32px;
  height: 32px;
  background: linear-gradient(145deg, #334155, #1e293b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.user-mini-info .user-name {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}
.user-mini-info .user-role {
  font-size: 10px;
  color: #7e8a9b;
}
.footer-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 10px;
  border-radius: 10px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 13px;
  transition: all 0.15s;
}
.menu-item:hover {
  background: rgba(30, 41, 59, 0.7);
  color: #e2e8f0;
}
.menu-item.active {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}
.menu-item .el-icon {
  font-size: 16px;
  width: 24px;
}
.submenu-arrow {
  font-size: 10px;
  margin-left: auto;
  transition: transform 0.2s;
  font-style: normal;
}
.submenu-arrow.rotated {
  transform: rotate(180deg);
}
.status-area {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 6px 8px;
  font-size: 11px;
  color: #7e8a9b;
}
.status-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}
.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 8px;
}
.sidebar.collapsed .user-mini {
  justify-content: center;
}
.sidebar.collapsed .avatar-mini {
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
}

/* ========== 主内容区 ========== */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 12px 12px 12px;
  gap: 8px;
  overflow: hidden;
  min-width: 0;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px;
  min-height: 48px;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}
.topbar-left h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #f1f5f9;
}
.topbar-right {
  display: flex;
  gap: 12px;
}
.ghost-btn, .primary-btn {
  border-radius: 40px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.ghost-btn {
  background: rgba(30, 41, 59, 0.7);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.ghost-btn:hover {
  background: #334155;
  color: white;
}
.primary-btn {
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
  color: #0a0f1a;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(34, 211, 238, 0.3);
}
.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(34, 211, 238, 0.4);
}

/* ========== 历史菜单栏样式（最上方区域） ========== */
.history-bar {
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
  transition: all 0.2s;
}
.history-bar.empty {
  justify-content: flex-start;
}
.history-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8e9aaf;
  font-size: 12px;
  font-weight: 500;
  padding-right: 12px;
  border-right: 1px solid rgba(148, 163, 184, 0.2);
  white-space: nowrap;
}
.history-label .el-icon {
  font-size: 14px;
}
.history-list {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}
.history-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px 5px 8px;
  border-radius: 32px;
  background: rgba(30, 41, 59, 0.5);
  color: #cbd5e1;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  border: 1px solid transparent;
}
.history-item:hover {
  background: rgba(56, 189, 248, 0.15);
  color: #e2e8f0;
  border-color: rgba(56, 189, 248, 0.3);
}
.history-item.active {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.4);
}
.history-item .el-icon {
  font-size: 14px;
}
.history-label-text {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.history-close {
  background: transparent;
  border: none;
  color: #7e8a9b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  margin-left: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0.6;
}
.history-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f87171;
  opacity: 1;
}
.history-empty {
  font-size: 12px;
  color: #6b7280;
  padding: 4px 0;
  font-style: italic;
}
.history-bar::-webkit-scrollbar {
  height: 3px;
}
.history-bar::-webkit-scrollbar-track {
  background: transparent;
}
.history-bar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
}

.view-shell {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: rgba(8, 12, 24, 0.3);
  border-radius: 24px;
  backdrop-filter: blur(2px);
  padding: 20px 24px;
}
.view-shell::-webkit-scrollbar {
  width: 4px;
}
.view-shell::-webkit-scrollbar-track {
  background: transparent;
}
.view-shell::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 8px;
}

/* 页面内部样式 */
.page-container { max-width: 1300px; margin: 0 auto; }
.page-header { margin-bottom: 28px; }
.page-header h2 { font-size: 26px; font-weight: 600; color: #f0f4fa; margin-bottom: 6px; }
.page-header p { color: #8e9aaf; font-size: 13px; }
.card-grid { display: flex; gap: 20px; margin-bottom: 32px; flex-wrap: wrap; }
.stat-card { background: rgba(18, 24, 36, 0.7); backdrop-filter: blur(8px); border-radius: 24px; padding: 18px 24px; display: flex; align-items: center; gap: 18px; border: 1px solid rgba(255,255,255,0.05); flex: 1; }
.stat-icon { font-size: 36px; }
.stat-value { font-size: 30px; font-weight: 700; color: #38bdf8; }
.stat-label { font-size: 13px; color: #9aa4bf; }
.data-table, .role-list, .settings-group, .log-timeline { background: rgba(12, 18, 28, 0.6); border-radius: 24px; padding: 16px; border: 1px solid rgba(255,255,255,0.04); }
.table-header, .table-row { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1.5fr; padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.table-header { font-weight: 600; color: #b9c2d4; }
.table-row { color: #e2e8f0; }
.role-item { display: flex; justify-content: space-between; padding: 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0; }
.role-badge { background: rgba(56,189,248,0.15); padding: 4px 12px; border-radius: 40px; font-size: 11px; color: #38bdf8; }
.setting-item { display: flex; justify-content: space-between; padding: 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.toggle-switch { width: 40px; height: 20px; background: #2d3748; border-radius: 30px; position: relative; cursor: pointer; }
.toggle-switch.active { background: #38bdf8; }
.toggle-switch::after { content: ''; width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 3px; transition: 0.2s; }
.toggle-switch.active::after { left: 21px; }
.setting-value { color: #a0aec0; font-family: monospace; font-size: 13px; }
.log-entry { padding: 12px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 24px; color: #cbd5e1; }
.log-time { color: #38bdf8; min-width: 60px; font-weight: 500; }

/* 动画 */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.2s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(8px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-4px); }
.submenu-fade-enter-active, .submenu-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.submenu-fade-enter-from, .submenu-fade-leave-to { opacity: 0; transform: translateY(6px); }

/* 浮动子菜单样式 */
.floating-submenu {
  position: fixed !important;
  left: 0;
  top: 0;
  background: #0f172a;
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(56, 189, 248, 0.2);
  min-width: 200px;
  z-index: 1000;
  margin: 0;
  transform-origin: left top;
}
.floating-submenu .submenu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #cbd5e1;
  font-size: 13px;
  transition: all 0.15s;
  white-space: nowrap;
}
.floating-submenu .submenu-item:hover {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}
.floating-submenu .submenu-item.active {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}
.floating-submenu .submenu-item .el-icon {
  font-size: 16px;
  width: 24px;
}
:deep(.sidebar-tooltip) {
  background: rgba(15, 23, 42, 0.96) !important;
  border: 1px solid rgba(148, 163, 184, 0.25) !important;
  border-radius: 10px !important;
  padding: 6px 12px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: #e5e7eb !important;
  backdrop-filter: blur(12px) !important;
  margin-left: 8px !important;
}
.floating-submenu {
  transform: scale(0.98);
  opacity: 0;
  animation: vscode-pop 0.12s ease-out forwards;
}
.floating-submenu::before {
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  background: #0f172a;
  transform: rotate(45deg);
  top: 14px;
  left: -4px;
  border-left: 1px solid rgba(56, 189, 248, 0.2);
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
}
.floating-submenu.left::before {
  left: auto;
  right: -4px;
}
@keyframes vscode-pop {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>