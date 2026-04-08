<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Modale - Profil personnel

import { computed } from 'vue'
import ModalBase from './ModalBase.vue'
import { useModalStore } from '~/stores/modal'

const mStore = useModalStore()
const mOuverte = computed({
  get: () => mStore.activeModal === 'profil',
  set: (lVal) => { if (!lVal) mStore.close() },
})
</script>

<template>
  <ModalBase v-model="mOuverte" title="Florian Guerrin">
    <!-- Avatar photo + intro -->
    <div class="flex items-start gap-5 mb-6">
      <img
        src="~/assets/images/moi/moi.jpg"
        alt="Photo de profil - Florian Guerrin"
        class="avatar-photo flex-shrink-0"
      />

      <div class="flex-1">
        <p class="font-semibold text-base opacity-90" style="color: var(--modal-text)">
          Full-Stack Developer
        </p>
        <p class="text-sm opacity-55 mt-0.5" style="color: var(--modal-text)">
          23 ans · Tressange, Moselle (57710)
        </p>
        <p class="text-xs opacity-50 mt-0.5 flex items-center gap-1" style="color: var(--modal-text)">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M6 1a4 4 0 014 4c0 2.8-4 6.5-4 6.5S2 7.8 2 5a4 4 0 014-4zm0 2a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd"/>
          </svg>
          Frontière luxembourgeoise · 5 min du Grand-Duché
        </p>
        <div class="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
          Ouvert aux opportunités Moselle / Luxembourg
        </div>
      </div>
    </div>

    <!-- Accroche -->
    <div class="mb-5 space-y-2.5">
      <p class="text-sm leading-relaxed opacity-85" style="color: var(--modal-text)">
        Passionné par la <strong>conception logicielle</strong> et l'usage productif de l'IA.
        Curieux par nature, je trouve toujours une solution - même quand je ne connais pas encore la réponse.
      </p>
    </div>

    <div class="separator" />

    <!-- Grille infos -->
    <div class="grid grid-cols-3 gap-4 mt-4">
      <!-- Langues -->
      <div>
        <h3 class="section-label">Langues</h3>
        <div class="space-y-1.5 text-sm" style="color: var(--modal-text)">
          <div><span class="opacity-80">Français</span> <span class="opacity-40 text-xs">Natif</span></div>
          <div><span class="opacity-80">Anglais</span> <span class="opacity-40 text-xs">B2</span></div>
          <div><span class="opacity-80">Allemand</span> <span class="opacity-40 text-xs">B1</span></div>
        </div>
      </div>

      <!-- Contact rapide -->
      <div>
        <h3 class="section-label">Contact</h3>
        <div class="space-y-1 text-xs opacity-75" style="color: var(--modal-text)">
          <p>guerrinflorian@yahoo.com</p>
          <p>06 95 38 01 57</p>
        </div>
      </div>

      <!-- Liens -->
      <div>
        <h3 class="section-label">Profils</h3>
        <div class="space-y-1 text-xs" style="color: var(--modal-text)">
          <a href="https://github.com/guerrinflorian" target="_blank" rel="noopener" class="profile-link">GitHub</a>
          <a href="https://linkedin.com/in/florian-guerrin-43a138295" target="_blank" rel="noopener" class="profile-link">LinkedIn</a>
        </div>
      </div>
    </div>
  </ModalBase>
</template>

<style scoped>
.avatar-photo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
}

.separator {
  height: 1px;
  background: var(--modal-header-border);
  margin: 0.25rem 0;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.45;
  margin-bottom: 0.5rem;
  color: var(--modal-text);
}

.profile-link {
  display: block;
  font-size: 0.78rem;
  color: #3b82f6;
  text-decoration: none;
  opacity: 0.85;
}

.profile-link:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>
