<script setup lang="ts">
import { ref, markRaw, defineAsyncComponent } from 'vue';
import { GridLayout, GridItem } from 'vue3-grid-layout';
import Header from '../components/dashboard/Header.vue';

// Async import widgets
const CenterPanel = markRaw(defineAsyncComponent(() => import('../components/dashboard/CenterPanel.vue')));
const SecurityGrid = markRaw(defineAsyncComponent(() => import('../components/dashboard/widgets/SecurityGrid.vue')));
const IncidentAnalysis = markRaw(defineAsyncComponent(() => import('../components/dashboard/widgets/IncidentAnalysis.vue')));
const SentimentAnalysis = markRaw(defineAsyncComponent(() => import('../components/dashboard/widgets/SentimentAnalysis.vue')));
const KeySites = markRaw(defineAsyncComponent(() => import('../components/dashboard/widgets/KeySites.vue')));
const SecurityTrend = markRaw(defineAsyncComponent(() => import('../components/dashboard/widgets/SecurityTrend.vue')));
const RiskRank = markRaw(defineAsyncComponent(() => import('../components/dashboard/widgets/RiskRank.vue')));
const PoliceDeployment = markRaw(defineAsyncComponent(() => import('../components/dashboard/widgets/PoliceDeployment.vue')));
const LiveSurveillance = markRaw(defineAsyncComponent(() => import('../components/dashboard/widgets/LiveSurveillance.vue')));
const AlarmEvents = markRaw(defineAsyncComponent(() => import('../components/dashboard/widgets/AlarmEvents.vue')));

// Role Definitions
const ROLES = {
  ADMIN: 'ADMIN',
  COMMAND_CENTER: 'COMMAND_CENTER',
  POLICE_FORCE: 'POLICE_FORCE',
  TRAFFIC_CONTROL: 'TRAFFIC_CONTROL'
};

const currentRole = ref(ROLES.ADMIN);

// Layout Definitions for different roles
const layouts = {
  [ROLES.ADMIN]: [
    { x: 3, y: 0, w: 6, h: 16, i: 'center', component: CenterPanel, title: '3D Digital Twin Map' },
    { x: 0, y: 0, w: 3, h: 4, i: 'grid', component: SecurityGrid, title: 'Security Grid' },
    { x: 0, y: 4, w: 3, h: 6, i: 'incident', component: IncidentAnalysis, title: 'Incident Analysis' },
    { x: 0, y: 10, w: 3, h: 6, i: 'sentiment', component: SentimentAnalysis, title: 'Public Sentiment' },
    { x: 0, y: 16, w: 3, h: 6, i: 'sites', component: KeySites, title: 'Key Sites' },
    { x: 9, y: 0, w: 3, h: 6, i: 'trend', component: SecurityTrend, title: 'Security Trend' },
    { x: 9, y: 6, w: 3, h: 6, i: 'rank', component: RiskRank, title: 'Risk Rank' },
    { x: 9, y: 12, w: 3, h: 6, i: 'police', component: PoliceDeployment, title: 'Police Force' },
    { x: 9, y: 18, w: 3, h: 6, i: 'video', component: LiveSurveillance, title: 'Live Video' },
    { x: 3, y: 16, w: 6, h: 8, i: 'alarms', component: AlarmEvents, title: 'Live Alarms' }
  ],
  [ROLES.COMMAND_CENTER]: [
    { x: 2, y: 0, w: 8, h: 18, i: 'center', component: CenterPanel, title: 'Strategic Command Map' },
    { x: 0, y: 0, w: 2, h: 6, i: 'incident', component: IncidentAnalysis, title: 'Live Incidents' },
    { x: 0, y: 6, w: 2, h: 6, i: 'sentiment', component: SentimentAnalysis, title: 'Social Risk' },
    { x: 0, y: 12, w: 2, h: 6, i: 'video', component: LiveSurveillance, title: 'Command Video' },
    { x: 10, y: 0, w: 2, h: 6, i: 'rank', component: RiskRank, title: 'City Risk' },
    { x: 10, y: 6, w: 2, h: 6, i: 'trend', component: SecurityTrend, title: 'Event Trend' },
    { x: 10, y: 12, w: 2, h: 6, i: 'police', component: PoliceDeployment, title: 'Unit Status' },
    { x: 2, y: 18, w: 8, h: 6, i: 'alarms', component: AlarmEvents, title: 'Emergency Dispatch' }
  ],
  [ROLES.POLICE_FORCE]: [
    { x: 0, y: 0, w: 9, h: 18, i: 'center', component: CenterPanel, title: 'Patrol Dispatch Map' },
    { x: 9, y: 0, w: 3, h: 8, i: 'police', component: PoliceDeployment, title: 'Force Distribution' },
    { x: 9, y: 8, w: 3, h: 8, i: 'grid', component: SecurityGrid, title: 'Grid Security' },
    { x: 9, y: 16, w: 3, h: 8, i: 'video', component: LiveSurveillance, title: 'Patrol Video' },
    { x: 0, y: 18, w: 12, h: 6, i: 'alarms', component: AlarmEvents, title: 'Incident Response' }
  ],
  [ROLES.TRAFFIC_CONTROL]: [
    { x: 0, y: 0, w: 3, h: 8, i: 'trend', component: SecurityTrend, title: 'Traffic Trend' },
    { x: 3, y: 0, w: 6, h: 18, i: 'center', component: CenterPanel, title: 'Traffic Flow Map' },
    { x: 9, y: 0, w: 3, h: 8, i: 'incident', component: IncidentAnalysis, title: 'Traffic Incidents' },
    { x: 0, y: 8, w: 3, h: 10, i: 'video', component: LiveSurveillance, title: 'CCTV Feeds' },
    { x: 9, y: 8, w: 3, h: 10, i: 'rank', component: RiskRank, title: 'Congestion Rank' },
    { x: 0, y: 18, w: 12, h: 6, i: 'alarms', component: AlarmEvents, title: 'Traffic Alarms' }
  ]
};

// Default layout with all atomic widgets
const layout = ref([...layouts[currentRole.value]]);

const availableWidgets = [
  { id: 'grid', title: 'Security Grid', component: SecurityGrid, w: 3, h: 4 },
  { id: 'incident', title: 'Incident Analysis', component: IncidentAnalysis, w: 3, h: 6 },
  { id: 'sentiment', title: 'Sentiment Analysis', component: SentimentAnalysis, w: 3, h: 6 },
  { id: 'sites', title: 'Key Sites', component: KeySites, w: 3, h: 6 },
  { id: 'trend', title: 'Security Trend', component: SecurityTrend, w: 3, h: 6 },
  { id: 'rank', title: 'Risk Rank', component: RiskRank, w: 3, h: 6 },
  { id: 'police', title: 'Police Force', component: PoliceDeployment, w: 3, h: 6 },
  { id: 'video', title: 'Live Video', component: LiveSurveillance, w: 3, h: 6 },
  { id: 'alarms', title: 'Live Alarms', component: AlarmEvents, w: 6, h: 8 }
];

const isEditMode = ref(false);
const showMenu = ref(false);
const showRoleMenu = ref(false);

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

const switchRole = (role: string) => {
  currentRole.value = role;
  layout.value = [...layouts[role]];
  showRoleMenu.value = false;
};

const removeCard = (id: string) => {
  layout.value = layout.value.filter(item => item.i !== id);
};

const addCard = (widget: any) => {
  const exists = layout.value.find(item => item.i === widget.id);
  if (exists) return;
  
  layout.value.push({ 
    x: 0, y: 20, 
    w: widget.w, h: widget.h, 
    i: widget.id, 
    component: widget.component, 
    title: widget.title 
  });
  showMenu.value = false;
};

const resetLayout = () => {
  window.location.reload(); // Simple reset
};

</script>

<template>
  <div class="dashboard-container">
    <Header />
    
    <!-- Control Buttons -->
    <div class="top-controls">
      <!-- Role Switcher -->
      <div class="role-switcher">
        <button @click="showRoleMenu = !showRoleMenu" class="glass-btn role-btn">
          <span class="icon">👤</span>
          {{ currentRole.replace('_', ' ') }}
        </button>
        <div v-if="showRoleMenu" class="role-menu">
          <div 
            v-for="(label, role) in ROLES" 
            :key="role"
            @click="switchRole(role)"
            class="menu-item"
            :class="{ active: currentRole === role }"
          >
            {{ role.replace('_', ' ') }}
          </div>
        </div>
      </div>

      <button @click="toggleEditMode" :class="{ 'btn-active': isEditMode }" class="glass-btn">
        <span class="icon">{{ isEditMode ? '💾' : '⚙️' }}</span>
        {{ isEditMode ? 'Save Layout' : 'Customize Dashboard' }}
      </button>
      
      <div v-if="isEditMode" class="edit-group">
        <div class="add-widget-dropdown">
          <button @click="showMenu = !showMenu" class="glass-btn">
            <span class="icon">➕</span> Add Widget
          </button>
          <div v-if="showMenu" class="widget-menu">
            <div 
              v-for="w in availableWidgets" 
              :key="w.id" 
              @click="addCard(w)"
              class="menu-item"
            >
              {{ w.title }}
            </div>
          </div>
        </div>
        <button @click="resetLayout" class="glass-btn danger">Reset</button>
      </div>
    </div>

    <div class="main-viewport">
      <grid-layout
        v-model:layout="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="isEditMode"
        :is-resizable="isEditMode"
        :vertical-compact="true"
        :margin="[12, 12]"
        :use-css-transforms="true"
        class="dynamic-grid"
      >
        <grid-item
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          class="grid-card-item"
        >
          <div class="card-container" :class="{ 'is-editing': isEditMode }">
            <!-- Edit Overlay -->
            <div v-if="isEditMode" class="edit-overlay">
              <div class="drag-handle">⠿ Drag to Move</div>
              <button class="close-btn" @click.stop="removeCard(item.i)">×</button>
            </div>
            
            <!-- Component Content -->
            <component :is="item.component" class="widget-content" />
          </div>
        </grid-item>
      </grid-layout>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at 50% 50%, #0a1a3a 0%, #010816 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-controls {
  position: fixed;
  top: 95px;
  right: 30px;
  z-index: 2000;
  display: flex;
  gap: 12px;
  align-items: center;

  .edit-group {
    display: flex;
    gap: 12px;
  }

  .glass-btn {
    background: rgba(0, 247, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 247, 255, 0.3);
    color: #00f7ff;
    padding: 6px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 8px;
    
    &:hover {
      background: rgba(0, 247, 255, 0.2);
      border-color: #00f7ff;
      box-shadow: 0 0 15px rgba(0, 247, 255, 0.4);
    }

    &.btn-active {
      background: #00f7ff;
      color: #010816;
      box-shadow: 0 0 20px #00f7ff;
    }

    &.danger {
      color: #ff4b4b;
      border-color: rgba(255, 75, 75, 0.3);
      &:hover { background: rgba(255, 75, 75, 0.1); border-color: #ff4b4b; }
    }
  }

  .role-switcher {
    position: relative;
    .role-btn {
      background: rgba(0, 115, 255, 0.2);
      border-color: rgba(0, 115, 255, 0.5);
      color: #fff;
      min-width: 140px;
      justify-content: center;
      &:hover { background: rgba(0, 115, 255, 0.3); border-color: #0073ff; }
    }
    .role-menu {
      position: absolute;
      top: calc(100% + 10px);
      left: 0;
      background: rgba(1, 12, 34, 0.95);
      backdrop-filter: blur(15px);
      border: 1px solid #0073ff;
      border-radius: 8px;
      width: 180px;
      padding: 8px 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
      z-index: 2100;

      .menu-item {
        padding: 10px 20px;
        cursor: pointer;
        font-size: 13px;
        color: rgba(224, 242, 255, 0.8);
        transition: all 0.2s;
        &.active { color: #00f7ff; background: rgba(0, 247, 255, 0.1); font-weight: bold; }
        &:hover {
          background: rgba(0, 115, 255, 0.2);
          color: #fff;
          padding-left: 25px;
        }
      }
    }
  }

  .add-widget-dropdown {
    position: relative;
    .widget-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: rgba(1, 12, 34, 0.95);
      backdrop-filter: blur(15px);
      border: 1px solid #00f7ff;
      border-radius: 8px;
      width: 180px;
      padding: 8px 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
      z-index: 2100;

      .menu-item {
        padding: 10px 20px;
        cursor: pointer;
        font-size: 13px;
        color: rgba(224, 242, 255, 0.8);
        transition: all 0.2s;
        &:hover {
          background: rgba(0, 247, 255, 0.1);
          color: #00f7ff;
          padding-left: 25px;
        }
      }
    }
  }
}

.main-viewport {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 15px;
  perspective: 1000px;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(0, 247, 255, 0.2); border-radius: 3px; }

  .dynamic-grid {
    min-height: 100%;
  }

  .grid-card-item {
    transition: none !important; // Layout handles transition
    
    &.vue-grid-placeholder {
      background: rgba(0, 247, 255, 0.15) !important;
      border-radius: 8px !important;
      border: 2px dashed #00f7ff !important;
      opacity: 0.5 !important;
    }
  }

  .card-container {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 8px;
    
    &.is-editing {
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border: 2px dashed #00f7ff;
        background: rgba(0, 247, 255, 0.05);
        border-radius: 8px;
        z-index: 100;
        pointer-events: none;
      }
    }

    .edit-overlay {
      position: absolute;
      inset: 0;
      z-index: 150;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;

      .drag-handle {
        color: #00f7ff;
        font-weight: 800;
        font-size: 14px;
        background: rgba(1, 12, 34, 0.8);
        padding: 8px 20px;
        border-radius: 20px;
        border: 1px solid #00f7ff;
        cursor: move;
        pointer-events: auto;
        box-shadow: 0 0 15px rgba(0, 247, 255, 0.3);
      }

      .close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ff4b4b;
        border: none;
        color: #fff;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 0 10px rgba(255, 75, 75, 0.5);
        &:hover { transform: scale(1.1); }
      }
    }
    
    .widget-content {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
