const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY  = Deno.env.get('SERVICE_JWT')!
const BOT_USER_ID  = '9ee14107-478e-4a24-bec4-aceb9f550884'

const H = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Prefer': 'return=representation',
}

// ── HTTP helpers ──────────────────────────────────────

async function dbGet<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: H })
  if (!res.ok) { console.error(`[dbGet] ${path} ${res.status}`, await res.text()); return [] }
  return res.json()
}

async function dbPatch(table: string, filter: string, body: object): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: { ...H, 'Prefer': 'return=minimal' },
    body: JSON.stringify(body),
  })
  if (!res.ok) { const err = await res.json().catch(() => null); console.error(`[dbPatch] ${table} ${res.status}`, err); return err }
  return null
}

async function dbRpc(fn: string, body: object): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) { console.error(`[dbRpc] ${fn} ${res.status}`, data); return { error: data } }
  return { data, error: null }
}

async function rtBroadcast(channel: string, event: string, payload: object): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify({
      messages: [{ topic: `realtime:${channel}`, event: 'broadcast', payload: { type: 'broadcast', event, payload } }]
    }),
  })
  if (!res.ok) console.error(`[rtBroadcast] ${channel}/${event} ${res.status}`, await res.text())
}

function nombreTerritorio(id: string): string {
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ── Static data ───────────────────────────────────────

const TERRITORIES: { id: string; continent: string; neighbors: string[] }[] = [
  { id: 'alaska',               continent: 'north_america', neighbors: ['northwest_territory','alberta','kamchatka'] },
  { id: 'northwest_territory',  continent: 'north_america', neighbors: ['alaska','alberta','ontario','greenland'] },
  { id: 'greenland',            continent: 'north_america', neighbors: ['northwest_territory','quebec','iceland'] },
  { id: 'alberta',              continent: 'north_america', neighbors: ['alaska','northwest_territory','ontario','western_united_states'] },
  { id: 'ontario',              continent: 'north_america', neighbors: ['alberta','northwest_territory','quebec','western_united_states','eastern_united_states'] },
  { id: 'quebec',               continent: 'north_america', neighbors: ['ontario','greenland','eastern_united_states'] },
  { id: 'western_united_states',continent: 'north_america', neighbors: ['alberta','ontario','eastern_united_states','central_america'] },
  { id: 'eastern_united_states',continent: 'north_america', neighbors: ['western_united_states','ontario','quebec','central_america'] },
  { id: 'central_america',      continent: 'north_america', neighbors: ['western_united_states','eastern_united_states','venezuela'] },
  { id: 'venezuela',            continent: 'south_america', neighbors: ['central_america','brazil','peru'] },
  { id: 'peru',                 continent: 'south_america', neighbors: ['venezuela','brazil','argentina','eastern_australia'] },
  { id: 'brazil',               continent: 'south_america', neighbors: ['venezuela','peru','argentina','north_africa'] },
  { id: 'argentina',            continent: 'south_america', neighbors: ['peru','brazil'] },
  { id: 'iceland',              continent: 'europe',        neighbors: ['greenland','great_britain','scandinavia'] },
  { id: 'scandinavia',          continent: 'europe',        neighbors: ['iceland','great_britain','northern_europe','ukraine'] },
  { id: 'great_britain',        continent: 'europe',        neighbors: ['iceland','scandinavia','northern_europe','western_europe'] },
  { id: 'northern_europe',      continent: 'europe',        neighbors: ['scandinavia','ukraine','western_europe','southern_europe'] },
  { id: 'western_europe',       continent: 'europe',        neighbors: ['great_britain','northern_europe','southern_europe','north_africa'] },
  { id: 'southern_europe',      continent: 'europe',        neighbors: ['northern_europe','western_europe','ukraine','north_africa','egypt','middle_east'] },
  { id: 'ukraine',              continent: 'europe',        neighbors: ['scandinavia','northern_europe','southern_europe','middle_east','afghanistan','ural'] },
  { id: 'north_africa',         continent: 'africa',        neighbors: ['brazil','western_europe','southern_europe','egypt','east_africa','congo'] },
  { id: 'egypt',                continent: 'africa',        neighbors: ['north_africa','southern_europe','middle_east','east_africa'] },
  { id: 'east_africa',          continent: 'africa',        neighbors: ['north_africa','egypt','congo','south_africa','madagascar'] },
  { id: 'congo',                continent: 'africa',        neighbors: ['north_africa','east_africa','south_africa'] },
  { id: 'south_africa',         continent: 'africa',        neighbors: ['congo','east_africa','madagascar'] },
  { id: 'madagascar',           continent: 'africa',        neighbors: ['east_africa','south_africa'] },
  { id: 'middle_east',          continent: 'asia',          neighbors: ['southern_europe','ukraine','egypt','afghanistan','india'] },
  { id: 'afghanistan',          continent: 'asia',          neighbors: ['ukraine','ural','middle_east','india','china'] },
  { id: 'ural',                 continent: 'asia',          neighbors: ['ukraine','afghanistan','siberia','china'] },
  { id: 'siberia',              continent: 'asia',          neighbors: ['ural','china','mongolia','irkutsk','yakutsk'] },
  { id: 'yakutsk',              continent: 'asia',          neighbors: ['siberia','irkutsk','kamchatka'] },
  { id: 'irkutsk',              continent: 'asia',          neighbors: ['siberia','mongolia','yakutsk','kamchatka'] },
  { id: 'kamchatka',            continent: 'asia',          neighbors: ['yakutsk','irkutsk','mongolia','japan','alaska'] },
  { id: 'japan',                continent: 'asia',          neighbors: ['mongolia','kamchatka'] },
  { id: 'mongolia',             continent: 'asia',          neighbors: ['china','siberia','irkutsk','japan','kamchatka'] },
  { id: 'china',                continent: 'asia',          neighbors: ['ural','afghanistan','india','siam','mongolia','siberia'] },
  { id: 'india',                continent: 'asia',          neighbors: ['afghanistan','middle_east','china','siam','indonesia'] },
  { id: 'siam',                 continent: 'asia',          neighbors: ['india','china','new_guinea'] },
  { id: 'indonesia',            continent: 'oceania',       neighbors: ['india','new_guinea','western_australia'] },
  { id: 'new_guinea',           continent: 'oceania',       neighbors: ['indonesia','eastern_australia','western_australia','siam'] },
  { id: 'western_australia',    continent: 'oceania',       neighbors: ['new_guinea','eastern_australia','indonesia'] },
  { id: 'eastern_australia',    continent: 'oceania',       neighbors: ['new_guinea','western_australia','peru'] },
]

const CONTINENT_BONUSES = [
  { id: 'north_america', bonus: 5 },
  { id: 'south_america', bonus: 3 },
  { id: 'europe',        bonus: 5 },
  { id: 'africa',        bonus: 4 },
  { id: 'asia',          bonus: 7 },
  { id: 'oceania',       bonus: 2 },
]

const CONTINENT_TERRITORIES: Record<string, string[]> = (() => {
  const m: Record<string, string[]> = {}
  for (const t of TERRITORIES) {
    if (!m[t.continent]) m[t.continent] = []
    m[t.continent].push(t.id)
  }
  return m
})()

// ── Utils ─────────────────────────────────────────────

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
const ok = (msg = 'OK') => new Response(msg, { status: 200 })

type TerrsMap = Record<string, { territorio_id: string; usuario_id: string; tropas: number }>
type Jugador  = { usuario_id: string; tropas_por_colocar: number; objetivo: any; color: string; cartas?: string[] | null }

function getVivos(orden: string[], terrs: TerrsMap): Set<string> {
  const vals = Object.values(terrs)
  return new Set(orden.filter(uid => vals.some(t => t.usuario_id === uid)))
}

function siguienteVivoIdx(fromIdx: number, orden: string[], vivos: Set<string>): number {
  const n = orden.length
  let idx = (fromIdx + 1) % n
  for (let i = 0; i < n; i++) {
    if (vivos.has(orden[idx])) return idx
    idx = (idx + 1) % n
  }
  return fromIdx
}

function primerVivoDesde(fromIdx: number, orden: string[], vivos: Set<string>): number {
  const n = orden.length
  let idx = ((fromIdx % n) + n) % n
  for (let i = 0; i < n; i++) {
    if (vivos.has(orden[idx])) return idx
    idx = (idx + 1) % n
  }
  return fromIdx
}

function calcularBonusContinente(userId: string, ownerMap: Record<string, string>): number {
  let bonus = 0
  for (const cb of CONTINENT_BONUSES) {
    const terrs = CONTINENT_TERRITORIES[cb.id] ?? []
    if (terrs.every(tid => ownerMap[tid] === userId)) bonus += cb.bonus
  }
  return bonus
}

// Territorio fronterizo con más tropas; si no hay fronteras, el de más tropas
function mejorTerritorioDeLista(lista: [string, { tropas: number }][], terrs: TerrsMap): [string, { tropas: number }] {
  const conEnemigos = lista.filter(([id]) =>
    (TERRITORIES.find(t => t.id === id)?.neighbors ?? [])
      .some(v => terrs[v] && terrs[v].usuario_id !== BOT_USER_ID)
  )
  const candidatos = conEnemigos.length > 0 ? conEnemigos : lista
  return candidatos.reduce((a, b) => a[1].tropas >= b[1].tropas ? a : b)
}

// ── Estado evaluado del bot ───────────────────────────

interface EstadoBot {
  totalTerrs:           number
  botCount:             number
  pctTerrs:             number
  fronteras:            string[]
  amenaza:              Record<string, number>  // territorio propio → tropas enemigas adyacentes
  continentesCompletos: string[]
  continentesProgreso:  { id: string; propios: number; total: number; faltantes: string[] }[]
  dominante:            string | null           // uid con >45% territorios
  modoDefensivo:        boolean                 // bot tiene <20% territorios
  tropasTotalesBot:     number
}

function evaluarEstado(terrs: TerrsMap, _jugadores: Jugador[], _objetivo: any): EstadoBot {
  const totalTerrs = Object.keys(terrs).length
  let botCount = 0
  let tropasTotalesBot = 0
  const ownerMap: Record<string, string> = {}

  for (const [tid, e] of Object.entries(terrs)) {
    ownerMap[tid] = e.usuario_id
    if (e.usuario_id === BOT_USER_ID) { botCount++; tropasTotalesBot += e.tropas }
  }

  const pctTerrs = totalTerrs > 0 ? botCount / totalTerrs : 0

  const fronteras: string[] = []
  const amenaza: Record<string, number> = {}
  for (const [tid, e] of Object.entries(terrs)) {
    if (e.usuario_id !== BOT_USER_ID) continue
    let enemigosTropas = 0
    for (const v of TERRITORIES.find(t => t.id === tid)?.neighbors ?? []) {
      const ev = terrs[v]
      if (ev && ev.usuario_id !== BOT_USER_ID) enemigosTropas += ev.tropas
    }
    if (enemigosTropas > 0) { fronteras.push(tid); amenaza[tid] = enemigosTropas }
  }

  const continentesCompletos: string[] = []
  const continentesProgreso: { id: string; propios: number; total: number; faltantes: string[] }[] = []
  for (const cb of CONTINENT_BONUSES) {
    const contTerrs = CONTINENT_TERRITORIES[cb.id] ?? []
    const propios   = contTerrs.filter(tid => ownerMap[tid] === BOT_USER_ID).length
    const faltantes = contTerrs.filter(tid => ownerMap[tid] !== BOT_USER_ID)
    if (!faltantes.length) continentesCompletos.push(cb.id)
    continentesProgreso.push({ id: cb.id, propios, total: contTerrs.length, faltantes })
  }

  const conteos: Record<string, number> = {}
  for (const uid of Object.values(ownerMap)) conteos[uid] = (conteos[uid] ?? 0) + 1
  const dominante = Object.entries(conteos)
    .find(([uid, c]) => uid !== BOT_USER_ID && c / totalTerrs > 0.45)?.[0] ?? null

  return {
    totalTerrs, botCount, pctTerrs, fronteras, amenaza,
    continentesCompletos, continentesProgreso, dominante,
    modoDefensivo: pctTerrs < 0.20, tropasTotalesBot,
  }
}

// Continente objetivo con mayor progreso que aún falta completar
function continenteObjetivo(objetivo: any, estado: EstadoBot): { id: string; faltantes: string[] } | null {
  if (objetivo?.tipo !== 'continentes') return null
  return estado.continentesProgreso
    .filter(c => (objetivo.ids as string[]).includes(c.id) && c.faltantes.length > 0)
    .sort((a, b) => (b.propios / b.total) - (a.propios / a.total))[0] ?? null
}

// ── Pact helpers ──────────────────────────────────────

function tieneAlianza(uid1: string, uid2: string, pactos: any[], ronda: number): boolean {
  return (pactos ?? []).some((p: any) =>
    p.tipo === 'alianza' && (p.rondaExpira ?? 0) >= ronda &&
    ((p.jugador1Id === uid1 && p.jugador2Id === uid2) ||
     (p.jugador1Id === uid2 && p.jugador2Id === uid1))
  )
}

function tieneNoAgresion(origenId: string, destinoId: string, pactos: any[], ronda: number): boolean {
  return (pactos ?? []).some((p: any) => {
    if (p.tipo !== 'no_agresion' || (p.rondaExpira ?? 0) < ronda) return false
    const terrsId2 = p.territoriosId2?.length ? p.territoriosId2 : (p.territorioId2 ? [p.territorioId2] : [])
    return (p.territorioId1 === origenId && terrsId2.includes(destinoId)) ||
           (p.territorioId1 === destinoId && terrsId2.includes(origenId))
  })
}

// ── Victory check ─────────────────────────────────────

function verificarVictoriaBot(
  conquistadoId: string,
  eliminadoId: string | null,
  objetivo: any,
  jugadores: Jugador[],
  terrs: TerrsMap,
): boolean {
  if (!objetivo) return false
  const ownerMap: Record<string, string> = {}
  for (const [tid, e] of Object.entries(terrs)) ownerMap[tid] = e.usuario_id
  ownerMap[conquistadoId] = BOT_USER_ID

  if (objetivo.tipo === 'continentes') {
    return (objetivo.ids as string[]).every((cid: string) =>
      (CONTINENT_TERRITORIES[cid] ?? []).every(tid => ownerMap[tid] === BOT_USER_ID)
    )
  }
  if (objetivo.tipo === 'destruir') {
    const target = jugadores.find(j => j.color === objetivo.color)
    if (!target) return Object.values(ownerMap).filter(uid => uid === BOT_USER_ID).length >= 24
    const quedan = Object.values(ownerMap).filter(uid => uid === target.usuario_id).length
    if (quedan === 0) {
      if (eliminadoId === target.usuario_id) return true
      return Object.values(ownerMap).filter(uid => uid === BOT_USER_ID).length >= 24
    }
  }
  return false
}

// ── Card drawing ──────────────────────────────────────

async function robarCartaBot(
  partidaId: string,
  ultimoConquistadoId: string,
  terrs: TerrsMap,
  botJ: Jugador,
): Promise<void> {
  const cartasActuales: string[] = botJ.cartas ?? []
  const disponibles = TERRITORIES.map(t => t.id).filter(id => !cartasActuales.includes(id))
  if (!disponibles.length) return

  const cartaId      = disponibles[Math.floor(Math.random() * disponibles.length)]
  const nuevasCartas = [...cartasActuales, cartaId]
  let   bonusCartaId: string | null = null

  if (cartaId === ultimoConquistadoId) {
    const restantes = disponibles.filter(id => id !== cartaId)
    if (restantes.length > 0) {
      bonusCartaId = restantes[Math.floor(Math.random() * restantes.length)]
      nuevasCartas.push(bonusCartaId)
    }
  }

  await dbPatch('partida_jugador',
    `partida_id=eq.${partidaId}&usuario_id=eq.${BOT_USER_ID}`,
    { cartas: nuevasCartas }
  )

  const terrActual = terrs[cartaId]
  if (terrActual?.usuario_id === BOT_USER_ID) {
    await dbPatch('territorio_estado',
      `partida_id=eq.${partidaId}&territorio_id=eq.${cartaId}`,
      { tropas: terrActual.tropas + 2 }
    )
  }

  await rtBroadcast(`kuboteg-eventos-${partidaId}`, 'carta_robada', {
    jugadorId:     BOT_USER_ID,
    jugadorNombre: 'Bot',
    cartaNombre:   nombreTerritorio(cartaId),
    bonusNombre:   bonusCartaId ? nombreTerritorio(bonusCartaId) : null,
    ts:            Date.now(),
  })
}

// ── DB helpers ────────────────────────────────────────

async function getTerritorios(partidaId: string): Promise<TerrsMap> {
  const data = await dbGet<{ territorio_id: string; usuario_id: string; tropas: number }>(
    `territorio_estado?partida_id=eq.${partidaId}&select=territorio_id,usuario_id,tropas`
  )
  const map: TerrsMap = {}
  for (const t of data) map[t.territorio_id] = t
  console.log(`[getTerritorios] partidaId=${partidaId} count=${data.length}`)
  return map
}

async function getJugadores(partidaId: string): Promise<Jugador[]> {
  return dbGet<Jugador>(
    `partida_jugador?partida_id=eq.${partidaId}&select=usuario_id,tropas_por_colocar,objetivo,color,cartas`
  )
}

// ── Main handler ──────────────────────────────────────

Deno.serve(async (req) => {
  try {
    console.log(`[bot-turn] SERVICE_KEY starts=${SERVICE_KEY?.slice(0,20)} len=${SERVICE_KEY?.length}`)

    const body   = await req.json()
    const record = body.record ?? body

    console.log(`[bot-turn] recv id=${record?.id} estado=${record?.estado} idx=${record?.jugador_actual_index}`)

    if (!record?.id || record.estado !== 'En juego') return ok('not in game')

    const orden: string[] = record.orden_jugadores ?? []
    const idx: number     = record.jugador_actual_index ?? 0
    if (orden[idx] !== BOT_USER_ID) return ok('not bot turn')

    await delay(300)

    const fp = (await dbGet<any>(`partida?id=eq.${record.id}&select=*`))[0]
    console.log(`[bot-turn] refetch fp=${fp ? 'found' : 'null'} estado=${fp?.estado} idx=${fp?.jugador_actual_index} orden=${JSON.stringify(fp?.orden_jugadores)}`)
    if (!fp || fp.estado !== 'En juego') { console.log('[bot-turn] exit: state changed'); return ok('state changed') }

    // Usar el índice del record original — el refetch puede llegar con el turno ya avanzado
    const ordenFinal: string[] = fp.orden_jugadores ?? record.orden_jugadores ?? []
    const idxFinal: number = record.jugador_actual_index ?? 0
    console.log(`[bot-turn] ordenFinal[${idxFinal}]=${ordenFinal[idxFinal]} BOT=${BOT_USER_ID}`)
    if (ordenFinal[idxFinal] !== BOT_USER_ID) { console.log('[bot-turn] exit: not bot after refetch'); return ok('not bot after refetch') }
    fp.jugador_actual_index = idxFinal

    console.log(`[bot-turn] partida=${fp.id} fase=${fp.fase_actual} ronda=${fp.ronda_actual}`)

    if      (fp.fase_actual === 'colocacion')   await botColocacion(fp)
    else if (fp.fase_actual === 'ataque')       await botAtaque(fp)
    else if (fp.fase_actual === 'reagrupacion') await botReagrupacion(fp)

    return ok()
  } catch (e) {
    console.error('[bot-turn]', e)
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})

// ── Colocacion ────────────────────────────────────────

async function botColocacion(partida: any) {
  const [terrs, jugadores] = await Promise.all([
    getTerritorios(partida.id),
    getJugadores(partida.id),
  ])

  const botJ   = jugadores.find(j => j.usuario_id === BOT_USER_ID)
  const tropas = botJ?.tropas_por_colocar ?? 0
  console.log(`[botColocacion] terrs=${Object.keys(terrs).length} tropas=${tropas}`)

  if (tropas > 0) {
    const botTerrs = Object.entries(terrs).filter(([_, e]) => e.usuario_id === BOT_USER_ID)
    if (botTerrs.length > 0) {
      const estado  = evaluarEstado(terrs, jugadores, botJ?.objetivo)
      const patches: Record<string, number> = {}

      if (partida.ronda_actual <= 1) {
        // Ronda 1: sin sub-fase continental — todo a la mejor frontera
        const [tid] = mejorTerritorioDeLista(botTerrs, terrs)
        patches[tid] = tropas
      } else {
        const ownerMap: Record<string, string> = {}
        for (const [tid, e] of Object.entries(terrs)) ownerMap[tid] = e.usuario_id
        let restantes = tropas

        // 1. Bonus de continente completo → frontera más amenazada dentro de ese continente
        for (const cb of CONTINENT_BONUSES) {
          const contTerrs = CONTINENT_TERRITORIES[cb.id] ?? []
          if (!contTerrs.every(tid => ownerMap[tid] === BOT_USER_ID)) continue
          const contBot   = botTerrs.filter(([id]) => contTerrs.includes(id))
          if (!contBot.length) continue
          const conFront  = contBot.filter(([id]) => estado.fronteras.includes(id))
          const cands     = conFront.length > 0 ? conFront : contBot
          const [tid]     = cands.reduce((a, b) =>
            (estado.amenaza[a[0]] ?? 0) >= (estado.amenaza[b[0]] ?? 0) ? a : b
          )
          patches[tid] = (patches[tid] ?? 0) + cb.bonus
          restantes   -= cb.bonus
        }

        // 2. Ningún territorio de continente propio queda con < 2 tropas
        for (const cid of estado.continentesCompletos) {
          for (const tid of CONTINENT_TERRITORIES[cid] ?? []) {
            const actual = (terrs[tid]?.tropas ?? 0) + (patches[tid] ?? 0)
            if (actual < 2 && restantes > 0) {
              const add = Math.min(2 - actual, restantes)
              patches[tid] = (patches[tid] ?? 0) + add
              restantes   -= add
            }
          }
        }

        // 3. Distribuir restantes por ratio de amenaza (enemigos / propias)
        if (restantes > 0) {
          const contObj = continenteObjetivo(botJ?.objetivo, estado)

          const frontScored = estado.fronteras.map(fid => {
            const propias = (terrs[fid]?.tropas ?? 1) + (patches[fid] ?? 0)
            let   score   = (estado.amenaza[fid] ?? 0) / propias
            // Bonus si este territorio puede avanzar hacia el continente objetivo
            if (contObj) {
              const vecinos = TERRITORIES.find(t => t.id === fid)?.neighbors ?? []
              if (vecinos.some(v => contObj.faltantes.includes(v))) score += 1.5
            }
            return { id: fid, score }
          }).sort((a, b) => b.score - a.score)

          if (frontScored.length > 0) {
            // 60% al más amenazado, 40% al segundo (o todo si solo hay uno)
            const main = frontScored.length === 1
              ? restantes
              : Math.ceil(restantes * 0.6)
            patches[frontScored[0].id] = (patches[frontScored[0].id] ?? 0) + main
            restantes -= main
            if (restantes > 0) {
              const dest = frontScored[1]?.id ?? frontScored[0].id
              patches[dest] = (patches[dest] ?? 0) + restantes
            }
          } else {
            // Sin fronteras: reforzar el territorio con más tropas (reserva para expansión)
            const [tid] = mejorTerritorioDeLista(botTerrs, terrs)
            patches[tid] = (patches[tid] ?? 0) + restantes
          }
        }
      }

      await Promise.all(
        Object.entries(patches).map(([tid, add]) =>
          dbPatch('territorio_estado',
            `partida_id=eq.${partida.id}&territorio_id=eq.${tid}`,
            { tropas: terrs[tid].tropas + add }
          )
        )
      )
      console.log(`[botColocacion] colocó ${tropas} tropas en ${Object.keys(patches).length} territorio(s)`)
    }
    await dbPatch('partida_jugador',
      `partida_id=eq.${partida.id}&usuario_id=eq.${BOT_USER_ID}`,
      { tropas_por_colocar: 0 }
    )
  }

  const orden: string[] = partida.orden_jugadores
  const vivos    = getVivos(orden, terrs)
  const startIdx = primerVivoDesde((partida.ronda_actual - 1) % orden.length, orden, vivos)
  const nextIdx  = siguienteVivoIdx(partida.jugador_actual_index, orden, vivos)

  if (nextIdx === startIdx) {
    await dbPatch('partida', `id=eq.${partida.id}`, { fase_actual: 'ataque', jugador_actual_index: startIdx })
  } else {
    await dbPatch('partida', `id=eq.${partida.id}`, { jugador_actual_index: nextIdx })
  }
}

// ── Diplomacia del bot ────────────────────────────────

async function botConsiderarRomperPacto(
  partida: any, jugadores: Jugador[], terrs: TerrsMap,
  estado: EstadoBot, pactos: any[], ronda: number,
): Promise<string | null> {
  const pactoActivo = (pactos ?? []).find((p: any) =>
    p.estado !== 'en_transicion' && (p.rondaExpira ?? 0) >= ronda &&
    (p.jugador1Id === BOT_USER_ID || p.jugador2Id === BOT_USER_ID)
  )
  if (!pactoActivo) return null

  const aliadoId  = pactoActivo.jugador1Id === BOT_USER_ID ? pactoActivo.jugador2Id : pactoActivo.jugador1Id
  const botJ      = jugadores.find(j => j.usuario_id === BOT_USER_ID)
  const objetivo  = botJ?.objetivo
  let   debeRomper = false

  if (estado.pctTerrs > 0.50) {
    debeRomper = true
    console.log(`[botRomperPacto] >50% territorios → rompiendo con ${aliadoId}`)
  } else if (objetivo?.tipo === 'destruir') {
    const targetJ = jugadores.find(j => j.color === objetivo.color)
    if (targetJ?.usuario_id === aliadoId) {
      // Oportunidad clara: ≥3 tropas propias en frontera con el aliado, más del doble que él
      const oportunidad = Object.entries(terrs).some(([tid, e]) => {
        if (e.usuario_id !== BOT_USER_ID || e.tropas < 3) return false
        return (TERRITORIES.find(t => t.id === tid)?.neighbors ?? [])
          .some(v => terrs[v]?.usuario_id === aliadoId && e.tropas > (terrs[v]?.tropas ?? 0) * 2)
      })
      if (oportunidad) {
        debeRomper = true
        console.log(`[botRomperPacto] objetivo destruir ${aliadoId} y hay oportunidad → rompiendo`)
      }
    }
  }

  if (!debeRomper) return null

  const nuevosPactos = (pactos ?? []).map((p: any) =>
    p.id === pactoActivo.id ? { ...p, estado: 'en_transicion', rondaExpira: ronda + 1 } : p
  )
  await dbPatch('partida', `id=eq.${partida.id}`, { pactos: nuevosPactos })
  const aliadoJ = jugadores.find(j => j.usuario_id === aliadoId)
  await rtBroadcast(`kuboteg-eventos-${partida.id}`, 'pacto_roto', {
    rompedorId:      BOT_USER_ID,
    rompedorNombre:  'IA Bot',
    afectadoId:      aliadoId,
    afectadoNombre:  aliadoJ ? 'Jugador' : aliadoId.slice(0, 6),
    tipo:            pactoActivo.tipo,
    ts:              Date.now(),
  })
  return aliadoId
}

async function botConsiderarPacto(
  partida: any, jugadores: Jugador[], terrs: TerrsMap,
  estado: EstadoBot, pactos: any[], ronda: number,
): Promise<void> {
  if (!estado.botCount) return
  // Solo proponer si estamos en desventaja o hay un jugador dominante
  if (estado.pctTerrs >= 0.35 && !estado.dominante) return

  const pactosVigentes = (pactos ?? []).filter((p: any) =>
    p.estado !== 'en_transicion' && (p.rondaExpira ?? 0) >= ronda &&
    (p.jugador1Id === BOT_USER_ID || p.jugador2Id === BOT_USER_ID)
  )
  if (pactosVigentes.length >= 2) return

  const botJ = jugadores.find(j => j.usuario_id === BOT_USER_ID)
  let targetDestruirId: string | null = null
  if (botJ?.objetivo?.tipo === 'destruir') {
    const targetJ = jugadores.find(j => j.color === botJ.objetivo.color)
    if (targetJ) targetDestruirId = targetJ.usuario_id
  }

  const yaConPacto = new Set(pactosVigentes.flatMap((p: any) => [p.jugador1Id, p.jugador2Id]))

  // Calcular amenaza por jugador (tropas enemigas adyacentes a las fronteras del bot)
  const amenazaPorJugador: Record<string, number> = {}
  for (const fid of estado.fronteras) {
    for (const v of TERRITORIES.find(t => t.id === fid)?.neighbors ?? []) {
      const ev = terrs[v]
      if (ev && ev.usuario_id !== BOT_USER_ID)
        amenazaPorJugador[ev.usuario_id] = (amenazaPorJugador[ev.usuario_id] ?? 0) + ev.tropas
    }
  }

  const candidatos = Object.entries(amenazaPorJugador)
    .filter(([uid]) => uid !== BOT_USER_ID && uid !== targetDestruirId && !yaConPacto.has(uid))
    .sort((a, b) => b[1] - a[1])

  if (!candidatos.length) return
  const [receptorId] = candidatos[0]

  // Buscar territorios adyacentes para no_agresion
  let territorioId1: string | undefined
  let territorioId2: string | undefined
  let tipo: 'no_agresion' | 'alianza' = 'no_agresion'

  for (const fid of estado.fronteras) {
    const vReceptor = (TERRITORIES.find(t => t.id === fid)?.neighbors ?? [])
      .find(v => terrs[v]?.usuario_id === receptorId)
    if (vReceptor) { territorioId1 = fid; territorioId2 = vReceptor; break }
  }
  if (!territorioId1 || !territorioId2) { tipo = 'alianza'; territorioId1 = undefined; territorioId2 = undefined }

  const propuesta = {
    id:           crypto.randomUUID(),
    tipo,
    proponenteId: BOT_USER_ID,
    receptorId,
    territorioId1,
    territorioId2,
    territoriosId2: territorioId2 ? [territorioId2] : undefined,
    ts:           Date.now(),
  }
  console.log(`[botConsiderarPacto] proponiendo ${tipo} a ${receptorId}`)
  await rtBroadcast(`kuboteg-eventos-${partida.id}`, 'pacto_propuesta', propuesta)
}

// ── Ataque ────────────────────────────────────────────

async function botAtaque(partida: any) {
  console.log(`[botAtaque] iniciando partidaId=${partida.id}`)
  const jugadores = await getJugadores(partida.id)
  const botJ      = jugadores.find(j => j.usuario_id === BOT_USER_ID)
  const objetivo  = botJ?.objetivo ?? null
  let   pactos    = (partida.pactos as any[]) ?? []
  const ronda     = partida.ronda_actual ?? 1

  let terrs  = await getTerritorios(partida.id)
  let estado = evaluarEstado(terrs, jugadores, objetivo)

  // 1. Considerar romper un pacto antes de atacar (ataque sorpresa)
  const exAliadoId = await botConsiderarRomperPacto(partida, jugadores, terrs, estado, pactos, ronda)
  if (exAliadoId) {
    const freshPartida = (await dbGet<any>(`partida?id=eq.${partida.id}&select=pactos`))[0]
    pactos = freshPartida?.pactos ?? pactos
  }

  // 2. Proponer pacto si es necesario (solo si no rompimos uno)
  if (!exAliadoId) {
    await botConsiderarPacto(partida, jugadores, terrs, estado, pactos, ronda)
  }

  // 3. Máximo de ataques adaptativo según posición territorial
  const MAX = estado.pctTerrs > 0.40 ? 5 + Math.floor(Math.random() * 4)  // agresivo: 5-8
            : estado.pctTerrs > 0.30 ? 3 + Math.floor(Math.random() * 3)  // moderado: 3-5
            :                          2 + Math.floor(Math.random() * 2)   // conservador: 2-3

  let conquistoAlgo = false
  let ultimoConqId  = ''
  const fallos: Record<string, number> = {}  // destinoId → fallos consecutivos

  for (let i = 0; i < MAX; i++) {
    console.log(`[botAtaque] loop i=${i} MAX=${MAX} pct=${estado.pctTerrs.toFixed(2)} modo=${estado.modoDefensivo ? 'DEF' : 'ATK'}`)
    await delay(1500)
    if (i > 0) {
      terrs  = await getTerritorios(partida.id)
      estado = evaluarEstado(terrs, jugadores, objetivo)
    }

    // Modo defensivo: solo atacar si hay oportunista (enemigo con 1 tropa en nuestra frontera)
    if (estado.modoDefensivo) {
      const hayOportunista = Object.entries(terrs).some(([tid, e]) => {
        if (e.usuario_id === BOT_USER_ID || e.tropas > 1) return false
        return (TERRITORIES.find(t => t.id === tid)?.neighbors ?? [])
          .some(v => terrs[v]?.usuario_id === BOT_USER_ID)
      })
      if (!hayOportunista) break
    }

    // Evaluar todos los ataques posibles con score
    const candidatos: {
      origenId: string; destinoId: string; score: number
      atkTropas: number; defTropas: number
    }[] = []

    for (const [tid, e] of Object.entries(terrs)) {
      if (e.usuario_id !== BOT_USER_ID || e.tropas < 3) continue  // mínimo 3 tropas para atacar

      for (const v of TERRITORIES.find(t => t.id === tid)?.neighbors ?? []) {
        const def = terrs[v]
        if (!def || def.usuario_id === BOT_USER_ID) continue
        if (tieneAlianza(BOT_USER_ID, def.usuario_id, pactos, ronda)) continue
        if (tieneNoAgresion(tid, v, pactos, ronda)) continue
        if (e.tropas <= def.tropas * 2) continue            // necesitamos más del doble
        if ((fallos[v] ?? 0) >= 2) continue                 // saltamos si falló 2+ veces seguidas

        let score = 0

        // Ataque sorpresa al ex-aliado
        if (exAliadoId && def.usuario_id === exAliadoId) score += 15

        // Territorio en el continente objetivo
        if (objetivo?.tipo === 'continentes') {
          if ((objetivo.ids as string[]).some((cid: string) => CONTINENT_TERRITORIES[cid]?.includes(v)))
            score += 10
        }

        // Esta conquista completa un continente
        const contDest = TERRITORIES.find(t => t.id === v)?.continent
        if (contDest) {
          const faltanEnCont = (CONTINENT_TERRITORIES[contDest] ?? [])
            .filter(t => terrs[t]?.usuario_id !== BOT_USER_ID).length
          if (faltanEnCont === 1) score += 8
        }

        // Objetivo destruir al defensor
        if (objetivo?.tipo === 'destruir') {
          const targetJ = jugadores.find(j => j.color === objetivo.color)
          if (targetJ && def.usuario_id === targetJ.usuario_id) score += 5
        }

        // Objetivo débil (≤2 tropas)
        if (def.tropas <= 2) score += 3

        // Penalizar si dejamos el origen expuesto (menos de la mitad de la amenaza que recibe)
        const amenazaOrigen  = estado.amenaza[tid] ?? 0
        const tropasDespues  = e.tropas - 3
        if (tropasDespues < amenazaOrigen * 0.5) score -= 5

        // Penalizar si reserva defensiva total es baja (<30% de tropas en fronteras)
        if (estado.tropasTotalesBot > 0) {
          const reserva = estado.fronteras.reduce((s, fid) => s + (terrs[fid]?.tropas ?? 0), 0)
            / estado.tropasTotalesBot
          if (reserva < 0.30) score -= 3
        }

        candidatos.push({ origenId: tid, destinoId: v, score, atkTropas: e.tropas, defTropas: def.tropas })
      }
    }

    if (!candidatos.length) break
    candidatos.sort((a, b) => b.score - a.score)
    const mejor = candidatos[0]

    const { data: res, error } = await dbRpc('resolver_combate', {
      p_partida_id: partida.id,
      p_origen_id:  mejor.origenId,
      p_destino_id: mejor.destinoId,
      p_usuario_id: BOT_USER_ID,
    })
    if (error || res?.error) { console.error('resolver_combate:', error ?? res?.error); break }

    const defUid = terrs[mejor.destinoId]?.usuario_id
    const defJ   = jugadores.find(j => j.usuario_id === defUid)

    // Persistir ultimo_combate para que Angular muestre el popup
    const ucPatchErr = await dbPatch('partida', `id=eq.${partida.id}`, {
      ultimo_combate: {
        dadosAtaque:      res.dados_ataque   ?? [],
        dadosDefensa:     res.dados_defensa  ?? [],
        bajasAtacante:    res.bajas_atacante ?? 0,
        bajasDefensor:    res.bajas_defensor ?? 0,
        conquista:        res.conquista      ?? false,
        atacanteNombre:   'IA Bot',
        defensorNombre:   '?',
        origenNombre:     mejor.origenId,
        destinoNombre:    mejor.destinoId,
        colorAtacante:    'rgb(159, 3, 3)',
        colorDefensor:    '#888',
        liderAtacanteImg: '',
        liderDefensorImg: '',
        ts:               Date.now(),
      }
    })
    console.log(`[botAtaque] ultimo_combate patch err=${JSON.stringify(ucPatchErr)}`)

    await rtBroadcast(`kuboteg-eventos-${partida.id}`, 'combate', {
      dadosAtaque:      res.dados_ataque   ?? [],
      dadosDefensa:     res.dados_defensa  ?? [],
      bajasAtacante:    res.bajas_atacante ?? 0,
      bajasDefensor:    res.bajas_defensor ?? 0,
      conquista:        res.conquista      ?? false,
      atacanteNombre:   'Bot',
      defensorNombre:   defJ ? 'Jugador' : '?',
      origenNombre:     nombreTerritorio(mejor.origenId),
      destinoNombre:    nombreTerritorio(mejor.destinoId),
      colorAtacante:    botJ?.color  ?? '#cc0000',
      colorDefensor:    defJ?.color  ?? '#ddbb00',
      liderAtacanteImg: '',
      liderDefensorImg: '',
      ts:               Date.now(),
    })

    if (res?.conquista) {
      delete fallos[mejor.destinoId]

      const maxMovibles = Math.min(3, Math.max(0, (res.tropas_origen_final ?? 1) - 1))
      const mover       = maxMovibles

      if (mover > 0) {
        const { error: moveErr } = await dbRpc('mover_tropas_conquista', {
          p_partida_id: partida.id,
          p_origen_id:  mejor.origenId,
          p_destino_id: mejor.destinoId,
          p_tropas:     mover,
          p_usuario_id: BOT_USER_ID,
        })
        if (moveErr) break
      } else {
        // Edge case: atacante quedó con 1 tropa — transferir soberanía directamente
        const patchErr = await dbPatch('territorio_estado',
          `partida_id=eq.${partida.id}&territorio_id=eq.${mejor.destinoId}`,
          { usuario_id: BOT_USER_ID, tropas: 1 }
        )
        if (patchErr) break
      }

      const origen  = terrs[mejor.origenId]
      const destino = terrs[mejor.destinoId]
      if (origen)  terrs[mejor.origenId]  = { ...origen,  tropas: mover > 0 ? origen.tropas  - mover : origen.tropas }
      if (destino) terrs[mejor.destinoId] = { ...destino, tropas: mover > 0 ? destino.tropas + mover : 1, usuario_id: BOT_USER_ID }

      conquistoAlgo = true
      ultimoConqId  = mejor.destinoId

      const defQuedan   = defUid ? Object.values(terrs).filter(t => t.usuario_id === defUid).length : 1
      const eliminadoId = defQuedan === 0 ? (defUid ?? null) : null

      await rtBroadcast(`kuboteg-eventos-${partida.id}`, 'conquista', {
        territorioNombre: nombreTerritorio(mejor.destinoId),
        atacanteNombre:   'Bot',
        defensorNombre:   defJ ? 'Jugador' : '?',
        colorAtacante:    botJ?.color ?? '#cc0000',
        ts:               Date.now(),
      })

      if (eliminadoId) {
        await rtBroadcast(`kuboteg-eventos-${partida.id}`, 'jugador_eliminado', {
          jugadorId:          eliminadoId,
          jugadorNombre:      defJ ? 'Jugador' : eliminadoId.slice(0, 6),
          eliminadoPorNombre: 'Bot',
          ts:                 Date.now(),
        })
      }

      if (verificarVictoriaBot(mejor.destinoId, eliminadoId, objetivo, jugadores, terrs)) {
        console.log(`[botAtaque] victoria detectada para Bot`)
        await dbPatch('partida', `id=eq.${partida.id}`, { ganador_id: BOT_USER_ID, estado: 'Finalizada' })
        return
      }

      await delay(800)
    } else {
      // Ataque fallido: registrar para evitar reintentos infinitos
      fallos[mejor.destinoId] = (fallos[mejor.destinoId] ?? 0) + 1
    }

    await delay(600)
  }

  if (conquistoAlgo && botJ) {
    terrs = await getTerritorios(partida.id)
    const freshBotJ = (await getJugadores(partida.id)).find(j => j.usuario_id === BOT_USER_ID) ?? botJ
    await robarCartaBot(partida.id, ultimoConqId, terrs, freshBotJ)
  }

  await dbPatch('partida', `id=eq.${partida.id}`, { fase_actual: 'reagrupacion' })
}

// ── Reagrupacion ──────────────────────────────────────

async function botReagrupacion(partida: any) {
  const [terrs, jugadores] = await Promise.all([
    getTerritorios(partida.id),
    getJugadores(partida.id),
  ])
  const botJ   = jugadores.find(j => j.usuario_id === BOT_USER_ID)
  const estado = evaluarEstado(terrs, jugadores, botJ?.objetivo)
  const botTerrs = Object.entries(terrs).filter(([_, e]) => e.usuario_id === BOT_USER_ID)

  // Territorios interiores: todos sus vecinos son propios y tienen >1 tropa
  const interiores = botTerrs.filter(([id, e]) => {
    if (e.tropas <= 1) return false
    return (TERRITORIES.find(t => t.id === id)?.neighbors ?? [])
      .every(v => !terrs[v] || terrs[v].usuario_id === BOT_USER_ID)
  })

  if (interiores.length > 0 && estado.fronteras.length > 0) {
    const [origenId, origenEst] = interiores.reduce((a, b) => a[1].tropas > b[1].tropas ? a : b)
    const vecinosOrigen = TERRITORIES.find(t => t.id === origenId)?.neighbors ?? []
    const contObj       = continenteObjetivo(botJ?.objetivo, estado)

    // Elegir la frontera alcanzable con mayor score
    let mejorFrontera: string | null = null
    let mejorScore    = -Infinity

    for (const fid of estado.fronteras) {
      if (!vecinosOrigen.includes(fid)) continue  // debe ser adyacente al origen

      let score = estado.amenaza[fid] ?? 0

      // Bonus si desde aquí podemos avanzar al continente objetivo
      if (contObj) {
        const vecinosFront = TERRITORIES.find(t => t.id === fid)?.neighbors ?? []
        if (vecinosFront.some(v => contObj.faltantes.includes(v))) score += 10
      }

      if (score > mejorScore) { mejorScore = score; mejorFrontera = fid }
    }

    if (mejorFrontera) {
      const mover      = origenEst.tropas - 1
      const destinoEst = terrs[mejorFrontera]
      if (mover > 0) {
        await Promise.all([
          dbPatch('territorio_estado', `partida_id=eq.${partida.id}&territorio_id=eq.${origenId}`,      { tropas: origenEst.tropas  - mover }),
          dbPatch('territorio_estado', `partida_id=eq.${partida.id}&territorio_id=eq.${mejorFrontera}`, { tropas: destinoEst.tropas + mover }),
        ])
        console.log(`[botReagrupacion] ${mover} tropas de ${origenId} → ${mejorFrontera} (score=${mejorScore})`)
      }
    }
  }

  await avanzarTurnoBot(partida, terrs)
}

// ── Advance turn ──────────────────────────────────────

async function avanzarTurnoBot(partida: any, terrs: TerrsMap) {
  const orden: string[] = partida.orden_jugadores
  const vivos    = getVivos(orden, terrs)
  const startIdx = primerVivoDesde((partida.ronda_actual - 1) % orden.length, orden, vivos)
  const nextIdx  = siguienteVivoIdx(partida.jugador_actual_index, orden, vivos)

  if (nextIdx === startIdx) {
    await iniciarNuevaRonda(partida, orden, vivos, terrs)
  } else {
    await dbPatch('partida', `id=eq.${partida.id}`, { fase_actual: 'ataque', jugador_actual_index: nextIdx })
  }
}

async function iniciarNuevaRonda(partida: any, orden: string[], vivos: Set<string>, terrs: TerrsMap) {
  const rondaActual: number   = partida.ronda_actual
  const limite: number | null = partida.limite_rondas ?? null
  if (limite && rondaActual >= limite) return

  const newRonda = rondaActual + 1
  const newStart = primerVivoDesde((newRonda - 1) % orden.length, orden, vivos)
  const divisor  = newRonda >= 2 ? 2 : 3

  const ownerMap: Record<string, string> = {}
  for (const [tid, e] of Object.entries(terrs)) ownerMap[tid] = e.usuario_id

  await Promise.all(orden.map(uid => {
    const myCount = Object.values(ownerMap).filter(o => o === uid).length
    const base    = vivos.has(uid) ? Math.max(3, Math.floor(myCount / divisor)) : 0
    const bonus   = vivos.has(uid) ? calcularBonusContinente(uid, ownerMap) : 0
    return dbPatch('partida_jugador',
      `partida_id=eq.${partida.id}&usuario_id=eq.${uid}`,
      { tropas_por_colocar: base + bonus }
    )
  }))

  await dbPatch('partida', `id=eq.${partida.id}`, {
    fase_actual:          'colocacion',
    jugador_actual_index: newStart,
    ronda_actual:         newRonda,
  })
}
