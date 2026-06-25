import { CONTINENT_BONUSES, CONTINENT_MAJORITY, CONTINENT_TERRITORIES, CONTINENT_NAMES } from './continentes.data';

/**
 * Calcula el bonus de continentes aplicado al otorgar tropas reales.
 * A diferencia del display (calcResumenTropas), respeta `conMayorias`:
 * si la partida no usa mayorías, solo se otorga bonus por totalidad.
 */
export function calcBonusContinente(
  territorios: Record<string, { usuario_id: string }>,
  userId: string,
  conMayorias: boolean
): number {
  let bonus = 0;
  for (const cb of CONTINENT_BONUSES) {
    const terrs     = CONTINENT_TERRITORIES[cb.id];
    const owned     = terrs.filter(tid => territorios[tid]?.usuario_id === userId).length;
    const threshold = Math.floor(terrs.length / 2) + 1;
    if (owned === terrs.length) {
      bonus += cb.bonus;
    } else if (owned >= threshold && conMayorias) {
      const maj = CONTINENT_MAJORITY.find(m => m.id === cb.id)!;
      bonus += maj.bonus;
    }
  }
  return bonus;
}

export interface ResumenContinente {
  nombre: string;
  bonus: number;
  tipo: 'totalidad' | 'mayoria' | null;
  misTerr: number;
  totalTerr: number;
}

export interface ResumenTropas {
  cantTerritorios: number;
  tropasBase: number;
  continentes: ResumenContinente[];
  bonusContinentes: number;
  total: number;
}

export function calcResumenTropas(
  territorios: Record<string, { usuario_id: string }>,
  userId: string,
  rondaActual: number,
  conMayorias = true
): ResumenTropas {
  const misTerritorios = Object.values(territorios).filter(t => t.usuario_id === userId);
  const cantTerritorios = misTerritorios.length;
  const divisor = rondaActual >= 2 ? 2 : 3;
  const tropasBase = cantTerritorios > 0 ? Math.max(3, Math.floor(cantTerritorios / divisor)) : 0;

  const continentes: ResumenContinente[] = CONTINENT_BONUSES.map(cb => {
    const terrsTotal = CONTINENT_TERRITORIES[cb.id];
    const misTerr    = terrsTotal.filter(tid => territorios[tid]?.usuario_id === userId).length;
    const threshold  = Math.floor(terrsTotal.length / 2) + 1;
    const maj        = CONTINENT_MAJORITY.find(m => m.id === cb.id)!;

    let tipo: 'totalidad' | 'mayoria' | null = null;
    let bonus = 0;
    if (misTerr === terrsTotal.length) {
      tipo  = 'totalidad';
      bonus = cb.bonus;
    } else if (misTerr >= threshold && conMayorias) {
      tipo  = 'mayoria';
      bonus = maj.bonus;
    }

    return { nombre: CONTINENT_NAMES[cb.id], bonus, tipo, misTerr, totalTerr: terrsTotal.length };
  });

  const bonusContinentes = continentes
    .filter(c => c.tipo !== null)
    .reduce((sum, c) => sum + c.bonus, 0);

  return { cantTerritorios, tropasBase, continentes, bonusContinentes, total: tropasBase + bonusContinentes };
}

export function countMayorias(
  territorios: Record<string, { usuario_id: string }>,
  userId: string
): number {
  return Object.entries(CONTINENT_TERRITORIES).filter(([, terrs]) => {
    const owned = terrs.filter(tid => territorios[tid]?.usuario_id === userId).length;
    return owned >= Math.floor(terrs.length / 2) + 1;
  }).length;
}
