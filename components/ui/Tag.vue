<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - badge coloré réutilisable

type TagVariant = 'default' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan'

const mProps = defineProps<{
  label: string
  variant?: TagVariant
  small?: boolean
}>()

// Mapping variant → classes Tailwind
const mVariantClasses: Record<TagVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
}

const mVariant = mProps.variant ?? 'default'
</script>

<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-full',
      small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs',
      mVariantClasses[mVariant],
    ]"
  >
    {{ label }}
  </span>
</template>
