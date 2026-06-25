import { PartidaJugador } from '../../core/services/supabase.service';
import { TERRITORIES } from './map/territories.data';
import { Pacto } from './game.types';

// ─── Query helpers ────────────────────────────────────────────────────────────

export function pactosActivos(pactos: Pacto[], ronda: number): Pacto[] {
  return pactos.filter(p => p.rondaExpira >= ronda);
}

export function pactosRompibles(pactos: Pacto[], ronda: number): Pacto[] {
  return pactosActivos(pactos, ronda).filter(
    p => p.estado !== 'en_transicion' && p.rondaExpira !== ronda
  );
}

export function countPactosJugador(userId: string, activos: Pacto[]): number {
  return activos.filter(p => p.jugador1Id === userId || p.jugador2Id === userId).length;
}

export function tieneNoAgresion(pactos: Pacto[], ronda: number, tId1: string, tId2: string): boolean {
  return pactos.some(p => {
    if (p.tipo !== 'no_agresion' || p.rondaExpira < ronda) return false;
    const t1 = p.territoriosId1?.length ? p.territoriosId1 : (p.territorioId1 ? [p.territorioId1] : []);
    const t2 = p.territoriosId2?.length ? p.territoriosId2 : (p.territorioId2 ? [p.territorioId2] : []);
    return (t1.includes(tId1) && t2.includes(tId2)) || (t1.includes(tId2) && t2.includes(tId1));
  });
}

/**
 * Comprueba si alguno de los dos jugadores declaró hostilidad al otro.
 * `posturasPropias` son las posturas del usuario actual (this.posturas).
 * `jugadores` es la lista completa para leer las posturas de terceros.
 */
export function hayHostilidadEntre(
  idA: string,
  idB: string,
  userId: string,
  posturasPropias: Record<string, 'amigable' | 'neutral' | 'hostil'>,
  jugadores: Pick<PartidaJugador, 'usuario_id' | 'posturas'>[]
): boolean {
  const postura = (declarante: string, objetivo: string): 'amigable' | 'neutral' | 'hostil' | undefined =>
    declarante === userId
      ? posturasPropias[objetivo]
      : jugadores.find(j => j.usuario_id === declarante)?.posturas?.[objetivo];

  return postura(idA, idB) === 'hostil' || postura(idB, idA) === 'hostil';
}

// ─── Mutation helpers (devuelven nuevo array, sin efectos secundarios) ────────

/**
 * Elimina pactos de no-agresión que cubren el territorio conquistado,
 * y todos los pactos del jugador eliminado (si lo hay).
 * No llama setPactos — el caller decide si persiste.
 */
export function disolverPactosTerritorio(
  pactos: Pacto[],
  territorioId: string,
  jugadorEliminadoId?: string | null
): Pacto[] {
  return pactos.filter(p => {
    if (p.tipo === 'no_agresion') {
      const t1 = p.territoriosId1?.length ? p.territoriosId1 : (p.territorioId1 ? [p.territorioId1] : []);
      const t2 = p.territoriosId2?.length ? p.territoriosId2 : (p.territorioId2 ? [p.territorioId2] : []);
      if (t1.includes(territorioId) || t2.includes(territorioId)) return false;
    }
    if (jugadorEliminadoId && (p.jugador1Id === jugadorEliminadoId || p.jugador2Id === jugadorEliminadoId)) return false;
    return true;
  });
}

/**
 * Filtra los pactos cuya rondaExpira ya pasó.
 * No llama setPactos — el caller decide si persiste.
 */
export function expirarPactos(pactos: Pacto[], rondaActual: number): Pacto[] {
  return pactos.filter(p => p.rondaExpira >= rondaActual);
}

// ─── Territory graph helpers ──────────────────────────────────────────────────

export function esAdyacenteASeleccion(id: string, seleccion: string[]): boolean {
  const vecinos = TERRITORIES.find(t => t.id === id)?.neighbors ?? [];
  return seleccion.some(s => vecinos.includes(s));
}

export function esSeleccionContigua(seleccion: string[]): boolean {
  if (seleccion.length <= 1) return true;
  const selSet = new Set(seleccion);
  const visited = new Set<string>([seleccion[0]]);
  const queue = [seleccion[0]];
  while (queue.length) {
    const curr = queue.shift()!;
    for (const v of (TERRITORIES.find(t => t.id === curr)?.neighbors ?? [])) {
      if (selSet.has(v) && !visited.has(v)) { visited.add(v); queue.push(v); }
    }
  }
  return visited.size === seleccion.length;
}

export function calcPactoDisponiblesPropio(pactoTerrsPropios: string[], misTerrsIds: Set<string>): string[] {
  if (pactoTerrsPropios.length === 0) return [...misTerrsIds];
  const yaSeleccionados = new Set(pactoTerrsPropios);
  const disponibles = new Set<string>();
  for (const tid of pactoTerrsPropios) {
    for (const v of (TERRITORIES.find(t => t.id === tid)?.neighbors ?? [])) {
      if (misTerrsIds.has(v) && !yaSeleccionados.has(v)) disponibles.add(v);
    }
  }
  return [...disponibles];
}

export function calcPactoDisponiblesAjenos(
  pactoTerrsPropios: string[],
  pactoTerrsAjenos: string[],
  pactoReceptorId: string | null,
  territorios: Record<string, { usuario_id: string }>,
  userId: string
): string[] {
  const yaSeleccionados = new Set(pactoTerrsAjenos);
  const disponibles = new Set<string>();
  for (const propio of pactoTerrsPropios) {
    for (const v of (TERRITORIES.find(t => t.id === propio)?.neighbors ?? [])) {
      const owner = territorios[v]?.usuario_id;
      if (!owner || owner === userId) continue;
      if (pactoReceptorId && owner !== pactoReceptorId) continue;
      if (!yaSeleccionados.has(v)) disponibles.add(v);
    }
  }
  return [...disponibles];
}

/** BFS para calcular todos los territorios alcanzables desde origen en ≤ maxHops pasos. */
export function territoriosEnRango(origen: string, maxHops: number): Set<string> {
  const visitados = new Set<string>([origen]);
  let frontera = [origen];
  for (let i = 0; i < maxHops; i++) {
    const siguiente: string[] = [];
    for (const curr of frontera) {
      for (const v of (TERRITORIES.find(t => t.id === curr)?.neighbors ?? [])) {
        if (!visitados.has(v)) { visitados.add(v); siguiente.push(v); }
      }
    }
    frontera = siguiente;
  }
  visitados.delete(origen);
  return visitados;
}
