<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - terminal de scan visiteur (effet Mr. Robot, PC uniquement)

import { ref, onMounted } from 'vue'
import { useLocale } from '~/composables/useLocale'

// ─── État ─────────────────────────────────────────────────────────────────────

const mLines   = ref<string[]>([])
const mVisible = ref(true)
const { locale } = useLocale()

// ─── Traductions ──────────────────────────────────────────────────────────────

function tr(pFr: string, pEn: string): string {
  return locale.value === 'fr' ? pFr : pEn
}

// ─── Utilitaires navigateur ───────────────────────────────────────────────────

function calcOS(): string {
  const lUa = navigator.userAgent
  if (/Windows NT 10/.test(lUa))   return 'Windows 10 / 11'
  if (/Windows NT 6\.3/.test(lUa)) return 'Windows 8.1'
  if (/Windows NT 6\.1/.test(lUa)) return 'Windows 7'
  if (/Macintosh/.test(lUa)) {
    const lM = lUa.match(/Mac OS X ([\d_]+)/)
    return `macOS ${lM ? lM[1].replace(/_/g, '.') : ''}`
  }
  if (/Android ([\d.]+)/.test(lUa)) return `Android ${RegExp.$1}`
  if (/Linux/.test(lUa)) return 'Linux'
  return tr('Système inconnu', 'Unknown OS')
}

function calcBrowser(): string {
  const lUa = navigator.userAgent
  const lV  = (lPat: RegExp) => lUa.match(lPat)?.[1]?.split('.')[0] ?? ''
  if (/Edg\//.test(lUa))     return `Edge ${lV(/Edg\/([\d.]+)/)}`
  if (/OPR\//.test(lUa))     return `Opera ${lV(/OPR\/([\d.]+)/)}`
  if (/Chrome\//.test(lUa))  return `Chrome ${lV(/Chrome\/([\d.]+)/)}`
  if (/Firefox\//.test(lUa)) return `Firefox ${lV(/Firefox\/([\d.]+)/)}`
  if (/Safari\//.test(lUa))  return 'Safari'
  return tr('Navigateur inconnu', 'Unknown browser')
}

function calcGreeting(pHeure: number): string {
  if (pHeure < 5)  return tr('Bonne nuit',      'Good night')
  if (pHeure < 12) return tr('Bonjour',          'Good morning')
  if (pHeure < 18) return tr('Bon après-midi',   'Good afternoon')
  if (pHeure < 22) return tr('Bonne soirée',     'Good evening')
  return tr('Bonne nuit', 'Good night')
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
  const lIpPromise = fetch('/api/visitor')
    .then(r => r.json())
    .catch(() => ({ ok: false }))

  await pause(300)
  mLines.value.push(tr('[INITIALISATION DE L\'ANALYSE...]', '[INITIALIZING SCAN...]'))
  await pause(500)
  mLines.value.push(tr('> Connexion établie', '> Connection established'))
  await pause(350)

  // ── Données navigateur (synchrones) ──────────────────────────────────────
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

  mLines.value.push(`> ${tr('Système', 'OS')} : ${lOs}`)
  await pause(320)
  mLines.value.push(`> ${tr('Navigateur', 'Browser')} : ${lBrowser}`)
  await pause(320)
  mLines.value.push(`> ${tr('Résolution', 'Resolution')} : ${lW} × ${lH} — ${lDepth} bits`)
  await pause(320)
  mLines.value.push(`> ${tr('Langue système', 'System language')} : ${lLang}`)
  await pause(320)
  mLines.value.push(`> ${tr('Heure locale', 'Local time')} : ${lTime} — ${calcGreeting(lHour)}`)
  await pause(320)
  mLines.value.push(`> ${tr('Fuseau horaire', 'Timezone')} : ${lTz} (${calcTzOffset()})`)
  await pause(320)
  mLines.value.push(`> ${tr('Cœurs CPU', 'CPU cores')} : ${lCpus}`)
  await pause(320)

  if (lMem) {
    mLines.value.push(`> ${tr('Mémoire appareil', 'Device memory')} : ${lMem} Go`)
    await pause(320)
  }

  // ── Batterie (Chrome uniquement) ─────────────────────────────────────────
  try {
    const lBatt = await (navigator as any).getBattery?.()
    if (lBatt) {
      const lPct    = Math.round(lBatt.level * 100)
      const lStatus = lBatt.charging
        ? tr('⚡ en charge', '⚡ charging')
        : tr('non branché', 'unplugged')
      mLines.value.push(`> ${tr('Batterie', 'Battery')} : ${lPct}% — ${lStatus}`)
      await pause(320)
    }
  } catch { /* indisponible */ }

  // ── Connexion (Chrome uniquement) ─────────────────────────────────────────
  const lConn = (navigator as any).connection
  if (lConn?.effectiveType) {
    const lType = (lConn.effectiveType as string).toUpperCase()
    const lDown = lConn.downlink ? ` — ${lConn.downlink} Mbps` : ''
    mLines.value.push(`> ${tr('Connexion', 'Connection')} : ${lType}${lDown}`)
    await pause(320)
  }

  // ── Données IP ────────────────────────────────────────────────────────────
  const lIp = await lIpPromise as Record<string, unknown>

  if (lIp['ok']) {
    mLines.value.push(`> ${tr('Adresse IP', 'IP address')} : ${lIp['ip']}`)
    await pause(320)
    mLines.value.push(`> ${tr('Localisation', 'Location')} : ${lIp['city']}, ${lIp['region']}, ${lIp['country']}`)
    await pause(320)
    mLines.value.push(`> ${tr('Fournisseur', 'ISP')} : ${lIp['isp']}`)
    await pause(400)
  }

  mLines.value.push(tr('[ANALYSE TERMINÉE — ACCÈS AUTORISÉ]', '[SCAN COMPLETE — ACCESS GRANTED]'))

  await pause(7000)
  mVisible.value = false
}

onMounted(() => {
  if (!import.meta.client) return
  if (window.innerWidth < 768) return
  runScan()
})
</script>

<template>
  <Transition name="terminal-fade">
    <div v-if="mVisible" class="terminal-scan" aria-hidden="true">
      <TransitionGroup name="line-appear" tag="div">
        <p
          v-for="(lLine, lIdx) in mLines"
          :key="lIdx"
          class="terminal-line"
          :class="{ 'terminal-line--header': lLine.startsWith('[') }"
        >
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
  opacity: 0.75;
  pointer-events: none;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 0.72rem;
  line-height: 1.8;
  color: #4ade80;
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.6);
  max-width: 380px;
  user-select: none;
}

.terminal-line {
  margin: 0;
  white-space: nowrap;
}

.terminal-line--header {
  color: #bbf7d0;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.line-appear-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.line-appear-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.terminal-fade-leave-active {
  transition: opacity 1.5s ease;
}
.terminal-fade-leave-to {
  opacity: 0;
}
</style>
