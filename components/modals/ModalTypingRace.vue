<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Mini-jeu - Typing Race : joueur vs bot (Florian)

import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import ModalBase from './ModalBase.vue'
import { useModalStore } from '~/stores/modal'
import { useLocale } from '~/composables/useLocale'
import mPhotoSrc from '~/assets/images/moi/moi.jpg'

// ─── Stores & locale ─────────────────────────────────────────────────────────

const mStore = useModalStore()
const mOuverte = computed({
  get: () => mStore.activeModal === 'minijeu',
  set: (lVal) => { if (!lVal) mStore.close() },
})
const { t } = useLocale()

// ─── Textes - vrais commits git style projet ───────────────────────────────

const TEXTES = [
  'fix: correction du bug de concurrence dans le worker WebSocket bloquant le thread principal en production',
  "feat: ajout de la pagination infinie avec virtualisation DOM pour l'affichage performant de 10 000 commandes",
  'refactor: migration des controllers VB.NET vers des services TypeScript avec injection de dependances Fastify',
  'perf: remplacement des curseurs SQL Server par des operations ensemblistes sur la table des commandes rail',
  'fix: resolution du deadlock sur sp_GetCommandesEnCours lors des pics de charge simultanes en environnement prod',
]

// ─── États du jeu ─────────────────────────────────────────────────────────────

type GameState = 'idle' | 'countdown' | 'playing' | 'finished'

const mState      = ref<GameState>('idle')
const mTexte      = ref('')
const mInput      = ref('')
const mCountdown  = ref(3)
const mBotPos     = ref(0)
const mBotErrors  = ref(0)
const mPlayerTime = ref(0)
const mBotTime    = ref(0)
const mWinner     = ref<'player' | 'bot' | null>(null)
const mLostReason = ref<'accuracy' | 'qualite' | null>(null)

const mInputRef = ref<HTMLInputElement | null>(null)

// ─── Timers ───────────────────────────────────────────────────────────────────

let mBotTimeoutId:    ReturnType<typeof setTimeout>  | null = null
let mTimerIntervalId: ReturnType<typeof setInterval> | null = null
let mCdIntervalId:    ReturnType<typeof setInterval> | null = null
let mStartTime = 0

// ─── Calculs réactifs ─────────────────────────────────────────────────────────

const mChars = computed(() =>
  mTexte.value.split('').map((lC, lI) => {
    if (lI < mInput.value.length)
      return { char: lC, state: mInput.value[lI] === lC ? 'correct' : 'wrong' }
    if (lI === mInput.value.length)
      return { char: lC, state: 'cursor' }
    return { char: lC, state: 'pending' }
  })
)

const mPlayerProgress = computed(() =>
  mTexte.value ? Math.min(100, mInput.value.length / mTexte.value.length * 100) : 0
)
const mBotProgress = computed(() =>
  mTexte.value ? Math.min(100, mBotPos.value / mTexte.value.length * 100) : 0
)

const mErrors = computed(() => {
  let lCount = 0
  for (let i = 0; i < Math.min(mInput.value.length, mTexte.value.length); i++) {
    if (mInput.value[i] !== mTexte.value[i]) lCount++
  }
  // Caractères manquants si bot a fini avant le joueur
  if (mWinner.value === 'bot')
    lCount += Math.max(0, mTexte.value.length - mInput.value.length)
  return lCount
})

const mAccuracy = computed(() => {
  if (!mTexte.value.length) return 100
  const lGood = mTexte.value.length - mErrors.value
  return Math.max(0, Math.round(lGood / mTexte.value.length * 100))
})

const mBotAccuracy = computed(() =>
  mTexte.value ? Math.max(0, Math.round((1 - mBotErrors.value / mTexte.value.length) * 100)) : 100
)

const mPlayerTimeFmt = computed(() => mPlayerTime.value.toFixed(1) + 's')
const mBotTimeFmt    = computed(() => mBotTime.value.toFixed(1) + 's')

// ─── Logique du bot ───────────────────────────────────────────────────────────

function planifierProchainChar(): void {
  if (mBotPos.value >= mTexte.value.length) return

  // Vitesse : 65-115ms par caractère soit ~9-15 chars/sec
  let lDelay = 65 + Math.random() * 50

  // Hésitation occasionnelle toutes les 22-38 lettres
  if (mBotPos.value > 0 && mBotPos.value % (22 + Math.floor(Math.random() * 16)) === 0) {
    lDelay += 180 + Math.random() * 280
  }

  mBotTimeoutId = setTimeout(() => {
    if (mState.value !== 'playing') return
    mBotPos.value++
    // 2.5% de chance de faire une erreur sur ce caractère
    if (Math.random() < 0.025) mBotErrors.value++
    if (mBotPos.value >= mTexte.value.length) {
      mBotTime.value = parseFloat(((Date.now() - mStartTime) / 1000).toFixed(1))
      terminerJeu('bot')
    } else {
      planifierProchainChar()
    }
  }, lDelay)
}

// ─── Contrôle du jeu ─────────────────────────────────────────────────────────

function demarrer(): void {
  mTexte.value      = TEXTES[Math.floor(Math.random() * TEXTES.length)]
  mInput.value      = ''
  mBotPos.value     = 0
  mBotErrors.value  = 0
  mWinner.value     = null
  mLostReason.value = null
  mPlayerTime.value = 0
  mBotTime.value    = 0
  mState.value      = 'countdown'
  mCountdown.value  = 3

  mCdIntervalId = setInterval(() => {
    mCountdown.value--
    if (mCountdown.value <= 0) {
      clearInterval(mCdIntervalId!)
      lancerPartie()
    }
  }, 1000)
}

function lancerPartie(): void {
  mState.value = 'playing'
  mStartTime   = Date.now()

  nextTick(() => mInputRef.value?.focus())

  mTimerIntervalId = setInterval(() => {
    if (mState.value === 'playing')
      mPlayerTime.value = parseFloat(((Date.now() - mStartTime) / 1000).toFixed(1))
  }, 100)

  planifierProchainChar()
}

function onInput(): void {
  if (mState.value !== 'playing') return
  if (mInput.value.length >= mTexte.value.length) {
    mPlayerTime.value = parseFloat(((Date.now() - mStartTime) / 1000).toFixed(1))

    // Calcul des erreurs joueur (sans le bonus "chars manquants" qui s'applique après)
    let lPlayerErrors = 0
    for (let i = 0; i < mTexte.value.length; i++) {
      if ((mInput.value[i] ?? '') !== mTexte.value[i]) lPlayerErrors++
    }
    const lErrorRate = lPlayerErrors / mTexte.value.length

    if (lErrorRate > 0.06) {
      // Plus de 6% d'erreurs → défaite
      mLostReason.value = 'accuracy'
      terminerJeu('bot')
    } else if (lPlayerErrors > mBotErrors.value) {
      // Plus d'erreurs que le bot même en étant plus rapide → défaite
      mLostReason.value = 'qualite'
      terminerJeu('bot')
    } else {
      mLostReason.value = null
      terminerJeu('player')
    }
  }
}

function terminerJeu(lGagnant: 'player' | 'bot'): void {
  mWinner.value = lGagnant
  mState.value  = 'finished'
  // Si le joueur gagne, on capture le temps actuel du bot (il n'a pas fini)
  if (lGagnant === 'player' && mBotTime.value === 0) {
    mBotTime.value = parseFloat(((Date.now() - mStartTime) / 1000).toFixed(1))
  }
  effacerTimers()
}

function rejouer(): void {
  effacerTimers()
  mState.value      = 'idle'
  mInput.value      = ''
  mBotPos.value     = 0
  mBotErrors.value  = 0
  mWinner.value     = null
  mLostReason.value = null
}

function effacerTimers(): void {
  if (mBotTimeoutId)    clearTimeout(mBotTimeoutId)
  if (mTimerIntervalId) clearInterval(mTimerIntervalId)
  if (mCdIntervalId)    clearInterval(mCdIntervalId)
}

// ─── Sécurité anti-copier-coller ─────────────────────────────────────────────

function onPaste(e: Event): void { e.preventDefault() }
function onDrop(e: Event): void  { e.preventDefault() }
function onKeydown(e: KeyboardEvent): void {
  if ((e.ctrlKey || e.metaKey) && ['v', 'a', 'c', 'x'].includes(e.key)) {
    if (e.key !== 'a') e.preventDefault() // Autoriser select-all mais pas paste/cut/copy
  }
}

// ─── Cycle de vie ─────────────────────────────────────────────────────────────

watch(mOuverte, (lVal) => { if (!lVal) rejouer() })
onUnmounted(() => effacerTimers())
</script>

<template>
  <ModalBase v-model="mOuverte" :title="t('Typing Race - Florian vs Vous', 'Typing Race - Florian vs You')">

    <!-- ── IDLE ── -->
    <div v-if="mState === 'idle'" class="state-idle">
      <p class="idle-desc">
        {{
          t(
            'Tapez le commit git le plus vite possible. Le bot (moi 👋) tape vite, mais il hésite parfois. Pas de copier-coller !',
            'Type the git commit as fast as possible. The bot (me 👋) types fast but hesitates sometimes. No copy-paste!'
          )
        }}
      </p>
      <div class="bot-profile">
        <span class="bot-avatar">🧑‍💻</span>
        <div>
          <p class="bot-name">Florian · Bot</p>
          <p class="bot-speed">~{{ t('5-7 caractères / seconde', '5-7 chars / second') }} · {{ t('hésitations aléatoires', 'random hesitations') }}</p>
        </div>
      </div>
      <button class="btn-start" @click="demarrer">
        {{ t('Lancer la partie !', 'Start game!') }}
      </button>
    </div>

    <!-- ── COUNTDOWN ── -->
    <div v-else-if="mState === 'countdown'" class="state-countdown">
      <p class="countdown-label">{{ t('Préparez-vous...', 'Get ready...') }}</p>
      <div class="countdown-number">{{ mCountdown }}</div>
    </div>

    <!-- ── PLAYING ── -->
    <div v-else-if="mState === 'playing'" class="state-playing">

      <!-- Texte à reproduire -->
      <div class="text-display" aria-live="off">
        <span
          v-for="(lChar, lIdx) in mChars"
          :key="lIdx"
          :class="['char', `char--${lChar.state}`]"
        >{{ lChar.char === ' ' ? '\u00A0' : lChar.char }}</span>
      </div>

      <!-- Input caché mais fonctionnel -->
      <input
        ref="mInputRef"
        v-model="mInput"
        class="race-input"
        type="text"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        :maxlength="mTexte.length"
        @input="onInput"
        @paste="onPaste"
        @drop="onDrop"
        @keydown="onKeydown"
        @contextmenu.prevent
        :aria-label="t('Champ de saisie', 'Input field')"
      />

      <!-- Barres de progression -->
      <div class="progress-section">
        <div class="progress-row">
          <span class="progress-label">{{ t('Vous', 'You') }}</span>
          <div class="progress-track">
            <div class="progress-fill progress-fill--player" :style="{ width: mPlayerProgress + '%' }" />
          </div>
          <span class="progress-pct">{{ Math.round(mPlayerProgress) }}%</span>
        </div>
        <div class="progress-row progress-row--bot">
          <span class="progress-label">Bot 🧑‍💻</span>
          <div class="progress-track progress-track--bot">
            <div class="progress-fill progress-fill--bot" :style="{ width: mBotProgress + '%' }" />
            <img
              :src="mPhotoSrc"
              class="bot-avatar-img"
              alt="Florian"
              :style="{ left: mBotProgress + '%' }"
            />
          </div>
          <span class="progress-pct">{{ Math.round(mBotProgress) }}%</span>
        </div>
      </div>

      <!-- Stats live -->
      <div class="live-stats">
        <span>⏱ {{ mPlayerTimeFmt }}</span>
        <span>❌ {{ mErrors }} {{ t('erreur(s)', 'error(s)') }}</span>
        <span>🎯 {{ mAccuracy }}%</span>
      </div>

    </div>

    <!-- ── FINISHED ── -->
    <div v-else-if="mState === 'finished'" class="state-finished">

      <!-- Barres de progression finales -->
      <div class="progress-section">
        <div class="progress-row">
          <span class="progress-label">{{ t('Vous', 'You') }}</span>
          <div class="progress-track">
            <div class="progress-fill progress-fill--player" :style="{ width: mPlayerProgress + '%' }" />
          </div>
          <span class="progress-pct">{{ Math.round(mPlayerProgress) }}%</span>
        </div>
        <div class="progress-row progress-row--bot">
          <span class="progress-label">Bot 🧑‍💻</span>
          <div class="progress-track progress-track--bot">
            <div class="progress-fill progress-fill--bot" :style="{ width: mBotProgress + '%' }" />
            <img
              :src="mPhotoSrc"
              class="bot-avatar-img"
              alt="Florian"
              :style="{ left: mBotProgress + '%' }"
            />
          </div>
          <span class="progress-pct">{{ Math.round(mBotProgress) }}%</span>
        </div>
      </div>

      <div class="result-header">
        <span class="result-emoji">{{ mWinner === 'player' ? '🏆' : '🤖' }}</span>
        <h3 class="result-title">
          {{
            mWinner === 'player'
              ? t('Vous avez gagné !', 'You won!')
              : t('Le bot a gagné !', 'The bot won!')
          }}
        </h3>
      </div>

      <!-- Raison de défaite -->
      <div v-if="mWinner === 'bot' && mLostReason" class="lost-reason">
        <template v-if="mLostReason === 'accuracy'">
          {{ t('Trop d\'erreurs — tu dépasses 6% de taux d\'erreur.', 'Too many errors — you exceeded the 6% error rate.') }}
        </template>
        <template v-else-if="mLostReason === 'qualite'">
          {{ t('Plus rapide que le bot, mais plus d\'erreurs — la vitesse ne suffit pas.', 'Faster than the bot, but more errors — speed alone isn\'t enough.') }}
        </template>
      </div>

      <!-- Scores -->
      <div class="scores-grid">
        <div class="score-card" :class="{ 'score-card--winner': mWinner === 'player' }">
          <p class="score-who">{{ t('Vous', 'You') }}</p>
          <p class="score-time">{{ mPlayerTimeFmt }}</p>
          <p class="score-detail">{{ mAccuracy }}% · {{ mErrors }} {{ t('erreur(s)', 'error(s)') }}</p>
        </div>
        <div class="score-card" :class="{ 'score-card--winner': mWinner === 'bot' }">
          <p class="score-who">Bot 🧑‍💻</p>
          <p class="score-time">{{ mBotTimeFmt }}</p>
          <p class="score-detail">
            {{ mBotAccuracy }}% · {{ mBotErrors }} {{ t('erreur(s)', 'error(s)') }}
            <template v-if="mWinner === 'player'"> · {{ t('pas fini', 'not finished') }}</template>
          </p>
        </div>
      </div>

      <!-- Message recrutement -->
      <div class="recruit-msg">
        <p>
          {{
            mWinner === 'player'
              ? t(
                  'Impressionnant ! Mais que tu gagnes ou que tu perdes, le constat est le même :',
                  'Impressive! But whether you win or lose, the conclusion is the same:'
                )
              : t(
                  'Le bot a été plus rapide cette fois. Mais que tu gagnes ou que tu perdes, le constat est le même :',
                  'The bot was faster this time. But whether you win or lose, the conclusion is the same:'
                )
          }}
        </p>
        <p class="recruit-cta">
          {{ t('→ Recrute-moi. 😄', '→ Hire me. 😄') }}
        </p>
      </div>

      <button class="btn-retry" @click="rejouer">
        {{ t('Rejouer', 'Play again') }}
      </button>

    </div>

  </ModalBase>
</template>

<style scoped>
/* ── Idle ── */
.state-idle {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.idle-desc {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--modal-text);
  opacity: 0.8;
}

.bot-profile {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.06);
  border-left: 2px solid rgba(59, 130, 246, 0.4);
  border-radius: 0 6px 6px 0;
}

.bot-avatar { font-size: 1.75rem; }

.bot-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--modal-text);
}

.bot-speed {
  font-size: 0.72rem;
  opacity: 0.55;
  color: var(--modal-text);
  margin-top: 0.15rem;
}

.btn-start {
  align-self: center;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.65rem 2rem;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, transform 0.1s;
}
.btn-start:hover  { background: #1d3a9e; transform: translateY(-1px); }
.btn-start:active { transform: translateY(0); }

/* ── Countdown ── */
.state-countdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 0;
}

.countdown-label {
  font-size: 0.9rem;
  opacity: 0.6;
  color: var(--modal-text);
}

.countdown-number {
  font-size: 5rem;
  font-weight: 900;
  color: #1e40af;
  line-height: 1;
  animation: countdown-pulse 1s ease-in-out infinite;
}

@keyframes countdown-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.1); opacity: 0.7; }
}

/* ── Playing ── */
.state-playing {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.text-display {
  font-family: 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.88rem;
  line-height: 1.8;
  padding: 0.85rem 1rem;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid var(--modal-header-border);
  border-radius: 6px;
  letter-spacing: 0.02em;
  word-break: break-all;
  cursor: text;
  user-select: none;
}

.char { display: inline; }
.char--correct { color: #16a34a; }
.char--wrong   { color: white; background: #ef4444; border-radius: 2px; }
.char--cursor  {
  color: var(--modal-text);
  border-bottom: 2.5px solid #1e40af;
  animation: blink-cursor 0.8s step-end infinite;
}
.char--pending { color: var(--modal-text); opacity: 0.35; }

@keyframes blink-cursor {
  0%, 100% { border-color: #1e40af; }
  50%       { border-color: transparent; }
}

.race-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 1px;
  height: 1px;
}

/* ── Progress ── */
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.progress-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--modal-text);
  width: 52px;
  flex-shrink: 0;
}

.progress-track {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.1s ease;
}

.progress-fill--player { background: linear-gradient(to right, #1e40af, #60a5fa); }
.progress-fill--bot    { background: linear-gradient(to right, #9333ea, #c084fc); }

.progress-row--bot {
  padding-top: 34px;
}

.progress-track--bot {
  overflow: visible;
  position: relative;
}

.bot-avatar-img {
  position: absolute;
  bottom: calc(100% + 4px);  /* 4px au-dessus du bord supérieur de la barre */
  transform: translateX(-50%);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #9333ea;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.4);
  transition: left 0.1s ease;
  z-index: 2;
  pointer-events: none;
}

.progress-pct {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--modal-text);
  opacity: 0.6;
  width: 32px;
  text-align: right;
  flex-shrink: 0;
}

/* ── Stats live ── */
.live-stats {
  display: flex;
  gap: 1.25rem;
  font-size: 0.78rem;
  color: var(--modal-text);
  opacity: 0.7;
}

/* ── Finished ── */
.state-finished {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.result-emoji { font-size: 2.25rem; }

.result-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--modal-text);
}

.scores-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.score-card {
  padding: 0.85rem 1rem;
  border: 1px solid var(--modal-header-border);
  border-radius: 8px;
  text-align: center;
}

.score-card--winner {
  border-color: #1e40af;
  background: rgba(30, 64, 175, 0.07);
}

.score-who {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.5;
  color: var(--modal-text);
  margin-bottom: 0.3rem;
}

.score-time {
  font-size: 1.7rem;
  font-weight: 900;
  color: var(--modal-text);
  line-height: 1.1;
}

.score-detail {
  font-size: 0.7rem;
  opacity: 0.5;
  color: var(--modal-text);
  margin-top: 0.25rem;
}

.lost-reason {
  padding: 0.6rem 1rem;
  background: rgba(239, 68, 68, 0.07);
  border-left: 2px solid #ef4444;
  border-radius: 0 6px 6px 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: #ef4444;
}

.recruit-msg {
  padding: 0.85rem 1rem;
  background: rgba(34, 197, 94, 0.07);
  border-left: 2px solid #16a34a;
  border-radius: 0 6px 6px 0;
  font-size: 0.85rem;
  color: var(--modal-text);
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.recruit-cta {
  font-weight: 800;
  font-size: 1rem;
  color: #16a34a;
}

.btn-retry {
  align-self: center;
  background: transparent;
  color: var(--modal-text);
  border: 1px solid var(--modal-header-border);
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.btn-retry:hover { background: rgba(0, 0, 0, 0.05); border-color: #1e40af; color: #1e40af; }
</style>
