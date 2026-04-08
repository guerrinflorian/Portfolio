<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - lumière ambiante CSS selon heure et météo

import { computed } from 'vue'
import { useSceneStore } from '~/stores/scene'
import { useWeatherStore } from '~/stores/weather'

const mSceneStore = useSceneStore()
const mWeatherStore = useWeatherStore()

/**
 * Style de la couche lumineuse ambiante.
 * Applique une teinte colorée sur toute la scène selon l'heure.
 */
const mLightStyle = computed(() => ({
  backgroundColor: mSceneStore.theme.ambientLight,
  transition: 'background-color 3s ease',
}))

/**
 * Indique si on est la nuit pour l'effet de vignette sombre.
 */
const mEstNuit = computed(
  () => !mWeatherStore.isDay || mWeatherStore.timeOfDay === 'night'
)
</script>

<template>
  <div aria-hidden="true" class="scene-lighting">
    <!-- Lumière ambiante colorée -->
    <div class="ambient-light" :style="mLightStyle" />

    <!-- Vignette nocturne -->
    <div v-if="mEstNuit" class="night-vignette" />
  </div>
</template>

<style scoped>
.scene-lighting {
  position: fixed;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.ambient-light {
  position: absolute;
  inset: 0;
  mix-blend-mode: screen;
}

.night-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 40%,
    rgba(0, 0, 20, 0.4) 100%
  );
  animation: fadeIn 3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
