<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - bouton FR / EN, coin haut droit

import { useLocale } from '~/composables/useLocale'

const { locale, toggleLocale } = useLocale()
</script>

<template>
  <button
    class="lang-toggle"
    :aria-label="locale === 'fr' ? 'Switch to English' : 'Passer en français'"
    @click="toggleLocale"
  >
    <span :class="['lang-opt', { 'lang-opt--active': locale === 'fr' }]">FR</span>
    <span class="lang-sep" aria-hidden="true">|</span>
    <span :class="['lang-opt', { 'lang-opt--active': locale === 'en' }]">EN</span>
  </button>
</template>

<style scoped>
.lang-toggle {
  position: fixed;
  top: 3.5rem;
  right: 1.25rem;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.65rem;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 99px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.lang-toggle:hover {
  border-color: rgba(96, 165, 250, 0.45);
  background: rgba(0, 0, 0, 0.5);
}

.lang-opt {
  color: rgba(255, 255, 255, 0.3);
  transition: color 0.2s ease;
}

.lang-opt--active {
  color: rgba(255, 255, 255, 0.9);
}

.lang-sep {
  color: rgba(255, 255, 255, 0.15);
  font-weight: 400;
}

@media (max-width: 900px) {
  .lang-toggle {
    top: 3.2rem;
    right: 0.85rem;
  }
}

@media (max-width: 639px) {
  .lang-toggle {
    top: 3rem;
    right: 0.65rem;
  }
}
</style>
