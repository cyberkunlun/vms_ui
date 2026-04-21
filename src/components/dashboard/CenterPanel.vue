<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import * as echarts from "echarts";
import "echarts-gl";
import DigitFlop from "./DigitFlop.vue";

const mapChart = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// Map levels: 0: Governorate, 1: District, 2: Building/Mall
const currentLevel = ref(0);
const navPath = ref([
  { name: "Muscat", level: 0, file: "/muscat.json", map: "muscat" },
]);

// Enhanced Mock Data
const cameras = [
  {
    name: "MB-CAM-01",
    value: [58.391, 23.59, 31],
    type: "camera",
    status: "online",
    hasAlarm: true,
  },
  {
    name: "MB-CAM-02",
    value: [58.394, 23.589, 31],
    type: "camera",
    status: "online",
    hasAlarm: false,
  },
  {
    name: "NW-CAM-01",
    value: [58.392, 23.594, 21],
    type: "camera",
    status: "online",
    hasAlarm: true,
  },
  {
    name: "SW-CAM-01",
    value: [58.391, 23.586, 21],
    type: "camera",
    status: "offline",
    hasAlarm: false,
  },
  {
    name: "PK-CAM-01",
    value: [58.386, 23.587, 6],
    type: "camera",
    status: "online",
    hasAlarm: false,
  },
];

const alarms = [
  {
    name: "Unauthorized Entry",
    value: [58.391, 23.59, 32],
    type: "alarm",
    severity: "critical",
  },
  {
    name: "Suspicious Activity",
    value: [58.392, 23.594, 22],
    type: "alarm",
    severity: "warning",
  },
];

// Detail View State
const showDetail = ref(false);
const selectedCamera = ref<any>(null);

const districts = [
  { name: "Seeb", value: [58.18, 23.67], cameras: 450, alarms: 2 },
  { name: "Bawshar", value: [58.38, 23.59], cameras: 620, alarms: 5 },
  { name: "Mutrah", value: [58.56, 23.62], cameras: 380, alarms: 1 },
  { name: "Al Amerat", value: [58.49, 23.5], cameras: 150, alarms: 0 },
];

const initMap = async (mapConfig: any) => {
  if (!mapChart.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  await nextTick();
  chartInstance = echarts.init(mapChart.value);

  try {
    const response = await fetch(mapConfig.file);
    const geoJson = await response.json();
    echarts.registerMap(mapConfig.map, geoJson);

    // Dynamic configuration based on level
    const isBuildingLevel = currentLevel.value === 2;

    const option: any = {
      backgroundColor: "transparent",
      tooltip: {
        show: true,
        backgroundColor: "rgba(0, 20, 40, 0.95)",
        borderColor: "#00f7ff",
        textStyle: { color: "#fff" },
      },
      geo3D: {
        map: mapConfig.map,
        roam: true, // Enable panning and zooming
        boxHeight: isBuildingLevel ? 15 : 5,
        regionHeight: isBuildingLevel ? 1 : 2,
        shading: "color",
        colorMaterial: {
          detailTexture: "/oman01.jpg",
          textureTiling: 1,
          textureRepeat: "no-repeat",
        },
        itemStyle: {
          areaColor: "rgba(0, 0, 0, 0)",
          borderColor: "#00f7ff",
          borderWidth: 1,
          opacity: 1,
        },
        label: { show: false },
        viewControl: {
          projection: 'perspective',
          autoRotate: false,
          distance: isBuildingLevel ? 80 : 100, // Zoom in more
          alpha: isBuildingLevel ? 45 : 40, // Standard 3D view angle
          beta: isBuildingLevel ? 10 : 0,
          center: isBuildingLevel ? [58.39, 23.59, 0] : [58.38, 23.58, 0], // Center on Muscat
          panMouseButton: "left",
          rotateMouseButton: "right",
          zoomSensitivity: 1,
          panSensitivity: 1,
          rotateSensitivity: 1
        },
        light: {
          main: {
            intensity: 2,
            shadow: true,
            shadowQuality: "high",
            alpha: 40,
            beta: 40,
          },
          ambient: { intensity: 0.6 },
          ambientCubemap: {
            exposure: 1,
            diffuseIntensity: 0.8,
            specularIntensity: 0.8,
          },
        },
        postEffect: {
          enable: true,
          SSAO: { enable: true, radius: 2, intensity: 1.5 },
          bloom: { enable: true, bloomIntensity: 0.2 },
        },
        emphasis: {
          itemStyle: { areaColor: "rgba(0, 115, 255, 0.4)", opacity: 1 },
        },
      },
      series: [
        // Level 0/1: Show District Clusters (3D Bars)
        ...(currentLevel.value < 2
          ? [
              {
                name: "District Statistics",
                type: "bar3D",
                coordinateSystem: "geo3D",
                data: districts.map((d) => ({
                  name: d.name,
                  value: [d.value[0], d.value[1], d.cameras / 10],
                  itemStyle: { color: "#00f7ff", opacity: 0.8 },
                })),
                barSize: 2,
                shading: "lambert",
                label: {
                  show: true,
                  formatter: (p: any) =>
                    `{a|${p.name}}\n{b|📷 ${p.data.value[2] * 10}}`,
                  rich: {
                    a: { color: "#fff", fontSize: 12, fontWeight: "bold" },
                    b: {
                      color: "#00f7ff",
                      fontSize: 10,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      padding: [2, 5],
                      borderRadius: 2,
                    },
                  },
                },
              },
            ]
          : []),
        // Level 0/1: Regional Alarms with FLASHING EFFECT
        ...(currentLevel.value < 2
          ? [
              {
                name: "Regional Alarms",
                type: "scatter3D",
                coordinateSystem: "geo3D",
                data: districts
                  .filter((d) => d.alarms > 0)
                  .map((d) => ({
                    name: d.name,
                    value: [d.value[0], d.value[1], 15],
                    alarms: d.alarms,
                    type: "regional_alarm",
                  })),
                symbol: "sphere",
                symbolSize: 25,
                itemStyle: { color: "#ff4b4b", opacity: 0.9 },
                label: {
                  show: true,
                  formatter: (p: any) => `⚠️ ${p.data.alarms} Alarms`,
                  color: "#fff",
                  fontWeight: "bold",
                  backgroundColor: "#ff4b4b",
                  padding: [4, 8],
                  borderRadius: 4,
                  distance: 10,
                },
              },
              // The "Flashing" effect using effectScatter (2D) correctly projected on 3D
              {
                type: "effectScatter",
                coordinateSystem: "geo3D",
                data: districts
                  .filter((d) => d.alarms > 0)
                  .map((d) => ({
                    name: d.name,
                    value: [d.value[0], d.value[1], 2], // Slightly higher to avoid Z-fighting
                    type: "regional_alarm_ripple",
                  })),
                symbolSize: 45,
                rippleEffect: { brushType: "stroke", scale: 5, period: 2 },
                itemStyle: { color: "#ff4b4b", shadowBlur: 10, shadowColor: "#ff4b4b" },
                zlevel: 12,
              },
            ]
          : []),
        // Level 2: Physical Buildings
        ...(isBuildingLevel
          ? [
              {
                type: "bar3D",
                coordinateSystem: "geo3D",
                data: geoJson.features.map((f: any) => ({
                  name: f.properties.name,
                  value: [
                    (f.geometry.coordinates[0][0][0] +
                      f.geometry.coordinates[0][2][0]) /
                      2,
                    (f.geometry.coordinates[0][0][1] +
                      f.geometry.coordinates[0][2][1]) /
                      2,
                    f.properties.height,
                  ],
                  itemStyle: {
                    color:
                      f.properties.type === "building"
                        ? "rgba(0, 247, 255, 0.4)"
                        : "rgba(100, 100, 100, 0.3)",
                    opacity: 0.9,
                    borderColor: "#00f7ff",
                    borderWidth: 1,
                  },
                })),
                shading: "lambert",
                barSize: 10,
                minHeight: 2,
                label: {
                  show: true,
                  // Fixed deprecated textStyle
                  color: "#fff",
                  fontSize: 10,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  padding: [2, 4],
                },
                emphasis: { itemStyle: { color: "#00f7ff", opacity: 1 } },
              },
            ]
          : []),
        // Level 2: Individual Cameras
        ...(isBuildingLevel
          ? [
              {
                type: "scatter3D",
                coordinateSystem: "geo3D",
                data: cameras.map((c) => ({
                  ...c,
                  symbol: c.hasAlarm
                    ? "path://M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    : "circle",
                  symbolSize: c.hasAlarm ? 30 : 15,
                  itemStyle: {
                    color: c.hasAlarm
                      ? "#ff4b4b"
                      : c.status === "online"
                      ? "#00f7ff"
                      : "#495057",
                    opacity: 1,
                    shadowBlur: 20,
                    shadowColor: c.hasAlarm ? "#ff4b4b" : "#00f7ff",
                  },
                })),
                label: {
                  show: true,
                  position: "top",
                  distance: 5,
                  formatter: (p: any) =>
                    p.data.hasAlarm ? "{warn|⚠️ ALARM}" : "",
                  rich: {
                    warn: {
                      color: "#fff",
                      backgroundColor: "#ff4b4b",
                      padding: [4, 8],
                      borderRadius: 4,
                      fontWeight: "bold",
                      fontSize: 12,
                      shadowBlur: 10,
                      shadowColor: "rgba(255, 75, 75, 0.8)",
                    },
                  },
                },
                zlevel: 10,
              },
              // Flashing ripple for cameras with alarms
              {
                type: "effectScatter",
                coordinateSystem: "geo3D",
                data: cameras.filter(c => c.hasAlarm).map(c => ({
                  ...c,
                  value: [c.value[0], c.value[1], c.value[2] + 1],
                })),
                symbolSize: 30,
                rippleEffect: { brushType: "stroke", scale: 5, period: 2 },
                itemStyle: { color: "#ff4b4b", shadowBlur: 15, shadowColor: "#ff4b4b" },
                zlevel: 11,
              }
            ]
          : []),
      ],
    };

    chartInstance.setOption(option);

    chartInstance.on("click", (params: any) => {
      // Handle Drill-down
      if (currentLevel.value === 0 && params.componentType === "geo3D") {
        drillDown(params.name, 1);
      } else if (currentLevel.value === 0 && params.data?.type?.startsWith("regional_alarm")) {
        drillDown(params.data.name, 1);
      } else if (
        currentLevel.value === 1 &&
        (params.name.includes("Bawshar") || 
         params.componentType === "series" || 
         params.data?.type?.startsWith("regional_alarm"))
      ) {
        drillDown("Muscat Grand Mall", 2);
      }

      // Handle Camera Details
      if (params.seriesType === "scatter3D" && params.data?.type === "camera") {
        selectedCamera.value = params.data;
        showDetail.value = true;
      }
    });
  } catch (error) {
    console.error("Map failed:", error);
  }
};

const drillDown = (name: string, level: number) => {
  currentLevel.value = level;
  let file = "/muscat.json";
  let map = "muscat";
  if (level === 2) {
    file = "/muscat_malls.json";
    map = "muscat_malls";
  }
  const newPath = { name, level, file, map };
  navPath.value.push(newPath);
  initMap(newPath);
};

const goBack = (index: number) => {
  if (index === navPath.value.length - 1) return;
  navPath.value = navPath.value.slice(0, index + 1);
  const target = navPath.value[index];
  currentLevel.value = target.level;
  initMap(target);
};

onMounted(() => {
  setTimeout(() => initMap(navPath.value[0]), 300);
  window.addEventListener("resize", () => chartInstance?.resize());
});

onUnmounted(() => {
  chartInstance?.dispose();
});

const totalCameras = computed(() =>
  districts.reduce((acc, d) => acc + d.cameras, 0),
);
</script>

<template>
  <div class="center-panel">
    <div class="nav-breadcrumb">
      <template v-for="(path, i) in navPath" :key="i">
        <span
          @click="goBack(i)"
          :class="{
            link: i < navPath.length - 1,
            curr: i === navPath.length - 1,
          }"
        >
          {{ path.name }}
        </span>
        <span v-if="i < navPath.length - 1" class="sep">/</span>
      </template>
    </div>

    <div class="map-overlay-stats">
      <div class="mini-card">
        <div class="icon">📷</div>
        <div class="info">
          <div class="label">MCT Cameras</div>
          <div class="val"><DigitFlop :value="totalCameras" /></div>
        </div>
      </div>
      <div class="mini-card danger" v-if="alarms.length > 0">
        <div class="icon">🚨</div>
        <div class="info">
          <div class="label">Live Alarms</div>
          <div class="val"><DigitFlop :value="alarms.length" /></div>
        </div>
      </div>
    </div>

    <div class="map-wrapper">
      <div ref="mapChart" class="map-chart"></div>
    </div>

    <!-- Camera Detail Modal -->
    <div v-if="showDetail && selectedCamera" class="camera-detail-modal">
      <div class="modal-header">
        <div class="title">
          <span class="status-dot" :class="selectedCamera.status"></span>
          {{ selectedCamera.name }}
        </div>
        <button class="close-btn" @click="showDetail = false">×</button>
      </div>
      <div class="modal-body">
        <div class="video-preview">
          <div class="video-placeholder">
            <div class="scan-line"></div>
            <div class="rec-dot"></div>
            <div class="cam-info">LIVE // {{ selectedCamera.name }}</div>
            <div class="noise"></div>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Status</span>
            <span class="value" :class="selectedCamera.status">{{
              selectedCamera.status.toUpperCase()
            }}</span>
          </div>
          <div class="info-item">
            <span class="label">Location</span>
            <span class="value">Muscat Grand Mall, 2F</span>
          </div>
          <div class="info-item" v-if="selectedCamera.hasAlarm">
            <span class="label">Alarm</span>
            <span class="value danger">CRITICAL - MOTION DETECTED</span>
          </div>
        </div>
        <div class="actions">
          <button class="btn primary">View Full Stream</button>
          <button class="btn">Playback</button>
        </div>
      </div>
    </div>

    <div class="map-bottom-bar">
      <div class="legend">
        <div class="item"><span class="dot building"></span> Building</div>
        <div class="item"><span class="dot camera"></span> Camera</div>
        <div class="item"><span class="dot alarm"></span> 🚨 Alarm Active</div>
      </div>
      <div class="v-divider"></div>
      <div class="index-item">
        <span class="label">Command Level</span>
        <span class="value">{{
          currentLevel === 0
            ? "City"
            : currentLevel === 1
              ? "District"
              : "Building"
        }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.center-panel {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(0, 10, 30, 0.3);
  border-radius: 12px;

  .nav-breadcrumb {
    position: absolute;
    top: 25px;
    left: 25px;
    z-index: 1000;
    background: rgba(0, 20, 40, 0.85);
    backdrop-filter: blur(15px);
    padding: 8px 25px;
    border: 1px solid rgba(0, 247, 255, 0.4);
    border-radius: 30px;
    font-size: 13px;
    .link {
      color: rgba(0, 247, 255, 0.7);
      cursor: pointer;
      &:hover {
        color: #fff;
        text-shadow: 0 0 10px #00f7ff;
      }
    }
    .curr {
      color: #00f7ff;
      font-weight: bold;
    }
    .sep {
      margin: 0 12px;
      color: rgba(255, 255, 255, 0.2);
    }
  }

  .map-overlay-stats {
    position: absolute;
    top: 25px;
    right: 25px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 15px;
    .mini-card {
      background: rgba(0, 20, 40, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 247, 255, 0.2);
      border-radius: 8px;
      padding: 10px 18px;
      display: flex;
      align-items: center;
      gap: 15px;
      min-width: 160px;
      &.danger {
        border-color: rgba(255, 75, 75, 0.4);
        .icon {
          filter: drop-shadow(0 0 8px #ff4b4b);
        }
        .val {
          color: #ff4b4b;
        }
      }
      .icon {
        font-size: 22px;
      }
      .label {
        font-size: 11px;
        color: rgba(224, 242, 255, 0.6);
      }
      .val {
        font-size: 20px;
        font-weight: 800;
        color: #fff;
        font-family: "Digital-7", sans-serif;
      }
    }
  }

  .map-wrapper {
    flex: 1;
    width: 100%;
    height: 100%;
    z-index: 1;
    position: relative;
    justify-content: flex-end; 
    .map-chart {
      width: 100%;
      height: 100%;
    }
  }

  .map-bottom-bar {
    position: absolute;
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    background: rgba(0, 20, 40, 0.85);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(0, 247, 255, 0.3);
    border-radius: 40px;
    padding: 12px 40px;
    display: flex;
    align-items: center;
    gap: 35px;
    .legend {
      display: flex;
      gap: 25px;
      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        color: rgba(224, 242, 255, 0.8);
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          &.building {
            background: rgba(0, 247, 255, 0.4);
            border: 1px solid #00f7ff;
          }
          &.camera {
            background: #00f7ff;
          }
          &.alarm {
            background: #ff4b4b;
            box-shadow: 0 0 8px #ff4b4b;
          }
        }
      }
    }
    .v-divider {
      width: 1px;
      height: 25px;
      background: rgba(255, 255, 255, 0.1);
    }
    .index-item {
      display: flex;
      align-items: center;
      gap: 15px;
      .label {
        font-size: 13px;
        color: rgba(0, 247, 255, 0.8);
        font-weight: 600;
      }
      .value {
        font-size: 24px;
        font-weight: 900;
        color: #00f7ff;
        font-family: "Digital-7", sans-serif;
      }
    }
  }

  .camera-detail-modal {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    background: rgba(0, 15, 35, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 247, 255, 0.4);
    border-radius: 12px;
    z-index: 2000;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
    .modal-header {
      padding: 15px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title {
        font-size: 16px;
        font-weight: bold;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 10px;
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          &.online {
            background: #00f7ff;
            box-shadow: 0 0 8px #00f7ff;
          }
          &.offline {
            background: #495057;
          }
        }
      }
      .close-btn {
        background: none;
        border: none;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        opacity: 0.6;
        &:hover {
          opacity: 1;
        }
      }
    }
    .modal-body {
      padding: 20px;
      .video-preview {
        width: 100%;
        aspect-ratio: 16/9;
        background: #000;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 20px;
        position: relative;
        .video-placeholder {
          width: 100%;
          height: 100%;
          position: relative;
          .scan-line {
            position: absolute;
            width: 100%;
            height: 2px;
            background: rgba(0, 247, 255, 0.2);
            animation: scan 3s linear infinite;
          }
          .rec-dot {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 10px;
            height: 10px;
            background: #ff4b4b;
            border-radius: 50%;
            animation: blink 1s infinite;
          }
          .cam-info {
            position: absolute;
            bottom: 10px;
            left: 10px;
            font-family: monospace;
            font-size: 10px;
            color: rgba(255, 255, 255, 0.6);
          }
          .noise {
            position: absolute;
            inset: 0;
            background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAElBMVEUAAAD8/Pz09PT4+Pj29vb////6F6X9AAAABXRSTlMAmZmpmYl7V1kAAAA0SURBVDjLY2AYBYMWAAMGEB0AsQEIsIAYIAasAIsBYsAIsACLAWLACLAALAZSABYDKQCLAQD7OAFvF0S7OAAAAABJRU5ErkJggg==");
            opacity: 0.05;
          }
        }
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 12px;
        margin-bottom: 20px;
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          .label {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.4);
            text-transform: uppercase;
          }
          .value {
            font-size: 13px;
            color: #fff;
            &.online {
              color: #00f7ff;
            }
            &.danger {
              color: #ff4b4b;
              font-weight: bold;
            }
          }
        }
      }
      .actions {
        display: flex;
        gap: 10px;
        .btn {
          flex: 1;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;
          &:hover {
            background: rgba(255, 255, 255, 0.15);
          }
          &.primary {
            background: #0073ff;
            border-color: #00f7ff;
            &:hover {
              background: #0056b3;
              box-shadow: 0 0 15px rgba(0, 115, 255, 0.5);
            }
          }
        }
      }
    }
  }
}

@keyframes scan {
  from {
    top: 0;
  }
  to {
    top: 100%;
  }
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
