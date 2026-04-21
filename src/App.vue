<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import Dashboard from './views/Dashboard.vue'
import CaseHandlingDashboard from './views/CaseHandlingDashboard.vue'
import EventWarning from './views/EventWarning.vue'
import LiveMonitor from './views/LiveMonitor.vue'
import VideoPlayback from './views/VideoPlayback.vue'
import VideoWall from './views/VideoWall.vue'
import SystemManagement from './views/SystemManagement.vue'
import FaceAlarmCenter from './views/surveillance/alarms/FaceAlarmCenter.vue'
import SurveillanceTaskList from './views/surveillance/tasks/SurveillanceTaskList.vue'
import VehicleAlarmCenter from './views/surveillance/alarms/VehicleAlarmCenter.vue'
import UnifiedAlarmCenter from './views/surveillance/alarms/UnifiedAlarmCenter.vue'

// Element Plus icon components
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
  FullScreen,
  Location,
  WarningFilled,
  House,
  Search,
  View,
  Aim,
  Avatar,
  Van
} from '@element-plus/icons-vue'

// 主菜单项（支持二级菜单）
const menuItems = [
  { id: 'home', icon: House, label: 'Home', component: CaseHandlingDashboard },
  { id: 'dashboard', icon: DataLine, label: 'Dashboard', component: Dashboard },
  { 
    id: 'vms', 
    icon: VideoCamera, 
    label: 'VMS', 
    children: [
      { id: 'video-wall', label: 'Video Wall', icon: Grid, component: VideoWall },
      { id: 'video-playback', label: 'Video Playback', icon: RefreshRight, component: VideoPlayback },
      { id: 'smart-monitor', label: 'Smart Monitor', icon: VideoCamera, component: LiveMonitor },
    ]
  },
  {
    id: 'retrieval',
    icon: Search,
    label: 'retrieval center',
    children: [
      { id: 'face-body-capture', label: 'Face/Body Capture Retrieval', icon: Search, component: CaseHandlingDashboard },
      { id: 'vehicle-capture', label: 'Vehicle Capture Retrieval', icon: Search, component: CaseHandlingDashboard },
      { id: 'fusion-retrieval', label: 'Fusion Retrieval', icon: Search, component: CaseHandlingDashboard },
      { id: 'face-body-archives', label: 'Face/Body Archives Retrieval', icon: Search, component: CaseHandlingDashboard },
      { id: 'vehicle-archives', label: 'Vehicle Archives Retrieval', icon: Search, component: CaseHandlingDashboard },
    ]
  },
  {
    id: 'surveillance',
    icon: View,
    label: 'Surveillance Center',
    children: [
      { id: 'surveillance-task', label: 'Surveillance Task', icon: View, component: SurveillanceTaskList },
      { id: 'face-alarm', label: 'Face Alarm', icon: Bell, component: UnifiedAlarmCenter },
      { id: 'vehicle-alarm', label: 'Vehicle Alarm', icon: Van, component: UnifiedAlarmCenter },
      { id: 'realtime', label: 'Real-Time', icon: Bell, component: EventWarning },
    ]
  },
  {
    id: 'tactics',
    icon: Aim,
    label: 'Tactics Application',
    children: [
      { id: 'space-time-collision', label: 'Space-time collision', icon: Aim, component: CaseHandlingDashboard },
      { id: 'offline-video', label: 'Offline Video Analysis', icon: Aim, component: CaseHandlingDashboard },
      { id: 'key-area', label: 'Key Area', icon: Aim, component: CaseHandlingDashboard },
    ]
  },
  {
    id: 'ai-event',
    icon: Bell,
    label: 'AI Event Center',
    children: [
      { id: 'ai-event-item', label: 'AI Event', icon: Bell, component: EventWarning },
      { id: 'full-text-search', label: 'Full-text Search', icon: Search, component: CaseHandlingDashboard },
    ]
  },
  {
    id: 'system',
    icon: Setting,
    label: 'System Management',
    children: [
      { id: 'user-mgmt', label: 'User Management', icon: User, component: SystemManagement },
      { id: 'role-mgmt', label: 'Role Management', icon: Lock, component: SystemManagement },
      { id: 'dept-mgmt', label: 'Department Management', icon: Avatar, component: SystemManagement },
      { id: 'log-audit', label: 'Log Audit', icon: Document, component: SystemManagement },
    ]
  }
]

const openedViews = ref<string[]>(['dashboard']) // 默认打开
const currentView = ref('dashboard')
const sidebarCollapsed = ref(true)

// 子菜单浮层相关状态
const activeSubMenuId = ref<string | null>(null)      // 当前显示子菜单的父菜单ID
const subMenuPosition = ref({ left: '0px', top: '0px' })
const subMenuItems = ref<Array<{ id: string; label: string; icon: any; component: any }>>([])

// 获取菜单项的DOM元素引用（用于定位浮层）
const menuItemRefs = ref<Map<string, HTMLElement>>(new Map())

const closeTab = (tab: string) => {
  const index = openedViews.value.indexOf(tab)
  if (index !== -1) openedViews.value.splice(index, 1)

  if (currentView.value === tab) {
    const next = openedViews.value[index - 1] || openedViews.value[0]
    if (next) currentView.value = next
  }
}

// 递归查找组件（支持二级菜单）
const findComponentById = (id: string): any => {
  for (const item of menuItems) {
    if (item.id === id && item.component) return item.component
    if (item.children) {
      const child = item.children.find(c => c.id === id)
      if (child) return child.component
    }
  }
  return Dashboard
}

const currentComponent = computed(() => {
  return findComponentById(currentView.value)
})

// 为 SystemManagement 提供 tab 属性
const currentViewTab = computed(() => {
  const tabMap: Record<string, string> = {
    'user-mgmt': 'user',
    'role-mgmt': 'role',
    'dept-mgmt': 'dept',
    'log-audit': 'log'
  }
  return tabMap[currentView.value] || 'user'
})

const pageTitle = computed(() => {
  for (const item of menuItems) {
    if (item.id === currentView.value && item.label) return item.label
    if (item.children) {
      const child = item.children.find(c => c.id === currentView.value)
      if (child) return child.label
    }
  }
  return 'VMS Management'
})

const switchView = (viewId: string) => {
  currentView.value = viewId
  if (!openedViews.value.includes(viewId)) {
    openedViews.value.push(viewId)
  }
  closeSubMenu() // 切换后关闭子菜单浮层
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  closeSubMenu()
}

// 更新子菜单浮层位置（基于指定元素）
const updateSubmenuPosition = (targetEl: HTMLElement) => {
  const rect = targetEl.getBoundingClientRect()
  const menuWidth = 220
  const menuHeight = subMenuItems.value.length * 40 + 16
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
  if (top < 8) top = 8

  subMenuPosition.value = { left: `${left}px`, top: `${top}px` }
}

// 打开子菜单浮层
const openSubMenu = (menuId: string, event: Event) => {
  event.stopPropagation()
  const target = event.currentTarget as HTMLElement
  const menuItem = menuItems.find(item => item.id === menuId)
  if (!menuItem?.children) return

  subMenuItems.value = menuItem.children.map(child => ({
    id: child.id,
    label: child.label,
    icon: child.icon,
    component: child.component
  }))
  activeSubMenuId.value = menuId
  updateSubmenuPosition(target)
}

// 关闭子菜单浮层
const closeSubMenu = () => {
  activeSubMenuId.value = null
  subMenuItems.value = []
}

// 处理菜单项点击（区分有无子菜单）
const handleMenuClick = (item: any, event: Event) => {
  if (item.children) {
    // 有子菜单：显示浮层
    openSubMenu(item.id, event)
  } else {
    // 无子菜单：直接切换视图
    switchView(item.id)
  }
}

// 处理子菜单项点击
const handleSubMenuClick = (subItem: { id: string; label: string }) => {
  switchView(subItem.id)
  closeSubMenu()
}

// 点击外部关闭浮层
const handleClickOutside = (event: MouseEvent) => {
  if (!activeSubMenuId.value) return
  const target = event.target as HTMLElement
  const subMenuPanel = document.querySelector('.floating-submenu')
  if (subMenuPanel && subMenuPanel.contains(target)) return
  
  // 检查是否点击在触发菜单项上
  const triggerEl = menuItemRefs.value.get(activeSubMenuId.value)
  if (triggerEl && triggerEl.contains(target)) return
  
  closeSubMenu()
}

// 监听窗口变化重新计算位置
const handleResizeOrScroll = () => {
  if (activeSubMenuId.value) {
    const triggerEl = menuItemRefs.value.get(activeSubMenuId.value)
    if (triggerEl) updateSubmenuPosition(triggerEl)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResizeOrScroll)
  window.addEventListener('scroll', handleResizeOrScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResizeOrScroll)
  window.removeEventListener('scroll', handleResizeOrScroll, true)
})

// 设置菜单项ref
const setMenuItemRef = (el: any, id: string) => {
  if (el) {
    menuItemRefs.value.set(id, el)
  } else {
    menuItemRefs.value.delete(id)
  }
}

// Topbar action functions
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const showLanguageSettings = () => {
  console.log('Language settings clicked')
  // TODO: Implement language settings modal/dropdown
}

const showAlertPanel = () => {
  console.log('Alert panel clicked')
  // TODO: Implement alert panel/sidebar
}
</script>

<template>
  <div class="app-shell">
    <!-- 侧边栏 -->
    <aside :class="['sidebar', { collapsed: sidebarCollapsed }]">
      <div class="sidebar-header">
        <div class="logo-circle">V</div>
        <div v-show="!sidebarCollapsed" class="sidebar-title">
          <h1>VMS Platform</h1>
          <p>Intelligence Center</p>
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
        <div class="custom-menu">
          <div
            v-for="item in menuItems"
            :key="item.id"
            :ref="(el) => setMenuItemRef(el, item.id)"
            class="menu-item"
            :class="{
              'has-children': !!item.children,
              active: !item.children && currentView === item.id,
              'submenu-open': activeSubMenuId === item.id
            }"
            @click="handleMenuClick(item, $event)"
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
            <i v-if="item.children && !sidebarCollapsed" class="submenu-arrow" :class="{ rotated: activeSubMenuId === item.id }">▼</i>
          </div>
        </div>
      </nav>
    </aside>

    <main class="main">
      <header class="topbar">
        <div class="tabs-bar">
          <div
            v-for="tab in openedViews"
            :key="tab"
            class="tab-item"
            :class="{ active: tab === currentView }"
            @click="switchView(tab)"
          >
            {{ menuItems.flatMap(m => [m, ...(m.children || [])]).find(v => v.id === tab)?.label || tab }}
            <span class="close-btn" @click.stop="closeTab(tab)">×</span>
          </div>
        </div>
        <div class="topbar-right">
          <!-- 用户信息区域（原 sidebar-footer 内容） -->
          <div class="topbar-user-section">

            
            <div class="topbar-actions">
              <div class="topbar-action-btn" @click="toggleFullscreen" title="Maximize">
                <el-icon><FullScreen /></el-icon>
              </div>
              
              <div class="topbar-action-btn" @click="showLanguageSettings" title="Language Settings">
                <el-icon><Setting /></el-icon>
              </div>
              
              <div class="topbar-action-btn" @click="showAlertPanel" title="Alert Display">
                <el-icon><Bell /></el-icon>
                <span class="alert-badge">3</span>
              </div>
              <div class="user-mini-horizontal">
              <div class="avatar-mini">👤</div>
              <div class="user-info">
                <div class="user-name">Administrator</div>
                <div class="user-role">System Admin</div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </header>
      <div class="view-shell">
        <transition name="fade-slide" mode="out-in">
          <component :is="currentComponent" :key="currentView" :initialTab="currentViewTab" />
        </transition>
      </div>
    </main>

    <!-- 子菜单浮层（Teleport 到 body） -->
    <Teleport to="body">
      <transition name="submenu-fade">
        <div v-if="activeSubMenuId && subMenuItems.length" class="submenu-panel floating-submenu" :style="subMenuPosition">
          <div
            v-for="sub in subMenuItems"
            :key="sub.id"
            @click="handleSubMenuClick(sub)"
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
.custom-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 10px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 13px;
  transition: all 0.15s;
  position: relative;
}
.menu-item:hover {
  background: rgba(30, 41, 59, 0.7);
  color: #e2e8f0;
}
.menu-item.active {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(14, 165, 233, 0.08));
  color: #38bdf8;
  border-right: 2px solid #38bdf8;
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
.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 8px;
}
.sidebar.collapsed .menu-item span {
  display: none;
}
.sidebar.collapsed .submenu-arrow {
  display: none;
}

/* ========== 主内容区 ========== */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2px 4px 4px 4px;
  gap: 4px;
  overflow: hidden;
  min-width: 0;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  min-height: 44px;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}
.tabs-bar {
  display: flex;
  gap: 6px;
  margin-left: 0;
  overflow-x: auto;
  flex: 1;
}
.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.4);
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.tab-item:hover {
  background: rgba(56, 189, 248, 0.12);
  color: #e2e8f0;
}
.tab-item.active {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}
.close-btn {
  font-size: 14px;
  opacity: 0.6;
  cursor: pointer;
}
.close-btn:hover {
  opacity: 1;
  color: #f87171;
}
.topbar-right {
  display: flex;
  align-items: center;
}
.topbar-user-section {
  display: flex;
  align-items: center;
  gap: 20px;
}
.user-mini-horizontal {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.5);
}
.user-mini-horizontal .avatar-mini {
  width: 28px;
  height: 28px;
  background: linear-gradient(145deg, #334155, #1e293b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.user-mini-horizontal .user-info {
  line-height: 1.2;
}
.user-mini-horizontal .user-name {
  font-size: 12px;
  font-weight: 500;
  color: #e2e8f0;
}
.user-mini-horizontal .user-role {
  font-size: 10px;
  color: #7e8a9b;
}
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.about-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 12px;
  transition: all 0.15s;
  background: rgba(15, 23, 42, 0.3);
}
.about-action:hover {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}
.topbar-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 12px;
  transition: all 0.15s;
  background: rgba(15, 23, 42, 0.3);
  position: relative;
}
.topbar-action-btn:hover {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}
.alert-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}
.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.3);
  font-size: 11px;
  color: #7e8a9b;
}
.status-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
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

/* ========== 页面内部样式 ========== */
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
  animation: vscode-pop 0.12s ease-out forwards;
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

/* Tooltip 样式 */
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
</style>