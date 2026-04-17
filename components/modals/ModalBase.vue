<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - modale générique animée GSAP avec focus trap et accessibilité

import { ref, onMounted, onUnmounted } from 'vue'

// ─── Props & Emits ────────────────────────────────────────────────────────────

const mProps = defineProps<{
  modelValue: boolean
  title: string
  /** Icône SVG inline (optionnelle) */
  icon?: string
}>()

const mEmits = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// ─── Refs DOM ─────────────────────────────────────────────────────────────────

const mOverlayRef        = ref<HTMLElement | null>(null)
const mPanelRef          = ref<HTMLElement | null>(null)
const mFirstFocusableRef = ref<HTMLButtonElement | null>(null)

// ─── API publique ─────────────────────────────────────────────────────────────

function scrollToTop(): void {
  if (mPanelRef.value) mPanelRef.value.scrollTop = 0
}

defineExpose({ scrollToTop })

// ─── Fermeture ────────────────────────────────────────────────────────────────

function close(): void {
  mEmits('update:modelValue', false)
}

function onEscape(pEvent: KeyboardEvent): void {
  if (pEvent.key === 'Escape') close()
}

// ─── Focus trap ───────────────────────────────────────────────────────────────

/**
 * Emprisonne le focus dans la modale pour l'accessibilité.
 */
function handleFocusTrap(pEvent: KeyboardEvent): void {
  if (!mPanelRef.value || pEvent.key !== 'Tab') return

  const lFocusables = mPanelRef.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  )

  const lFirst = lFocusables[0]
  const lLast  = lFocusables[lFocusables.length - 1]

  if (!lFirst || !lLast) return

  if (pEvent.shiftKey) {
    if (document.activeElement === lFirst) {
      pEvent.preventDefault()
      lLast.focus()
    }
  } else {
    if (document.activeElement === lLast) {
      pEvent.preventDefault()
      lFirst.focus()
    }
  }
}

// ─── Hooks de transition GSAP (pas de CSS, uniquement GSAP) ───────────────────

/**
 * Appelé par <Transition :css="false" @enter> - anime l'ouverture.
 */
async function onEnter(_el: Element, done: () => void): Promise<void> {
  if (!import.meta.client || !mOverlayRef.value || !mPanelRef.value) {
    done()
    return
  }

  const { gsap } = await import('gsap')

  // État initial + remise à zéro du scroll
  mPanelRef.value.scrollTop = 0
  gsap.set(mOverlayRef.value, { opacity: 0 })
  gsap.set(mPanelRef.value,   { opacity: 0, scale: 0.92, y: 8 })

  // Focus sur le bouton fermer après rendu
  mFirstFocusableRef.value?.focus()
  // Bloquer le scroll du body
  document.body.style.overflow = 'hidden'

  // Animation enchaînée
  const lTl = gsap.timeline({ onComplete: done })
  lTl
    .to(mOverlayRef.value, { opacity: 1, duration: 0.2 })
    .to(
      mPanelRef.value,
      { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      '-=0.1'
    )
}

/**
 * Appelé par <Transition :css="false" @leave> - anime la fermeture.
 */
async function onLeave(_el: Element, done: () => void): Promise<void> {
  if (!import.meta.client || !mOverlayRef.value || !mPanelRef.value) {
    document.body.style.overflow = ''
    done()
    return
  }

  const { gsap } = await import('gsap')

  const lTl = gsap.timeline({
    onComplete: () => {
      document.body.style.overflow = ''
      done()
    },
  })
  lTl
    .to(mPanelRef.value,   { opacity: 0, scale: 0.94, y: 4, duration: 0.2, ease: 'power2.in' })
    .to(mOverlayRef.value!, { opacity: 0, duration: 0.15 }, '-=0.1')
}

// ─── Cycle de vie ─────────────────────────────────────────────────────────────

onMounted(() => {
  window.addEventListener('keydown', onEscape)
  window.addEventListener('keydown', handleFocusTrap)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onEscape)
  window.removeEventListener('keydown', handleFocusTrap)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
      <div
        v-if="modelValue"
        ref="mOverlayRef"
        class="modal-overlay"
        @click.self="close"
        role="presentation"
      >
        <div
          ref="mPanelRef"
          class="modal-panel"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="`modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`"
        >
          <!-- En-tête -->
          <div class="modal-header">
            <div class="flex items-center gap-2.5">
              <!-- Icône optionnelle -->
              <span
                v-if="icon"
                class="text-xl"
                aria-hidden="true"
                v-html="icon"
              />
              <h2
                :id="`modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`"
                class="modal-header-title"
              >
                {{ title }}
              </h2>
            </div>

            <button
              ref="mFirstFocusableRef"
              class="modal-close-btn"
              @click="close"
              aria-label="Fermer la modale"
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- Corps - slot par défaut -->
          <div class="modal-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-header-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--modal-text);
}
</style>
