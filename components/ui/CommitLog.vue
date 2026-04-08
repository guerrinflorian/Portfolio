<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - journal de commits fictifs défilant en coin, ambiance terminal

import { ref, computed, onMounted, onUnmounted } from 'vue'

// Commits inspirés des vrais changements du projet
const COMMITS = [
  { type: 'feat',     msg: 'add new feature' },
  { type: 'fix',      msg: 'fix bug' },
  { type: 'feat',     msg: 'update component' },
  { type: 'refactor', msg: 'refactor code' },
  { type: 'feat',     msg: 'add animation' },
  { type: 'chore',    msg: 'update deps' },
  { type: 'fix',      msg: 'fix issue' },
  { type: 'perf',     msg: 'optimize' },
  { type: 'feat',     msg: 'add transition' },
  { type: 'feat',     msg: 'add effect' },
  { type: 'fix',      msg: 'fix render' },
  { type: 'chore',    msg: 'cleanup' },
]

const TYPE_COLORS: Record<string, string> = {
  feat:     '#22d3ee',
  fix:      '#f87171',
  refactor: '#c084fc',
  chore:    '#9ca3af',
  perf:     '#fbbf24',
  docs:     '#6b7280',
}

// Index courant et état de visibilité
const mCurrentIndex = ref(0)
const mVisible      = ref(true)

let mTimerId: ReturnType<typeof setInterval> | null = null

function nextCommit(): void {
  // Masquer → délai → afficher le suivant
  mVisible.value = false
  setTimeout(() => {
    mCurrentIndex.value = (mCurrentIndex.value + 1) % COMMITS.length
    mVisible.value = true
  }, 600)
}

const mCurrentCommit = computed(() => COMMITS[mCurrentIndex.value]!)

onMounted(() => {
  // Cycle toutes les 4 secondes
  mTimerId = setInterval(nextCommit, 4000)
})

onUnmounted(() => {
  if (mTimerId !== null) clearInterval(mTimerId)
})
</script>

<template>
  <div class="commit-log" aria-hidden="true">
    <Transition name="commit-fade">
      <div v-if="mVisible" :key="mCurrentIndex" class="commit-entry">
        <span class="commit-hash">{{ (mCurrentIndex * 7 + 0xf3a21).toString(16).slice(0, 7) }}</span>
        <span
          class="commit-type"
          :style="{ color: TYPE_COLORS[mCurrentCommit.type] ?? '#9ca3af' }"
        >{{ mCurrentCommit.type }}</span>
        <span class="commit-msg">{{ mCurrentCommit.msg }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.commit-log {
  position: fixed;
  top: 1.35rem;
  left: 1.35rem;
  z-index: 10;
  pointer-events: none;
  user-select: none;
  min-width: 240px;
}

.commit-entry {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.7rem;
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  white-space: nowrap;
}

.commit-hash {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.65rem;
}

.commit-type {
  font-weight: 700;
  font-size: 0.68rem;
}

.commit-msg {
  color: rgba(255, 255, 255, 0.65);
}

/* ─── Responsive ─────────────────────────────────────────────────────────────── */

@media (max-width: 639px) {
  .commit-log {
    display: none;
  }
}

/* Tablette : réduire la largeur minimale */
@media (max-width: 900px) {
  .commit-log {
    top: 0.85rem;
    left: 0.85rem;
    min-width: 180px;
  }
}

/* Transition fondu */
.commit-fade-enter-active,
.commit-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.commit-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.commit-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
