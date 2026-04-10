<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - terminal de scan visiteur (effet Mr. Robot, PC uniquement)

import { ref, onMounted } from 'vue'

// ─── État ─────────────────────────────────────────────────────────────────────

const mLines   = ref<string[]>([])
const mVisible = ref(true)

// ─── Utilitaires navigateur ───────────────────────────────────────────────────

function calcOS(): string {
  const lUa = navigator.userAgent
  if (/Windows NT 10/.test(lUa))  return 'Windows 10 / 11'
  if (/Windows NT 6\.3/.test(lUa)) return 'Windows 8.1'
  if (/Windows NT 6\.1/.test(lUa)) return 'Windows 7'
  if (/Macintosh/.test(lUa)) {
    const lM = lUa.match(/Mac OS X ([\d_]+)/)
    return `macOS ${lM ? lM[1].replace(/_/g, '.') : ''}`
  }
  if (/Android ([\d.]+)/.test(lUa)) return `Android ${RegExp.$1}`
  if (/Linux/.test(lUa)) return 'Linux'
  return 'Système inconnu'
}

function calcBrowser(): string {
  const lUa = navigator.userAgent
  const lV  = (lPat: RegExp) => lUa.match(lPat)?.[1]?.split('.')[0] ?? ''
  if (/Edg\//.test(lUa))     return `Edge ${lV(/Edg\/([\d.]+)/)}`
  if (/OPR\//.test(lUa))     return `Opera ${lV(/OPR\/([\d.]+)/)}`
  if (/Chrome\//.test(lUa))  return `Chrome ${lV(/Chrome\/([\d.]+)/)}`
  if (/Firefox\//.test(lUa)) return `Firefox ${lV(/Firefox\/([\d.]+)/)}`
  if (/Safari\//.test(lUa))  return 'Safari'
  return 'Navigateur inconnu'
}

function calcGreeting(pHeure: number): string {
  if (pHeure < 5)  return 'Bonne nuit'
  if (pHeure < 12) return 'Bonjour'
  if (pHeure < 18) return 'Bon après-midi'
  if (pHeure < 22) return 'Bonne soirée'
  return 'Bonne nuit'
}

function calcTzOffset(): string {
  const lOff = -new Date().getTimezoneOffset() / 60
  return `UTC${lOff >= 0 ? '+' : ''}${lOff}`
}

function pause(pMs: number): Promise<void> {
  return new Promise(r => setTimeout(r, pMs))
}

// ─── Séquence de scan ─────────────────────────────────────────────────────────

async function runScan(): Promise<void> {
  // Lancer le fetch IP en parallèle dès le début
  const lIpPromise = fetch('/api/visitor')
    .then(r => r.json())
    .catch(() => ({ ok: false }))

  await pause(300)
  mLines.value.push('[INITIALISATION DE L\'ANALYSE...]')
  await pause(500)
  mLines.value.push('> Connexion établie')
  await pause(350)

  // ── Données navigateur (synchrones) ────────────────────────────────────────
  const lOs      = calcOS()
  const lBrowser = calcBrowser()
  const lW       = window.screen.width
  const lH       = window.screen.height
  const lDepth   = window.screen.colorDepth
  const lLang    = navigator.language
  const lNow     = new Date()
  const lHour    = lNow.getHours()
  const lTime    = `${String(lHour).padStart(2, '0')}:${String(lNow.getMinutes()).padStart(2, '0')}`
  const lTz      = Intl.DateTimeFormat().resolvedOptions().timeZone
  const lCpus    = navigator.hardwareConcurrency
  const lMem     = (navigator as any).deviceMemory as number | undefined

  mLines.value.push(`> Système : ${lOs}`)
  await pause(300)
  mLines.value.push(`> Navigateur : ${lBrowser}`)
  await pause(300)
  mLines.value.push(`> Résolution : ${lW} × ${lH} — ${lDepth} bits`)
  await pause(300)
  mLines.value.push(`> Langue : ${lLang}`)
  await pause(300)
  mLines.value.push(`> Heure locale : ${lTime} — ${calcGreeting(lHour)}`)
  await pause(300)
  mLines.value.push(`> Fuseau horaire : ${lTz} (${calcTzOffset()})`)
  await pause(300)
  mLines.value.push(`> Cœurs CPU : ${lCpus}`)
  await pause(300)

  if (lMem) {
    mLines.value.push(`> Mémoire appareil : ${lMem} Go`)
    await pause(300)
  }

  // ── Batterie (async, Chrome uniquement) ────────────────────────────────────
  try {
    const lBatt = await (navigator as any).getBattery?.()
    if (lBatt) {
      const lPct    = Math.round(lBatt.level * 100)
      const lStatus = lBatt.charging ? '⚡ en charge' : 'non branché'
      mLines.value.push(`> Batterie : ${lPct}% — ${lStatus}`)
      await pause(300)
    }
  } catch { /* API indisponible sur ce navigateur */ }

  // ── Type de connexion (Chrome uniquement) ──────────────────────────────────
  const lConn = (navigator as any).connection
  if (lConn?.effectiveType) {
    const lType = (lConn.effectiveType as string).toUpperCase()
    const lDown = lConn.downlink ? ` — ${lConn.downlink} Mbps` : ''
    mLines.value.push(`> Connexion : ${lType}${lDown}`)
    await pause(300)
  }

  // ── Données IP (résultat du fetch lancé au début) ──────────────────────────
  const lIp = await lIpPromise as Record<string, unknown>

  if (lIp['ok']) {
    mLines.value.push(`> Adresse IP : ${lIp['ip']}`)
    await pause(300)
    mLines.value.push(`> Localisation : ${lIp['city']}, ${lIp['region']}, ${lIp['country']}`)
    await pause(300)
    mLines.value.push(`> Fournisseur : ${lIp['isp']}`)
    await pause(350)
  }

  mLines.value.push('[ANALYSE TERMINÉE — ACCÈS AUTORISÉ]')

  // ── Afficher 4 secondes puis disparaître ───────────────────────────────────
  await pause(4000)
  mVisible.value = false
}

onMounted(() => {
  if (!import.meta.client) return
  if (window.innerWidth < 768) return   // PC uniquement
  runScan()
})
</script>

<template>
  <Transition name="terminal-fade">
    <div v-if="mVisible" class="terminal-scan" aria-hidden="true">
      <TransitionGroup name="line-appear" tag="div">
        <p v-for="(lLine, lIdx) in mLines" :key="lIdx" class="terminal-line" :class="{ 'terminal-line--header': lLine.startsWith('[') }">
          {{ lLine }}
        </p>
      </TransitionGroup>
    </div>
  </Transition>
</template>

<style scoped>
.terminal-scan {
  position: fixed;
  bottom: 5rem;
  left: 1.75rem;
  z-index: 1;
  opacity: 0.5;
  pointer-events: none;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 0.68rem;
  line-height: 1.7;
  color: #4ade80;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
  max-width: 340px;
  user-select: none;
}

.terminal-line {
  margin: 0;
  white-space: nowrap;
}

.terminal-line--header {
  color: #86efac;
  font-weight: 700;
  letter-spacing: 0.04em;
}

/* Apparition de chaque ligne */
.line-appear-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.line-appear-enter-from {
  opacity: 0;
  transform: translateX(-6px);
}

/* Disparition du bloc entier */
.terminal-fade-leave-active {
  transition: opacity 1s ease;
}
.terminal-fade-leave-to {
  opacity: 0;
}
</style>
