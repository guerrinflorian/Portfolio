<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Curseur personnalisé — réticule 4 coins, translate3d GPU, sans mix-blend-mode

import { ref, onMounted, onUnmounted } from 'vue'

const mRootRef  = ref<HTMLElement | null>(null)
const mVisible  = ref(false)
const mHover    = ref(false)
const mClicking = ref(false)

let mLastTarget: EventTarget | null = null

function mOnMove(e: MouseEvent): void {
  if (mRootRef.value) {
    // translate3d force la couche GPU — 0 lag de composition
    mRootRef.value.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`
  }
  if (!mVisible.value) mVisible.value = true
  if (e.buttons === 0 && mClicking.value) mClicking.value = false

  if (e.target !== mLastTarget) {
    mLastTarget = e.target
    const lTarget = e.target as HTMLElement
    mHover.value = !!lTarget?.closest(
      'button, a, [role="button"], input, textarea, select, label, [tabindex="0"]'
    )
  }
}

function mOnLeave(): void  { mVisible.value  = false }
function mOnEnter(): void  { mVisible.value  = true  }
function mOnDown(): void   { mClicking.value = true  }
function mOnUp(): void     { mClicking.value = false }

onMounted(() => {
  document.addEventListener('mousemove',  mOnMove,  { passive: true })
  document.addEventListener('mouseleave', mOnLeave)
  document.addEventListener('mouseenter', mOnEnter)
  document.addEventListener('mousedown',  mOnDown)
  document.addEventListener('mouseup',    mOnUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove',  mOnMove)
  document.removeEventListener('mouseleave', mOnLeave)
  document.removeEventListener('mouseenter', mOnEnter)
  document.removeEventListener('mousedown',  mOnDown)
  document.removeEventListener('mouseup',    mOnUp)
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="mRootRef"
      class="cursor-root"
      :class="{
        'cursor-root--hidden':   !mVisible,
        'cursor-root--hover':    mHover && !mClicking,
        'cursor-root--clicking': mClicking,
      }"
      style="transform: translate3d(-200px,-200px,0)"
      aria-hidden="true"
    >
      <!-- Coin haut-gauche -->
      <div class="cursor-corner cursor-tl" />
      <!-- Coin haut-droit -->
      <div class="cursor-corner cursor-tr" />
      <!-- Coin bas-gauche -->
      <div class="cursor-corner cursor-bl" />
      <!-- Coin bas-droit -->
      <div class="cursor-corner cursor-br" />
      <!-- Point central -->
      <div class="cursor-dot" />
    </div>
  </Teleport>
</template>

<style scoped>
/* Origine = position exacte du curseur (div 0×0) */
.cursor-root {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 99999;
  will-change: transform;
  /* Pas de mix-blend-mode — pas de recomposition GPU */
}

/* ─── Masqué ─────────────────────────────────────────────────────────────────── */

.cursor-root--hidden .cursor-corner,
.cursor-root--hidden .cursor-dot {
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* ─── Coins : L inversés ─────────────────────────────────────────────────────── */

.cursor-corner {
  position: absolute;
  width: 9px;
  height: 9px;
  border-color: rgba(255, 255, 255, 0.88);
  border-style: solid;
  transition:
    top    0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    left   0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    right  0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    bottom 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    border-color 0.18s ease,
    opacity 0.2s ease;
}

/* État normal : coins écartés à ±16px du centre */
.cursor-tl { top: -17px; left: -17px; border-width: 1.5px 0 0 1.5px; }
.cursor-tr { top: -17px; left:   8px; border-width: 1.5px 1.5px 0 0; }
.cursor-bl { top:   8px; left: -17px; border-width: 0 0 1.5px 1.5px; }
.cursor-br { top:   8px; left:   8px; border-width: 0 1.5px 1.5px 0; }

/* ─── Point central ──────────────────────────────────────────────────────────── */

.cursor-dot {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  top: -1.5px;
  left: -1.5px;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

/* ─── Hover : coins qui se referment + teinte bleue ─────────────────────────── */

.cursor-root--hover .cursor-tl { top: -11px; left: -11px; border-color: rgba(96, 165, 250, 0.95); }
.cursor-root--hover .cursor-tr { top: -11px; left:   2px; border-color: rgba(96, 165, 250, 0.95); }
.cursor-root--hover .cursor-bl { top:   2px; left: -11px; border-color: rgba(96, 165, 250, 0.95); }
.cursor-root--hover .cursor-br { top:   2px; left:   2px; border-color: rgba(96, 165, 250, 0.95); }

.cursor-root--hover .cursor-dot {
  background: rgba(96, 165, 250, 0.95);
}

/* ─── Click : coins très serrés + flash ─────────────────────────────────────── */

.cursor-root--clicking .cursor-tl { top: -6px; left: -6px; border-color: rgba(255, 255, 255, 1); }
.cursor-root--clicking .cursor-tr { top: -6px; left:  -3px; border-color: rgba(255, 255, 255, 1); }
.cursor-root--clicking .cursor-bl { top: -3px; left: -6px; border-color: rgba(255, 255, 255, 1); }
.cursor-root--clicking .cursor-br { top: -3px; left: -3px; border-color: rgba(255, 255, 255, 1); }

.cursor-root--clicking .cursor-corner {
  transition:
    top    0.08s ease,
    left   0.08s ease,
    border-color 0.08s ease;
}

.cursor-root--clicking .cursor-dot {
  transform: scale(1.8);
  background: white;
}

/* ─── Tactile : masqué ───────────────────────────────────────────────────────── */

@media (pointer: coarse) {
  .cursor-root { display: none; }
}
</style>
