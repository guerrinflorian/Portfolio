<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - fragments de vrai code du projet dérivant lentement dans le fond

// Extraits réels du projet (arbre, météo, SQL, Vue)
interface CodeSnippet {
  text: string
  x: number    // % depuis la gauche
  y: number    // % depuis le haut
  speed: number  // durée animation (s)
  delay: number  // délai (s)
  opacity: number
}

const mSnippets: CodeSnippet[] = [
  { text: 'const app = createApp(App)',            x:  3, y:  8, speed: 22, delay:  0, opacity: 0.065 },
  { text: 'SELECT * FROM cmdrail.orders',          x: 68, y: 14, speed: 28, delay:  4, opacity: 0.055 },
  { text: 'v-if="isLoaded" :key="nodeId"',         x: 15, y: 42, speed: 18, delay:  8, opacity: 0.06  },
  { text: 'useWeather()',                          x: 82, y: 28, speed: 30, delay:  2, opacity: 0.07  },
  { text: 'const { windState } = useTreePhysics()',x:  5, y: 68, speed: 24, delay: 11, opacity: 0.05  },
  { text: 'gsap.timeline().to(panel, { opacity: 1 })', x: 55, y:  6, speed: 26, delay:  6, opacity: 0.06 },
  { text: 'EXEC sp_GetCommandesRail @statut = N\'EN_COURS\'', x: 72, y: 55, speed: 20, delay: 14, opacity: 0.05 },
  { text: 'computed(() => weatherStore.windSpeed)', x: 28, y: 22, speed: 32, delay:  1, opacity: 0.065 },
  { text: 'defineProps<{ modelValue: boolean }>()', x: 10, y: 82, speed: 19, delay: 16, opacity: 0.055 },
  { text: 'watch(() => store.state, syncScene)',    x: 80, y: 75, speed: 27, delay:  9, opacity: 0.06  },
  { text: 'makeNode(0, angle, length, 1.0, rng)',  x: 42, y: 88, speed: 23, delay:  5, opacity: 0.05  },
  { text: '@click.prevent="modal.open(\'profil\')"', x: 60, y: 42, speed: 25, delay: 12, opacity: 0.065 },
]
</script>

<template>
  <div class="floating-code-layer" aria-hidden="true">
    <span
      v-for="(lSnippet, lIndex) in mSnippets"
      :key="lIndex"
      class="code-snippet"
      :style="{
        left:              `${lSnippet.x}%`,
        top:               `${lSnippet.y}%`,
        opacity:           lSnippet.opacity,
        animationDuration: `${lSnippet.speed}s`,
        animationDelay:    `-${lSnippet.delay}s`,
      }"
    >{{ lSnippet.text }}</span>
  </div>
</template>

<style scoped>
.floating-code-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
}

.code-snippet {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 1);
  white-space: nowrap;
  animation: codeDrift linear infinite;
  will-change: transform;
}

@keyframes codeDrift {
  0%   { transform: translateY(0) translateX(0); }
  25%  { transform: translateY(-18px) translateX(4px); }
  50%  { transform: translateY(-8px) translateX(-3px); }
  75%  { transform: translateY(-22px) translateX(5px); }
  100% { transform: translateY(0) translateX(0); }
}

@media (max-width: 639px) {
  .code-snippet {
    font-size: 0.58rem;
  }
}
</style>
