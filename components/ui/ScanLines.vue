<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - effet de lignes de balayage CRT très subtil (texture d'écran)
</script>

<template>
  <div class="scan-lines" aria-hidden="true" />
</template>

<style scoped>
.scan-lines {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.022) 2px,
    rgba(0, 0, 0, 0.022) 4px
  );
}
</style>
