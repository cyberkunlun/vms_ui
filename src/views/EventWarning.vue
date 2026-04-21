<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

interface AlarmEvent {
  id: number;
  taskName: string;
  status: 'red' | 'yellow' | 'blue';
  algorithmType: string;
  location: string;
  time: string;
  image: string;
}

const activeTab = ref('event')
const searchQuery = ref('')
const timeRange = ref('last1h')
const region = ref('')
const taskModel = ref('')
const viewMode = ref('card') // 'card' or 'list'

const typeChartRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
let typeChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

const tabs = [
  { label: '事件预警', value: 'event' },
  { label: '目标预警', value: 'target' },
  { label: '事件统计', value: 'stats' },
  { label: '趋势分析', value: 'trend' }
]

const statsCards = [
  { label: '今日报警总数', value: 128, color: '#ef4444', icon: '🚨' },
  { label: '已处理报警', value: 96, color: '#10b981', icon: '✅' },
  { label: '待处理报警', value: 32, color: '#f59e0b', icon: '⏳' },
  { label: '今日在线任务', value: 45, color: '#3b82f6', icon: '📋' }
]

const initCharts = () => {
  if (typeChartRef.value) {
    if (typeChart) typeChart.dispose()
    typeChart = echarts.init(typeChartRef.value)
    typeChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%', left: 'center', textStyle: { color: '#94a3b8' } },
      series: [
        {
          name: '事件类型分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#010816', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold', color: '#fff' } },
          labelLine: { show: false },
          data: [
            { value: 45, name: '区域离开', itemStyle: { color: '#ef4444' } },
            { value: 32, name: '人员拌线', itemStyle: { color: '#f59e0b' } },
            { value: 24, name: '车辆入侵', itemStyle: { color: '#3b82f6' } },
            { value: 18, name: '非法聚集', itemStyle: { color: '#8b5cf6' } },
            { value: 9, name: '其他', itemStyle: { color: '#64748b' } }
          ]
        }
      ]
    })
  }

  if (trendChartRef.value) {
    if (trendChart) trendChart.dispose()
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
        axisLabel: { color: '#94a3b8' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.1)' } }
      },
      series: [
        {
          name: '预警趋势',
          type: 'line',
          smooth: true,
          data: [12, 18, 15, 25, 22, 30, 28],
          itemStyle: { color: '#00f7ff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 247, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 247, 255, 0)' }
            ])
          }
        }
      ]
    })
  }
}

const handleResize = () => {
  typeChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  typeChart?.dispose()
  trendChart?.dispose()
})

const handleTabChange = (val: string) => {
  activeTab.value = val
  if (val === 'stats') {
    nextTick(() => {
      initCharts()
    })
  }
}

const timeOptions = [
  { label: '最近2分钟', value: 'last2m' },
  { label: '最近1小时', value: 'last1h' },
  { label: '近1天', value: 'last1d' },
  { label: '近3天', value: 'last3d' },
  { label: '近7天', value: 'last7d' }
]

const mockEvents = ref<AlarmEvent[]>([
  {
    id: 1,
    taskName: 'Area Exit_20260409_210540',
    status: 'red',
    algorithmType: '区域离开',
    location: 'xuntui_test',
    time: '2026/04/16 15:05:08',
    image: 'https://images.unsplash.com/photo-1542350327-4636dc45719b?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 2,
    taskName: 'Person Tripwire Detection...',
    status: 'red',
    algorithmType: '人员拌线检测',
    location: 'xuntui_test',
    time: '2026/04/16 15:05:08',
    image: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 3,
    taskName: 'Area Exit_20260409_210540',
    status: 'red',
    algorithmType: '区域离开',
    location: 'xuntui_test',
    time: '2026/04/16 14:58:21',
    image: 'https://images.unsplash.com/photo-1590333746438-2834503f5573?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 4,
    taskName: 'Person Tripwire Detection...',
    status: 'red',
    algorithmType: '人员拌线检测',
    location: 'xuntui_test',
    time: '2026/04/16 14:58:21',
    image: 'https://images.unsplash.com/photo-1531058021387-39322098616e?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 5,
    taskName: 'Area Exit_20260409_210540',
    status: 'red',
    algorithmType: '区域离开',
    location: 'xuntui_test',
    time: '2026/04/16 14:58:11',
    image: 'https://images.unsplash.com/photo-1542350327-4636dc45719b?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 6,
    taskName: 'Person Tripwire Detection...',
    status: 'red',
    algorithmType: '人员拌线检测',
    location: 'xuntui_test',
    time: '2026/04/16 14:58:11',
    image: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 7,
    taskName: 'Area Exit_20260409_210540',
    status: 'red',
    algorithmType: '区域离开',
    location: 'xuntui_test',
    time: '2026/04/16 14:55:40',
    image: 'https://images.unsplash.com/photo-1590333746438-2834503f5573?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 8,
    taskName: 'Person Tripwire Detection...',
    status: 'red',
    algorithmType: '人员拌线检测',
    location: 'xuntui_test',
    time: '2026/04/16 14:55:40',
    image: 'https://images.unsplash.com/photo-1531058021387-39322098616e?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 9,
    taskName: 'Area Exit_20260409_210540',
    status: 'red',
    algorithmType: '区域离开',
    location: 'xuntui_test',
    time: '2026/04/16 14:55:38',
    image: 'https://images.unsplash.com/photo-1542350327-4636dc45719b?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 10,
    taskName: 'Person Tripwire Detection...',
    status: 'red',
    algorithmType: '人员拌线检测',
    location: 'xuntui_test',
    time: '2026/04/16 14:55:38',
    image: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 11,
    taskName: 'Area Exit_20260409_210540',
    status: 'red',
    algorithmType: '区域离开',
    location: 'xuntui_test',
    time: '2026/04/16 14:55:35',
    image: 'https://images.unsplash.com/photo-1590333746438-2834503f5573?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 12,
    taskName: 'Person Tripwire Detection...',
    status: 'red',
    algorithmType: '人员拌线检测',
    location: 'xuntui_test',
    time: '2026/04/16 14:55:35',
    image: 'https://images.unsplash.com/photo-1531058021387-39322098616e?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 13,
    taskName: 'Area Exit_20260409_210540',
    status: 'red',
    algorithmType: '区域离开',
    location: 'xuntui_test',
    time: '2026/04/16 14:54:10',
    image: 'https://images.unsplash.com/photo-1542350327-4636dc45719b?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 14,
    taskName: 'Person Tripwire Detection...',
    status: 'red',
    algorithmType: '人员拌线检测',
    location: 'xuntui_test',
    time: '2026/04/16 14:54:10',
    image: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 15,
    taskName: 'Area Exit_20260409_210540',
    status: 'red',
    algorithmType: '区域离开',
    location: 'xuntui_test',
    time: '2026/04/16 14:53:22',
    image: 'https://images.unsplash.com/photo-1590333746438-2834503f5573?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 16,
    taskName: 'Person Tripwire Detection...',
    status: 'red',
    algorithmType: '人员拌线检测',
    location: 'xuntui_test',
    time: '2026/04/16 14:53:22',
    image: 'https://images.unsplash.com/photo-1531058021387-39322098616e?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 17,
    taskName: 'Area Exit_20260409_210540',
    status: 'red',
    algorithmType: '区域离开',
    location: 'xuntui_test',
    time: '2026/04/16 14:52:15',
    image: 'https://images.unsplash.com/photo-1542350327-4636dc45719b?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 18,
    taskName: 'Person Tripwire Detection...',
    status: 'red',
    algorithmType: '人员拌线检测',
    location: 'xuntui_test',
    time: '2026/04/16 14:52:15',
    image: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=400&auto=format&fit=crop'
  }
])

// Duplicate for filling grid
const events = computed(() => {
  return [...mockEvents.value]
})

const resetFilters = () => {
  searchQuery.value = ''
  timeRange.value = 'last1h'
  region.value = ''
  taskModel.value = ''
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'red': return '红色'
    case 'yellow': return '黄色'
    case 'blue': return '蓝色'
    default: return status
  }
}
</script>

<template>
  <div class="event-warning-view">
    <!-- Top Tabs -->
    <div class="tabs-header">
      <div 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="handleTabChange(tab.value)"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- Stats View -->
    <div v-if="activeTab === 'stats'" class="stats-view">
      <div class="stats-overview">
        <div v-for="card in statsCards" :key="card.label" class="stats-card">
          <div class="card-icon">{{ card.icon }}</div>
          <div class="card-info">
            <div class="label">{{ card.label }}</div>
            <div class="value" :style="{ color: card.color }">{{ card.value }}</div>
          </div>
        </div>
      </div>

      <div class="charts-container">
        <div class="chart-box">
          <div class="chart-title">事件类型分布</div>
          <div ref="typeChartRef" class="chart-content"></div>
        </div>
        <div class="chart-box">
          <div class="chart-title">预警趋势分析</div>
          <div ref="trendChartRef" class="chart-content"></div>
        </div>
      </div>
    </div>

    <!-- Filter Bar (Hidden in Stats) -->
    <div class="filter-bar" v-if="activeTab !== 'stats'">
      <div class="filter-item search">
        <span class="label">搜索</span>
        <div class="input-wrapper">
          <span class="icon">🔍</span>
          <input type="text" v-model="searchQuery" placeholder="请输入任务名称搜索" />
        </div>
      </div>

      <div class="filter-item time">
        <span class="label">时间</span>
        <div class="date-picker">
          <input type="text" value="2026-04-16 14:17" readonly />
          <span class="separator">-</span>
          <input type="text" value="2026-04-16 15:17" readonly />
        </div>
        <div class="quick-times">
          <button 
            v-for="opt in timeOptions" 
            :key="opt.value"
            :class="{ active: timeRange === opt.value }"
            @click="timeRange = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="filter-item">
        <span class="label">区域</span>
        <select v-model="region">
          <option value="">请选择前端设备</option>
        </select>
      </div>

      <div class="filter-item">
        <span class="label">任务模型</span>
        <select v-model="taskModel">
          <option value="">请选择任务模型</option>
        </select>
      </div>

      <button class="reset-btn" @click="resetFilters">重置</button>
    </div>

    <!-- Title & View Controls (Hidden in Stats) -->
    <div class="content-header" v-if="activeTab !== 'stats'">
      <div class="title">预警信息</div>
      <div class="header-right">
        <span class="count">共有{{ events.length }}个报警</span>
        <div class="view-switch">
          <button 
            :class="{ active: viewMode === 'card' }"
            @click="viewMode = 'card'"
          >
            <span class="icon">⊞</span> 卡片
          </button>
          <button 
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <span class="icon">≡</span> 列表
          </button>
        </div>
      </div>
    </div>

    <!-- Events Grid (Hidden in Stats) -->
    <div class="events-grid" v-if="viewMode === 'card' && activeTab !== 'stats'">
      <div v-for="event in events" :key="event.id" class="event-card">
        <div class="card-image">
          <img :src="event.image" :alt="event.taskName" />
        </div>
        <div class="card-info">
          <div class="info-row main">
            <span class="task-name">{{ event.taskName }}</span>
            <span class="status-tag" :class="event.status">{{ getStatusLabel(event.status) }}</span>
          </div>
          <div class="info-row sub">
            <span class="algo-type">{{ event.algorithmType }}</span>
          </div>
          <div class="info-row detail">
            <span class="icon">📍</span>
            <span class="text">{{ event.location }}</span>
          </div>
          <div class="info-row detail">
            <span class="icon">🕒</span>
            <span class="text">{{ event.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination (Hidden in Stats) -->
    <div class="pagination" v-if="activeTab !== 'stats'">
      <button class="page-btn prev">←</button>
      <div class="page-numbers">
        <span class="page-num active">1</span>
        <span class="page-num">2</span>
        <span class="page-num">3</span>
        <span class="page-num">4</span>
        <span class="page-num">5</span>
        <span class="page-num">6</span>
        <span class="page-num">7</span>
        <span class="page-num">8</span>
      </div>
      <button class="page-btn next">→</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stats-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.3s ease;

  .stats-overview {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .stats-card {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(56, 189, 248, 0.1);
      padding: 20px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(56, 189, 248, 0.3);
        background: rgba(15, 23, 42, 0.6);
        transform: translateY(-2px);
      }

      .card-icon {
        font-size: 24px;
        width: 48px;
        height: 48px;
        background: rgba(15, 23, 42, 0.8);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .card-info {
        .label {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 4px;
        }
        .value {
          font-size: 24px;
          font-weight: bold;
          font-family: 'Digital-7', sans-serif;
        }
      }
    }
  }

  .charts-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    height: 400px;

    .chart-box {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(56, 189, 248, 0.1);
      padding: 20px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;

      .chart-title {
        font-size: 15px;
        font-weight: 600;
        color: #e2e8f0;
        margin-bottom: 20px;
        padding-left: 10px;
        border-left: 3px solid #00f7ff;
      }

      .chart-content {
        flex: 1;
        width: 100%;
        min-height: 250px;
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.event-warning-view {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #010816;
  color: #fff;
  overflow-y: auto;
}

.tabs-header {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 20px;

  .tab-item {
    font-size: 16px;
    color: #94a3b8;
    cursor: pointer;
    padding: 8px 0;
    position: relative;

    &:hover {
      color: #38bdf8;
    }

    &.active {
      color: #00f7ff;
      font-weight: bold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: #00f7ff;
        box-shadow: 0 0 10px #00f7ff;
      }
    }
  }
}

.filter-bar {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(56, 189, 248, 0.05);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  border-radius: 4px;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      font-size: 13px;
      color: #94a3b8;
      white-space: nowrap;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      
      .icon {
        position: absolute;
        left: 8px;
        color: #64748b;
        font-size: 12px;
      }

      input {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.1);
        color: #f1f5f9;
        padding: 6px 10px 6px 28px;
        border-radius: 2px;
        font-size: 12px;
        width: 180px;
        transition: all 0.2s ease;

        &:focus {
          border-color: #00f7ff;
          outline: none;
          background: rgba(15, 23, 42, 1);
        }

        &::placeholder {
          color: #475569;
        }
      }
    }

    .date-picker {
      display: flex;
      align-items: center;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 2px;
      padding: 0 8px;

      input {
        background: transparent;
        border: none;
        color: #f1f5f9;
        padding: 6px 0;
        font-size: 12px;
        width: 110px;
        text-align: center;
        outline: none;
      }

      .separator {
        margin: 0 4px;
        color: #475569;
      }
    }

    .quick-times {
      display: flex;
      gap: 4px;

      button {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(148, 163, 184, 0.1);
        color: #94a3b8;
        padding: 4px 8px;
        border-radius: 2px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;

        &.active {
          background: #00f7ff;
          color: #010816;
          border-color: #00f7ff;
          font-weight: 600;
        }

        &:hover:not(.active) {
          border-color: #38bdf8;
          color: #38bdf8;
        }
      }
    }

    select {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.1);
      color: #f1f5f9;
      padding: 6px 10px;
      border-radius: 2px;
      font-size: 12px;
      outline: none;
      min-width: 120px;

      &:focus {
        border-color: #00f7ff;
      }
    }
  }

  .reset-btn {
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.2);
    color: #e2e8f0;
    padding: 6px 16px;
    border-radius: 2px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
    margin-left: auto;

    &:hover {
      border-color: #00f7ff;
      color: #00f7ff;
      background: rgba(0, 247, 255, 0.05);
    }
  }
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  padding-bottom: 15px;

  .title {
    font-size: 18px;
    font-weight: bold;
    color: #e2e8f0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .count {
      color: #94a3b8;
      font-size: 14px;
    }

    .view-switch {
      display: flex;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 4px;
      padding: 2px;

      button {
        background: transparent;
        border: none;
        color: #94a3b8;
        padding: 4px 12px;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        border-radius: 2px;
        transition: all 0.2s ease;

        &.active {
          background: #00f7ff;
          color: #010816;
        }

        &:hover:not(.active) {
          color: #fff;
        }
      }
    }
  }
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  flex: 1;
}

.event-card {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    border-color: #00f7ff;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  }

  .card-image {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.8;
    }
  }

  .card-info {
    padding: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;

    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 6px;

      &.main {
        justify-content: space-between;
        margin-bottom: 4px;
      }

      &.sub {
        margin-bottom: 8px;
      }

      &.detail {
        font-size: 11px;
        color: #94a3b8;
        gap: 6px;
        margin-bottom: 4px;

        .icon {
          opacity: 0.7;
          font-size: 10px;
        }
      }

      .task-name {
        font-size: 13px;
        font-weight: 600;
        color: #f1f5f9;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        margin-right: 8px;
      }

      .status-tag {
        font-size: 10px;
        padding: 1px 6px;
        border-radius: 2px;
        color: #fff;
        font-weight: bold;
        white-space: nowrap;

        &.red { background: #ef4444; }
        &.yellow { background: #f59e0b; color: #000; }
        &.blue { background: #3b82f6; }
      }

      .algo-type {
        font-size: 12px;
        color: #22d3ee;
        font-weight: 500;
      }
    }
  }
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;

  .page-btn {
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.2);
    color: #94a3b8;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      border-color: #00f7ff;
      color: #00f7ff;
    }
  }

  .page-numbers {
    display: flex;
    gap: 8px;

    .page-num {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      color: #94a3b8;

      &.active {
        background: #00f7ff;
        color: #010816;
      }

      &:hover:not(.active) {
        color: #38bdf8;
      }
    }
  }
}
</style>
