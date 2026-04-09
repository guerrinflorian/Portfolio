<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Modale - Contact

import { computed } from 'vue'
import ModalBase from './ModalBase.vue'
import { useModalStore } from '~/stores/modal'
import { useLocale } from '~/composables/useLocale'

const mStore = useModalStore()
const mOuverte = computed({
  get: () => mStore.activeModal === 'contact',
  set: (lVal) => { if (!lVal) mStore.close() },
})

const { t } = useLocale()

// ─── Liens réels ──────────────────────────────────────────────────────────────

const GITHUB_URL   = 'https://github.com/guerrinflorian'
const LINKEDIN_URL = 'https://linkedin.com/in/florian-guerrin-43a138295'
const EMAIL        = 'guerrinflorian@yahoo.com'
const PHONE        = '06 95 38 01 57'
</script>

<template>
  <ModalBase v-model="mOuverte" title="Contact">
    <!-- Intro -->
    <div class="mb-5">
      <p class="text-sm leading-relaxed opacity-80" style="color: var(--modal-text)">
        {{
          t(
            'Disponible pour des opportunités côté Moselle ou Luxembourg.',
            'Open to opportunities in Moselle or Luxembourg.'
          )
        }}
      </p>
    </div>

    <!-- Liens directs -->
    <div class="contact-links mb-6">
      <!-- GitHub -->
      <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" class="contact-link" aria-label="Profil GitHub de Florian Guerrin">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.42 22 12c0-5.523-4.477-10-10-10z"/>
        </svg>
        <span>guerrinflorian</span>
      </a>

      <!-- LinkedIn -->
      <a :href="LINKEDIN_URL" target="_blank" rel="noopener noreferrer" class="contact-link" aria-label="Profil LinkedIn de Florian Guerrin">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        <span>Florian Guerrin</span>
      </a>

      <!-- Email -->
      <a :href="`mailto:${EMAIL}`" class="contact-link" :aria-label="`Envoyer un email à ${EMAIL}`">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        <span>{{ EMAIL }}</span>
      </a>

      <!-- Téléphone -->
      <a href="tel:+33695380157" class="contact-link" aria-label="Appeler Florian Guerrin">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82 19.79 19.79 0 01.06 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        </svg>
        <span>{{ PHONE }}</span>
      </a>
    </div>

    <!-- Localisation -->
    <p class="mt-5 text-xs opacity-45 text-center" style="color: var(--modal-text)">
      {{ t('Bure / Tressange · Moselle · 57710 · Frontière Luxembourg', 'Bure / Tressange · Moselle · France · Luxembourg border') }}
    </p>
  </ModalBase>
</template>

<style scoped>
.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.8rem;
  border: 1px solid var(--modal-border);
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--modal-text);
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
  opacity: 0.85;
}

.contact-link:hover {
  opacity: 1;
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-1px);
}
</style>
