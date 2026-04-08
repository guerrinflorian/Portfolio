<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - noeud interactif sur l'arbre (rendu CSS, pas canvas)
// Note : ce composant est utilisé comme référence de données.
// Le rendu réel des noeuds se fait dans TreeCanvas.vue pour la synchronisation avec le canvas.

import type { TreeNodeConfig } from '~/types/tree'

defineProps<{
  config: TreeNodeConfig
  x: number
  y: number
  isHovered: boolean
}>()

defineEmits<{
  click: [id: string]
  hover: [id: string | null]
}>()
</script>

<template>
  <!-- Ce composant sert de documentation des props des noeuds -->
  <!-- Le rendu réel est effectué directement dans le canvas de TreeCanvas.vue -->
  <div
    class="tree-node-css"
    :style="{
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: `${config.radius * 2}px`,
      height: `${config.radius * 2}px`,
      borderRadius: '50%',
      backgroundColor: config.color,
      border: '2px solid rgba(255,255,255,0.85)',
      cursor: 'pointer',
      zIndex: 5,
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      transform: isHovered
        ? 'translate(-50%, -50%) scale(1.4)'
        : 'translate(-50%, -50%) scale(1)',
      boxShadow: isHovered
        ? `0 0 0 6px ${config.color}40, 0 4px 12px rgba(0,0,0,0.3)`
        : `0 2px 6px rgba(0,0,0,0.25)`,
    }"
    :aria-label="config.label"
    role="button"
    :tabindex="0"
    @click="$emit('click', config.id)"
    @mouseenter="$emit('hover', config.id)"
    @mouseleave="$emit('hover', null)"
    @keydown.enter="$emit('click', config.id)"
  />
</template>
