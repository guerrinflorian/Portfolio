<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - cercles sonar s'étendant depuis la base de l'arbre, pulsation de vie
</script>

<template>
  <div class="sonar-origin" aria-hidden="true">
    <div class="sonar-ring sonar-ring--a" />
    <div class="sonar-ring sonar-ring--b" />
    <div class="sonar-ring sonar-ring--c" />
  </div>
</template>

<style scoped>
/* Centre exactement sur la base de l'arbre (baseY = pHeight - 65px) */
.sonar-origin {
  position: fixed;
  left: 50%;
  bottom: 65px;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 3;
}

.sonar-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  width: 8px;
  height: 4px;
  /* Centrer sur l'origine */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  animation: sonarPulse 5s ease-out infinite;
}

.sonar-ring--b { animation-delay: -1.66s; }
.sonar-ring--c { animation-delay: -3.33s; }

@keyframes sonarPulse {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.55;
  }
  100% {
    transform: translate(-50%, -50%) scaleX(55) scaleY(30);
    opacity: 0;
  }
}
</style>
