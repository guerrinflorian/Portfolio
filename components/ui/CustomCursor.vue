<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Curseur personnalisé — mix-blend-mode: exclusion (toujours visible sur tout fond)
// Position via manipulation DOM directe pour fluidité maximale (0 lag Vue)

import { ref, onMounted, onUnmounted } from 'vue'

const mRootRef  = ref<HTMLElement | null>(null)
const mVisible  = ref(false)
const mHover    = ref(false)
const mClicking = ref(false)

// ─── Position : DOM direct, pas de réactivité Vue ─────────────────────────────

let mLastTarget: EventTarget | null = null

function mOnMove(e: MouseEvent): void {
  if (mRootRef.value) {
    mRootRef.value.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
  }
  if (!mVisible.value) mVisible.value = true

  // Réinitialise le click si le bouton a été relâché hors fenêtre
  if (e.buttons === 0 && mClicking.value) mClicking.value = false

  // Détection hover — recalcul uniquement si la cible change
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
  document.addEventListener('mousemove',  mOnMove)
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
      style="transform: translate(-200px, -200px)"
      aria-hidden="true"
    >
      <!-- Anneau externe -->
      <div class="cursor-ring" />
      <!-- Point central -->
      <div class="cursor-dot" />
    </div>
  </Teleport>
</template>

<style scoped>
/*
  mix-blend-mode: exclusion → formule : A + B - 2AB
  Pour blanc (A=1) : résultat = 1 - B (complément du fond)
  Résultat : toujours contrasté, quelle que soit la couleur du fond.
*/
.cursor-root {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 99999;
  will-change: transform;
  mix-blend-mode: exclusion;
  /* Pas de transition sur transform — suivi immédiat de la souris */
}

.cursor-root--hidden .cursor-dot,
.cursor-root--hidden .cursor-ring {
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* ─── Anneau ─────────────────────────────────────────────────────────────────── */

.cursor-ring {
  position: absolute;
  width: 36px;
  height: 36px;
  border: 1.5px solid #ffffff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width        0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
    height       0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.2s ease,
    border-width 0.2s ease,
    opacity      0.2s ease;
}

/* ─── Point central ──────────────────────────────────────────────────────────── */

.cursor-dot {
  position: absolute;
  width: 5px;
  height: 5px;
  background: #ffffff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width  0.15s ease,
    height 0.15s ease,
    opacity 0.2s ease;
}

/* ─── Hover : anneau élargi avec ressort (cubic-bezier springy) ──────────────── */

.cursor-root--hover .cursor-ring {
  width: 52px;
  height: 52px;
  border-width: 1px;
}

.cursor-root--hover .cursor-dot {
  width: 3px;
  height: 3px;
}

/* ─── Click : anneau compressé et point disparu ──────────────────────────────── */

.cursor-root--clicking .cursor-ring {
  width: 18px;
  height: 18px;
  border-width: 2.5px;
  transition:
    width  0.1s ease,
    height 0.1s ease,
    border-width 0.1s ease;
}

.cursor-root--clicking .cursor-dot {
  width: 2px;
  height: 2px;
  transition: width 0.1s ease, height 0.1s ease;
}

/* ─── Tactile : masqué ───────────────────────────────────────────────────────── */

@media (pointer: coarse) {
  .cursor-root { display: none; }
}
</style>
