import { PartidaJugador, TerritorioEstado } from '../../core/services/supabase.service';

type JugadorVivo = Pick<PartidaJugador, 'usuario_id' | 'rendido'>;
type TerritorioDueño = Pick<TerritorioEstado, 'usuario_id'>;

/**
 * Un jugador está vivo si no se rindió y controla al menos un territorio.
 */
export function estaVivo(
  jugadorId: string,
  jugadores: JugadorVivo[],
  territorios: Record<string, TerritorioDueño>
): boolean {
  if (jugadores.find(j => j.usuario_id === jugadorId)?.rendido) return false;
  return Object.values(territorios).some(t => t.usuario_id === jugadorId);
}

/**
 * Devuelve el índice del primer jugador vivo empezando desde fromIdx (inclusive).
 * Envuelve circularmente. Si ninguno está vivo, devuelve fromIdx.
 */
export function primerVivoDesde(
  fromIdx: number,
  orden: string[],
  jugadores: JugadorVivo[],
  territorios: Record<string, TerritorioDueño>
): number {
  const n = orden.length;
  if (n === 0) return fromIdx;
  let idx = ((fromIdx % n) + n) % n;
  for (let i = 0; i < n; i++) {
    if (estaVivo(orden[idx], jugadores, territorios)) return idx;
    idx = (idx + 1) % n;
  }
  return fromIdx;
}

/**
 * Devuelve el índice del siguiente jugador vivo después de fromIdx.
 * Envuelve circularmente. Si ninguno está vivo, devuelve fromIdx.
 */
export function siguienteVivoIdx(
  fromIdx: number,
  orden: string[],
  jugadores: JugadorVivo[],
  territorios: Record<string, TerritorioDueño>
): number {
  const n = orden.length;
  if (n === 0) return fromIdx;
  let idx = (fromIdx + 1) % n;
  for (let i = 0; i < n; i++) {
    if (estaVivo(orden[idx], jugadores, territorios)) return idx;
    idx = (idx + 1) % n;
  }
  return fromIdx;
}

/**
 * Fisher-Yates shuffle usando Math.random (no determinístico).
 * Devuelve un nuevo array sin mutar el original.
 */
export function randomShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Fisher-Yates shuffle con semilla LCG derivada de un string.
 * Mismo seed + mismo array = siempre el mismo resultado.
 * Devuelve un nuevo array sin mutar el original.
 */
export function seededShuffle<T>(arr: T[], seed: string): T[] {
  const result = [...arr];
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (Math.imul(31, s) + seed.charCodeAt(i)) | 0;
  for (let i = result.length - 1; i > 0; i--) {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
