<template>
  <div class="lm-root">
    <!-- Global grid texture -->
    <div class="grid-texture" aria-hidden="true"></div>
    <!-- Scanlines -->
    <div class="scanlines" aria-hidden="true"></div>

    <!-- ══ TOP BAR ══ -->
    <header class="top-bar">
      <!-- <div class="tb-brand">
        <div class="brand-icon">⬡</div>
        <div class="brand-info">
          <span class="brand-name">SURV<span class="brand-accent">·</span>OS</span>
          <span class="brand-sub">LIVE MONITORING SYSTEM</span>
        </div>
        <div class="sys-status">
          <span class="ss-dot"></span>
          <span class="ss-text">SYS ONLINE</span>
        </div>
      </div> -->

      <div class="tb-center">
        <button
          ref="deviceBtnRef"
          class="cmd-btn"
          :class="{ active: showDeviceList }"
          @click="toggleDeviceList"
        >
          <span class="cb-icon">◈</span>
          <span>DEVICE REGISTRY</span>
          <span v-if="onlineCount > 0" class="online-pill">{{ onlineCount }}</span>
        </button>

        <div class="layout-group">
          <button
            v-for="m in [1,4]"
            :key="m"
            class="layout-btn"
            :class="{ active: windowMode === m }"
            @click="windowMode = m"
          >
            <span class="lb-grid" :class="'g' + m"></span>
          </button>
        </div>

        <button class="cmd-btn accent" @click="showAllSnapshots">
          <span class="cb-icon">⊞</span>
          <span>ALL CAPTURES</span>
        </button>
      </div>

      <!-- <div class="tb-right">
        <div class="sys-clock">{{ clockStr }}</div>
        <div class="sys-date">{{ dateStr }}</div>
      </div> -->
    </header>

    <!-- ══ MAIN LAYOUT ══ -->
    <div class="main-layout">

      <!-- Video grid area -->
      <section class="video-area">
        <div class="video-grid" :class="'grid-' + windowMode">
          <div
            v-for="(cam, idx) in videoCameras.slice(0, windowMode)"
            :key="idx"
            class="video-window"
            :class="{ active: activeWindow === idx, 'drag-over': dragOverWindow === idx }"
            @click="activeWindow = idx"
            @dragover.prevent="onDragOver(idx)"
            @dragleave="onDragLeave(idx)"
            @drop="onDropToWindow($event, idx)"
          >
            <!-- Corner brackets -->
            <div class="vc-corner vtl"></div>
            <div class="vc-corner vtr"></div>
            <div class="vc-corner vbl"></div>
            <div class="vc-corner vbr"></div>

            <!-- Active indicator -->
            <div v-if="activeWindow === idx" class="active-ring"></div>

            <div class="video-inner">
              <img
                :src="`https://picsum.photos/seed/${cam.id !== 'empty_' + idx ? cam.id?.replace(/[^a-z0-9]/gi, '') || idx + 400 : idx + 999}/600/400`"
                class="stream-img"
                :class="{ unassigned: cam.id?.startsWith('empty') }"
              />
              <div class="stream-overlay"></div>

              <!-- HUD top -->
              <div class="hud-top">
                <div class="hud-left">
                  <span class="rec-dot" v-if="!cam.id?.startsWith('empty')">●</span>
                  <span class="cam-id">{{ cam.id?.startsWith('empty') ? `WINDOW ${idx+1}` : `CH-${String(idx+1).padStart(2,'0')}` }}</span>
                  <span class="cam-name-hud">{{ cam.name }}</span>
                </div>
                <div class="hud-right">
                  <span class="hud-tag" v-if="!cam.id?.startsWith('empty')">LIVE</span>
                  <span class="hud-tag idle" v-else>IDLE</span>
                </div>
              </div>

              <!-- HUD bottom -->
              <div class="hud-bottom" v-if="!cam.id?.startsWith('empty')">
                <span class="hud-res">1080P</span>
                <span class="hud-sep">·</span>
                <span class="hud-fps">30FPS</span>
                <span class="hud-sep">·</span>
                <span class="hud-codec">H.265</span>
              </div>

              <!-- Unassigned overlay -->
              <div v-if="cam.id?.startsWith('empty')" class="unassigned-overlay">
                <div class="ua-icon">⊕</div>
                <div class="ua-text">DRAG CAMERA HERE</div>
              </div>

              <!-- Active marker -->
              <div v-if="activeWindow === idx" class="active-marker">ACTIVE</div>
            </div>
          </div>
        </div>

        <div class="drag-hint">
          <span class="dh-icon">⌖</span>
          DOUBLE-CLICK OR DRAG DEVICE FROM REGISTRY TO ASSIGN CHANNEL
        </div>
      </section>

      <!-- Right panel: Captures -->
      <aside class="capture-panel">
        <div class="cp-header">
          <div class="cp-title">
            <span class="cp-title-icon">⊞</span>
            <span>CAPTURE LOG</span>
            <span class="cp-count">{{ snapshots.length }}</span>
          </div>
          <div class="cp-filters">
            <button
              v-for="f in filters"
              :key="f.val"
              class="cf-btn"
              :class="{ active: activeFilter === f.val }"
              @click="activeFilter = f.val"
            >{{ f.label }}</button>
          </div>
        </div>

        <div class="cp-scroll" ref="snapshotScrollRef">
          <template v-for="(group, type) in filteredSnapshots" :key="type">
            <div v-if="group.length" class="cap-group">
              <div class="cg-header">
                <span class="cg-type-icon">{{ typeIcon(type) }}</span>
                <span class="cg-label">{{ typeLabel(type) }}</span>
                <span class="cg-count">{{ group.length }}</span>
              </div>
              <div class="cap-grid">
                <div
                  v-for="snap in group"
                  :key="snap.id"
                  class="cap-card"
                  @click="openProfile(snap)"
                >
                  <div class="cc-img-wrap">
                    <img :src="snap.image" class="cc-img" />
                    <div class="cc-scan"></div>
                    <div class="cc-time">{{ snap.time }}</div>
                    <div class="cc-corner cc-tl"></div>
                    <div class="cc-corner cc-tr"></div>
                  </div>
                  <div class="cc-label">{{ snap.name || snap.licensePlate || 'UNKNOWN' }}</div>
                </div>
              </div>
            </div>
          </template>
          <div v-if="totalSnapshots === 0" class="empty-cap">
            <span class="ec-icon">◻</span>
            <span>NO CAPTURE DATA</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- ══ DEVICE REGISTRY POPUP ══ -->
    <Teleport to="body">
      <div
        v-if="showDeviceList"
        ref="deviceListRef"
        class="device-popup"
        :style="popupStyle"
      >
        <div class="dp-header">
          <div class="dp-title">
            <span class="dp-icon">◈</span>
            <span>DEVICE REGISTRY</span>
          </div>
          <div class="dp-stats">
            <span class="dp-stat online">{{ onlineCount }} ONLINE</span>
          </div>
          <button class="dp-close" @click="closeDeviceList">✕</button>
        </div>

        <div class="dp-search">
          <span class="ds-icon">⌕</span>
          <input
            v-model="searchKeyword"
            placeholder="SEARCH NODES..."
            class="ds-input"
          />
          <span v-if="searchKeyword" class="ds-clear" @click="searchKeyword = ''">✕</span>
        </div>

        <div class="dp-toolbar">
          <button class="dp-tb-btn" @click="expandAll">▶ EXPAND ALL</button>
          <button class="dp-tb-btn" @click="collapseAll">▼ COLLAPSE</button>
        </div>

        <div class="dp-tree">
          <div v-if="!topLevelNodes.length" class="dp-loading">
            <span class="dp-spin"></span>
            <span>INITIALIZING NODES…</span>
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

        <div class="dp-footer">
          <span>⌖ DBL-CLICK TO ASSIGN · DRAG TO WINDOW</span>
        </div>
      </div>
    </Teleport>

    <!-- ══ PROFILE MODAL ══ -->
    <Teleport to="body">
      <div v-if="showProfile" class="modal-mask" @click.self="showProfile = false">
        <div class="profile-modal">
          <!-- corner deco -->
          <div class="pm-corner pm-tl"></div>
          <div class="pm-corner pm-tr"></div>
          <div class="pm-corner pm-bl"></div>
          <div class="pm-corner pm-br"></div>

          <div class="pm-header">
            <div class="pm-title">
              <span class="pm-icon">◈</span>
              <span>SUBJECT PROFILE</span>
            </div>
            <button class="pm-close" @click="showProfile = false">✕</button>
          </div>

          <div class="pm-body">
            <div class="pm-identity">
              <div class="pm-avatar-wrap">
                <img :src="selectedSnapshot?.image" class="pm-avatar" />
                <div class="pm-avatar-scan"></div>
              </div>
              <div class="pm-info-list">
                <div class="pi-row" v-for="row in profileRows" :key="row.label">
                  <span class="pi-label">{{ row.label }}</span>
                  <span class="pi-value">{{ row.value }}</span>
                </div>
              </div>
            </div>

            <div class="pm-tabs">
              <div class="pt-header">
                <button
                  v-for="tab in ['TRAJECTORY', 'ASSOCIATES']"
                  :key="tab"
                  class="pt-btn"
                  :class="{ active: activeTab === tab }"
                  @click="activeTab = tab"
                >{{ tab }}</button>
              </div>
              <div class="pt-body">
                <div v-if="activeTab === 'TRAJECTORY'" class="traj-list">
                  <div v-for="(p, i) in trajectoryPoints" :key="i" class="traj-item">
                    <div class="ti-node">
                      <div class="ti-dot"></div>
                      <div v-if="i < trajectoryPoints.length - 1" class="ti-line"></div>
                    </div>
                    <div class="ti-info">
                      <span class="ti-time">{{ p.time }}</span>
                      <span class="ti-loc">{{ p.loc }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="assoc-list">
                  <div class="assoc-item" v-for="a in associates" :key="a">
                    <div class="ai-avatar"></div>
                    <div class="ai-info">
                      <div class="ai-name">{{ a }}</div>
                      <div class="ai-tag">ASSOCIATED SUBJECT</div>
                    </div>
                    <div class="ai-conf">HIGH CONF</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pm-footer">
            <button class="pm-btn primary" @click="goToPlayback">▶ PLAYBACK</button>
            <button class="pm-btn ghost" @click="showProfile = false">CLOSE</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, defineComponent, h, type PropType } from 'vue'

interface Snapshot {
  id: number
  type: 'person' | 'vehicle' | 'non-motor'
  time: string
  image: string
  name?: string
  licensePlate?: string
}

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
  await delay(280)
  const areas = ['EAST TERMINAL', 'WEST TERMINAL', 'SOUTH ARRIVAL', 'NORTH DEPARTURE', 'CENTRAL HALL', 'UNDERGROUND PARKING', 'PERIMETER', 'ADMIN BLOCK']
  return areas.map((name, i) => ({
    id: `region_top_${i}`,
    name,
    type: 'region',
    isLeaf: false,
    loaded: false,
    loading: false,
    hasChildren: true,
  }))
}

const fetchRegionChildren = async (regionId: string, regionName: string): Promise<TreeNode[]> => {
  await delay(180 + Math.random() * 280)
  const children: TreeNode[] = []
  const subCount = regionId.includes('top') ? Math.floor(Math.random() * 3) + 1 : 0
  for (let i = 0; i < subCount; i++) {
    children.push({
      id: `${regionId}_sub_${i}`,
      name: `${regionName} · ZONE-${String.fromCharCode(65 + i)}`,
      type: 'region',
      isLeaf: false,
      loaded: false,
      loading: false,
      hasChildren: true,
    })
  }
  const cameraCount = Math.floor(Math.random() * 30) + 8
  for (let i = 0; i < cameraCount; i++) {
    children.push({
      id: `${regionId}_cam_${i}`,
      name: `CAM-${regionName.slice(0,3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      type: 'camera',
      isLeaf: true,
      loaded: true,
      loading: false,
      hasChildren: false,
      cameraStatus: Math.random() > 0.06 ? 'online' : 'offline',
    })
  }
  return children.sort(() => Math.random() - 0.5)
}

// ── TreeItem component ──
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
        if (!props.node!.loaded && props.node!.hasChildren) await emit('toggle', props.node)
        expanded.value = !expanded.value
      }
    }

    const handleDblClick = (e: Event) => {
      if (props.node!.type === 'camera') {
        e.stopPropagation()
        emit('select', props.node)
      }
    }

    const handleDragStart = (e: DragEvent) => {
      if (props.node!.type !== 'camera') { e.preventDefault(); return }
      e.dataTransfer?.setData('text/plain', JSON.stringify({ id: props.node!.id, name: props.node!.name, type: 'camera' }))
      e.dataTransfer!.effectAllowed = 'copy'
    }

    return () => {
      const indent = { paddingLeft: `${(props.level || 0) * 14 + 8}px` }
      const isCamera = props.node!.type === 'camera'
      const isSelected = props.selectedId === props.node!.id && isCamera
      const isOnline = props.node!.cameraStatus === 'online'

      return h('div', { class: 'tr-item' }, [
        h('div', {
          class: ['tr-row', { 'tr-selected': isSelected, 'tr-region': !isCamera }],
          style: indent,
          onClick: () => { if (!isCamera) toggleExpand() },
          onDblclick: handleDblClick,
          draggable: isCamera,
          onDragstart: isCamera ? handleDragStart : undefined,
        }, [
          isCamera
            ? h('span', { class: ['tr-dot', isOnline ? 'tr-on' : 'tr-off'] })
            : h('span', { class: 'tr-chevron' }, expanded.value ? '▾' : '▸'),
          h('span', { class: 'tr-name' }, props.node!.name),
          props.node!.loading && h('span', { class: 'tr-spin' }),
          isCamera && h('span', { class: ['tr-badge', isOnline ? 'tr-badge-on' : 'tr-badge-off'] }, isOnline ? 'LIVE' : 'LOST'),
        ]),
        expanded.value && props.node!.children && h('div', { class: 'tr-children' },
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

// ── State ──
const windowMode = ref(4)
const activeWindow = ref(0)
const showDeviceList = ref(false)
const searchKeyword = ref('')
const selectedCameraNodeId = ref<string | null>(null)
const showProfile = ref(false)
const selectedSnapshot = ref<Snapshot | null>(null)
const activeFilter = ref<'all' | 'person' | 'vehicle' | 'non-motor'>('all')
const activeTab = ref('TRAJECTORY')
const dragOverWindow = ref<number | null>(null)
const snapshotScrollRef = ref<HTMLElement | null>(null)
const deviceListRef = ref<HTMLElement | null>(null)
const deviceBtnRef = ref<HTMLElement | null>(null)
const popupStyle = ref<{ top: string; left: string }>({ top: '0px', left: '0px' })

const clockStr = ref('')
const dateStr = ref('')
const updateClock = () => {
  const now = new Date()
  clockStr.value = now.toLocaleTimeString('en-GB')
  dateStr.value = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}

const videoCameras = ref([
  { id: 'cam_demo_1', name: 'EAST MAIN ENTRANCE' },
  { id: 'cam_demo_2', name: 'WEST CORRIDOR' },
  { id: 'cam_demo_3', name: 'SOUTH PLAZA' },
  { id: 'cam_demo_4', name: 'NORTH GATE' },
])
const topLevelNodes = ref<TreeNode[]>([])

const snapshots = ref<Snapshot[]>([
  { id: 1, type: 'person', time: '15:26:40', image: 'https://picsum.photos/id/100/200/200', name: 'ZHANG M.' },
  { id: 2, type: 'person', time: '15:25:03', image: 'https://picsum.photos/id/101/200/200', name: 'LI F.' },
  { id: 3, type: 'vehicle', time: '15:21:10', image: 'https://picsum.photos/id/111/200/200', licensePlate: '京A·88888' },
  { id: 4, type: 'non-motor', time: '15:18:20', image: 'https://picsum.photos/id/113/200/200', name: 'E-BIKE' },
  { id: 5, type: 'person', time: '15:12:07', image: 'https://picsum.photos/id/20/200/200', name: 'CHEN M.' },
  { id: 6, type: 'vehicle', time: '15:08:44', image: 'https://picsum.photos/id/26/200/200', licensePlate: '沪B·12345' },
])

const filters = [
  { val: 'all', label: 'ALL' },
  { val: 'person', label: 'PERSON' },
  { val: 'vehicle', label: 'VEHICLE' },
  { val: 'non-motor', label: 'NON-MOTOR' },
] as const

const typeIcon = (t: string) => ({ person: '◉', vehicle: '◈', 'non-motor': '◌' }[t] || '◉')
const typeLabel = (t: string) => ({ person: 'PERSONS', vehicle: 'VEHICLES', 'non-motor': 'NON-MOTOR' }[t] || t.toUpperCase())

const onlineCount = computed(() => {
  let c = 0
  const t = (ns: TreeNode[]) => { for (const n of ns) { if (n.type==='camera'&&n.cameraStatus==='online') c++; if(n.children)t(n.children) } }
  t(topLevelNodes.value); return c
})

const filteredSnapshots = computed(() => {
  const f = snapshots.value.filter(s => activeFilter.value === 'all' || s.type === activeFilter.value)
  return {
    person: f.filter(s => s.type === 'person'),
    vehicle: f.filter(s => s.type === 'vehicle'),
    'non-motor': f.filter(s => s.type === 'non-motor'),
  }
})
const totalSnapshots = computed(() => snapshots.value.length)

const trajectoryPoints = [
  { time: '15:26:40', loc: 'MAIN ENTRANCE · INGRESS' },
  { time: '15:28:15', loc: 'CORRIDOR A · TRANSIT' },
  { time: '15:30:05', loc: 'ELEVATOR B · STATIONARY' },
]
const associates = ['WANG Z.', 'LI L.']

const profileRows = computed(() => [
  { label: 'ID', value: selectedSnapshot.value?.id ? `SUB-${String(selectedSnapshot.value.id).padStart(4,'0')}` : '—' },
  { label: 'NAME', value: selectedSnapshot.value?.name || selectedSnapshot.value?.licensePlate || 'UNKNOWN' },
  { label: 'GENDER', value: 'MALE' },
  { label: 'ESTIMATED AGE', value: 'approx. 35' },
  { label: 'LAST SEEN', value: selectedSnapshot.value?.time || '—' },
  { label: 'THREAT LEVEL', value: 'LOW' },
])

// ── Camera assignment ──
const assignCameraToWindow = (cam: TreeNode, idx: number) => {
  if (cam.type !== 'camera' || idx < 0 || idx >= videoCameras.value.length) return
  videoCameras.value[idx] = { id: cam.id, name: cam.name }
  showToast(`✓ ASSIGNED ${cam.name} → WINDOW ${idx + 1}`)
}

const onSelectCamera = (cam: TreeNode) => {
  selectedCameraNodeId.value = cam.id
  assignCameraToWindow(cam, activeWindow.value)
}

const onDragOver = (idx: number) => { dragOverWindow.value = idx }
const onDragLeave = (idx: number) => { if (dragOverWindow.value === idx) dragOverWindow.value = null }
const onDropToWindow = (e: DragEvent, idx: number) => {
  e.preventDefault()
  dragOverWindow.value = null
  try {
    const d = JSON.parse(e.dataTransfer?.getData('text/plain') || '{}')
    if (d.type === 'camera') {
      assignCameraToWindow({ ...d, isLeaf: true, loaded: true, loading: false, hasChildren: false, cameraStatus: 'online' } as TreeNode, idx)
    }
  } catch {}
}

// ── Tree ──
const toggleNode = async (node: TreeNode) => {
  if (node.type === 'camera') return
  if (!node.loaded && node.hasChildren) {
    node.loading = true
    node.children = await fetchRegionChildren(node.id, node.name)
    node.loaded = true
    node.loading = false
  }
}

let expandTimer: ReturnType<typeof setTimeout> | null = null
const expandAll = async () => {
  const rec = async (ns: TreeNode[]) => {
    for (const n of ns) {
      if (n.type === 'region' && !n.loaded && n.hasChildren) await toggleNode(n)
      if (n.children) await rec(n.children)
    }
  }
  await rec(topLevelNodes.value)
  await nextTick()
}
const collapseAll = () => initTree()

watch(searchKeyword, v => {
  if (expandTimer) clearTimeout(expandTimer)
  if (v?.trim()) expandTimer = setTimeout(expandAll, 200)
  else collapseAll()
})

const filteredTree = computed(() => {
  if (!searchKeyword.value) return topLevelNodes.value
  const kw = searchKeyword.value.toLowerCase()
  const filter = (n: TreeNode): TreeNode | null => {
    const match = n.name.toLowerCase().includes(kw)
    const fc = n.children?.map(c => filter(c)).filter((c): c is TreeNode => c !== null) ?? []
    if (match || fc.length) return { ...n, children: fc.length ? fc : n.children }
    return null
  }
  return topLevelNodes.value.map(n => filter(n)).filter((n): n is TreeNode => n !== null)
})

const initTree = async () => {
  topLevelNodes.value = await fetchTopLevelRegions()
}

// ── Popup positioning ──
const updatePopupPosition = () => {
  if (!showDeviceList.value || !deviceBtnRef.value) return
  const r = deviceBtnRef.value.getBoundingClientRect()
  const pw = 360; const gap = 8
  let left = r.left
  let top = r.bottom + gap
  if (left + pw > window.innerWidth - 10) left = window.innerWidth - pw - 10
  if (left < 10) left = 10
  popupStyle.value = { top: `${top}px`, left: `${left}px` }
}

let resizeObs: ResizeObserver | null = null
let scrollH: (() => void) | null = null

watch(showDeviceList, v => {
  if (v) {
    nextTick(() => {
      updatePopupPosition()
      scrollH = () => updatePopupPosition()
      window.addEventListener('scroll', scrollH, true)
      window.addEventListener('resize', updatePopupPosition)
      resizeObs = new ResizeObserver(updatePopupPosition)
      if (deviceBtnRef.value) resizeObs.observe(deviceBtnRef.value)
    })
  } else {
    if (scrollH) { window.removeEventListener('scroll', scrollH, true); window.removeEventListener('resize', updatePopupPosition); scrollH = null }
    if (resizeObs) { resizeObs.disconnect(); resizeObs = null }
  }
})

const toggleDeviceList = (e?: Event) => { e?.stopPropagation(); showDeviceList.value = !showDeviceList.value; if (showDeviceList.value) nextTick(updatePopupPosition) }
const closeDeviceList = () => { showDeviceList.value = false }

const handleClickOutside = (e: MouseEvent) => {
  if (!showDeviceList.value) return
  if (!deviceListRef.value?.contains(e.target as Node) && !deviceBtnRef.value?.contains(e.target as Node)) showDeviceList.value = false
}

const syncCameras = () => {
  const t = windowMode.value
  while (videoCameras.value.length < t) videoCameras.value.push({ id: `empty_${videoCameras.value.length}`, name: 'UNASSIGNED' })
  if (videoCameras.value.length > t) videoCameras.value = videoCameras.value.slice(0, t)
  if (activeWindow.value >= t) activeWindow.value = 0
}

const openProfile = (snap: Snapshot) => { selectedSnapshot.value = snap; showProfile.value = true }
const goToPlayback = () => { alert('PLAYBACK MODULE: Integration pending'); showProfile.value = false }
const showAllSnapshots = () => { activeFilter.value = 'all'; nextTick(() => snapshotScrollRef.value?.scrollTo({ top: 0, behavior: 'smooth' })); showToast('ALL CAPTURES LOADED') }

const showToast = (msg: string) => {
  const el = document.createElement('div')
  el.className = 'lm-toast'
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2000)
}

let clockTimer: ReturnType<typeof setInterval>

onMounted(() => {
  initTree(); syncCameras(); updateClock()
  clockTimer = setInterval(updateClock, 1000)
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  clearInterval(clockTimer)
  document.removeEventListener('mousedown', handleClickOutside)
  if (scrollH) { window.removeEventListener('scroll', scrollH, true); window.removeEventListener('resize', updatePopupPosition) }
  if (resizeObs) resizeObs.disconnect()
  if (expandTimer) clearTimeout(expandTimer)
})
watch(windowMode, syncCameras)
</script>

<style  lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=DM+Mono:wght@400;500&family=Barlow:wght@400;500;600&display=swap');

// ── Variables ──
$bg:       #02050c;
$panel:    #040810;
$border:   #0e2235;
$accent:   #00d4ff;
$accent2:  #00c8ff;
$red:      #ff3a3a;
$amber:    #ffb020;
$text:     #a8c8e0;
$dim:      #3a5a6e;
$mono:     'DM Mono', monospace;
$display:  'Orbitron', sans-serif;
$body:     'Barlow', sans-serif;

* { box-sizing: border-box; margin: 0; padding: 0; }

// Global toast (unscoped injected)
:global(.lm-toast) {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 212, 255, 0.12);
  border: 1px solid rgba(0, 212, 255, 0.4);
  color: $accent;
  font-family: $mono;
  font-size: 11px;
  letter-spacing: 1.5px;
  padding: 8px 20px;
  border-radius: 4px;
  z-index: 9999;
  animation: toast-in 0.2s ease;
  pointer-events: none;
}
:global(@keyframes toast-in) {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.lm-root {
  position: relative;
  height: 86vh;
  display: flex;
  flex-direction: column;
  background: $bg;
  color: $text;
  font-family: $body;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,80,120,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 90% 90%, rgba(0,212,255,0.04) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
}

.grid-texture {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px, transparent 3px,
    rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px
  );
  pointer-events: none;
  z-index: 1;
}

// ── TOP BAR ──
.top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 56px;
  background: rgba(4, 8, 16, 0.92);
  border-bottom: 1px solid $border;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, $accent 30%, $accent 70%, transparent);
    opacity: 0.3;
  }
}

.tb-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  .brand-icon {
    font-size: 22px;
    color: $accent;
    animation: icon-pulse 3s ease-in-out infinite;
    text-shadow: 0 0 12px $accent;
  }
  .brand-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .brand-name {
    font-family: $display;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 3px;
    .brand-accent { color: $accent; }
  }
  .brand-sub {
    font-family: $mono;
    font-size: 8px;
    letter-spacing: 2px;
    color: $dim;
  }
  .sys-status {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: 16px;
    padding: 4px 10px;
    border: 1px solid rgba($accent2, 0.3);
    border-radius: 3px;
    background: rgba($accent2, 0.04);
    .ss-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: $accent2;
      box-shadow: 0 0 6px $accent2;
      animation: pulse-dot 1.5s infinite;
    }
    .ss-text {
      font-family: $mono;
      font-size: 9px;
      letter-spacing: 2px;
      color: $accent2;
    }
  }
}

.tb-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cmd-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid $border;
  border-radius: 3px;
  padding: 7px 16px;
  font-family: $mono;
  font-size: 10px;
  letter-spacing: 1.5px;
  color: $text;
  cursor: pointer;
  transition: all 0.15s;

  &:hover, &.active {
    border-color: rgba($accent, 0.5);
    background: rgba($accent, 0.06);
    color: $accent;
    box-shadow: 0 0 10px rgba($accent, 0.1);
  }
  &.accent {
    border-color: rgba($accent2, 0.3);
    color: rgba($accent2, 0.9);
    &:hover { border-color: $accent2; background: rgba($accent2, 0.06); color: $accent2; }
  }
  .cb-icon { font-size: 12px; }
  .online-pill {
    background: rgba($accent2, 0.15);
    border: 1px solid rgba($accent2, 0.4);
    color: $accent2;
    font-size: 9px;
    padding: 1px 7px;
    border-radius: 2px;
    letter-spacing: 1px;
  }
}

.layout-group {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid $border;
  border-radius: 3px;
  background: rgba(0,0,0,0.3);
}
.layout-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.12s;
  &.active { background: rgba($accent, 0.1); border-color: rgba($accent, 0.4); }
  &:hover:not(.active) { background: rgba(255,255,255,0.04); }
}
.lb-grid {
  display: grid;
  gap: 2px;
  &.g1 { grid-template-columns: 1fr; width: 12px; height: 12px; span { display: block; background: currentColor; border-radius: 1px; } }
  &.g4 { grid-template-columns: 1fr 1fr; width: 12px; height: 12px; }

  &::before, &::after {
    content: '';
    background: rgba($text, 0.5);
    border-radius: 1px;
  }
  .layout-btn.active & { &::before, &::after { background: $accent; } }
}
.lb-grid.g1 { display: block; width: 12px; height: 12px; background: rgba($text, 0.5); border-radius: 1px; }
.lb-grid.g1 { .layout-btn.active & { background: $accent; } }
.lb-grid.g4 { display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
  &::before { content: ''; background: rgba($text,0.5); border-radius: 1px; }
  &::after { content: ''; background: rgba($text,0.5); border-radius: 1px; }
  box-shadow: inset 0 0 0 0;
  /* 4 cells via shadow trick */
}

.tb-right {
  text-align: right;
  .sys-clock {
    font-family: $display;
    font-size: 18px;
    font-weight: 600;
    color: $accent;
    letter-spacing: 3px;
    text-shadow: 0 0 10px rgba($accent, 0.5);
  }
  .sys-date {
    font-family: $mono;
    font-size: 9px;
    color: $dim;
    letter-spacing: 2px;
    margin-top: 1px;
  }
}

// ── MAIN LAYOUT ──
.main-layout {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 12px 16px 14px;
  overflow: hidden;
  position: relative;
  z-index: 5;
}

// ── VIDEO AREA ──
.video-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.video-grid {
  flex: 1;
  display: grid;
  gap: 8px;
  min-height: 0;
  &.grid-1 { grid-template-columns: 1fr; }
  &.grid-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
}

.video-window {
  position: relative;
  background: #000;
  border: 1px solid $border;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;

  &.active {
    border-color: rgba($accent, 0.7);
    box-shadow: 0 0 0 1px rgba($accent, 0.2), inset 0 0 20px rgba($accent, 0.03);
  }
  &.drag-over {
    border-color: $accent2;
    box-shadow: 0 0 20px rgba($accent2, 0.3);
    transform: scale(0.99);
  }
}

// Corner bracket decorations
.vc-corner {
  position: absolute;
  width: 14px; height: 14px;
  z-index: 8;
  &.vtl { top: 2px; left: 2px; border-top: 2px solid rgba($accent, 0.5); border-left: 2px solid rgba($accent, 0.5); }
  &.vtr { top: 2px; right: 2px; border-top: 2px solid rgba($accent, 0.5); border-right: 2px solid rgba($accent, 0.5); }
  &.vbl { bottom: 2px; left: 2px; border-bottom: 2px solid rgba($accent, 0.5); border-left: 2px solid rgba($accent, 0.5); }
  &.vbr { bottom: 2px; right: 2px; border-bottom: 2px solid rgba($accent, 0.5); border-right: 2px solid rgba($accent, 0.5); }
  .active & { border-color: $accent; }
}

.active-ring {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 0 2px rgba($accent, 0.5);
  pointer-events: none;
  z-index: 9;
}

.video-inner {
  width: 100%;
  height: 100%;
  position: relative;
}

.stream-img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  filter: brightness(0.72) contrast(1.08) saturate(0.8);
  &.unassigned { filter: grayscale(1) brightness(0.15); }
}

.stream-overlay {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px);
  pointer-events: none; z-index: 2;
}

// HUDs
.hud-top {
  position: absolute; top: 0; left: 0; right: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
  z-index: 5;
  font-family: $mono;
  .hud-left { display: flex; align-items: center; gap: 8px; }
  .rec-dot {
    color: $red; font-size: 10px;
    animation: blink-rec 0.8s step-end infinite;
    text-shadow: 0 0 6px $red;
  }
  .cam-id { font-size: 9px; letter-spacing: 2px; color: $dim; }
  .cam-name-hud { font-size: 10px; letter-spacing: 1px; color: rgba($accent, 0.9); }
  .hud-tag {
    font-size: 9px; letter-spacing: 2px; padding: 2px 8px;
    border: 1px solid rgba($red, 0.6); border-radius: 2px;
    color: $red; background: rgba($red, 0.1);
    animation: blink-rec 1.5s step-end infinite;
    &.idle { border-color: $dim; color: $dim; background: transparent; animation: none; }
  }
}

.hud-bottom {
  position: absolute; bottom: 40px; left: 0; right: 0;
  display: flex; align-items: center; gap: 6px;
  padding: 0 12px 6px;
  font-family: $mono; font-size: 9px; letter-spacing: 1px; color: $dim;
  z-index: 5;
  .hud-sep { color: rgba($dim, 0.4); }
}

.unassigned-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; z-index: 6;
  .ua-icon { font-size: 28px; color: $dim; opacity: 0.5; }
  .ua-text { font-family: $mono; font-size: 10px; letter-spacing: 3px; color: $dim; }
}

.active-marker {
  position: absolute; bottom: 8px; right: 10px;
  font-family: $mono; font-size: 9px; letter-spacing: 2px;
  color: $accent;
  border: 1px solid rgba($accent, 0.4);
  padding: 2px 8px; border-radius: 2px;
  background: rgba($accent, 0.08);
  z-index: 8;
}

.drag-hint {
  font-family: $mono;
  font-size: 9px;
  letter-spacing: 1.5px;
  color: $dim;
  text-align: center;
  .dh-icon { margin-right: 6px; color: rgba($accent, 0.4); }
}

// ── CAPTURE PANEL ──
.capture-panel {
  width: 290px;
  flex-shrink: 0;
  background: rgba(4, 8, 16, 0.85);
  border: 1px solid $border;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cp-header {
  padding: 12px 14px 8px;
  border-bottom: 1px solid $border;
}

.cp-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-family: $display;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  color: rgba($accent, 0.9);
  .cp-title-icon { font-size: 12px; }
  .cp-count {
    margin-left: auto;
    font-family: $mono;
    font-size: 14px;
    color: $accent;
  }
}

.cp-filters {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  .cf-btn {
    background: transparent;
    border: 1px solid $border;
    border-radius: 2px;
    padding: 3px 10px;
    font-family: $mono;
    font-size: 9px;
    letter-spacing: 1px;
    color: $dim;
    cursor: pointer;
    transition: all 0.12s;
    &.active { border-color: rgba($accent, 0.5); color: $accent; background: rgba($accent, 0.06); }
    &:hover:not(.active) { border-color: rgba($text, 0.3); color: $text; }
  }
}

.cp-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 12px 14px;
  scrollbar-width: thin;
  scrollbar-color: $border $panel;
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-track { background: $panel; }
  &::-webkit-scrollbar-thumb { background: $border; }
}

.cap-group { margin-bottom: 18px; }

.cg-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-family: $mono;
  font-size: 9px;
  letter-spacing: 2px;
  color: $dim;
  .cg-type-icon { color: $accent; }
  .cg-count {
    margin-left: auto;
    background: rgba($accent, 0.08);
    border: 1px solid rgba($accent, 0.2);
    color: $accent;
    padding: 0 6px;
    border-radius: 2px;
    font-size: 9px;
  }
}

.cap-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cap-card {
  cursor: pointer;
  transition: transform 0.12s;
  &:hover { transform: scale(0.97); }
  &:hover .cc-scan { opacity: 1; }
}

.cc-img-wrap {
  position: relative;
  aspect-ratio: 1;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid $border;
  .cc-img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.85) saturate(0.9); }
  .cc-scan {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba($accent, 0.12) 50%, transparent 100%);
    opacity: 0;
    animation: scan-move 1.5s ease-in-out infinite;
    pointer-events: none;
    transition: opacity 0.2s;
  }
  .cc-time {
    position: absolute; bottom: 0; left: 0; right: 0;
    font-family: $mono; font-size: 9px; letter-spacing: 1px;
    padding: 4px 6px;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    color: $accent;
    text-align: center;
  }
  .cc-corner {
    position: absolute; width: 8px; height: 8px;
    &.cc-tl { top: 2px; left: 2px; border-top: 1px solid $accent; border-left: 1px solid $accent; }
    &.cc-tr { top: 2px; right: 2px; border-top: 1px solid $accent; border-right: 1px solid $accent; }
  }
}

.cc-label {
  font-family: $mono;
  font-size: 9px;
  letter-spacing: 1px;
  color: $dim;
  text-align: center;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-cap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  font-family: $mono;
  font-size: 10px;
  letter-spacing: 3px;
  color: $dim;
  .ec-icon { font-size: 24px; opacity: 0.4; }
}

// ── DEVICE POPUP ──
.device-popup {
  position: fixed;
  width: 360px;
  max-height: 72vh;
  background: rgba(4, 8, 20, 0.97);
  border: 1px solid rgba($accent, 0.3);
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 0 1px rgba($accent, 0.1);
  animation: dp-in 0.18s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, $accent, transparent);
    opacity: 0.6;
  }
}

@keyframes dp-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.dp-header {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid $border;
  gap: 10px;
  background: rgba(0,0,0,0.4);
  .dp-icon { color: $accent; font-size: 12px; }
  .dp-title {
    display: flex; align-items: center; gap: 8px;
    font-family: $display; font-size: 10px; letter-spacing: 2px; color: $accent; font-weight: 600;
  }
  .dp-stats { margin-left: auto; }
  .dp-stat.online {
    font-family: $mono; font-size: 9px; letter-spacing: 1px;
    color: $accent2; border: 1px solid rgba($accent2, 0.3);
    padding: 2px 8px; border-radius: 2px; background: rgba($accent2, 0.05);
  }
  .dp-close {
    background: transparent; border: 1px solid $border; border-radius: 2px;
    color: $dim; font-size: 12px; width: 22px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    &:hover { border-color: $red; color: $red; }
  }
}

.dp-search {
  position: relative;
  margin: 10px 12px 6px;
  .ds-icon {
    position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
    font-size: 16px; color: $dim; font-family: $mono;
  }
  .ds-input {
    width: 100%;
    background: rgba(0,0,0,0.5);
    border: 1px solid $border;
    border-radius: 2px;
    padding: 7px 30px 7px 32px;
    font-family: $mono; font-size: 10px; letter-spacing: 1px;
    color: #fff;
    outline: none;
    transition: border-color 0.15s;
    &::placeholder { color: $dim; }
    &:focus { border-color: rgba($accent, 0.5); box-shadow: 0 0 0 1px rgba($accent, 0.1); }
  }
  .ds-clear {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    font-size: 10px; color: $dim; cursor: pointer;
    font-family: $mono;
    &:hover { color: $accent; }
  }
}

.dp-toolbar {
  display: flex; gap: 6px; padding: 0 12px 8px;
  .dp-tb-btn {
    flex: 1; background: transparent; border: 1px solid $border; border-radius: 2px;
    font-family: $mono; font-size: 9px; letter-spacing: 1px; color: $dim;
    padding: 5px 0; cursor: pointer; transition: all 0.12s;
    &:hover { border-color: rgba($accent, 0.4); color: $accent; background: rgba($accent, 0.04); }
  }
}

.dp-tree {
  flex: 1; overflow-y: auto; padding: 4px 0 8px;
  scrollbar-width: thin; scrollbar-color: $border $panel;
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-track { background: $panel; }
  &::-webkit-scrollbar-thumb { background: $border; }
}

.dp-loading {
  display: flex; align-items: center; gap: 10px;
  padding: 24px 20px; font-family: $mono; font-size: 10px;
  letter-spacing: 2px; color: $dim;
}
.dp-spin {
  display: inline-block; width: 14px; height: 14px;
  border: 1.5px solid $dim; border-top-color: $accent;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}

.dp-footer {
  padding: 8px 14px; border-top: 1px solid $border;
  font-family: $mono; font-size: 9px; letter-spacing: 1px;
  color: $dim; text-align: center;
  background: rgba(0,0,0,0.3);
}
// ── Tree items (Enhanced Contrast + Hierarchy) ──
.tr-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all 0.15s ease;
  position: relative;

  // hover 提升明显对比
  &:hover {
    background: rgba($accent, 0.12);
  }

  // 区域节点（更亮 + 更有结构感）
  &.tr-region {
    .tr-name {
      font-family: $display;
      font-size: 9px;
      letter-spacing: 2px;
      font-weight: 600;
      color: #7fdfff;
      text-shadow: 0 0 6px rgba(0, 212, 255, 0.25);
    }
  }

  // 选中状态（更明显）
  &.tr-selected {
    background: rgba($accent, 0.18);
    border-left-color: $accent;

    .tr-name {
      color: $accent;
      text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
    }
  }
}

// 展开箭头
.tr-chevron {
  font-size: 10px;
  color: $accent;
  width: 10px;
  text-align: center;
  opacity: 0.8;
}

// 在线/离线点
.tr-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;

  &.tr-on {
    background: $accent2;
    box-shadow: 0 0 6px $accent2, 0 0 10px rgba($accent2, 0.4);
    animation: pulse-dot 2s infinite;
  }

  &.tr-off {
    background: #2a3a44;
    border: 1px solid #3a4a55;
  }
}

// 摄像头名称（核心：提高可读性）
.tr-name {
  font-family: $mono;
  font-size: 10px;
  color: #cfe8ff;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.5px;

  // 轻微发光（科技感）
  text-shadow: 0 0 6px rgba(0, 212, 255, 0.25);
}

// 离线设备名称弱化（关键）
.tr-off + .tr-name {
  color: #4f6b7a;
  text-shadow: none;
}

// 状态标签
.tr-badge {
  font-family: $mono;
  font-size: 8px;
  letter-spacing: 1px;
  padding: 1px 6px;
  border-radius: 2px;

  &.tr-badge-on {
    color: $accent2;
    background: rgba($accent2, 0.08);
    border: 1px solid rgba($accent2, 0.3);
  }

  &.tr-badge-off {
    color: #4f6b7a;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid #2a3a44;
  }
}

// loading 动画
.tr-spin {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1px solid $dim;
  border-top-color: $accent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

// 子节点层级线
.tr-children {
  border-left: 1px solid rgba($accent, 0.15);
  margin-left: 14px;
  animation: tr-slide 0.15s ease;
}
// ── PROFILE MODAL ──
.modal-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1100;
}

.profile-modal {
  position: relative;
  width: 540px;
  background: rgba(4, 8, 20, 0.98);
  border: 1px solid rgba($accent, 0.3);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.9);
  animation: modal-in 0.2s ease;

  &::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, $accent, transparent);
  }
}

.pm-corner {
  position: absolute; width: 16px; height: 16px; z-index: 2;
  &.pm-tl { top: 4px; left: 4px; border-top: 2px solid $accent; border-left: 2px solid $accent; }
  &.pm-tr { top: 4px; right: 4px; border-top: 2px solid $accent; border-right: 2px solid $accent; }
  &.pm-bl { bottom: 4px; left: 4px; border-bottom: 2px solid $accent; border-left: 2px solid $accent; }
  &.pm-br { bottom: 4px; right: 4px; border-bottom: 2px solid $accent; border-right: 2px solid $accent; }
}

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

.pm-header {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid $border;
  background: rgba(0,0,0,0.5);
  .pm-title {
    display: flex; align-items: center; gap: 8px;
    font-family: $display; font-size: 11px; letter-spacing: 2px; color: $accent; font-weight: 600;
    .pm-icon { font-size: 13px; }
  }
  .pm-close {
    margin-left: auto; background: transparent; border: 1px solid $border;
    border-radius: 2px; color: $dim; font-size: 12px; width: 24px; height: 24px;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    &:hover { border-color: $red; color: $red; }
  }
}

.pm-body { padding: 18px; display: flex; flex-direction: column; gap: 18px; }

.pm-identity { display: flex; gap: 18px; align-items: flex-start; }

.pm-avatar-wrap {
  position: relative; flex-shrink: 0;
  .pm-avatar {
    width: 90px; height: 90px; object-fit: cover; border-radius: 2px;
    border: 1px solid rgba($accent, 0.4);
    filter: brightness(0.9) saturate(0.8);
  }
  .pm-avatar-scan {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba($accent, 0.12) 50%, transparent 100%);
    animation: scan-move 2s ease-in-out infinite;
    pointer-events: none;
  }
}

.pm-info-list {
  flex: 1; display: flex; flex-direction: column; gap: 6px;
}
.pi-row {
  display: flex; gap: 12px; align-items: baseline;
  .pi-label { font-family: $mono; font-size: 9px; letter-spacing: 1.5px; color: $dim; width: 120px; flex-shrink: 0; }
  .pi-value { font-family: $mono; font-size: 11px; color: $text; letter-spacing: 0.5px; }
}

.pm-tabs { }
.pt-header {
  display: flex; gap: 0;
  border-bottom: 1px solid $border;
  margin-bottom: 12px;
  .pt-btn {
    background: transparent; border: none; border-bottom: 2px solid transparent;
    padding: 6px 16px; font-family: $mono; font-size: 9px; letter-spacing: 2px;
    color: $dim; cursor: pointer; transition: all 0.12s;
    margin-bottom: -1px;
    &.active { color: $accent; border-bottom-color: $accent; }
    &:hover:not(.active) { color: $text; }
  }
}

.traj-list { display: flex; flex-direction: column; gap: 0; }
.traj-item {
  display: flex; gap: 12px;
  .ti-node {
    display: flex; flex-direction: column; align-items: center;
    .ti-dot { width: 8px; height: 8px; border-radius: 50%; background: $accent; box-shadow: 0 0 6px $accent; flex-shrink: 0; margin-top: 2px; }
    .ti-line { flex: 1; width: 1px; background: rgba($accent, 0.2); margin-top: 4px; min-height: 18px; }
  }
  .ti-info { display: flex; flex-direction: column; gap: 2px; padding-bottom: 14px;
    .ti-time { font-family: $mono; font-size: 9px; color: $accent; letter-spacing: 1px; }
    .ti-loc { font-family: $mono; font-size: 10px; color: $text; letter-spacing: 0.5px; }
  }
}

.assoc-list { display: flex; flex-direction: column; gap: 8px; }
.assoc-item {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 12px; border: 1px solid $border; border-radius: 2px;
  background: rgba(0,0,0,0.3);
  .ai-avatar { width: 32px; height: 32px; border-radius: 2px; background: rgba($accent, 0.08); border: 1px solid rgba($accent, 0.2); }
  .ai-info { flex: 1;
    .ai-name { font-family: $mono; font-size: 11px; color: $text; letter-spacing: 0.5px; }
    .ai-tag { font-family: $mono; font-size: 8px; color: $dim; letter-spacing: 1px; margin-top: 2px; }
  }
  .ai-conf { font-family: $mono; font-size: 9px; letter-spacing: 1px; color: $accent2; border: 1px solid rgba($accent2, 0.3); padding: 2px 8px; border-radius: 2px; }
}

.pm-footer {
  padding: 14px 18px; border-top: 1px solid $border;
  display: flex; gap: 10px; justify-content: flex-end;
  background: rgba(0,0,0,0.4);
  .pm-btn {
    font-family: $mono; font-size: 10px; letter-spacing: 1.5px;
    padding: 8px 20px; border-radius: 2px; cursor: pointer; transition: all 0.15s;
    &.primary {
      background: rgba($accent, 0.1); border: 1px solid rgba($accent, 0.5); color: $accent;
      &:hover { background: rgba($accent, 0.18); box-shadow: 0 0 12px rgba($accent, 0.2); }
    }
    &.ghost {
      background: transparent; border: 1px solid $border; color: $dim;
      &:hover { border-color: rgba($text, 0.3); color: $text; }
    }
  }
}

// ── Animations ──
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 3px $accent2; }
  50% { box-shadow: 0 0 8px $accent2, 0 0 14px rgba($accent2, 0.4); }
}
@keyframes blink-rec {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes icon-pulse {
  0%, 100% { text-shadow: 0 0 8px $accent; }
  50% { text-shadow: 0 0 20px $accent, 0 0 40px rgba($accent, 0.4); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes scan-move {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
@keyframes tr-slide {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>