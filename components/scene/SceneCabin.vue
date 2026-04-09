<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - cabane interactive ouvrant le mini-jeu (desktop uniquement)

import { useModalStore } from '~/stores/modal'
import { useLocale } from '~/composables/useLocale'

const modal  = useModalStore()
const { t }  = useLocale()
</script>

<template>
  <div
    class="cabin-wrapper"
    role="button"
    tabindex="0"
    :aria-label="t('Ouvrir le mini-jeu', 'Open mini-game')"
    @click="modal.open('minijeu')"
    @keydown.enter="modal.open('minijeu')"
    @keydown.space.prevent="modal.open('minijeu')"
  >
    <!-- Cabane SVG -->
    <svg width="88" height="96" viewBox="0 0 88 96" fill="none" xmlns="http://www.w3.org/2000/svg" class="cabin-svg">
      <!-- Cheminée -->
      <rect x="58" y="10" width="10" height="22" fill="#4a3020" rx="1"/>
      <rect x="55" y="8" width="16" height="5" fill="#3a2010" rx="1"/>
      <!-- Fumée -->
      <circle cx="63" cy="5" r="2.5" fill="rgba(200,200,200,0.5)"/>
      <circle cx="66" cy="2" r="1.8" fill="rgba(200,200,200,0.35)"/>

      <!-- Toit -->
      <polygon points="44,4 86,38 2,38" fill="#5c3d1e"/>
      <polygon points="44,4 86,38 2,38" fill="none" stroke="#3d2a0e" stroke-width="1.5"/>
      <!-- Liseré toit -->
      <line x1="2" y1="38" x2="86" y2="38" stroke="#3d2a0e" stroke-width="2"/>

      <!-- Murs -->
      <rect x="6" y="37" width="76" height="56" fill="#9b6b45" rx="2"/>
      <rect x="6" y="37" width="76" height="56" fill="none" stroke="#7a4f2e" stroke-width="1.5" rx="2"/>

      <!-- Planches horizontales (texture bois) -->
      <line x1="6" y1="51" x2="82" y2="51" stroke="#7a4f2e" stroke-width="0.8" opacity="0.5"/>
      <line x1="6" y1="64" x2="82" y2="64" stroke="#7a4f2e" stroke-width="0.8" opacity="0.5"/>
      <line x1="6" y1="77" x2="82" y2="77" stroke="#7a4f2e" stroke-width="0.8" opacity="0.5"/>

      <!-- Fenêtre gauche -->
      <rect x="12" y="44" width="22" height="16" fill="#b8dff0" rx="2"/>
      <rect x="12" y="44" width="22" height="16" fill="none" stroke="#7a4f2e" stroke-width="1.5" rx="2"/>
      <line x1="23" y1="44" x2="23" y2="60" stroke="#7a4f2e" stroke-width="1"/>
      <line x1="12" y1="52" x2="34" y2="52" stroke="#7a4f2e" stroke-width="1"/>

      <!-- Enseigne / panneau -->
      <rect x="28" y="43" width="32" height="14" fill="#d4a853" rx="3"/>
      <rect x="28" y="43" width="32" height="14" fill="none" stroke="#b8882e" stroke-width="1" rx="3"/>
      <text x="44" y="53.5" text-anchor="middle" font-size="8" fill="#3d2a0e" font-family="monospace" font-weight="700">&gt;_</text>

      <!-- Porte -->
      <rect x="34" y="66" width="20" height="27" fill="#5c3d1e" rx="2"/>
      <rect x="34" y="66" width="20" height="27" fill="none" stroke="#3d2a0e" stroke-width="1.5" rx="2"/>
      <!-- Arc porte -->
      <path d="M34,72 Q44,62 54,72" fill="#4a3020" stroke="#3d2a0e" stroke-width="1"/>
      <!-- Poignée -->
      <circle cx="51" cy="80" r="2.2" fill="#d4a853"/>
    </svg>

    <!-- Hint au survol -->
    <div class="cabin-hint">
      <span>{{ t('Jouer !', 'Play!') }}</span>
    </div>
  </div>
</template>

<style scoped>
.cabin-wrapper {
  position: fixed;
  bottom: 45px;
  right: 14%;
  z-index: 5;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  transition: transform 0.15s ease;
  user-select: none;
}

/* Desktop uniquement */
@media (max-width: 900px) {
  .cabin-wrapper { display: none; }
}

@media (max-height: 499px) {
  .cabin-wrapper { bottom: 20px; }
}

.cabin-wrapper:hover {
  transform: translateY(-4px);
}

.cabin-wrapper:hover .cabin-svg {
  filter: drop-shadow(0 4px 12px rgba(92, 61, 30, 0.5));
}

.cabin-hint {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  font-size: 0.68rem;
  font-weight: 700;
  color: white;
  background: rgba(30, 64, 175, 0.85);
  padding: 0.18rem 0.55rem;
  border-radius: 99px;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  white-space: nowrap;
  pointer-events: none;
}

.cabin-wrapper:hover .cabin-hint {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
