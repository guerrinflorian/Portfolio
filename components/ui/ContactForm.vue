<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - formulaire de contact (Formspree)

import { ref, reactive } from 'vue'

// ─── TODO FLORIAN : remplacer par votre ID Formspree réel ────────────────────
const FORMSPREE_URL = 'https://formspree.io/f/VOTRE_ID_FORMSPREE'

// ─── État du formulaire ───────────────────────────────────────────────────────

interface FormData {
  nom: string
  email: string
  societe: string
  message: string
}

const mFormData = reactive<FormData>({
  nom: '',
  email: '',
  societe: '',
  message: '',
})

const mEnvoi = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const mErreurMessage = ref('')

// ─── Validation ───────────────────────────────────────────────────────────────

function validerFormulaire(): string | null {
  if (!mFormData.nom.trim()) return 'Le nom est requis.'
  if (!mFormData.email.trim()) return 'L\'email est requis.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mFormData.email)) return 'Email invalide.'
  if (!mFormData.message.trim()) return 'Le message est requis.'
  if (mFormData.message.trim().length < 10) return 'Message trop court (min. 10 caractères).'
  return null
}

// ─── Soumission ───────────────────────────────────────────────────────────────

async function soumettre(): Promise<void> {
  const lErreur = validerFormulaire()
  if (lErreur) {
    mErreurMessage.value = lErreur
    return
  }

  mErreurMessage.value = ''
  mEnvoi.value = 'loading'

  try {
    const lReponse = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        nom: mFormData.nom,
        email: mFormData.email,
        societe: mFormData.societe,
        message: mFormData.message,
      }),
    })

    if (lReponse.ok) {
      mEnvoi.value = 'success'
      // Réinitialisation
      mFormData.nom = ''
      mFormData.email = ''
      mFormData.societe = ''
      mFormData.message = ''
    } else {
      throw new Error(`Erreur serveur : ${lReponse.status}`)
    }
  } catch (lErreur: unknown) {
    mEnvoi.value = 'error'
    mErreurMessage.value =
      lErreur instanceof Error ? lErreur.message : 'Une erreur est survenue. Réessayez.'
  }
}
</script>

<template>
  <div class="contact-form">
    <!-- Succès -->
    <div
      v-if="mEnvoi === 'success'"
      class="success-message"
      role="alert"
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" class="mx-auto mb-3">
        <circle cx="20" cy="20" r="20" fill="#10b981" opacity="0.15"/>
        <path d="M12 20l6 6 10-12" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p class="font-semibold text-center" style="color: var(--modal-text)">
        Message envoyé !
      </p>
      <p class="text-sm text-center opacity-70 mt-1" style="color: var(--modal-text)">
        Je vous répondrai sous 48h.
      </p>
    </div>

    <!-- Formulaire -->
    <form
      v-else
      @submit.prevent="soumettre"
      class="flex flex-col gap-4"
      novalidate
    >
      <!-- Nom -->
      <div class="form-group">
        <label for="contact-nom" class="form-label">
          Nom <span class="text-red-500" aria-label="requis">*</span>
        </label>
        <input
          id="contact-nom"
          v-model="mFormData.nom"
          type="text"
          class="form-input"
          autocomplete="name"
          :disabled="mEnvoi === 'loading'"
          placeholder="Votre nom"
          required
        />
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="contact-email" class="form-label">
          Email <span class="text-red-500" aria-label="requis">*</span>
        </label>
        <input
          id="contact-email"
          v-model="mFormData.email"
          type="email"
          class="form-input"
          autocomplete="email"
          :disabled="mEnvoi === 'loading'"
          placeholder="votre@email.com"
          required
        />
      </div>

      <!-- Société / Contexte -->
      <div class="form-group">
        <label for="contact-societe" class="form-label">
          Société / Contexte
        </label>
        <input
          id="contact-societe"
          v-model="mFormData.societe"
          type="text"
          class="form-input"
          autocomplete="organization"
          :disabled="mEnvoi === 'loading'"
          placeholder="Entreprise, cabinet de recrutement..."
        />
      </div>

      <!-- Message -->
      <div class="form-group">
        <label for="contact-message" class="form-label">
          Message <span class="text-red-500" aria-label="requis">*</span>
        </label>
        <textarea
          id="contact-message"
          v-model="mFormData.message"
          class="form-textarea"
          rows="4"
          :disabled="mEnvoi === 'loading'"
          placeholder="Votre message..."
          required
        />
      </div>

      <!-- Message d'erreur -->
      <p v-if="mErreurMessage" class="text-sm text-red-500" role="alert">
        {{ mErreurMessage }}
      </p>

      <!-- Bouton -->
      <button
        type="submit"
        class="form-submit"
        :disabled="mEnvoi === 'loading'"
      >
        <span v-if="mEnvoi === 'loading'">Envoi en cours…</span>
        <span v-else>Envoyer</span>
      </button>
    </form>
  </div>
</template>

<style scoped>
.success-message {
  padding: 2rem;
  text-align: center;
}

.form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
