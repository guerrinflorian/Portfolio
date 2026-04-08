<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - raccourcis clavier affichés + gestion navigation modale

import { ref, onMounted, onUnmounted } from 'vue'
import { useModalStore } from '~/stores/modal'
import type { ModalId } from '~/types/modal'

const mStore   = useModalStore()
const mVisible = ref(false)

// ─── Définition des raccourcis ────────────────────────────────────────────────

interface Shortcut {
  key: string
  label: string
  modal: ModalId
}

const mShortcuts: Shortcut[] = [
  { key: 'P', label: 'Profil',      modal: 'profil'     },
  { key: 'E', label: 'Expérience',  modal: 'experience' },
  { key: 'D', label: 'Diplômes',    modal: 'diplomes'   },
  { key: 'S', label: 'Stack',       modal: 'stack'      },
  { key: 'J', label: 'Projets',     modal: 'projets'    },
  { key: 'C', label: 'Contact',     modal: 'contact'    },
]

// ─── Gestionnaire clavier ─────────────────────────────────────────────────────

function mOnKeydown(e: KeyboardEvent): void {
  // Ne pas intercepter si l'utilisateur tape dans un champ
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  // Ignorer si une modale est ouverte (Escape géré par ModalBase)
  if (mStore.activeModal !== null) return
  // Pas de modificateurs
  if (e.ctrlKey || e.altKey || e.metaKey) return

  const lKey = e.key.toUpperCase()

  if (lKey === '?') {
    mVisible.value = !mVisible.value
    return
  }

  const lShortcut = mShortcuts.find(lS => lS.key === lKey)
  if (lShortcut) {
    e.preventDefault()
    mStore.open(lShortcut.modal)
    mVisible.value = false
  }
}

// ─── Affichage initial bref ───────────────────────────────────────────────────

let mTimer: ReturnType<typeof setTimeout> | null = null
let mTimerInner: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  document.addEventListener('keydown', mOnKeydown)

  // Apparaît brièvement après le chargement de la scène
  mTimer = setTimeout(() => {
    mVisible.value = true
    mTimerInner = setTimeout(() => { mVisible.value = false }, 4500)
  }, 4000)
})

onUnmounted(() => {
  document.removeEventListener('keydown', mOnKeydown)
  if (mTimer) clearTimeout(mTimer)
  if (mTimerInner) clearTimeout(mTimerInner)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="kb-fade">
      <div
        v-if="mVisible"
        class="kb-bar"
        role="status"
        aria-label="Raccourcis clavier disponibles"
      >
        <span class="kb-prefix">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <rect x="1" y="2" width="8" height="6" rx="1"/>
            <path d="M3 5h4M5 3v4"/>
          </svg>
          kbd
        </span>

        <template v-for="(lS, lIdx) in mShortcuts" :key="lS.key">
          <span v-if="lIdx > 0" class="kb-sep" aria-hidden="true">·</span>
          <button
            class="kb-shortcut"
            @click="mStore.open(lS.modal); mVisible = false"
            :aria-label="`Ouvrir ${lS.label}`"
          >
            <kbd class="kb-key">{{ lS.key }}</kbd>
            <span class="kb-label">{{ lS.label }}</span>
          </button>
        </template>

        <span class="kb-sep" aria-hidden="true">·</span>
        <span class="kb-hint">? pour revoir</span>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.kb-bar {
  position: fixed;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 99px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  pointer-events: all;
  user-select: none;
}

.kb-prefix {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0.45;
  font-size: 0.62rem;
  margin-right: 0.2rem;
}

.kb-sep {
  opacity: 0.25;
}

.kb-shortcut {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  transition: color 0.15s;
}

.kb-shortcut:hover {
  color: rgba(255, 255, 255, 0.95);
}

.kb-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1;
}

.kb-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.65rem;
}

.kb-hint {
  opacity: 0.3;
  font-size: 0.62rem;
  font-style: italic;
}

/* ─── Transition ─────────────────────────────────────────────────────────────── */

.kb-fade-enter-active,
.kb-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.kb-fade-enter-from,
.kb-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
}

/* ─── Mobile : masqué (pas de clavier) ──────────────────────────────────────── */

@media (max-width: 639px) {
  .kb-bar { display: none; }
}
</style>
