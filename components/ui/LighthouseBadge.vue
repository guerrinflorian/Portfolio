<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - badge Lighthouse 4 scores réutilisable

import { useLocale } from '~/composables/useLocale'

const { t } = useLocale()

interface Score {
  label: string
  value: number
  color: string
  dash: number   // stroke-dashoffset pour cercle r=13, circonférence=81.7
}

// Circonférence = 2 * π * 13 ≈ 81.7
// dashoffset = 81.7 * (1 - score/100)
const mScores: Score[] = [
  { label: t('Perf.', 'Perf.'),        value: 96,  color: '#22c55e', dash: 81.7 * 0.04 },
  { label: t('Access.', 'A11y'),        value: 100, color: '#22c55e', dash: 0           },
  { label: t('Pratiques', 'Practices'), value: 100, color: '#22c55e', dash: 0           },
  { label: 'SEO',                       value: 100, color: '#22c55e', dash: 0           },
]
</script>

<template>
  <div
    class="lh-badge"
    :title="t('Score Lighthouse mesuré sur Google PageSpeed Insights', 'Score measured on Google PageSpeed Insights')"
  >
    <div class="lh-scores">
      <div v-for="lS in mScores" :key="lS.label" class="lh-score-item">
        <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="13" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="3" />
          <circle
            cx="22" cy="22" r="13"
            fill="none"
            :stroke="lS.color"
            stroke-width="3"
            stroke-linecap="round"
            :stroke-dasharray="81.7"
            :stroke-dashoffset="lS.dash"
            transform="rotate(-90 22 22)"
          />
          <text x="22" y="26" text-anchor="middle" font-size="9" font-weight="700" :fill="lS.color" font-family="monospace">{{ lS.value }}</text>
        </svg>
        <span class="lh-score-label">{{ lS.label }}</span>
      </div>
    </div>
    <div class="lh-right">
      <span class="lh-title">Lighthouse</span>
      <span class="lh-desc">{{ t('malgré animations, avions temps réel, canvas étoiles', 'despite animations, live planes & star canvas') }}</span>
    </div>
  </div>
</template>

<style scoped>
.lh-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 10px;
  cursor: default;
}

.lh-scores {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.lh-score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.lh-score-label {
  font-size: 0.58rem;
  color: rgba(255, 255, 255, 0.4);
  font-family: var(--font-mono, monospace);
  white-space: nowrap;
}

.lh-right {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.lh-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #22c55e;
  letter-spacing: 0.04em;
}

.lh-desc {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.4;
}
</style>
