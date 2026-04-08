<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - ligne de timeline verticale

import Tag from './Tag.vue'

interface TimelineItem {
  id: string
  title: string
  subtitle: string
  period: string
  location?: string
  tags?: string[]
  points?: string[]
  description?: string
  url?: string
}

defineProps<{
  items: TimelineItem[]
}>()
</script>

<template>
  <div class="timeline-container">
    <!-- Ligne verticale -->
    <div class="timeline-line" aria-hidden="true" />

    <!-- Entrées -->
    <div
      v-for="lItem in items"
      :key="lItem.id"
      class="timeline-item"
    >
      <!-- Point sur la ligne -->
      <div class="timeline-dot" aria-hidden="true" />

      <!-- Contenu -->
      <div class="timeline-content">
        <!-- En-tête -->
        <div class="mb-1.5">
          <h3 class="font-bold text-base leading-tight" style="color: var(--modal-text)">
            <a
              v-if="lItem.url"
              :href="lItem.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-500 hover:underline transition-colors"
            >
              {{ lItem.title }}
            </a>
            <span v-else>{{ lItem.title }}</span>
          </h3>
          <p class="text-sm font-semibold opacity-75" style="color: var(--modal-text)">
            {{ lItem.subtitle }}
          </p>
          <a
            v-if="lItem.url"
            :href="lItem.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-blue-500 hover:underline transition-colors mt-1 inline-block"
          >
            {{ lItem.url }}
          </a>
        </div>

        <!-- Période & lieu -->
        <div class="flex flex-wrap gap-3 text-xs opacity-60 mb-2.5" style="color: var(--modal-text)">
          <span class="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <path d="M6 1a4 4 0 100 8A4 4 0 006 1zm0 1.5A2.5 2.5 0 116 8.5 2.5 2.5 0 016 2.5z"/>
              <path d="M6 5.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V6A.75.75 0 016 5.25zM6 3.5a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
            </svg>
            {{ lItem.period }}
          </span>
          <span v-if="lItem.location" class="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M6 1a4 4 0 014 4c0 2.8-4 6.5-4 6.5S2 7.8 2 5a4 4 0 014-4zm0 2a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd"/>
            </svg>
            {{ lItem.location }}
          </span>
        </div>

        <!-- Description courte -->
        <p v-if="lItem.description" class="text-sm opacity-80 mb-3 leading-relaxed" style="color: var(--modal-text)">
          {{ lItem.description }}
        </p>

        <!-- Points clés -->
        <ul v-if="lItem.points?.length" class="space-y-1 mb-3">
          <li
            v-for="(lPoint, lIndex) in lItem.points"
            :key="lIndex"
            class="flex items-start gap-2 text-sm opacity-80"
            style="color: var(--modal-text)"
          >
            <span class="text-blue-500 mt-0.5 flex-shrink-0" aria-hidden="true">•</span>
            {{ lPoint }}
          </li>
        </ul>

        <!-- Tags -->
        <div v-if="lItem.tags?.length" class="flex flex-wrap gap-1.5">
          <Tag
            v-for="lTag in lItem.tags"
            :key="lTag"
            :label="lTag"
            variant="blue"
            small
          />
        </div>
      </div>
    </div>
  </div>
</template>
