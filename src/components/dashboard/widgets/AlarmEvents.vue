<script setup lang="ts">
import { ref } from 'vue';
import ChartBox from '../ChartBox.vue';

const alarms = ref([
  {
    id: 1,
    type: 'Fire Alarm',
    location: 'Muscat Grand Mall - Zone A',
    time: '2026-04-14 10:25:30',
    status: 'Active',
    severity: 'Critical',
    image: 'https://images.unsplash.com/photo-1542350327-4636dc45719b?q=80&w=400&auto=format&fit=crop',
    description: 'Smoke detected in the food court area. Automatic sprinklers activated.'
  },
  {
    id: 2,
    type: 'Intrusion Detection',
    location: 'Bawshar District - Perimeter 4',
    time: '2026-04-14 10:20:15',
    status: 'Verifying',
    severity: 'Warning',
    image: 'https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=400&auto=format&fit=crop',
    description: 'Human figure detected crossing the fence line after hours.'
  },
  {
    id: 3,
    type: 'Vehicle Accident',
    location: 'Sultan Qaboos St - Exit 12',
    time: '2026-04-14 10:15:00',
    status: 'Dispatched',
    severity: 'High',
    image: 'https://images.unsplash.com/photo-1590333746438-2834503f5573?q=80&w=400&auto=format&fit=crop',
    description: 'Two-vehicle collision reported. Traffic patrol unit 04 is en route.'
  },
  {
    id: 4,
    type: 'Crowd Gathering',
    location: 'Mutrah Souq - Main Entrance',
    time: '2026-04-14 10:05:45',
    status: 'Monitoring',
    severity: 'Medium',
    image: 'https://images.unsplash.com/photo-1531058021387-39322098616e?q=80&w=400&auto=format&fit=crop',
    description: 'Unexpected large crowd forming near the entrance. No incident reported yet.'
  }
]);

const getSeverityClass = (severity: string) => {
  return severity.toLowerCase();
};
</script>

<template>
  <ChartBox title="Live Alarm Events" class="alarm-events-widget">
    <div class="events-container">
      <div v-for="alarm in alarms" :key="alarm.id" class="alarm-card">
        <div class="card-image" :class="{ 'fire-bg': alarm.type.includes('Fire') }">
          <img :src="alarm.image" :alt="alarm.type" />
          <div class="image-overlay">
            <span class="severity-badge" :class="getSeverityClass(alarm.severity)">
              {{ alarm.severity }}
            </span>
            <div class="fire-icon" v-if="alarm.type.includes('Fire')">🔥</div>
            <div class="rec-indicator">
              <span class="dot"></span> REC
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="card-header">
            <span class="alarm-type">{{ alarm.type }}</span>
            <span class="alarm-time">{{ alarm.time.split(' ')[1] }}</span>
          </div>
          <div class="alarm-location">
            <span class="icon">📍</span> {{ alarm.location }}
          </div>
          <p class="alarm-desc">{{ alarm.description }}</p>
          <div class="card-footer">
            <span class="status-indicator">
              <span class="status-dot" :class="alarm.status.toLowerCase()"></span>
              {{ alarm.status }}
            </span>
            <button class="detail-btn">DETAILS</button>
          </div>
        </div>
      </div>
    </div>
  </ChartBox>
</template>

<style scoped lang="scss">
.alarm-events-widget {
  width: 100%;
  height: 100%;
}

.events-container {
  height: calc(100% - 45px);
  padding: 10px;
  display: flex;
  gap: 15px;
  overflow-x: auto;
  overflow-y: hidden;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 247, 255, 0.3);
    border-radius: 2px;
  }
}

.alarm-card {
  flex: 0 0 280px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 247, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 247, 255, 0.5);
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
  }

  .card-image {
    width: 100%;
    height: 140px;
    position: relative;
    overflow: hidden;
    
    &.fire-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 50%, rgba(255, 75, 75, 0.2) 0%, transparent 70%);
      pointer-events: none;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: saturate(0.8) contrast(1.1);
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.8));
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .fire-icon {
        position: absolute;
        top: 40px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 40px;
        filter: drop-shadow(0 0 15px #ff4b4b);
        animation: fire-pulse 1.5s infinite;
      }

      .severity-badge {
        align-self: flex-start;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        
        &.critical { background: #ff4b4b; color: #fff; box-shadow: 0 0 10px #ff4b4b; }
        &.high { background: #ff8c00; color: #fff; }
        &.warning { background: #ffd700; color: #000; }
        &.medium { background: #00f7ff; color: #000; }
      }

      .rec-indicator {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 10px;
        color: #ff4b4b;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(0,0,0,0.5);
        padding: 2px 6px;
        border-radius: 4px;

        .dot {
          width: 6px;
          height: 6px;
          background: #ff4b4b;
          border-radius: 50%;
          animation: blink 1s infinite;
        }
      }
    }
  }

  .card-content {
    padding: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .alarm-type {
        font-size: 14px;
        font-weight: bold;
        color: #fff;
      }
      .alarm-time {
        font-size: 11px;
        color: rgba(255,255,255,0.4);
        font-family: 'Digital-7', sans-serif;
      }
    }

    .alarm-location {
      font-size: 12px;
      color: #00f7ff;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .alarm-desc {
      font-size: 11px;
      color: rgba(224, 242, 255, 0.7);
      line-height: 1.4;
      margin: 4px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.05);

      .status-indicator {
        font-size: 11px;
        color: rgba(255,255,255,0.6);
        display: flex;
        align-items: center;
        gap: 6px;

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          &.active { background: #ff4b4b; box-shadow: 0 0 5px #ff4b4b; }
          &.verifying { background: #ffd700; }
          &.dispatched { background: #00f7ff; }
          &.monitoring { background: #00ff00; }
        }
      }

      .detail-btn {
        background: transparent;
        border: 1px solid rgba(0, 247, 255, 0.3);
        color: #00f7ff;
        font-size: 10px;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background: rgba(0, 247, 255, 0.1);
          border-color: #00f7ff;
        }
      }
    }
  }
}

@keyframes scan { from { top: 0; } to { top: 100%; } }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes fire-pulse {
  0%, 100% { transform: translateX(-50%) scale(1); filter: drop-shadow(0 0 10px #ff4b4b); }
  50% { transform: translateX(-50%) scale(1.2); filter: drop-shadow(0 0 25px #ff4b4b); }
}
</style>
