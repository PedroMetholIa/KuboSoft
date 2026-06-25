import {
  pactosActivos, pactosRompibles, countPactosJugador,
  tieneNoAgresion, hayHostilidadEntre,
  disolverPactosTerritorio, expirarPactos,
  esAdyacenteASeleccion, esSeleccionContigua,
  calcPactoDisponiblesPropio, calcPactoDisponiblesAjenos,
  territoriosEnRango,
} from './pactos.utils';
import { Pacto } from './game.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makePacto(
  overrides: Partial<Pacto> & { rondaExpira: number; jugador1Id: string; jugador2Id: string }
): Pacto {
  return {
    id: overrides.id ?? 'p1',
    tipo: 'no_agresion',
    jugador1Id: overrides.jugador1Id,
    jugador2Id: overrides.jugador2Id,
    rondaInicio: overrides.rondaInicio ?? 1,
    rondaExpira: overrides.rondaExpira,
    estado: overrides.estado,
    territoriosId1: overrides.territoriosId1,
    territorioId1:  overrides.territorioId1,
    territoriosId2: overrides.territoriosId2,
    territorioId2:  overrides.territorioId2,
  };
}

const J1 = 'player-1';
const J2 = 'player-2';
const J3 = 'player-3';

// ─── pactosActivos ────────────────────────────────────────────────────────────
describe('pactosActivos', () => {
  it('returns pactos that expire on or after the current round', () => {
    const p1 = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 5 });
    const p2 = makePacto({ id: 'p2', jugador1Id: J1, jugador2Id: J3, rondaExpira: 4 }); // expires exactly this round
    const pOld = makePacto({ id: 'old', jugador1Id: J2, jugador2Id: J3, rondaExpira: 3 }); // already expired
    const result = pactosActivos([p1, p2, pOld], 4).map(p => p.id);
    expect(result).toContain('p1');
    expect(result).toContain('p2');
    expect(result).not.toContain('old');
  });

  it('excludes pactos whose rondaExpira is before current round', () => {
    const expired = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 2 });
    expect(pactosActivos([expired], 3)).toEqual([]);
  });

  it('includes a pacto expiring exactly on current round', () => {
    const p = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 4 });
    expect(pactosActivos([p], 4).length).toBe(1);
  });

  it('returns empty array when input is empty', () => {
    expect(pactosActivos([], 1)).toEqual([]);
  });
});

// ─── pactosRompibles ─────────────────────────────────────────────────────────
describe('pactosRompibles', () => {
  it('excludes pactos in transition (estado === en_transicion)', () => {
    const p = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 5, estado: 'en_transicion' });
    expect(pactosRompibles([p], 3)).toEqual([]);
  });

  it('excludes pactos expiring in the current round', () => {
    const p = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 3 });
    expect(pactosRompibles([p], 3)).toEqual([]);
  });

  it('includes active pacto that does not expire this round and is not in transition', () => {
    const p = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 5 });
    expect(pactosRompibles([p], 3).length).toBe(1);
  });

  it('excludes already expired pactos', () => {
    const p = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 1 });
    expect(pactosRompibles([p], 3)).toEqual([]);
  });
});

// ─── countPactosJugador ───────────────────────────────────────────────────────
describe('countPactosJugador', () => {
  const pactos: Pacto[] = [
    makePacto({ id: 'a', jugador1Id: J1, jugador2Id: J2, rondaExpira: 5 }),
    makePacto({ id: 'b', jugador1Id: J1, jugador2Id: J3, rondaExpira: 5 }),
    makePacto({ id: 'c', jugador1Id: J2, jugador2Id: J3, rondaExpira: 5 }),
  ];

  it('counts pactos where player is jugador1', () => {
    expect(countPactosJugador(J1, pactos)).toBe(2);
  });

  it('counts pactos where player is jugador2', () => {
    expect(countPactosJugador(J2, pactos)).toBe(2);
  });

  it('counts pactos for player in position 2 only', () => {
    expect(countPactosJugador(J3, pactos)).toBe(2);
  });

  it('returns 0 for player with no pactos', () => {
    expect(countPactosJugador('nobody', pactos)).toBe(0);
  });
});

// ─── tieneNoAgresion ──────────────────────────────────────────────────────────
describe('tieneNoAgresion', () => {
  it('returns true when tId1 in territoriosId1 and tId2 in territoriosId2 (within expiry)', () => {
    const p = makePacto({
      jugador1Id: J1, jugador2Id: J2, rondaExpira: 5,
      territoriosId1: ['alaska', 'alberta'],
      territoriosId2: ['ontario', 'greenland'],
    });
    expect(tieneNoAgresion([p], 3, 'alaska', 'ontario')).toBeTrue();
  });

  it('returns true for reversed order (tId1 in t2 side, tId2 in t1 side)', () => {
    const p = makePacto({
      jugador1Id: J1, jugador2Id: J2, rondaExpira: 5,
      territoriosId1: ['alaska'],
      territoriosId2: ['ontario'],
    });
    expect(tieneNoAgresion([p], 3, 'ontario', 'alaska')).toBeTrue();
  });

  it('returns false when pacto is expired', () => {
    const p = makePacto({
      jugador1Id: J1, jugador2Id: J2, rondaExpira: 2,
      territoriosId1: ['alaska'],
      territoriosId2: ['ontario'],
    });
    expect(tieneNoAgresion([p], 3, 'alaska', 'ontario')).toBeFalse();
  });

  it('returns false when territories do not match any pacto', () => {
    const p = makePacto({
      jugador1Id: J1, jugador2Id: J2, rondaExpira: 5,
      territoriosId1: ['alaska'],
      territoriosId2: ['ontario'],
    });
    expect(tieneNoAgresion([p], 3, 'alaska', 'greenland')).toBeFalse();
  });

  it('supports single-territory form via territorioId1/territorioId2', () => {
    const p = makePacto({
      jugador1Id: J1, jugador2Id: J2, rondaExpira: 5,
      territorioId1: 'alaska',
      territorioId2: 'ontario',
    });
    expect(tieneNoAgresion([p], 3, 'alaska', 'ontario')).toBeTrue();
  });

  it('returns false for empty pactos list', () => {
    expect(tieneNoAgresion([], 3, 'alaska', 'ontario')).toBeFalse();
  });
});

// ─── hayHostilidadEntre ───────────────────────────────────────────────────────
describe('hayHostilidadEntre', () => {
  const ME = 'me';

  it('returns true when the local player (userId) declared hostility toward idB', () => {
    const posturas = { [J2]: 'hostil' as const };
    expect(hayHostilidadEntre(ME, J2, ME, posturas, [])).toBeTrue();
  });

  it('returns true when idA (not me) declared hostility toward idB (me)', () => {
    const jugadores = [
      { usuario_id: J1, posturas: { [ME]: 'hostil' as const } } as any,
    ];
    expect(hayHostilidadEntre(J1, ME, ME, {}, jugadores)).toBeTrue();
  });

  it('returns false when both are neutral', () => {
    const posturas = { [J2]: 'neutral' as const };
    const jugadores = [{ usuario_id: J2, posturas: { [ME]: 'neutral' as const } } as any];
    expect(hayHostilidadEntre(ME, J2, ME, posturas, jugadores)).toBeFalse();
  });

  it('returns false when no postura is recorded', () => {
    expect(hayHostilidadEntre(ME, J2, ME, {}, [])).toBeFalse();
  });

  it('returns true when both declared hostility', () => {
    const posturas = { [J2]: 'hostil' as const };
    const jugadores = [{ usuario_id: J2, posturas: { [ME]: 'hostil' as const } } as any];
    expect(hayHostilidadEntre(ME, J2, ME, posturas, jugadores)).toBeTrue();
  });
});

// ─── disolverPactosTerritorio ─────────────────────────────────────────────────
describe('disolverPactosTerritorio', () => {
  it('removes pactos covering the conquered territory (territoriosId1)', () => {
    const p = makePacto({
      jugador1Id: J1, jugador2Id: J2, rondaExpira: 5,
      territoriosId1: ['alaska', 'alberta'],
      territoriosId2: ['ontario'],
    });
    expect(disolverPactosTerritorio([p], 'alaska')).toEqual([]);
  });

  it('removes pactos covering the conquered territory (territoriosId2)', () => {
    const p = makePacto({
      jugador1Id: J1, jugador2Id: J2, rondaExpira: 5,
      territoriosId1: ['alaska'],
      territoriosId2: ['ontario', 'greenland'],
    });
    expect(disolverPactosTerritorio([p], 'ontario')).toEqual([]);
  });

  it('removes pactos via single-territory form (territorioId1)', () => {
    const p = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 5, territorioId1: 'alaska', territorioId2: 'ontario' });
    expect(disolverPactosTerritorio([p], 'alaska')).toEqual([]);
  });

  it('keeps pactos that do not cover the conquered territory', () => {
    const p = makePacto({
      jugador1Id: J1, jugador2Id: J2, rondaExpira: 5,
      territoriosId1: ['alberta'],
      territoriosId2: ['ontario'],
    });
    expect(disolverPactosTerritorio([p], 'alaska').length).toBe(1);
  });

  it('removes all pactos involving the eliminated player when jugadorEliminadoId is provided', () => {
    const pElim = makePacto({ id: 'elim', jugador1Id: J1, jugador2Id: J3, rondaExpira: 5 });
    const pKeep = makePacto({ id: 'keep', jugador1Id: J1, jugador2Id: J2, rondaExpira: 5 });
    const result = disolverPactosTerritorio([pElim, pKeep], 'alaska', J3);
    expect(result.map(p => p.id)).toEqual(['keep']);
  });

  it('does not mutate the input array', () => {
    const p = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 5, territoriosId1: ['alaska'], territoriosId2: ['ontario'] });
    const original = [p];
    disolverPactosTerritorio(original, 'alaska');
    expect(original.length).toBe(1);
  });
});

// ─── expirarPactos ────────────────────────────────────────────────────────────
describe('expirarPactos', () => {
  it('keeps a pacto whose rondaExpira equals rondaActual (still valid this round)', () => {
    const p = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 3 });
    expect(expirarPactos([p], 3).length).toBe(1);
  });

  it('removes a pacto whose rondaExpira is strictly less than rondaActual', () => {
    const p = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 3 });
    expect(expirarPactos([p], 4)).toEqual([]);
  });

  it('keeps pactos whose rondaExpira is greater than rondaActual', () => {
    const active = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 5 });
    expect(expirarPactos([active], 3).length).toBe(1);
  });

  it('does not mutate the input array', () => {
    const p = makePacto({ jugador1Id: J1, jugador2Id: J2, rondaExpira: 2 });
    const original = [p];
    expirarPactos(original, 4);
    expect(original.length).toBe(1);
  });
});

// ─── esAdyacenteASeleccion ────────────────────────────────────────────────────
// Neighbor data: alaska → [northwest_territory, alberta, kamchatka]
describe('esAdyacenteASeleccion', () => {
  it('returns true when territory has a neighbor in the selection', () => {
    expect(esAdyacenteASeleccion('alaska', ['northwest_territory', 'venezuela'])).toBeTrue();
  });

  it('returns false when no neighbor is in the selection', () => {
    expect(esAdyacenteASeleccion('alaska', ['venezuela', 'peru'])).toBeFalse();
  });

  it('returns false for empty selection', () => {
    expect(esAdyacenteASeleccion('alaska', [])).toBeFalse();
  });

  it('returns false for unknown territory id', () => {
    expect(esAdyacenteASeleccion('nonexistent_territory', ['alaska'])).toBeFalse();
  });
});

// ─── esSeleccionContigua ──────────────────────────────────────────────────────
// Chain: alaska — northwest_territory — ontario — quebec — greenland
describe('esSeleccionContigua', () => {
  it('returns true for empty or single-element selection', () => {
    expect(esSeleccionContigua([])).toBeTrue();
    expect(esSeleccionContigua(['alaska'])).toBeTrue();
  });

  it('returns true for two directly adjacent territories', () => {
    // alaska and northwest_territory are neighbors
    expect(esSeleccionContigua(['alaska', 'northwest_territory'])).toBeTrue();
  });

  it('returns true for a contiguous chain', () => {
    // alaska — northwest_territory — alberta (all adjacent)
    expect(esSeleccionContigua(['alaska', 'northwest_territory', 'alberta'])).toBeTrue();
  });

  it('returns false for two non-adjacent territories', () => {
    // alaska and venezuela are not neighbors
    expect(esSeleccionContigua(['alaska', 'venezuela'])).toBeFalse();
  });

  it('returns false when one territory is disconnected from the rest', () => {
    // alaska — northwest_territory are connected but venezuela is not
    expect(esSeleccionContigua(['alaska', 'northwest_territory', 'venezuela'])).toBeFalse();
  });

  it('returns true for south america (all four are mutually reachable)', () => {
    // venezuela–brazil–peru–argentina form a connected group
    expect(esSeleccionContigua(['venezuela', 'brazil', 'peru', 'argentina'])).toBeTrue();
  });
});

// ─── calcPactoDisponiblesPropio ───────────────────────────────────────────────
describe('calcPactoDisponiblesPropio', () => {
  // alaska neighbors: northwest_territory, alberta, kamchatka
  // If I own alaska+northwest_territory+alberta and start selecting alaska:
  const MIS_TERRS = new Set(['alaska', 'northwest_territory', 'alberta', 'ontario']);

  it('returns all own territories when no territory is selected yet', () => {
    const result = calcPactoDisponiblesPropio([], MIS_TERRS);
    expect(new Set(result)).toEqual(MIS_TERRS);
  });

  it('returns adjacent own territories not yet selected', () => {
    // Selected: ['alaska']. alaska neighbors in MIS_TERRS: northwest_territory, alberta
    const result = calcPactoDisponiblesPropio(['alaska'], MIS_TERRS);
    expect(new Set(result)).toEqual(new Set(['northwest_territory', 'alberta']));
  });

  it('does not return territories already in the selection', () => {
    const result = calcPactoDisponiblesPropio(['alaska', 'northwest_territory'], MIS_TERRS);
    expect(result).not.toContain('alaska');
    expect(result).not.toContain('northwest_territory');
  });

  it('only returns own territories (not enemy territories adjacent to selection)', () => {
    // 'kamchatka' is a neighbor of alaska but NOT in MIS_TERRS → should be excluded
    const result = calcPactoDisponiblesPropio(['alaska'], MIS_TERRS);
    expect(result).not.toContain('kamchatka');
  });
});

// ─── calcPactoDisponiblesAjenos ───────────────────────────────────────────────
describe('calcPactoDisponiblesAjenos', () => {
  const ME_ID = 'me';
  const REC_ID = 'receptor';

  // alaska (mine) borders northwest_territory (mine), alberta (mine), kamchatka (enemy)
  // If receptor owns kamchatka, it should appear as available
  const territorios: Record<string, { usuario_id: string }> = {
    alaska:              { usuario_id: ME_ID },
    northwest_territory: { usuario_id: ME_ID },
    kamchatka:           { usuario_id: REC_ID },
    alberta:             { usuario_id: ME_ID },
  };

  it('returns enemy territories adjacent to my selection', () => {
    // alaska borders kamchatka (owned by receptor)
    const result = calcPactoDisponiblesAjenos(['alaska'], [], REC_ID, territorios, ME_ID);
    expect(result).toContain('kamchatka');
  });

  it('does not include own territories', () => {
    const result = calcPactoDisponiblesAjenos(['alaska'], [], REC_ID, territorios, ME_ID);
    expect(result).not.toContain('alaska');
    expect(result).not.toContain('northwest_territory');
    expect(result).not.toContain('alberta');
  });

  it('does not include territories already selected', () => {
    const result = calcPactoDisponiblesAjenos(['alaska'], ['kamchatka'], REC_ID, territorios, ME_ID);
    expect(result).not.toContain('kamchatka');
  });

  it('excludes territories not owned by pactoReceptorId when receptor is specified', () => {
    const terrs2 = {
      ...territorios,
      greenland: { usuario_id: 'someone-else' },
      // northwest_territory already mine
    };
    // alaska's neighbors: northwest_territory (mine), alberta (mine), kamchatka (receptor)
    // greenland is not adjacent to alaska, so doesn't appear anyway
    const result = calcPactoDisponiblesAjenos(['alaska'], [], REC_ID, terrs2, ME_ID);
    expect(result).not.toContain('greenland');
    expect(result).toContain('kamchatka'); // owned by receptor
  });

  it('returns empty when no adjacent enemy territory exists', () => {
    // argentina neighbors: peru, brazil — both owned by ME_ID → no enemy adjacency
    const terrs3: Record<string, { usuario_id: string }> = {
      argentina: { usuario_id: ME_ID },
      peru:      { usuario_id: ME_ID },
      brazil:    { usuario_id: ME_ID },
    };
    const result = calcPactoDisponiblesAjenos(['argentina'], [], REC_ID, terrs3, ME_ID);
    expect(result).toEqual([]);
  });
});

// ─── territoriosEnRango ───────────────────────────────────────────────────────
// Graph: alaska → [northwest_territory, alberta, kamchatka]
//        northwest_territory → [alaska, alberta, ontario, greenland]
describe('territoriosEnRango', () => {
  it('returns empty set for 0 hops (origin excluded)', () => {
    const result = territoriosEnRango('alaska', 0);
    expect(result.size).toBe(0);
  });

  it('returns direct neighbors for 1 hop', () => {
    const result = territoriosEnRango('alaska', 1);
    expect(result.has('northwest_territory')).toBeTrue();
    expect(result.has('alberta')).toBeTrue();
    expect(result.has('kamchatka')).toBeTrue();
    expect(result.has('alaska')).toBeFalse(); // origin excluded
  });

  it('includes 2-hop neighbors without the origin', () => {
    // alaska → northwest_territory → ontario, greenland (new at hop 2)
    const result = territoriosEnRango('alaska', 2);
    expect(result.has('ontario')).toBeTrue();
    expect(result.has('greenland')).toBeTrue();
    expect(result.has('alaska')).toBeFalse();
  });

  it('set grows monotonically with more hops', () => {
    const r1 = territoriosEnRango('alaska', 1);
    const r2 = territoriosEnRango('alaska', 2);
    expect(r2.size).toBeGreaterThan(r1.size);
    for (const id of r1) {
      expect(r2.has(id)).toBeTrue();
    }
  });

  it('eventually covers all reachable territories for large hop counts', () => {
    // With 10 hops from alaska we should reach the entire connected map
    const result = territoriosEnRango('alaska', 10);
    expect(result.size).toBeGreaterThan(20);
    expect(result.has('venezuela')).toBeTrue(); // via central_america
  });
});
