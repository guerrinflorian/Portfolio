<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Modale - Profil personnel

import { computed, ref, watch, nextTick, onUnmounted } from 'vue'
import ModalBase from './ModalBase.vue'
import { useModalStore } from '~/stores/modal'
import { useLocale } from '~/composables/useLocale'

const mStore = useModalStore()
const mOuverte = computed({
  get: () => mStore.activeModal === 'profil',
  set: (lVal) => { if (!lVal) mStore.close() },
})

const { t } = useLocale()

// Calcul dynamique de l'age depuis la date de naissance
const mAge = computed(() => {
  const lNaissance = new Date(2002, 9, 8) // 08/10/2002
  const lAuj = new Date()
  let lAge = lAuj.getFullYear() - lNaissance.getFullYear()
  const lM = lAuj.getMonth() - lNaissance.getMonth()
  if (lM < 0 || (lM === 0 && lAuj.getDate() < lNaissance.getDate())) lAge--
  return lAge
})

// ─── Carte Leaflet ────────────────────────────────────────────────────────────

const mMapContainer = ref<HTMLElement | null>(null)
let mLeafletMap: any = null

async function initMap(): Promise<void> {
  if (!mMapContainer.value || mLeafletMap) return

  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  // Fix icones Leaflet avec Vite (les assets ne sont pas résolus automatiquement)
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  // Tressange / Bure - Moselle (57710)
  const LAT = 49.362
  const LNG = 5.934

  mLeafletMap = L.map(mMapContainer.value, {
    center:             [LAT, LNG],
    zoom:               14,
    zoomControl:        false,
    scrollWheelZoom:    false,
    dragging:           false,
    touchZoom:          false,
    doubleClickZoom:    false,
    attributionControl: true,
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    subdomains:  'abcd',
    maxZoom:     20,
  }).addTo(mLeafletMap)

  const lIcon = L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:#3b82f6;border:3px solid white;
      box-shadow:0 2px 10px rgba(59,130,246,0.55);
    "></div>`,
    iconSize:   [14, 14],
    iconAnchor: [7, 7],
  })

  L.marker([LAT, LNG], { icon: lIcon })
    .addTo(mLeafletMap)
    .bindPopup(
      `<strong>Tressange · Moselle</strong><br><span style="font-size:0.78rem;color:#666">${t('5 min du Luxembourg', '5 min from Luxembourg')}</span>`,
      { closeButton: false }
    )
    .openPopup()
}

watch(mOuverte, async (lVal) => {
  if (lVal) {
    await nextTick()
    await initMap()
  } else {
    mLeafletMap?.remove()
    mLeafletMap = null
  }
})

onUnmounted(() => {
  mLeafletMap?.remove()
})
</script>

<template>
  <ModalBase v-model="mOuverte" :title="t('Florian Guerrin', 'Florian Guerrin')">
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
          {{ t(`${mAge} ans · Tressange, Moselle`, `${mAge} · Tressange, Moselle, France`) }}
        </p>
        <p class="text-xs opacity-50 mt-0.5 flex items-center gap-1" style="color: var(--modal-text)">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M6 1a4 4 0 014 4c0 2.8-4 6.5-4 6.5S2 7.8 2 5a4 4 0 014-4zm0 2a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd"/>
          </svg>
          {{ t('Frontière luxembourgeoise · 5 min du Grand-Duché', 'Luxembourg border · 5 min from the Grand Duchy') }}
        </p>
        <div class="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
          {{ t('Ouvert aux opportunités Moselle / Luxembourg', 'Open to opportunities in Moselle / Luxembourg') }}
        </div>
      </div>
    </div>

    <!-- Intro conviviale -->
    <div class="intro-block mb-5">
      <p class="text-sm leading-relaxed" style="color: var(--modal-text)">
        {{
          t(
            'Bonjour, je m\'appelle Florian. J\'habite à Tressange en Moselle, à cinq minutes de la frontière luxembourgeoise. D\'ailleurs, le petit indicateur météo en haut à droite affiche la température qu\'il fait chez moi en ce moment.',
            'Hi, my name is Florian. I live in Tressange, Moselle, five minutes from the Luxembourg border. By the way, the small weather indicator in the top right shows the current temperature where I live.'
          )
        }}
      </p>
    </div>

    <!-- Accroche pro -->
    <div class="mb-5">
      <p class="text-sm leading-relaxed opacity-85" style="color: var(--modal-text)">
        {{
          t(
            'Je m\'intéresse au développement depuis mes débuts et cette curiosité ne s\'est jamais arrêtée. J\'aime comprendre le fonctionnement des systèmes en profondeur et je cherche toujours à progresser. Je suis attentif aux évolutions du métier : je teste régulièrement de nouvelles technologies et j\'expérimente sur des projets personnels.',
            'I\'ve been interested in development since the very beginning and that curiosity has never stopped. I enjoy understanding how systems work in depth and I\'m always looking to improve. I stay close to what\'s happening in the field: I regularly try out new technologies and experiment through personal projects.'
          )
        }}
      </p>
    </div>

    <!-- Carte localisation -->
    <div ref="mMapContainer" class="map-container" aria-hidden="true" />

    <div class="separator" />

    <!-- Grille infos -->
    <div class="profil-grid mt-4">
      <!-- Langues -->
      <div>
        <h3 class="section-label">{{ t('Langues', 'Languages') }}</h3>
        <div class="space-y-1.5 text-sm" style="color: var(--modal-text)">
          <div><span class="opacity-80">{{ t('Français', 'French') }}</span> <span class="opacity-40 text-xs">{{ t('Natif', 'Native') }}</span></div>
          <div><span class="opacity-80">{{ t('Anglais', 'English') }}</span> <span class="opacity-40 text-xs">B2</span></div>
          <div><span class="opacity-80">{{ t('Allemand', 'German') }}</span> <span class="opacity-40 text-xs">B1</span></div>
        </div>
      </div>

      <!-- Contact rapide -->
      <div class="contact-col">
        <h3 class="section-label">Contact</h3>
        <div class="space-y-1 text-xs opacity-75 contact-info" style="color: var(--modal-text)">
          <p>guerrinflorian@yahoo.com</p>
          <p>06 95 38 01 57</p>
        </div>
      </div>

      <!-- Liens -->
      <div>
        <h3 class="section-label">{{ t('Profils', 'Profiles') }}</h3>
        <div class="space-y-1 text-xs" style="color: var(--modal-text)">
          <a href="https://github.com/guerrinflorian" target="_blank" rel="noopener" class="profile-link">GitHub</a>
          <a href="https://linkedin.com/in/florian-guerrin-43a138295" target="_blank" rel="noopener" class="profile-link">LinkedIn</a>
        </div>
      </div>
    </div>
  </ModalBase>
</template>

<style scoped>
.intro-block {
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.06);
  border-left: 2px solid rgba(59, 130, 246, 0.35);
  border-radius: 0 6px 6px 0;
  opacity: 0.9;
}

.avatar-photo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
}

.map-container {
  height: 155px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 1px solid var(--modal-header-border);
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

.profil-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 480px) {
  .profil-grid {
    grid-template-columns: 1fr 1fr;
  }

  .contact-col {
    grid-column: 1 / -1;
  }
}

.contact-info p {
  word-break: break-all;
  overflow-wrap: anywhere;
}

.profile-link {
  display: block;
  font-size: 0.78rem;
  color: #3b82f6;
  text-decoration: none;
  opacity: 0.85;
  word-break: break-all;
  overflow-wrap: anywhere;
}

.profile-link:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>
