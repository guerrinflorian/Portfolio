<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Modale - Stack technique avec barres de compétence animées GSAP

import { computed, ref, watch, nextTick } from 'vue'
import ModalBase from './ModalBase.vue'
import { useModalStore } from '~/stores/modal'
import { useLocale } from '~/composables/useLocale'
import type { Skill, SkillCategory } from '~/types/modal'

const mStore = useModalStore()
const mOuverte = computed({
  get: () => mStore.activeModal === 'stack',
  set: (lVal) => { if (!lVal) mStore.close() },
})

const { t } = useLocale()

// ─── Données compétences ──────────────────────────────────────────────────────

const mCompetences = computed<Skill[]>(() => [
  // Frontend - tri decroissant
  { name: 'Vue 2',                  level: 95, category: 'front',   context: 'prod'   },
  { name: 'HTML / CSS',             level: 85, category: 'front',   context: 'prod'   },
  { name: 'DevExtreme',             level: 80, category: 'front',   context: 'prod'   },
  { name: 'Vue 3 / Pinia / Router', level: 75, category: 'front',   context: 'prod'   },
  { name: 'TypeScript',             level: 70, category: 'front',   context: 'prod'   },
  { name: 'React',                  level: 65, category: 'front',   context: 'projet' },
  { name: 'Angular',                level: 50, category: 'front',   context: 'projet' },
  { name: 'Tailwind CSS',           level: 50, category: 'front',   context: 'projet' },

  // Back & BDD - tri decroissant
  { name: 'Webservices REST',       level: 75, category: 'back',    context: 'prod'   },
  { name: 'Node.js / Fastify',      level: 65, category: 'back',    context: 'projet' },
  { name: 'SQL Server',             level: 60, category: 'back',    context: 'prod'   },
  { name: 'VB.NET / ASP.NET',       level: 50, category: 'back',    context: 'prod'   },
  { name: 'PostgreSQL',             level: 35, category: 'back',    context: 'projet' },
  { name: 'Testing / Vitest',       level: 35, category: 'back',    context: 'projet' },

  // DevOps & Outils - tri decroissant
  { name: 'GitHub / Git',           level: 60, category: 'outils',  context: 'prod'   },
  { name: 'TFS / TFVC',             level: 60, category: 'outils',  context: 'prod'   },
  { name: 'Docker / Compose',       level: 40, category: 'outils',  context: 'prod'   },
  { name: t('SEO / Réf. moteurs IA', 'SEO / AI Search'), level: 40, category: 'outils', context: 'projet' },
  { name: 'Linux / Nginx',          level: 30, category: 'outils',  context: 'prod'   },
  { name: 'WireGuard VPN',          level: 25, category: 'outils',  context: 'prod'   },

  // Creatif & divers - tri decroissant
  { name: 'Canvas API / GSAP',      level: 55, category: 'creatif', context: 'projet' },
  { name: 'Lua',                    level: 35, category: 'creatif', context: 'projet' },
  { name: 'Phaser.js',              level: 35, category: 'creatif', context: 'projet' },
  { name: 'Flutter',                level: 30, category: 'creatif', context: 'projet' },
  { name: 'Python (scripts)',       level: 30, category: 'creatif', context: 'projet' },

  // Methodo & Soft skills - tri decroissant
  { name: t('Autonomie & Initiative', 'Autonomy & Initiative'), level: 80, category: 'methodo', context: 'prod' },
  { name: t('Travail en equipe',      'Teamwork'),              level: 70, category: 'methodo', context: 'prod' },
  { name: t('Gestion de projet',      'Project management'),    level: 65, category: 'methodo', context: 'prod' },
  { name: t('Redaction specs / recettes', 'Specs & UAT writing'), level: 60, category: 'methodo', context: 'prod' },
  { name: t('Encadrement / Mentorat', 'Mentoring'),             level: 55, category: 'methodo', context: 'prod' },
])

// ─── Groupes d'affichage ──────────────────────────────────────────────────────

interface SkillGroup {
  id: SkillCategory
  label: string
  color: string
  skills: Skill[]
}

const mGroupes = computed<SkillGroup[]>(() => [
  { id: 'front',   label: t('Frontend', 'Frontend'),                       color: '#3b82f6', skills: mCompetences.value.filter(c => c.category === 'front') },
  { id: 'back',    label: t('Back & BDD', 'Back-end & DB'),                color: '#10b981', skills: mCompetences.value.filter(c => c.category === 'back') },
  { id: 'outils',  label: t('DevOps & Outils', 'DevOps & Tools'),          color: '#f59e0b', skills: mCompetences.value.filter(c => c.category === 'outils') },
  { id: 'creatif', label: t('Creatif & Divers', 'Creative & Misc'),        color: '#ec4899', skills: mCompetences.value.filter(c => c.category === 'creatif') },
  { id: 'methodo', label: t('Methodo & Soft skills', 'Soft & Method.'),    color: '#06b6d4', skills: mCompetences.value.filter(c => c.category === 'methodo') },
])

// ─── Animation GSAP des barres ────────────────────────────────────────────────

const mBarreRefs = ref<HTMLElement[]>([])

function enregistrerBarre(pEl: Element | null): void {
  if (pEl instanceof HTMLElement) mBarreRefs.value.push(pEl)
}

watch(
  () => mOuverte.value,
  async (lNewVal) => {
    if (!lNewVal || !import.meta.client) return
    mBarreRefs.value = []
    await nextTick()
    await new Promise<void>((lResolve) => setTimeout(lResolve, 350))
    const { gsap } = await import('gsap')
    gsap.fromTo(
      mBarreRefs.value,
      { width: '0%' },
      {
        width: (lIndex) => {
          const lBarre = mBarreRefs.value[lIndex]
          return lBarre?.dataset['level'] ? `${lBarre.dataset['level']}%` : '0%'
        },
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.04,
      }
    )
  }
)
</script>

<template>
  <ModalBase v-model="mOuverte" :title="t('Stack technique', 'Tech Stack')">
    <div class="stack-grid">
      <div v-for="lGroupe in mGroupes" :key="lGroupe.id" class="skill-group">
        <h3 class="skill-group-title" :style="{ color: lGroupe.color }">
          {{ lGroupe.label }}
        </h3>
        <div class="space-y-3">
          <div v-for="lSkill in lGroupe.skills" :key="lSkill.name" class="skill-item">
            <div class="skill-header">
              <span class="skill-name" style="color: var(--modal-text)">{{ lSkill.name }}</span>
              <span class="skill-level" :style="{ color: lGroupe.color }">{{ lSkill.level }}%</span>
            </div>
            <div
              class="skill-bar-track"
              role="progressbar"
              :aria-valuenow="lSkill.level"
              :aria-valuemin="0"
              :aria-valuemax="100"
              :aria-label="lSkill.name"
            >
              <div
                :ref="(el) => enregistrerBarre(el as Element | null)"
                class="skill-bar-fill"
                :data-level="lSkill.level"
                :style="{ background: `linear-gradient(to right, ${lGroupe.color}cc, ${lGroupe.color})` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Badge performance Lighthouse -->
    <div class="perf-badge" :title="t('Score Lighthouse mesuré sur Google PageSpeed Insights', 'Score measured on Google PageSpeed Insights')">
      <div class="perf-score">
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3" />
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke="#22c55e"
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray="94.2"
            stroke-dashoffset="5.7"
            transform="rotate(-90 18 18)"
          />
          <text x="18" y="22" text-anchor="middle" font-size="9" font-weight="700" fill="#22c55e" font-family="monospace">96</text>
        </svg>
        <div class="perf-info">
          <span class="perf-label">Lighthouse</span>
          <span class="perf-desc">{{ t('Performance · malgré les animations, avions temps réel et canvas étoiles', 'Performance · despite animations, live planes & star canvas') }}</span>
        </div>
      </div>
    </div>
  </ModalBase>
</template>

<style scoped>
.stack-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.75rem;
}

@media (max-width: 520px) {
  .stack-grid { grid-template-columns: 1fr; }
}

.skill-group-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.875rem;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.375rem;
}

.skill-name  { font-size: 0.875rem; font-weight: 500; opacity: 0.9; }
.skill-level { font-size: 0.75rem; font-weight: 700; font-variant-numeric: tabular-nums; flex-shrink: 0; }

/* ─── Badge Lighthouse ──────────────────────────────────────────────────────── */

.perf-badge {
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 10px;
  cursor: default;
}

.perf-score {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.perf-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.perf-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #22c55e;
  letter-spacing: 0.04em;
}

.perf-desc {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.4;
}
</style>
