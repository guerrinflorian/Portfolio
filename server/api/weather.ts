// Auteur : GUERRINF - Florian Guerrin
// Server route - proxy Open-Meteo (evite les blocages CORS / proxy entreprise)

import type { OpenMeteoResponse } from '~/types/weather'

const LATITUDE  = 49.4167
const LONGITUDE = 6.0000
const TIMEZONE  = 'Europe/Paris'

const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weathercode,is_day,precipitation,snowfall,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset&forecast_days=1&timezone=${encodeURIComponent(TIMEZONE)}`

export default defineEventHandler(async (): Promise<OpenMeteoResponse> => {
  const lData = await $fetch<OpenMeteoResponse>(API_URL, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'portfolio-florian-guerrin/1.0' },
    timeout: 8000,
  })
  return lData
})
