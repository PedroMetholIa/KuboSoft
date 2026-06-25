import { ObjetivoSecreto } from './game.types';
import { CONTINENT_TERRITORIES } from './continentes.data';

type TerritorioDueño = { usuario_id: string; territorio_id: string };
type JugadorColor    = { usuario_id: string; color?: string | null };

/**
 * Genera el pool de objetivos posibles para una partida.
 * Excluye el par (south_america, oceania) por regla del juego.
 * Los objetivos "destruir" tienen doble peso (aparecen dos veces).
 */
export function generarObjetivosPool(jugadores: JugadorColor[]): ObjetivoSecreto[] {
  const CONTS = ['north_america', 'south_america', 'europe', 'africa', 'asia', 'oceania'];
  const pool: ObjetivoSecreto[] = [];

  for (let i = 0; i < CONTS.length; i++) {
    for (let j = i + 1; j < CONTS.length; j++) {
      const par = [CONTS[i], CONTS[j]];
      if (par.includes('south_america') && par.includes('oceania')) continue;
      pool.push({ tipo: 'continentes', ids: [CONTS[i], CONTS[j]] as [string, string] });
    }
  }

  for (const j of jugadores) {
    if (j.color) {
      pool.push({ tipo: 'destruir', color: j.color });
      pool.push({ tipo: 'destruir', color: j.color }); // doble peso
    }
  }

  for (let i = 0; i < 6; i++) pool.push({ tipo: 'tres_mayorias' });
  pool.push({ tipo: 'cuatro_mayorias' });

  return pool;
}

/**
 * Asigna objetivos del pool (ya mezclado) a los jugadores.
 * Garantiza que ningún jugador reciba un objetivo "destruir" con su propio color.
 */
export function asignarObjetivos(
  shuffledPool: ObjetivoSecreto[],
  jugadores: JugadorColor[],
  userId: string
): { assignments: Array<{ userId: string; obj: ObjetivoSecreto }>; miObjetivo: ObjetivoSecreto | null } {
  const pool = [...shuffledPool];
  const assignments: Array<{ userId: string; obj: ObjetivoSecreto }> = [];
  let miObjetivo: ObjetivoSecreto | null = null;

  for (const jugador of jugadores) {
    const idx = pool.findIndex(obj =>
      !(obj.tipo === 'destruir' && (obj as { tipo: 'destruir'; color: string }).color === jugador.color)
    );
    if (idx === -1) continue;
    const [obj] = pool.splice(idx, 1);
    if (jugador.usuario_id === userId) miObjetivo = obj;
    assignments.push({ userId: jugador.usuario_id, obj });
  }

  return { assignments, miObjetivo };
}

// `territorios` es el estado PRE-conquista; `conquistadoId` se trata como propio via `esMio`
// para no depender de que la DB haya sido actualizada en el momento de la verificación.
export function verificarVictoriaObjetivo(
  objetivo: ObjetivoSecreto,
  conquistadoId: string,
  eliminadoId: string | null,
  territorios: Record<string, TerritorioDueño>,
  userId: string,
  jugadores: JugadorColor[]
): boolean {
  const esMio = (tid: string) =>
    tid === conquistadoId || territorios[tid]?.usuario_id === userId;

  if (objetivo.tipo === 'continentes') {
    return objetivo.ids.every(cid => CONTINENT_TERRITORIES[cid]?.every(tid => esMio(tid)));
  }

  if (objetivo.tipo === 'destruir') {
    const misCant = () => Object.values(territorios).filter(t => esMio(t.territorio_id)).length;

    if (objetivo.fallback) return misCant() >= 24;

    const targetJ = jugadores.find(j => j.color === objetivo.color);
    if (!targetJ) return misCant() >= 24;

    const targetQuedan = Object.values(territorios).filter(
      t => t.usuario_id === targetJ.usuario_id && t.territorio_id !== conquistadoId
    ).length;

    if (targetQuedan === 0) {
      if (eliminadoId === targetJ.usuario_id) return true;
      return misCant() >= 24;
    }
  }

  if (objetivo.tipo === 'tres_mayorias') {
    const count = Object.entries(CONTINENT_TERRITORIES).filter(([, terrs]) =>
      terrs.filter(tid => esMio(tid)).length >= Math.floor(terrs.length / 2) + 1
    ).length;
    return count >= 3;
  }

  if (objetivo.tipo === 'cuatro_mayorias') {
    const count = Object.entries(CONTINENT_TERRITORIES).filter(([, terrs]) =>
      terrs.filter(tid => esMio(tid)).length >= Math.floor(terrs.length / 2) + 1
    ).length;
    return count >= 4;
  }

  return false;
}
