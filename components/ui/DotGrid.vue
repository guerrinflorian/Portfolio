<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - grille de points style graph paper, texture technique de fond
</script>

<template>
  <div class="dot-grid" aria-hidden="true" />
</template>

<style scoped>
.dot-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background-image: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.14) 1px,
    transparent 1px
  );
  background-size: 28px 28px;
}
</style>
