<template>
  <div class="monitor-system">
    <el-aside class="tree-panel" :width="asideWidth + 'px'">
      <div class="panel-header">
        <h3 v-show="showPanel">Device Location</h3>
        <el-icon @click="togglePanel">
          <Menu />
        </el-icon>
      </div>
      <div class="resize-handle" @mousedown="startResize"></div>

      <div class="tree-content" v-show="showPanel">
        <div class="tree-search">
          <el-input
            v-model="treeFilterText"
            placeholder="search"
            clearable
            prefix-icon="el-icon-search"
            @input="filterTree"
          />
        </div>

        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="treeProps"
          :filter-node-method="filterNode"
          node-key="id"
          highlight-current
          :expand-on-click-node="false"
          :default-expanded-keys="expandedKeys"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="tree-node">
              <el-icon v-if="data.type === 'device'" class="tree-icon !mr-5px">
                <VideoCamera />
              </el-icon>
              <el-icon v-else class="tree-icon !mr-5px">
                <OfficeBuilding />
              </el-icon>
              <span>{{ node.label }}({{ data.cameraCount }})</span>
              <span
                v-if="data.type === 'camera'"
                class="status-indicator"
                :class="getStatusClass(data.status)"
              ></span>
            </span>
          </template>
        </el-tree>
      </div>
    </el-aside>

    <el-main class="main-content">
      <div class="control-bar">
        <div class="search-container">
          <el-form :model="searchForm" inline size="default">
            <el-form-item>
              <el-switch
                v-model="isMapView"
                :active-icon="Grid"
                :inactive-icon="MapLocation"
                inline-prompt
              />
            </el-form-item>
            <el-form-item label="Device Name">
              <el-input
                v-model="searchForm.name"
                placeholder="Please enter device name"
                clearable
              />
            </el-form-item>
            <el-form-item label="Device IP">
              <el-input v-model="searchForm.ip" placeholder="Please enter device IP" clearable />
            </el-form-item>
            <el-form-item label="Running Status">
              <el-select
                v-model="searchForm.runningStatus"
                placeholder="Select running status"
                style="min-width: 200px"
                clearable
              >
                <el-option :key="1" :value="1" label="Online" />
                <el-option :key="0" :value="0" label="Offline" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button class="vms-main-button" @click="handleSearch">Search</el-button>
              <el-button class="vms-reset-button" @click="resetSearch">Reset</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <div v-if="!isMapView">
        <RecycleScroller
          class="image-wall"
          :items="rowItems"
          :item-size="300"
          key-filed="id"
          :height="600"
        >
          <template #default="{ item: row, index: id }">
            <p style="display: none">{{ id }}</p>
            <el-row :gutter="20">
              <el-col
                v-for="camera in row.items"
                :key="camera.id"
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
                :xl="4"
              >
                <el-card class="camera-card" shadow="hover" :body-style="{ padding: '0px' }">
                  <div class="image-container" @click="openVideoDialog(camera)">
                    <el-image
                      :src="getImageUrl(camera.cameraIp)"
                      fit="cover"
                      class="preview-image"
                      lazy
                    >
                      <template #placeholder>
                        <div class="image-skeleton">
                          <el-icon :size="40">
                            <Picture />
                          </el-icon>
                          <p>loading...</p>
                        </div>
                      </template>
                      <template #error>
                        <div class="image-error">
                          <el-icon :size="40">
                            <Warning />
                          </el-icon>
                          <p></p>
                        </div>
                      </template>
                    </el-image>
                    <div class="hover-overlay">
                      <el-icon :size="40">
                        <VideoPlay />
                      </el-icon>
                    </div>
                  </div>

                  <div class="card-footer">
                    <div class="camera-info">
                      <h4>{{ camera.cameraName }}</h4>
                      <div class="meta-info">
                        <el-tooltip content="IP">
                          <el-tag size="small">{{ camera.cameraIp }}</el-tag>
                        </el-tooltip>
                        <el-tooltip content="Status">
                          <el-tag
                            size="small"
                            :type="camera.runningStatus === true ? 'success' : 'danger'"
                          >
                            {{ camera.runningStatus ? 'Online' : 'Offline' }}
                          </el-tag>
                        </el-tooltip>
                        <el-tooltip :content="camera.areaName" placement="bottom" effect="dark">
                          <el-tag size="small" class="ellipsis" type="info">
                            {{ camera.areaName }}
                          </el-tag>
                        </el-tooltip>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </template>
        </RecycleScroller>
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
      <div v-else>
        <div id="map" class="map-view"></div>
        <div ref="popupRef" v-show="popupVisible" class="ol-popup">
          <CameraPopup :camera="popupCamera" @play="popPlay" />
        </div>
      </div>

      <VideoPlayerDialog v-model="videoDialogVisible" :camera="currentCamera" />
    </el-main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Menu,
  VideoCamera,
  OfficeBuilding,
  Search,
  VideoPlay,
  Picture,
  Warning,
  MapLocation,
  Grid
} from '@element-plus/icons-vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import { XYZ } from 'ol/source'
import View from 'ol/View'
import { fromLonLat } from 'ol/proj'
import { Feature, Overlay } from 'ol'
import { Icon, Style } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Point } from 'ol/geom'
import { DragPan, MouseWheelZoom } from 'ol/interaction'
import CameraPopup from '@/components/CameraPopup.vue'
import VideoPlayerDialog from '@/components/Device/VideoPlayerDialog.vue'
import { getCameras, getAreas } from '@/api/device'
import { config } from '@/utils/runtimeConfig'

const isMapView = ref(false)
const popupVisible = ref(false)
const popupCamera = ref({})

const pagination = ref({
  current: 1,
  size: 20,
  total: 0
})

const loading = ref(false)
const treeData = ref([])
const treeRef = ref(null)
const treeProps = {
  children: 'children',
  label: 'name'
}

const treeFilterText = ref('')
const currentTreeType = ref('dept')
const currentTreeNodeId = ref(null)

function filterTree() {
  treeRef.value?.filter(treeFilterText.value)
}

onMounted(async () => {
  await fetchTreeData('area')
  await fetchTableData()
})

function handleSearch() {
  pagination.value.current = 1
  fetchTableData()
  if (map.value) {
    map.value.setTarget(null)
    initMap(cameras.value[0]?.longitude, cameras.value[0]?.latitude)
  }
}

function resetSearch() {
  searchForm.value = {
    name: '',
    ip: '',
    type: [],
    status: '',
    runningStatus: undefined
  }
  pagination.value.current = 1
  fetchTableData()
  if (map.value) {
    map.value.setTarget(null)
    initMap(cameras.value[0]?.longitude, cameras.value[0]?.latitude)
  }
}

function handleSizeChange(size) {
  pagination.value.size = size
  fetchTableData()
}

function handleCurrentChange(page) {
  pagination.value.current = page
  fetchTableData()
}

async function fetchTreeData(type) {
  try {
    let areaList = await getAreas()
    treeData.value = buildAreaTree(areaList)
    nextTick(() => {
      if (treeData.value.length > 0) {
        const firstNode = treeData.value[0]
        currentTreeNodeId.value = firstNode.id
        treeRef.value.setCurrentKey(firstNode.id)
      }
    })
  } catch (error) {
    ElMessage.error('Failed to load tree data')
  } finally {
    loading.value = false
  }
}

const buildAreaTree = (regions, parentId = null) => {
  let result = regions
    .filter((region) => {
      const regionParentId = region.parentId === null ? null : region.parentId
      if (parentId === null) {
        return regionParentId === null
      } else {
        return regionParentId === parentId
      }
    })
    .map((region) => {
      const children = buildAreaTree(regions, region.id)
      return {
        ...region,
        children: children.length > 0 ? children : undefined
      }
    })
  return result
}

const expandedKeys = computed(() => {
  return treeData.value.map((node) => node.id)
})

const searchForm = ref({
  name: '',
  ip: '',
  type: [],
  status: '',
  runningStatus: undefined
})

async function fetchTableData() {
  loading.value = true
  try {
    const params = {
      page: pagination.value.current,
      size: pagination.value.size,
      name: searchForm.value.name,
      ip: searchForm.value.ip,
      type: searchForm.value.type.join(','),
      status: searchForm.value.status,
      nodeType: currentTreeType.value,
      nodeId: currentTreeNodeId.value,
      runningStatus: searchForm.value.runningStatus
    }
    const res = await getCameras(params)
    cameras.value = res.list
    pagination.value.total = res.total
  } catch (error) {
    ElMessage.error('Failed to load table data')
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  observer.value?.disconnect()
  document.body.removeEventListener('click', handlePopClick)
})

const observer = ref(null)
const cameras = ref([])

const showPanel = ref(true)
const asideWidth = ref(280)
let isResizing = false

const startResize = (e) => {
  isResizing = true
  const startX = e.clientX
  const startWidth = asideWidth.value

  const doResize = (e) => {
    if (isResizing) {
      const newWidth = startWidth + (e.clientX - startX)
      asideWidth.value = Math.max(240, Math.min(newWidth, 400))
    }
  }

  const stopResize = () => {
    isResizing = false
    document.removeEventListener('mousemove', doResize)
    document.removeEventListener('mouseup', stopResize)
  }

  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
}

const togglePanel = () => {
  showPanel.value = !showPanel.value
  if (showPanel.value) asideWidth.value = 280
  else asideWidth.value = 36
}

const deviceTree = computed(() => {
  const areas = [...new Set(cameras.value.map((c) => c.area))]
  return [
    {
      id: 'all',
      label: `ALL (${cameras.value.length})`,
      name: 'ALL',
      children: areas.map((area) => {
        const cameraInArea = cameras.value.filter((c) => c.area === area)
        return {
          id: `area-${area}`,
          label: `${area} (${cameraInArea.length})`,
          name: area,
          children: cameras.value
            .filter((c) => c.area === area)
            .map((c) => ({
              id: c.id,
              label: c.name,
              lon: c.lon,
              lat: c.lat,
              isCamera: true
            }))
        }
      })
    }
  ]
})

const selectedArea = ref(null)

function filterNode(value, data) {
  if (!value) return true
  return data.name.toLowerCase().includes(value.toLowerCase())
}

const handleNodeClick = async (node) => {
  currentTreeNodeId.value = node.id
  await fetchTableData()
  if (map.value) {
    map.value.setTarget(null)
    initMap(cameras.value[0]?.longitude, cameras.value[0]?.latitude)
  }
}

const getImageUrl = (path) => {
  const url = `${config.VITE_CAPTURE_URL || ''}/img/${path}.png`
  return url
}

const filteredCameras = computed(() => {
  let result = cameras.value
  return result.filter(
    (c) =>
      c.cameraName.toLowerCase().includes(searchForm.value.name.toLowerCase()) ||
      c.cameraIp.includes(searchForm.value.ip)
  )
})

const rowItems = computed(() => {
  const rows = []
  const perRow = 6
  for (let i = 0; i < filteredCameras.value.length; i += perRow) {
    rows.push(filteredCameras.value.slice(i, i + perRow))
  }
  return rows.map((row, idx) => ({ items: row, id: idx }))
})

const getCamera = (id) => {
  return cameras.value.find((c) => c.id === id)
}

const map = ref(null)
const popupRef = ref(null)

onMounted(() => {
  watch(isMapView, (newVal) => {
    if (newVal === true) {
      nextTick(() => {
        selectedArea.value = null
        if (cameras.value.length > 0 && cameras.value[0].longitude) {
          initMap(cameras.value[0].longitude, cameras.value[0].latitude)
        } else {
          initMap(58.290297, 23.6010676)
        }
      })
    }
  })
  document.body.addEventListener('click', handlePopClick)
})

const handlePopClick = (event) => {
  const target = event.target
  let type = target.dataset.type
  if (type === 'play') {
    const name = target.dataset.name
    openVideoDialogById(name)
  }
}

const initMap = (lon, lat) => {
  const url = `${config.VITE_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}`

  map.value = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: url
        })
      })
    ],
    view: new View({
      center: fromLonLat([lon, lat]),
      zoom: 17,
      minZoom: 1,
      maxZoom: 19
    })
  })

  const cameraStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: '/vms/images/point.svg',
      scale: 1.2
    })
  })

  const features = filteredCameras.value.map((camera) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat([camera.longitude, camera.latitude])),
      camera: camera
    })
    feature.setStyle(cameraStyle)
    return feature
  })

  const vectorSource = new VectorSource({
    features: features
  })

  const vectorLayer = new VectorLayer({
    source: vectorSource
  })
  map.value.addLayer(vectorLayer)

  const popup = new Overlay({
    element: popupRef.value,
    positioning: 'bottom-center',
    stopEvent: false
  })
  map.value.addOverlay(popup)

  map.value.on('pointermove', (evt) => {
    if (map.value.hasFeatureAtPixel(evt.pixel)) {
      map.value.getTargetElement().style.cursor = 'pointer'
    } else {
      map.value.getTargetElement().style.cursor = 'default'
    }
  })

  map.value.on('click', (evt) => {
    const feature = map.value.forEachFeatureAtPixel(evt.pixel, function (feature) {
      return feature
    })
    if (feature) {
      const coordinates = feature.getGeometry().getCoordinates()
      popup.setPosition(coordinates)

      const camera = feature.get('camera')
      popupCamera.value = camera
      popupVisible.value = true
    } else {
      popupVisible.value = false
    }
  })
}

const videoDialogVisible = ref(false)
const currentCamera = ref(null)

const openVideoDialog = (camera) => {
  if (!camera.runningStatus) {
    ElMessage.warning('The device is already offline')
    return
  }
  currentCamera.value = camera
  videoDialogVisible.value = true
}

const openVideoDialogById = (id) => {
  const camera = getCamera(id)
  if (camera) {
    openVideoDialog(camera)
  }
}

const popPlay = (camera) => {
  openVideoDialog(camera)
}

const getStatusClass = (status) => {
  return status === 'online' ? 'status-online' : 'status-offline'
}
</script>

<style scoped lang="scss">
.search-container {
  padding-top: 2px;
  padding-left: 10px;
  display: flex;
  align-items: center;
}

.view-switch {
  display: flex;
  align-items: center;
}

:deep(.popup-container) {
  font-family: 'Arial', sans-serif;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  min-width: 240px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.popup-table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

:deep(.popup-th) {
  text-align: left;
  padding: 6px 8px;
  background-color: #f5f7fa;
  color: #333;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
  width: 100px;
}

:deep(.popup-td) {
  padding: 6px 8px;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

:deep(.popup-actions) {
  text-align: right;
}

:deep(.popup-play-btn) {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.map-view {
  height: calc(100vh - 100px);
  width: 100%;
}

.maptool {
  position: absolute;
  background-color: #fff;
  z-index: 999;
  right: 12px;
  width: 20px;
  height: 20px;
  border-radius: 0 0 2px 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  color: #666666;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

.maptool:hover {
  border: 1px solid #666666;
}

.earthicon {
  top: 58px;
  right: 13px;
}

.monitor-system {
  display: flex;
  height: 91vh;
  overflow: hidden;
  padding: 5px;

  .tree-panel {
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: relative;
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.05);
    transition: width 0.2s ease;
    overflow: hidden;

    .panel-header {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #eee;

      h3 {
        margin: 0;
        font-size: 16px;
      }

      .el-icon {
        cursor: pointer;
        border-radius: 4px;

        &:hover {
          background: #f5f7fa;
        }
      }
    }

    .tree-content {
      flex: 1;
      overflow-y: auto;
    }

    .resize-handle {
      position: absolute;
      right: -4px;
      top: 0;
      bottom: 0;
      width: 8px;
      cursor: col-resize;
      background: linear-gradient(90deg, rgba(99, 123, 255, 0) 0%, rgba(99, 123, 255, 0.1) 50%, rgba(99, 123, 255, 0) 100%);
      opacity: 0;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }
    }

    :deep(.el-tree) {
      overflow-y: auto;
      background: transparent;
      padding: 8px 0;

      .custom-tree-node {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;

        .el-icon {
          color: #637bff;
        }

        .label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .el-tree-node__content {
        height: 40px;
        margin: 4px 8px;
        border-radius: 8px;

        &:hover {
          background-color: rgba(99, 123, 255, 0.05);
        }

        &.is-current {
          background: linear-gradient(90deg, rgba(99, 123, 255, 0.1), transparent);
          border-left: 3px solid #637bff;
        }
      }
    }
  }

  .main-content {
    padding: 0;
    overflow: hidden;

    .control-bar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      gap: 16px;
      padding: 3px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    }

    .pagination-container {
      position: sticky;
      bottom: 0;
      z-index: 10;
      display: flex;
      gap: 16px;
      padding: 1px 12px 0px 6px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      float: right;
    }

    .image-wall {
      overflow-y: auto;
      height: 78vh;
      padding: 16px;

      .camera-card {
        margin-bottom: 20px;
        transition: transform 0.3s;

        &:hover {
          transform: translateY(-5px);
        }

        .image-container {
          position: relative;
          height: 200px;
          cursor: pointer;

          .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .hover-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;

            .el-icon {
              color: white;
            }
          }

          &:hover .hover-overlay {
            opacity: 1;
          }

          .image-skeleton,
          .image-error {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f5f7fa;
            color: #909399;

            p {
              margin: 8px 0 0;
              font-size: 12px;
            }
          }
        }

        .card-footer {
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .camera-info {
            h4 {
              margin: 0 0 8px;
              font-size: 14px;
            }

            .meta-info {
              display: flex;
              gap: 8px;
            }
          }

          .el-dropdown {
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;

            &:hover {
              background: #f5f7fa;
            }
          }
        }
      }
    }

    .video-container {
      position: relative;
      height: 80vh;
      background: black;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.tree-content::-webkit-scrollbar {
  width: 5px;
}

.tree-content::-webkit-scrollbar-track {
  background: rgba(228, 232, 238, 0.5);
  border-radius: 10px;
}

.tree-content::-webkit-scrollbar-thumb {
  background: #ded9d5;
  border-radius: 10px;
}

.tree-content::-webkit-scrollbar-thumb:hover {
  background: rgb(100, 100, 100);
}

.tree-content::-webkit-scrollbar-thumb:active {
  background: rgb(68, 68, 68);
}

.image-wall::-webkit-scrollbar {
  width: 5px;
}

.image-wall::-webkit-scrollbar-track {
  background: rgba(228, 232, 238, 0.5);
  border-radius: 10px;
}

.image-wall::-webkit-scrollbar-thumb {
  background: #ded9d5;
  border-radius: 10px;
}

.image-wall::-webkit-scrollbar-thumb:hover {
  background: rgb(100, 100, 100);
}

.image-wall::-webkit-scrollbar-thumb:active {
  background: rgb(68, 68, 68);
}

.ellipsis {
  display: inline-block;
  max-width: 90px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 4px 6px;
}
</style>

<style>
.ol-popup {
  position: absolute;
  z-index: 1000;
}
</style>
