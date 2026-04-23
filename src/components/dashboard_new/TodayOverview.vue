<script setup lang="ts">
defineProps<{
  total?: number
  resolved?: number
  unresolved?: number
}>()

const stats = [
  { label: 'Total Incidents', key: 'total', defaultVal: 128, tone: 'neutral' },
  { label: 'Resolved', key: 'resolved', defaultVal: 92, tone: 'green' },
  { label: 'Unresolved', key: 'unresolved', defaultVal: 36, tone: 'red' }
]
</script>

<template>
  <div class="overview">
    <div class="head">
      <span class="knot"></span>
      <span class="title">TODAY'S OVERVIEW</span>
    </div>
    <div class="items">
      <div class="card">
        <span class="lbl">Total Incidents</span>
        <strong class="val">{{ total ?? 128 }}</strong>
        <em class="delta">13</em>
      </div>
      <div class="card">
        <span class="lbl"><span class="dot green"></span>Resolved</span>
        <strong class="val green">{{ resolved ?? 92 }}</strong>
        <em class="delta">13</em>
      </div>
      <div class="card">
        <span class="lbl"><span class="dot red"></span>Unresolved</span>
        <strong class="val red">{{ unresolved ?? 36 }}</strong>
        <em class="delta">13</em>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.overview {
  padding: 10px 12px;
  border: 1px solid rgba(108, 161, 255, 0.22);
  border-radius: 10px;
  background: rgba(5, 12, 29, 0.72);
  backdrop-filter: blur(8px);
  box-shadow: inset 0 0 20px rgba(47, 108, 255, 0.06);
}

.head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  .knot {
    width: 8px;
    height: 8px;
    border: 1px solid rgba(178, 219, 255, 0.8);
    transform: rotate(45deg);
    background: rgba(90, 150, 255, 0.18);
    box-shadow: 0 0 10px rgba(120, 177, 255, 0.55);
  }
  .title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: #edf5ff;
  }
}

.items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: baseline;
  padding: 6px 10px;
  background: rgba(7, 14, 31, 0.5);
  border: 1px solid rgba(100, 152, 255, 0.12);
  border-radius: 8px;
  .lbl {
    font-size: 11px;
    color: rgba(201, 222, 255, 0.76);
    letter-spacing: 0.05em;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .val {
    font-size: 20px;
    font-weight: 600;
    color: #f3f7ff;
    font-family: 'Consolas', monospace;
    &.green { color: #76e0a1; }
    &.red { color: #ff808c; }
  }
  .delta {
    font-style: normal;
    font-size: 10px;
    color: rgba(182, 214, 255, 0.58);
  }
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  &.green { background: #76e0a1; box-shadow: 0 0 6px #76e0a1; }
  &.red { background: #ff808c; box-shadow: 0 0 6px #ff808c; }
}
</style>
