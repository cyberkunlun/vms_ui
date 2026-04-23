<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, defineComponent, h, type PropType } from 'vue'

interface TreeNode {
  id: string
  name: string
  type: 'region' | 'camera'
  children?: TreeNode[]
  isLeaf: boolean
  loaded: boolean
  loading: boolean
  hasChildren: boolean
  cameraStatus?: 'online' | 'offline'
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

const fetchTopLevelRegions = async (): Promise<TreeNode[]> => {
  await delay(200)
  const areas = ['东区航站楼', '西区航站楼', '南区到达层', '北区出发层', '中央大厅', '地下停车场', 'VIP贵宾区']
  return areas.map((name, i) => ({
    id: `region_${i}`,
    name,
    type: 'region',
    isLeaf: false,
    loaded: false,
    loading: false,
    hasChildren: true,
  }))
}

const fetchRegionCameras = async (regionId: string, regionName: string): Promise<TreeNode[]> => {
  await delay(150 + Math.random() * 200)
  const cameraCount = Math.floor(Math.random() * 25) + 8
  const cameras: TreeNode[] = []
  for (let i = 0; i < cameraCount; i++) {
    cameras.push({
      id: `${regionId}_cam_${i}`,
      name: `CAM-${regionName.slice(0, 2)}-${String(i + 1).padStart(3, '0')}`,
      type: 'camera',
      isLeaf: true,
      loaded: true,
      loading: false,
      hasChildren: false,
      cameraStatus: Math.random() > 0.08 ? 'online' : 'offline',
    })
  }
  return cameras
}

const TreeItem = defineComponent({
  name: 'TreeItem',
  props: {
    node: Object as PropType<TreeNode>,
    level: Number,
    selectedId: String,
  },
  emits: ['toggle', 'select'],
  setup(props, { emit }) {
    const expanded = ref(false)

    const toggleExpand = async () => {
      if (props.node!.type === 'region') {
        if (!props.node!.loaded && props.node!.hasChildren) {
          await emit('toggle', props.node)
        }
        expanded.value = !expanded.value
      }
    }

    const handleClick = () => {
      if (props.node!.type === 'region') toggleExpand()
    }

    const handleSelect = () => {
      if (props.node!.type === 'camera') emit('select', props.node)
    }

    const chevron = () => expanded.value ? '▾' : '▸'

    return () => {
      const indent = { paddingLeft: `${(props.level || 0) * 16 + 8}px` }
      const isSelected = props.selectedId === props.node!.id && props.node!.type === 'camera'
      const isRegion = props.node!.type === 'region'
      const isOnline = props.node!.cameraStatus === 'online'

      return h('div', { class: 'tree-item' }, [
        h('div', {
          class: ['tree-row', { selected: isSelected, 'is-region': isRegion }],
          style: indent,
          onClick: handleClick,
          onDblclick: handleSelect,
        }, [
          isRegion
            ? h('span', { class: 'chevron' }, chevron())
            : h('span', { class: ['cam-dot', isOnline ? 'on' : 'off'] }),
          h('span', { class: 'tree-name' }, props.node!.name),
          isRegion && props.node!.loading && h('span', { class: 'spin-ring' }),
          !isRegion && h('span', { class: ['cam-status', isOnline ? 'on' : 'off'] }, isOnline ? 'LIVE' : 'LOST'),
        ]),
        expanded.value && props.node!.children && h('div', { class: 'tree-children' },
          props.node!.children.map(child => h(TreeItem, {
            node: child,
            level: (props.level || 0) + 1,
            selectedId: props.selectedId,
            onToggle: (n: TreeNode) => emit('toggle', n),
            onSelect: (n: TreeNode) => emit('select', n),
          }))
        ),
      ])
    }
  },
})

const searchKeyword = ref('')
const startTime = ref('2026-04-16 00:00:00')
const endTime = ref('2026-04-16 23:59:59')
const selectedDevice = ref<{ id: string; name: string; status?: string } | null>(null)
const selectedCameraNodeId = ref<string | null>(null)
const topLevelNodes = ref<TreeNode[]>([])
const isPlaying = ref(false)
const currentTime = ref('15:27:14')
const playbackSpeed = ref(1.0)
const speeds = [0.5, 1.0, 2.0, 4.0]

const onlineCount = computed(() => {
  let c = 0
  const t = (ns: TreeNode[]) => { for (const n of ns) { if (n.type==='camera'&&n.cameraStatus==='online') c++; if(n.children)t(n.children) } }
  t(topLevelNodes.value); return c
})
const totalDeviceCount = computed(() => {
  let c = 0
  const t = (ns: TreeNode[]) => { for (const n of ns) { if (n.type==='camera') c++; if(n.children)t(n.children) } }
  t(topLevelNodes.value); return c
})

const toggleNode = async (node: TreeNode) => {
  if (node.type !== 'region') return
  if (!node.loaded && node.hasChildren) {
    node.loading = true
    node.children = await fetchRegionCameras(node.id, node.name)
    node.loaded = true
    node.loading = false
  }
}

let expandTimer: ReturnType<typeof setTimeout> | null = null
const expandAll = async () => {
  const rec = async (nodes: TreeNode[]) => {
    for (const n of nodes) {
      if (n.type === 'region') {
        if (!n.loaded && n.hasChildren) await toggleNode(n)
        if (n.children) await rec(n.children)
      }
    }
  }
  await rec(topLevelNodes.value)
  await nextTick()
}

const collapseAll = () => initTree()

watch(searchKeyword, (v) => {
  if (expandTimer) clearTimeout(expandTimer)
  if (v?.trim()) { expandTimer = setTimeout(() => expandAll(), 200) }
  else collapseAll()
})

const filteredTree = computed(() => {
  if (!searchKeyword.value) return topLevelNodes.value
  const kw = searchKeyword.value.toLowerCase()
  const filter = (node: TreeNode): TreeNode | null => {
    const match = node.name.toLowerCase().includes(kw)
    const filteredChildren = node.children?.map(c => filter(c)).filter((c): c is TreeNode => c !== null) ?? []
    if (match || filteredChildren.length) return { ...node, children: filteredChildren.length ? filteredChildren : node.children }
    return null
  }
  return topLevelNodes.value.map(n => filter(n)).filter((n): n is TreeNode => n !== null)
})

const onSelectCamera = (n: TreeNode) => {
  if (n.type !== 'camera') return
  selectedCameraNodeId.value = n.id
  selectedDevice.value = { id: n.id, name: n.name, status: n.cameraStatus }
}

const initTree = async () => {
  topLevelNodes.value = await fetchTopLevelRegions()
  selectedCameraNodeId.value = null
  selectedDevice.value = null
}

const togglePlay = () => { isPlaying.value = !isPlaying.value }
const cycleSpeed = () => {
  const i = speeds.indexOf(playbackSpeed.value)
  playbackSpeed.value = speeds[(i + 1) % speeds.length]
}

onMounted(() => initTree())

const timelineHours = Array.from({ length: 25 }, (_, i) => i.toString().padStart(2, '0'))
const nowPercent = 35
</script>

<template>
  <div class="vpr-root">
    <!-- scanline overlay -->
    <div class="scanlines" aria-hidden="true"></div>
    <!-- corner brackets -->
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>

    <!-- ══ LEFT PANEL ══ -->
    <aside class="panel-left">
      <header class="panel-header">
        <div class="panel-title-row">
          <span class="title-icon">◈</span>
          <span class="panel-title">DEVICE REGISTRY</span>
          <span class="blink-dot"></span>
        </div>
        <div class="stat-chips">
          <div class="chip online">
            <span class="chip-val">{{ onlineCount }}</span>
            <span class="chip-label">ONLINE</span>
          </div>
          <div class="chip total">
            <span class="chip-val">{{ totalDeviceCount }}</span>
            <span class="chip-label">TOTAL</span>
          </div>
        </div>
      </header>

      <div class="search-wrap">
        <span class="s-icon">⌕</span>
        <input class="search-input" type="text" v-model="searchKeyword" placeholder="SEARCH NODES..." />
        <span v-if="searchKeyword" class="s-clear" @click="searchKeyword = ''">✕</span>
      </div>

      <div class="tree-toolbar">
        <button class="tb-btn" @click="expandAll">EXPAND ALL</button>
        <button class="tb-btn" @click="collapseAll">COLLAPSE</button>
      </div>

      <div class="tree-body">
        <div v-if="!topLevelNodes.length" class="tree-loading">
          <span class="ring-loader"></span>
          <span>INITIALIZING…</span>
        </div>
        <TreeItem
          v-for="node in filteredTree"
          :key="node.id"
          :node="node"
          :level="0"
          :selected-id="selectedCameraNodeId"
          @toggle="toggleNode"
          @select="onSelectCamera"
        />
      </div>

      <footer class="panel-footer">
        <span class="footer-id">SYS: SURV-NVR-001</span>
        <span class="footer-time">{{ new Date().toLocaleTimeString('en-GB') }}</span>
      </footer>
    </aside>

    <!-- ══ MAIN AREA ══ -->
    <main class="panel-main">

      <!-- Query bar -->
      <section class="query-rail">
        <div class="rail-section">
          <span class="rail-label">▶ CHANNEL</span>
          <div class="selected-device" :class="{ 'has-device': selectedDevice }">
            <span class="dev-id">{{ selectedDevice?.id ?? '—' }}</span>
            <span class="dev-name">{{ selectedDevice?.name ?? 'NO DEVICE SELECTED' }}</span>
            <span v-if="selectedDevice?.status" :class="['dev-badge', selectedDevice.status === 'online' ? 'on' : 'off']">
              {{ selectedDevice.status === 'online' ? '● LIVE' : '○ LOST' }}
            </span>
          </div>
        </div>
        <div class="rail-divider"></div>
        <div class="rail-section">
          <span class="rail-label">▶ TIMESPAN</span>
          <div class="time-inputs">
            <input class="ti" type="text" v-model="startTime" />
            <span class="ti-sep">⟶</span>
            <input class="ti" type="text" v-model="endTime" />
          </div>
        </div>
        <div class="rail-divider"></div>
        <div class="rail-actions">
          <button class="action-btn primary" @click="() => {}">RETRIEVE</button>
          <button class="action-btn ghost" @click="startTime = '2026-04-16 00:00:00'; endTime = '2026-04-16 23:59:59'">RESET</button>
        </div>
      </section>

      <!-- Video player -->
      <section class="player-section">
        <!-- HUD overlays -->
        <div class="hud-tl">
          <span class="hud-tag">REC ●</span>
          <span class="hud-cam">{{ selectedDevice?.name ?? 'NO SIGNAL' }}</span>
        </div>
        <div class="hud-tr">
          <span class="hud-tag">CH-{{ selectedDevice ? selectedDevice.id.slice(-2).toUpperCase() : '??'}}</span>
          <span class="hud-date">2026-04-16</span>
        </div>
        <div class="hud-bl">
          <span class="hud-res">4K UHD</span>
          <span class="hud-codec">H.265</span>
          <span class="hud-bitrate">12.4 Mbps</span>
        </div>
        <div class="hud-br">
          <span class="hud-time">{{ currentTime }}</span>
        </div>

        <!-- Corner brackets on player -->
        <div class="p-corner ptl"></div>
        <div class="p-corner ptr"></div>
        <div class="p-corner pbl"></div>
        <div class="p-corner pbr"></div>

        <!-- Video mock -->
        <img
          src="https://images.unsplash.com/photo-1557597774-9d2739f85a76?q=80&w=1400&auto=format&fit=crop"
          class="vid-img"
          :class="{ grayscale: !selectedDevice }"
        />
        <div class="vid-overlay"></div>

        <!-- No signal state -->
        <div v-if="!selectedDevice" class="no-signal">
          <div class="ns-icon">⬛</div>
          <div class="ns-text">NO SIGNAL</div>
          <div class="ns-sub">SELECT DEVICE FROM REGISTRY</div>
        </div>

        <!-- Playback controls -->
        <div class="pb-controls">
          <button class="pb-btn" @click="() => {}">⏮</button>
          <button class="pb-btn" @click="() => {}">⏪</button>
          <button class="pb-btn pb-play" @click="togglePlay">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          <button class="pb-btn" @click="() => {}">⏩</button>
          <button class="pb-btn" @click="() => {}">⏭</button>
          <div class="pb-divider"></div>
          <button class="pb-speed" @click="cycleSpeed">{{ playbackSpeed }}×</button>
          <div class="pb-divider"></div>
          <button class="pb-btn sm">⊞</button>
          <button class="pb-btn sm">🔈</button>
          <button class="pb-btn sm">⛶</button>
        </div>
      </section>

      <!-- Timeline -->
      <section class="timeline-section">
        <div class="tl-header">
          <span class="tl-label">◈ TIMELINE</span>
          <div class="tl-legend">
            <span class="leg-item recorded">● RECORDED</span>
            <span class="leg-item motion">● MOTION EVENT</span>
            <span class="leg-item alarm">● ALARM</span>
          </div>
        </div>
        <div class="tl-ruler">
          <!-- data blocks -->
          <div class="tl-block recorded" style="left:4%;width:32%"></div>
          <div class="tl-block motion" style="left:14%;width:6%"></div>
          <div class="tl-block alarm" style="left:22%;width:2%"></div>
          <div class="tl-block recorded" style="left:52%;width:26%"></div>
          <div class="tl-block motion" style="left:64%;width:4%"></div>
          <!-- playhead -->
          <div class="tl-head" :style="`left:${nowPercent}%`">
            <div class="tl-head-label">{{ currentTime }}</div>
          </div>
          <!-- hour marks -->
          <div
            v-for="h in timelineHours"
            :key="h"
            class="tl-hour"
            :style="`left:${(parseInt(h)/24)*100}%`"
          >
            <div class="tl-tick"></div>
            <span class="tl-hLabel">{{ h }}</span>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

$c-bg: #030507;
$c-panel: #060b10;
$c-border: #1a2a3a;
$c-accent: #00e0ff;
$c-accent2: #7a5cff;
$c-red: #ff3333;
$c-amber: #ffb800;
$c-text: #c8e0d0;
$c-dim: #4a6a56;
$font-mono: 'Share Tech Mono', monospace;
$font-ui: 'Rajdhani', sans-serif;

* { box-sizing: border-box; margin: 0; padding: 0; }

.vpr-root {
  position: relative;
  height: 86vh;
  display: flex;
  background: $c-bg;
  color: $c-text;
  font-family: $font-ui;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0, 120, 255, 0.05) 0%, transparent 70%),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 3px,
        rgba(0, 180, 255, 0.008) 3px,
        rgba(0, 180, 255, 0.008) 4px
      );
    pointer-events: none;
    z-index: 0;
  }
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(0,0,0,0.18) 2px,
    rgba(0,0,0,0.18) 4px
  );
  pointer-events: none;
  z-index: 100;
}

.corner {
  position: absolute;
  width: 24px;
  height: 24px;
  z-index: 200;
  &.tl { top: 8px; left: 8px; border-top: 2px solid $c-accent; border-left: 2px solid $c-accent; }
  &.tr { top: 8px; right: 8px; border-top: 2px solid $c-accent; border-right: 2px solid $c-accent; }
  &.bl { bottom: 8px; left: 8px; border-bottom: 2px solid $c-accent; border-left: 2px solid $c-accent; }
  &.br { bottom: 8px; right: 8px; border-bottom: 2px solid $c-accent; border-right: 2px solid $c-accent; }
}

// ══ LEFT PANEL ══
.panel-left {
  position: relative;
  z-index: 10;
  width: 280px;
  flex-shrink: 0;
  background: $c-panel;
  border-right: 1px solid $c-border;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0; right: 0; bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, transparent, $c-accent 30%, $c-accent 70%, transparent);
    opacity: 0.4;
  }
}

.panel-header {
  padding: 16px 14px 12px;
  border-bottom: 1px solid $c-border;
}

.panel-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .title-icon {
    color: $c-accent;
    font-size: 14px;
  }
  .panel-title {
    font-family: $font-mono;
    font-size: 11px;
    letter-spacing: 2px;
    color: $c-accent;
  }
  .blink-dot {
    margin-left: auto;
    width: 6px;
    height: 6px;
    background: $c-accent;
    border-radius: 50%;
    box-shadow: 0 0 6px $c-accent;
    animation: blink 1.2s step-end infinite;
  }
}

.stat-chips {
  display: flex;
  gap: 8px;
  .chip {
    flex: 1;
    padding: 6px 10px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 1px;
    border: 1px solid;
    .chip-val {
      font-family: $font-mono;
      font-size: 18px;
      font-weight: 700;
      line-height: 1;
    }
    .chip-label {
      font-size: 9px;
      letter-spacing: 1.5px;
      font-weight: 600;
    }
    &.online {
      border-color: rgba($c-accent, 0.4);
      background: rgba($c-accent, 0.05);
      .chip-val, .chip-label { color: $c-accent; }
    }
    &.total {
      border-color: rgba($c-accent2, 0.3);
      background: rgba($c-accent2, 0.04);
      .chip-val, .chip-label { color: $c-accent2; }
    }
  }
}

.search-wrap {
  position: relative;
  margin: 10px 12px 6px;
  .s-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: $c-dim;
    font-family: $font-mono;
  }
  .search-input {
    width: 100%;
    background: rgba(0,0,0,0.5);
    border: 1px solid $c-border;
    border-radius: 3px;
    padding: 7px 30px 7px 30px;
    color: $c-text;
    font-family: $font-mono;
    font-size: 11px;
    letter-spacing: 1px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    &::placeholder { color: $c-dim; }
    &:focus {
      border-color: rgba($c-accent, 0.6);
      box-shadow: 0 0 0 1px rgba($c-accent, 0.15), inset 0 0 12px rgba($c-accent, 0.03);
    }
  }
  .s-clear {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    color: $c-dim;
    cursor: pointer;
    font-family: $font-mono;
    &:hover { color: $c-accent; }
  }
}

.tree-toolbar {
  display: flex;
  gap: 6px;
  padding: 0 12px 8px;
  .tb-btn {
    flex: 1;
    background: transparent;
    border: 1px solid $c-border;
    border-radius: 3px;
    color: $c-dim;
    font-family: $font-mono;
    font-size: 9px;
    letter-spacing: 1px;
    padding: 5px 0;
    cursor: pointer;
    transition: all 0.15s;
    &:hover {
      border-color: rgba($c-accent, 0.5);
      color: $c-accent;
      background: rgba($c-accent, 0.04);
    }
  }
}

.tree-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0 8px;
  scrollbar-width: thin;
  scrollbar-color: $c-border $c-panel;
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-track { background: $c-panel; }
  &::-webkit-scrollbar-thumb { background: $c-border; }
}

.tree-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 20px;
  font-family: $font-mono;
  font-size: 11px;
  color: $c-dim;
  letter-spacing: 1px;
}

.ring-loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 1.5px solid $c-dim;
  border-top-color: $c-accent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* Tree nodes */
.tree-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  cursor: pointer;
  transition: background 0.12s;
  position: relative;
  border-left: 2px solid transparent;

  &:hover { background: rgba($c-accent, 0.04); }
  &.is-region {
    .tree-name {
      font-family: $font-ui;
      font-weight: 600;
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: $c-accent2;
    }
  }
  &.selected {
    background: rgba($c-accent, 0.08);
    border-left-color: $c-accent;
    .tree-name { color: $c-accent; }
  }
}

.chevron {
  font-size: 12px;
  color: $c-accent;
  width: 12px;
  text-align: center;
  transition: transform 0.15s;
}

.cam-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  &.on { background: $c-accent; box-shadow: 0 0 4px $c-accent; animation: pulse-dot 2s infinite; }
  &.off { background: #3a3a3a; border: 1px solid #555; }
}

.tree-name {
  font-family: $font-mono;
  font-size: 11px;
  color: #8aaa96;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.5px;
}

.cam-status {
  font-family: $font-mono;
  font-size: 9px;
  letter-spacing: 1px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 2px;
  &.on {
    color: $c-accent;
    background: rgba($c-accent, 0.1);
    border: 1px solid rgba($c-accent, 0.3);
  }
  &.off {
    color: #555;
    background: rgba(0,0,0,0.3);
    border: 1px solid #333;
  }
}

.spin-ring {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1px solid $c-dim;
  border-top-color: $c-accent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}

.tree-children {
  border-left: 1px solid rgba($c-accent, 0.12);
  margin-left: 16px;
  animation: slide-in 0.15s ease;
}

.panel-footer {
  padding: 8px 14px;
  border-top: 1px solid $c-border;
  display: flex;
  justify-content: space-between;
  font-family: $font-mono;
  font-size: 9px;
  color: $c-dim;
  letter-spacing: 1px;
}

// ══ MAIN AREA ══
.panel-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 14px 12px 14px;
  gap: 10px;
  overflow: hidden;
  position: relative;
  z-index: 5;
}

// Query rail
.query-rail {
  display: flex;
  align-items: center;
  gap: 0;
  background: $c-panel;
  border: 1px solid $c-border;
  border-radius: 4px;
  padding: 0;
  overflow: hidden;
  flex-shrink: 0;
}

.rail-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
}

.rail-divider {
  width: 1px;
  height: 40px;
  background: $c-border;
  flex-shrink: 0;
}

.rail-label {
  font-family: $font-mono;
  font-size: 9px;
  letter-spacing: 2px;
  color: $c-dim;
  white-space: nowrap;
}

.selected-device {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;
  .dev-id {
    font-family: $font-mono;
    font-size: 10px;
    color: $c-dim;
  }
  .dev-name {
    font-family: $font-mono;
    font-size: 11px;
    color: $c-text;
    letter-spacing: 0.5px;
  }
  .dev-badge {
    font-family: $font-mono;
    font-size: 9px;
    letter-spacing: 1px;
    padding: 2px 8px;
    border-radius: 2px;
    &.on { color: $c-accent; background: rgba($c-accent,0.1); border: 1px solid rgba($c-accent,0.3); }
    &.off { color: $c-red; background: rgba($c-red,0.08); border: 1px solid rgba($c-red,0.25); }
  }
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  .ti {
    background: rgba(0,0,0,0.5);
    border: 1px solid $c-border;
    border-radius: 3px;
    padding: 5px 10px;
    font-family: $font-mono;
    font-size: 11px;
    color: $c-text;
    letter-spacing: 0.5px;
    width: 148px;
    outline: none;
    transition: border-color 0.15s;
    &:focus { border-color: rgba($c-accent, 0.5); }
  }
  .ti-sep {
    font-family: $font-mono;
    color: $c-dim;
    font-size: 12px;
  }
}

.rail-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  .action-btn {
    font-family: $font-mono;
    font-size: 10px;
    letter-spacing: 2px;
    padding: 7px 18px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.15s;
    &.primary {
      background: rgba($c-accent, 0.12);
      border: 1px solid rgba($c-accent, 0.5);
      color: $c-accent;
      &:hover {
        background: rgba($c-accent, 0.2);
        box-shadow: 0 0 12px rgba($c-accent, 0.2);
      }
    }
    &.ghost {
      background: transparent;
      border: 1px solid $c-border;
      color: $c-dim;
      &:hover { border-color: rgba($c-accent2, 0.4); color: $c-accent2; }
    }
  }
}

// Player
.player-section {
  flex: 1;
  position: relative;
  background: #000;
  border: 1px solid $c-border;
  border-radius: 4px;
  overflow: hidden;
  min-height: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba($c-accent, 0.025) 0%,
      transparent 50%,
      rgba($c-accent2, 0.015) 100%
    );
    pointer-events: none;
    z-index: 2;
  }
}

.vid-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: brightness(0.7) contrast(1.05) saturate(0.85);
  transition: filter 0.3s;
  &.grayscale { filter: grayscale(1) brightness(0.3) contrast(1.1); }
}

.vid-overlay {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 3px,
    rgba(0,0,0,0.07) 3px,
    rgba(0,0,0,0.07) 4px
  );
  pointer-events: none;
  z-index: 3;
}

.no-signal {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 10;
  background: rgba(0,0,0,0.7);
  .ns-icon { font-size: 40px; opacity: 0.3; }
  .ns-text {
    font-family: $font-mono;
    font-size: 22px;
    letter-spacing: 8px;
    color: #666;
  }
  .ns-sub {
    font-family: $font-mono;
    font-size: 10px;
    letter-spacing: 3px;
    color: #444;
  }
}

// HUD overlays
$hud-bg: rgba(0,0,0,0.65);
.hud-tl, .hud-tr, .hud-bl, .hud-br {
  position: absolute;
  z-index: 8;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: $font-mono;
  font-size: 10px;
  letter-spacing: 1.5px;
  padding: 6px 12px;
  background: $hud-bg;
  backdrop-filter: blur(4px);
}
.hud-tl { top: 0; left: 0; border-bottom: 1px solid $c-border; border-right: 1px solid $c-border; border-radius: 0 0 4px 0; }
.hud-tr { top: 0; right: 0; border-bottom: 1px solid $c-border; border-left: 1px solid $c-border; border-radius: 0 0 0 4px; }
.hud-bl { bottom: 56px; left: 0; border-top: 1px solid $c-border; border-right: 1px solid $c-border; border-radius: 0 4px 0 0; }
.hud-br { bottom: 56px; right: 0; border-top: 1px solid $c-border; border-left: 1px solid $c-border; border-radius: 4px 0 0 0; }

.hud-tag {
  color: $c-red;
  animation: blink 0.9s step-end infinite;
  font-weight: 700;
}
.hud-cam { color: $c-accent; }
.hud-date { color: $c-text; }
.hud-res, .hud-codec, .hud-bitrate { color: $c-dim; }
.hud-time {
  color: $c-accent;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
}

// P-corners
.p-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  z-index: 9;
  &.ptl { top: 1px; left: 1px; border-top: 2px solid $c-accent; border-left: 2px solid $c-accent; }
  &.ptr { top: 1px; right: 1px; border-top: 2px solid $c-accent; border-right: 2px solid $c-accent; }
  &.pbl { bottom: 1px; left: 1px; border-bottom: 2px solid $c-accent; border-left: 2px solid $c-accent; }
  &.pbr { bottom: 1px; right: 1px; border-bottom: 2px solid $c-accent; border-right: 2px solid $c-accent; }
}

// Playback controls
.pb-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: rgba(0,0,0,0.82);
  border-top: 1px solid $c-border;
  backdrop-filter: blur(8px);
}
.pb-btn {
  background: transparent;
  border: 1px solid $c-border;
  border-radius: 3px;
  color: $c-text;
  font-size: 14px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.12s;
  &:hover { border-color: rgba($c-accent, 0.6); color: $c-accent; background: rgba($c-accent, 0.05); }
  &.pb-play {
    width: 42px;
    height: 42px;
    border-color: rgba($c-accent, 0.5);
    color: $c-accent;
    font-size: 18px;
    background: rgba($c-accent, 0.06);
    &:hover { background: rgba($c-accent, 0.14); box-shadow: 0 0 10px rgba($c-accent, 0.2); }
  }
  &.sm { width: 28px; height: 28px; font-size: 12px; }
}
.pb-speed {
  background: rgba($c-accent, 0.08);
  border: 1px solid rgba($c-accent, 0.4);
  border-radius: 3px;
  color: $c-accent;
  font-family: $font-mono;
  font-size: 11px;
  padding: 4px 12px;
  cursor: pointer;
  letter-spacing: 1px;
  transition: all 0.15s;
  &:hover { background: rgba($c-accent, 0.15); }
}
.pb-divider {
  width: 1px;
  height: 24px;
  background: $c-border;
  margin: 0 6px;
}

// Timeline
.timeline-section {
  flex-shrink: 0;
  background: $c-panel;
  border: 1px solid $c-border;
  border-radius: 4px;
  overflow: hidden;
}
.tl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 14px;
  border-bottom: 1px solid $c-border;
  .tl-label {
    font-family: $font-mono;
    font-size: 9px;
    letter-spacing: 2px;
    color: $c-dim;
  }
  .tl-legend {
    display: flex;
    gap: 16px;
    .leg-item {
      font-family: $font-mono;
      font-size: 9px;
      letter-spacing: 1px;
      &.recorded { color: rgba($c-accent, 0.8); }
      &.motion { color: $c-amber; }
      &.alarm { color: $c-red; }
    }
  }
}
.tl-ruler {
  position: relative;
  height: 52px;
  padding: 0 0;
}
.tl-block {
  position: absolute;
  top: 12px;
  height: 14px;
  border-radius: 2px;
  &.recorded { background: rgba($c-accent, 0.18); border: 1px solid rgba($c-accent, 0.35); }
  &.motion { background: rgba($c-amber, 0.25); border: 1px solid rgba($c-amber, 0.5); }
  &.alarm { background: rgba($c-red, 0.3); border: 1px solid rgba($c-red, 0.6); }
}
.tl-head {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: $c-red;
  z-index: 10;
  box-shadow: 0 0 6px $c-red;
  .tl-head-label {
    position: absolute;
    top: -1px;
    left: 6px;
    background: $c-red;
    color: white;
    font-family: $font-mono;
    font-size: 9px;
    padding: 1px 6px;
    border-radius: 2px;
    letter-spacing: 1px;
    white-space: nowrap;
  }
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -4px;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 7px solid $c-red;
  }
}
.tl-hour {
  position: absolute;
  top: 30px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  .tl-tick {
    width: 1px;
    height: 8px;
    background: $c-border;
  }
  .tl-hLabel {
    font-family: $font-mono;
    font-size: 8px;
    color: $c-dim;
    letter-spacing: 0px;
  }
}

// Animations
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 3px $c-accent; }
  50% { box-shadow: 0 0 8px $c-accent, 0 0 14px rgba($c-accent, 0.4); }
}
@keyframes slide-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>