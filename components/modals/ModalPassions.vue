<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Modale - Passions et centres d'intérêt

import { computed } from 'vue'
import ModalBase from './ModalBase.vue'
import { useModalStore } from '~/stores/modal'

const mStore = useModalStore()
const mOuverte = computed({
  get: () => mStore.activeModal === 'passions',
  set: (lVal) => { if (!lVal) mStore.close() },
})
</script>

<template>
  <ModalBase v-model="mOuverte" title="Ce qui m'anime">
    <div class="passions-layout">

      <!-- Tennis -->
      <section class="passion-section">
        <div class="passion-header">
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true" class="passion-icon">
            <circle cx="16" cy="16" r="13" stroke="#f59e0b" stroke-width="1.8" fill="#f59e0b" fill-opacity="0.1"/>
            <path d="M5 16 Q10 8 16 16 Q22 24 27 16" stroke="#f59e0b" stroke-width="1.5" fill="none"/>
            <path d="M5 16 Q10 24 16 16 Q22 8 27 16" stroke="#f59e0b" stroke-width="1.5" fill="none"/>
          </svg>
          <div>
            <h3 class="passion-title">Tennis</h3>
            <p class="passion-meta">3 ans et demi · pratique actuelle</p>
          </div>
        </div>
        <p class="passion-text">
          Mon sport actuel. Ce qui m'attire : la dimension mentale et stratégique.
          Chaque échange est un jeu de décisions sous pression - pas si différent du code.
        </p>
      </section>

      <div class="passion-divider" aria-hidden="true" />

      <!-- Sports passés -->
      <section class="passion-section">
        <div class="passion-header">
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true" class="passion-icon">
            <circle cx="16" cy="16" r="13" stroke="#3b82f6" stroke-width="1.8" fill="#3b82f6" fill-opacity="0.1"/>
            <path d="M10 22 L16 8 L22 22 M12 18 h8" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div>
            <h3 class="passion-title">Parcours sportif</h3>
            <p class="passion-meta">Football · Judo · Ping-pong</p>
          </div>
        </div>
        <p class="passion-text">
          Football pendant 8 ans jusqu'à 15 ans - l'apprentissage du collectif.
          Judo 1 an et demi en enfance - la rigueur et la chute maîtrisée.
          Tennis de table 1 an - la précision et la réactivité.
        </p>
      </section>

      <div class="passion-divider" aria-hidden="true" />

      <!-- Jeux vidéo -->
      <section class="passion-section">
        <div class="passion-header">
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true" class="passion-icon">
            <rect x="4" y="9" width="24" height="14" rx="3" stroke="#6366f1" stroke-width="1.8" fill="#6366f1" fill-opacity="0.1"/>
            <path d="M11 16h4M13 14v4M20 15h2M20 17h2" stroke="#6366f1" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <div>
            <h3 class="passion-title">Jeux vidéo</h3>
            <p class="passion-meta">RPG · Strategy · Tycoon</p>
          </div>
        </div>
        <p class="passion-text">
          Les jeux qui cachent une mécanique propre sous un vernis accessible -
          RPG, tycoons, systèmes de progression. J'aime disséquer comment les boucles
          de gameplay sont conçues, c'est de la conception logicielle par un autre nom.
        </p>
      </section>

      <div class="passion-divider" aria-hidden="true" />

      <!-- Auto-hébergement & infrastructure -->
      <section class="passion-section">
        <div class="passion-header">
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true" class="passion-icon">
            <rect x="4" y="5" width="24" height="7" rx="2" stroke="#10b981" stroke-width="1.8" fill="#10b981" fill-opacity="0.1"/>
            <rect x="4" y="15" width="24" height="7" rx="2" stroke="#10b981" stroke-width="1.8" fill="#10b981" fill-opacity="0.1"/>
            <circle cx="22" cy="8.5" r="1.5" fill="#10b981"/>
            <circle cx="22" cy="18.5" r="1.5" fill="#10b981"/>
          </svg>
          <div>
            <h3 class="passion-title">Auto-hébergement</h3>
            <p class="passion-meta">VPS · Docker · Monitoring</p>
          </div>
        </div>
        <p class="passion-text">
          Zéro service cloud externe, tout tourne chez moi.
          VPS OVH dockerisé, accès VPN WireGuard, Prometheus + Grafana pour tout surveiller.
          La satisfaction de maîtriser toute la chaîne, du hardware au DNS.
        </p>
      </section>

    </div>
  </ModalBase>
</template>

<style scoped>
.passions-layout {
  display: flex;
  flex-direction: column;
}

.passion-section {
  padding: 0.25rem 0;
}

.passion-header {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  margin-bottom: 0.6rem;
}

.passion-icon { flex-shrink: 0; }

.passion-title {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--modal-text);
  line-height: 1.2;
}

.passion-meta {
  font-size: 0.72rem;
  opacity: 0.45;
  color: var(--modal-text);
  margin-top: 0.1rem;
}

.passion-text {
  font-size: 0.875rem;
  line-height: 1.7;
  opacity: 0.78;
  color: var(--modal-text);
  padding-left: 2.75rem;
}

.passion-divider {
  height: 1px;
  background: var(--modal-header-border);
  margin: 1rem 0;
}
</style>
