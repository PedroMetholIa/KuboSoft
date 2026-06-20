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

function botPrioridad(destinoId: string, defensorId: string | undefined, objetivo: any, jugadores: Jugador[]): number {
  if (!objetivo) return 1
  if (objetivo.tipo === 'continentes') {
    return (objetivo.ids as string[])?.some(cid => CONTINENT_TERRITORIES[cid]?.includes(destinoId)) ? 10 : 1
  }
  if (objetivo.tipo === 'destruir') {
    const target = jugadores.find(j => j.color === objetivo.color)
    return (target && defensorId === target.usuario_id) ? 10 : 1
  }
  return 1
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
    jugadorId:   BOT_USER_ID,
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

    await delay(1500)

    const fp = (await dbGet<any>(`partida?id=eq.${record.id}&select=*`))[0]
    console.log(`[bot-turn] refetch fase=${fp?.fase_actual} idx=${fp?.jugador_actual_index} orden=${JSON.stringify(fp?.orden_jugadores)}`)
    if (!fp || fp.estado !== 'En juego') return ok('state changed')
    if ((fp.orden_jugadores ?? [])[fp.jugador_actual_index ?? 0] !== BOT_USER_ID) return ok('not bot after refetch')

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
      const patches: Record<string, number> = {}

      if (partida.ronda_actual <= 1) {
        // Ronda 1: sin sub-fase continental
        const [tid] = mejorTerritorioDeLista(botTerrs, terrs)
        patches[tid] = tropas
      } else {
        // Ronda 2+: igual que humano — bonus de continente va dentro del continente
        const ownerMap: Record<string, string> = {}
        for (const [tid, e] of Object.entries(terrs)) ownerMap[tid] = e.usuario_id

        let restantes = tropas
        for (const cb of CONTINENT_BONUSES) {
          const contTerrs = CONTINENT_TERRITORIES[cb.id] ?? []
          if (contTerrs.every(tid => ownerMap[tid] === BOT_USER_ID)) {
            const contBotTerrs = botTerrs.filter(([id]) => contTerrs.includes(id))
            if (contBotTerrs.length > 0) {
              const [tid] = mejorTerritorioDeLista(contBotTerrs, terrs)
              patches[tid] = (patches[tid] ?? 0) + cb.bonus
              restantes   -= cb.bonus
            }
          }
        }

        if (restantes > 0) {
          const [tid] = mejorTerritorioDeLista(botTerrs, terrs)
          patches[tid] = (patches[tid] ?? 0) + restantes
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

// ── Ataque ────────────────────────────────────────────

async function botAtaque(partida: any) {
  console.log(`[botAtaque] iniciando partidaId=${partida.id}`)
  const jugadores = await getJugadores(partida.id)
  const botJ      = jugadores.find(j => j.usuario_id === BOT_USER_ID)
  const objetivo  = botJ?.objetivo ?? null
  const pactos    = (partida.pactos as any[]) ?? []
  const ronda     = partida.ronda_actual ?? 1

  let terrs         = await getTerritorios(partida.id)
  let conquistoAlgo = false
  let ultimoConqId  = ''

  // Sin tope: ataca hasta agotar opciones válidas (igual que un humano)
  for (let i = 0; i < 50; i++) {
    await delay(1500)
    if (i > 0) terrs = await getTerritorios(partida.id)

    const atacantes = Object.entries(terrs)
      .filter(([_, e]) => e.usuario_id === BOT_USER_ID && e.tropas > 1)
      .map(([id, e]) => ({
        id,
        tropas: e.tropas,
        enemigos: (TERRITORIES.find(t => t.id === id)?.neighbors ?? [])
          .filter(v => {
            const ev = terrs[v]
            if (!ev || ev.usuario_id === BOT_USER_ID) return false
            // Respeta pactos igual que el humano
            if (tieneAlianza(BOT_USER_ID, ev.usuario_id, pactos, ronda)) return false
            if (tieneNoAgresion(id, v, pactos, ronda)) return false
            return true
          }),
      }))
      .filter(a => a.enemigos.length > 0)
      .sort((a, b) => b.tropas - a.tropas)

    if (!atacantes[0]) break

    const destinos = atacantes[0].enemigos
      .map(eid => ({
        id:       eid,
        tropas:   terrs[eid]?.tropas ?? 999,
        prioridad: botPrioridad(eid, terrs[eid]?.usuario_id, objetivo, jugadores),
      }))
      .sort((a, b) => b.prioridad - a.prioridad || a.tropas - b.tropas)

    if (!destinos[0]) break

    const { data: res, error } = await dbRpc('resolver_combate', {
      p_partida_id: partida.id,
      p_origen_id:  atacantes[0].id,
      p_destino_id: destinos[0].id,
      p_usuario_id: BOT_USER_ID,
    })
    if (error || res?.error) { console.error('resolver_combate:', error ?? res?.error); break }

    const defUid = terrs[destinos[0].id]?.usuario_id
    const defJ   = jugadores.find(j => j.usuario_id === defUid)

    if (!error && res && !res.error) {
      await dbPatch('partida', `id=eq.${partida.id}`, {
        ultimo_combate: {
          dadosAtaque:      res.dados_ataque   ?? [],
          dadosDefensa:     res.dados_defensa  ?? [],
          bajasAtacante:    res.bajas_atacante ?? 0,
          bajasDefensor:    res.bajas_defensor ?? 0,
          conquista:        res.conquista      ?? false,
          atacanteNombre:   'IA Bot',
          defensorNombre:   '?',
          origenNombre:     atacantes[0].id,
          destinoNombre:    destinos[0].id,
          colorAtacante:    'rgb(159, 3, 3)',
          colorDefensor:    '#888',
          liderAtacanteImg: '',
          liderDefensorImg: '',
          ts:               Date.now(),
        }
      })
    }

    await rtBroadcast(`kuboteg-eventos-${partida.id}`, 'combate', {
      dadosAtaque:      res.dados_ataque   ?? [],
      dadosDefensa:     res.dados_defensa  ?? [],
      bajasAtacante:    res.bajas_atacante ?? 0,
      bajasDefensor:    res.bajas_defensor ?? 0,
      conquista:        res.conquista      ?? false,
      atacanteNombre:   'Bot',
      defensorNombre:   defJ ? 'Jugador' : '?',
      origenNombre:     nombreTerritorio(atacantes[0].id),
      destinoNombre:    nombreTerritorio(destinos[0].id),
      colorAtacante:    botJ?.color  ?? '#cc0000',
      colorDefensor:    defJ?.color  ?? '#ddbb00',
      liderAtacanteImg: '',
      liderDefensorImg: '',
      ts:               Date.now(),
    })

    if (res?.conquista) {
      // Mismo límite que el humano: máximo 3 tropas tras conquista
      const maxMovibles = Math.min(3, Math.max(0, (res.tropas_origen_final ?? 1) - 1))
      const mover       = maxMovibles > 0 ? maxMovibles : 0

      if (mover > 0) {
        const { error: moveErr } = await dbRpc('mover_tropas_conquista', {
          p_partida_id: partida.id,
          p_origen_id:  atacantes[0].id,
          p_destino_id: destinos[0].id,
          p_tropas:     mover,
          p_usuario_id: BOT_USER_ID,
        })
        if (moveErr) break
      } else {
        // Edge case: atacante quedó con 1 tropa sola — no puede mover ninguna sin dejar
        // su territorio vacío. Transferimos directamente la soberanía con 1 tropa.
        const patchErr = await dbPatch('territorio_estado',
          `partida_id=eq.${partida.id}&territorio_id=eq.${destinos[0].id}`,
          { usuario_id: BOT_USER_ID, tropas: 1 }
        )
        if (patchErr) break
      }

      // Actualizar mapa local sin esperar Realtime
      const origen  = terrs[atacantes[0].id]
      const destino = terrs[destinos[0].id]
      if (origen)  terrs[atacantes[0].id] = { ...origen,  tropas: mover > 0 ? origen.tropas - mover : origen.tropas }
      if (destino) terrs[destinos[0].id]  = { ...destino, tropas: mover > 0 ? destino.tropas + mover : 1, usuario_id: BOT_USER_ID }

      conquistoAlgo = true
      ultimoConqId  = destinos[0].id

      const defQuedan = defUid
        ? Object.values(terrs).filter(t => t.usuario_id === defUid).length
        : 1
      const eliminadoId = defQuedan === 0 ? (defUid ?? null) : null

      await rtBroadcast(`kuboteg-eventos-${partida.id}`, 'conquista', {
        territorioNombre: nombreTerritorio(destinos[0].id),
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

      // Verifica victoria igual que el humano
      if (verificarVictoriaBot(destinos[0].id, eliminadoId, objetivo, jugadores, terrs)) {
        console.log(`[botAtaque] victoria detectada para Bot`)
        // Actualiza la partida directamente con service key (declarar_ganador_objetivo usa auth.uid())
        await dbPatch('partida', `id=eq.${partida.id}`, { ganador_id: BOT_USER_ID, estado: 'Finalizada' })
        return
      }

      await delay(800)
    }
    await delay(600)
  }

  // Roba carta si conquistó al menos un territorio — igual que el humano en saltarReagrupacion
  if (conquistoAlgo && botJ) {
    terrs = await getTerritorios(partida.id)
    const freshBotJ = (await getJugadores(partida.id)).find(j => j.usuario_id === BOT_USER_ID) ?? botJ
    await robarCartaBot(partida.id, ultimoConqId, terrs, freshBotJ)
  }

  await dbPatch('partida', `id=eq.${partida.id}`, { fase_actual: 'reagrupacion' })
}

// ── Reagrupacion ──────────────────────────────────────

async function botReagrupacion(partida: any) {
  const terrs    = await getTerritorios(partida.id)
  const botTerrs = Object.entries(terrs).filter(([_, e]) => e.usuario_id === BOT_USER_ID)

  const interiores = botTerrs.filter(([id, e]) => {
    if (e.tropas <= 1) return false
    return (TERRITORIES.find(t => t.id === id)?.neighbors ?? [])
      .every(v => !terrs[v] || terrs[v].usuario_id === BOT_USER_ID)
  })

  const fronteras = botTerrs.filter(([id]) =>
    (TERRITORIES.find(t => t.id === id)?.neighbors ?? [])
      .some(v => terrs[v] && terrs[v].usuario_id !== BOT_USER_ID)
  )

  if (interiores.length > 0 && fronteras.length > 0) {
    const [origenId, origenEst]   = interiores.reduce((a, b) => a[1].tropas > b[1].tropas ? a : b)
    const [destinoId, destinoEst] = fronteras.reduce((a, b)  => a[1].tropas < b[1].tropas ? a : b)
    const vecinos = TERRITORIES.find(t => t.id === origenId)?.neighbors ?? []
    if (origenId !== destinoId && vecinos.includes(destinoId)) {
      const mover = origenEst.tropas - 1
      if (mover > 0) {
        await Promise.all([
          dbPatch('territorio_estado', `partida_id=eq.${partida.id}&territorio_id=eq.${origenId}`,  { tropas: origenEst.tropas  - mover }),
          dbPatch('territorio_estado', `partida_id=eq.${partida.id}&territorio_id=eq.${destinoId}`, { tropas: destinoEst.tropas + mover }),
        ])
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
