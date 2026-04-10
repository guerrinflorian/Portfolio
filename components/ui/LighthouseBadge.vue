<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - badge Lighthouse score réutilisable

import { useLocale } from '~/composables/useLocale'

const { t } = useLocale()
</script>

<template>
  <div
    class="lh-badge"
    :title="t('Score Lighthouse mesuré sur Google PageSpeed Insights', 'Score measured on Google PageSpeed Insights')"
  >
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" class="lh-circle">
      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3" />
      <circle
        cx="18" cy="18" r="15"
        fill="none"
        stroke="#22c55e"
        stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray="94.2"
        stroke-dashoffset="5.7"
        transform="rotate(-90 18 18)"
      />
      <text x="18" y="22" text-anchor="middle" font-size="9" font-weight="700" fill="#22c55e" font-family="monospace">96</text>
    </svg>
    <div class="lh-info">
      <span class="lh-label">Lighthouse</span>
      <span class="lh-desc">{{ t('Performance · malgré les animations, avions temps réel et canvas étoiles', 'Performance · despite animations, live planes & star canvas') }}</span>
    </div>
  </div>
</template>

<style scoped>
.lh-badge {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1rem;
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 10px;
  cursor: default;
}

.lh-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.lh-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #22c55e;
  letter-spacing: 0.04em;
}

.lh-desc {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.4;
}
</style>
