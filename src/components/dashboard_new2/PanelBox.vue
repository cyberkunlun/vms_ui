<script setup lang="ts">
defineProps<{
  title?: string
  badge?: string | number
  noPadding?: boolean
}>()
</script>

<template>
  <div class="panel-box">
    <div class="panel-header" v-if="title">
      <div class="panel-title-wrap">
        <span class="panel-knot"></span>
        <span class="panel-title">{{ title }}</span>
      </div>
      <div class="panel-badge" v-if="badge !== undefined">{{ badge }}</div>
      <slot name="action" />
    </div>
    <div class="panel-body" :class="{ 'no-padding': noPadding }">
      <slot />
    </div>
    <span class="corner tl"></span>
    <span class="corner tr"></span>
    <span class="corner bl"></span>
    <span class="corner br"></span>
    <span class="scanline"></span>
  </div>
</template>

<style scoped lang="scss">
.panel-box {
  --frame-border: rgba(97, 151, 255, 0.28);
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--frame-border);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(7, 17, 40, 0.92), rgba(5, 12, 31, 0.96)),
    radial-gradient(circle at top, rgba(77, 139, 255, 0.12), transparent 40%);
  box-shadow:
    inset 0 0 26px rgba(47, 108, 255, 0.08),
    0 0 0 1px rgba(145, 194, 255, 0.06),
    0 16px 40px rgba(0, 0, 0, 0.32);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, transparent, rgba(109, 163, 255, 0.05), transparent),
      linear-gradient(transparent 0, rgba(109, 163, 255, 0.04) 50%, transparent 100%);
    pointer-events: none;
  }
}

.panel-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px 8px;
  border-bottom: 1px solid rgba(103, 170, 255, 0.16);
  background: linear-gradient(90deg, rgba(47, 108, 255, 0.16), rgba(47, 108, 255, 0.02) 70%);
}

.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-knot {
  width: 9px;
  height: 9px;
  border: 1px solid rgba(178, 219, 255, 0.8);
  transform: rotate(45deg);
  box-shadow: 0 0 14px rgba(120, 177, 255, 0.55);
  background: rgba(90, 150, 255, 0.18);
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #edf5ff;
  text-transform: uppercase;
}

.panel-badge {
  font-size: 11px;
  color: #8fd2ff;
  padding: 2px 10px;
  border: 1px solid rgba(143, 210, 255, 0.28);
  border-radius: 10px;
  background: rgba(71, 175, 255, 0.08);
  font-family: 'Consolas', monospace;
  letter-spacing: 0.08em;
}

.panel-body {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 10px 12px 10px;
  overflow: hidden;
  min-height: 0;

  &.no-padding {
    padding: 0;
  }
}

.corner {
  position: absolute;
  width: 14px;
  height: 14px;
  pointer-events: none;
  border-color: rgba(118, 177, 255, 0.65);
  z-index: 2;

  &.tl {
    top: 0; left: 0;
    border-top: 1px solid;
    border-left: 1px solid;
  }
  &.tr {
    top: 0; right: 0;
    border-top: 1px solid;
    border-right: 1px solid;
  }
  &.bl {
    bottom: 0; left: 0;
    border-bottom: 1px solid;
    border-left: 1px solid;
  }
  &.br {
    bottom: 0; right: 0;
    border-bottom: 1px solid;
    border-right: 1px solid;
  }
}

.scanline {
  position: absolute;
  top: 0;
  left: -20%;
  width: 30%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(174, 227, 255, 0.9), transparent);
  box-shadow: 0 0 16px rgba(136, 199, 255, 0.9);
  animation: glide 7s linear infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes glide {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  10%, 80% {
    opacity: 1;
  }
  100% {
    transform: translateX(430%);
    opacity: 0;
  }
}
</style>
