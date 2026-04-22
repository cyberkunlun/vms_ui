<script setup lang="ts">
import { computed } from 'vue'
import type { FamilyGraphMember } from '../data/mockRetrieval'

const props = withDefaults(
  defineProps<{
    centerName: string
    centerIdMask: string
    members: FamilyGraphMember[]
    maskIdentity: boolean
  }>(),
  {
    members: () => []
  }
)

const w = 360
const h = 220
const cx = 180
const cy = 108
const rCenter = 36
const rSat = 28
const ringR = 82

const nodes = computed(() => {
  const m = props.members
  const n = Math.max(m.length, 1)
  return m.map((mem, k) => {
    const a = (2 * Math.PI) / n - Math.PI / 2 + (2 * Math.PI * k) / n
    const x = cx + ringR * Math.cos(a)
    const y = cy + ringR * Math.sin(a)
    return { ...mem, x, y, a }
  })
})

const lines = computed(() => nodes.value.map((n) => ({ x1: cx, y1: cy, x2: n.x, y2: n.y })))

const showName = (t: string) => (props.maskIdentity ? '****' : t)
</script>

<template>
  <div class="fam-graph">
    <svg
      class="fam-svg"
      :viewBox="`0 0 ${w} ${h}`"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Family relationship map"
    >
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color: rgba(56, 189, 248, 0.1)" />
          <stop offset="100%" style="stop-color: rgba(56, 189, 248, 0.55)" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g v-for="(ln, i) in lines" :key="'ln-' + i">
        <line
          :x1="ln.x1"
          :y1="ln.y1"
          :x2="ln.x2"
          :y2="ln.y2"
          stroke="url(#lineGrad)"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </g>
      <g filter="url(#glow)">
        <circle :cx="cx" :cy="cy" :r="rCenter" class="node-circle node-center" />
        <text :x="cx" :y="cy - 6" text-anchor="middle" class="node-cap">Subject</text>
        <text :x="cx" :y="cy + 8" text-anchor="middle" class="node-name">{{ showName(centerName) }}</text>
        <text :x="cx" :y="cy + 22" text-anchor="middle" class="node-id">{{ showName(centerIdMask) }}</text>
      </g>
      <g v-for="n in nodes" :key="n.id">
        <circle :cx="n.x" :cy="n.y" :r="rSat" class="node-circle node-sat" />
        <text :x="n.x" :y="n.y - 8" text-anchor="middle" class="node-rel">{{ n.relation }}</text>
        <text :x="n.x" :y="n.y + 5" text-anchor="middle" class="node-name small">{{ showName(n.name) }}</text>
        <text :x="n.x" :y="n.y + 19" text-anchor="middle" class="node-id small">{{ showName(n.idMask) }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped lang="scss">
.fam-graph {
  width: 100%;
  border-radius: 16px;
  background: rgba(10, 15, 30, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.12);
  padding: 8px 4px 4px;
  overflow: hidden;
}
.fam-svg {
  width: 100%;
  height: auto;
  min-height: 200px;
  max-height: 240px;
  display: block;
}
.node-circle {
  fill: rgba(15, 23, 42, 0.85);
  stroke: rgba(56, 189, 248, 0.35);
  stroke-width: 1.2;
}
.node-center {
  stroke: rgba(56, 189, 248, 0.65);
  filter: drop-shadow(0 0 10px rgba(14, 165, 233, 0.25));
}
.node-sat {
  stroke: rgba(148, 163, 184, 0.25);
}
.node-cap,
.node-rel {
  fill: #64748b;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}
.node-name {
  fill: #f1f5f9;
  font-size: 10px;
  font-weight: 600;
  &.small {
    font-size: 9px;
  }
}
.node-id {
  fill: #94a3b8;
  font-size: 8px;
  font-family: ui-monospace, monospace;
  &.small {
    font-size: 7px;
  }
}
</style>
