import { generarObjetivosPool, asignarObjetivos, verificarVictoriaObjetivo } from './objetivos.utils';
import { ObjetivoSecreto } from './game.types';

// ─── Territory data (real IDs from territories.data.ts) ────────────────────────
const SA = ['venezuela', 'peru', 'brazil', 'argentina'];                       // 4 → majority = 3
const OC = ['indonesia', 'new_guinea', 'western_australia', 'eastern_australia']; // 4 → majority = 3
const AF = ['north_africa', 'egypt', 'east_africa', 'congo', 'south_africa', 'madagascar']; // 6 → majority = 4
const EU = ['iceland', 'scandinavia', 'great_britain', 'northern_europe', 'western_europe', 'southern_europe', 'ukraine']; // 7 → majority = 4
const NA = ['alaska', 'northwest_territory', 'greenland', 'alberta', 'ontario', 'quebec',
            'western_united_states', 'eastern_united_states', 'central_america', 'cuba']; // 10 → majority = 6
const AS = ['middle_east', 'afghanistan', 'ural', 'siberia', 'yakutsk', 'irkutsk',
            'kamchatka', 'japan', 'mongolia', 'china', 'india', 'siam'];        // 12 → majority = 7

const MY_ID = 'player-me';
const THEM  = 'player-them';

/** Build a territory record owned by MY_ID for the given IDs. */
function myTerrs(ids: string[]): Record<string, { usuario_id: string; territorio_id: string }> {
  return Object.fromEntries(ids.map(id => [id, { usuario_id: MY_ID, territorio_id: id }]));
}

/** Mix of myTerrs and opponent terrs. */
function mixedTerrs(mine: string[], theirs: string[]): Record<string, { usuario_id: string; territorio_id: string }> {
  const r: Record<string, { usuario_id: string; territorio_id: string }> = {};
  for (const id of mine)   r[id] = { usuario_id: MY_ID, territorio_id: id };
  for (const id of theirs) r[id] = { usuario_id: THEM,  territorio_id: id };
  return r;
}

// ─── generarObjetivosPool ──────────────────────────────────────────────────────
describe('generarObjetivosPool', () => {
  const JUGADORES = [
    { usuario_id: 'j1', color: 'red' },
    { usuario_id: 'j2', color: 'blue' },
    { usuario_id: 'j3', color: 'green' },
  ];

  it('generates 14 continent-pair objectives (15 pairs minus south_america+oceania)', () => {
    const pool = generarObjetivosPool(JUGADORES);
    const continentes = pool.filter(o => o.tipo === 'continentes');
    expect(continentes.length).toBe(14);
  });

  it('excludes the south_america + oceania pair', () => {
    const pool = generarObjetivosPool(JUGADORES);
    const hasSaOc = pool.some(o =>
      o.tipo === 'continentes' &&
      o.ids.includes('south_america') && o.ids.includes('oceania')
    );
    expect(hasSaOc).toBeFalse();
  });

  it('adds 2 destruir objectives per jugador with a color (double weight)', () => {
    const pool = generarObjetivosPool(JUGADORES);
    const destruir = pool.filter(o => o.tipo === 'destruir');
    expect(destruir.length).toBe(JUGADORES.length * 2); // 6
  });

  it('ignores jugadores without color', () => {
    const pool = generarObjetivosPool([{ usuario_id: 'j1', color: null }]);
    expect(pool.filter(o => o.tipo === 'destruir').length).toBe(0);
  });

  it('adds 6 tres_mayorias objectives, each with 3 specific continent ids', () => {
    const pool = generarObjetivosPool(JUGADORES);
    const tresMayorias = pool.filter(o => o.tipo === 'tres_mayorias');
    expect(tresMayorias.length).toBe(6);
    tresMayorias.forEach(o => {
      if (o.tipo === 'tres_mayorias') expect(o.ids.length).toBe(3);
    });
  });

  it('adds exactly 1 cuatro_mayorias objective', () => {
    const pool = generarObjetivosPool(JUGADORES);
    expect(pool.filter(o => o.tipo === 'cuatro_mayorias').length).toBe(1);
  });
});

// ─── asignarObjetivos ──────────────────────────────────────────────────────────
describe('asignarObjetivos', () => {
  const J1 = { usuario_id: 'j1', color: 'red' };
  const J2 = { usuario_id: 'j2', color: 'blue' };
  const J3 = { usuario_id: 'j3', color: 'green' };
  const JUGADORES = [J1, J2, J3];

  it('assigns one objective per jugador', () => {
    const pool = generarObjetivosPool(JUGADORES);
    const shuffled = [...pool];
    const { assignments } = asignarObjetivos(shuffled, JUGADORES, 'j1');
    expect(assignments.length).toBe(JUGADORES.length);
    const userIds = assignments.map(a => a.userId);
    expect(userIds).toContain('j1');
    expect(userIds).toContain('j2');
    expect(userIds).toContain('j3');
  });

  it('never assigns a "destruir" objective matching the player own color', () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      const pool = generarObjetivosPool(JUGADORES);
      const { assignments } = asignarObjetivos([...pool], JUGADORES, 'j1');
      for (const { userId, obj } of assignments) {
        if (obj.tipo === 'destruir') {
          const jugador = JUGADORES.find(j => j.usuario_id === userId)!;
          expect((obj as { tipo: 'destruir'; color: string }).color).not.toBe(jugador.color);
        }
      }
    }
  });

  it('sets miObjetivo to the objective assigned to userId', () => {
    const pool = generarObjetivosPool(JUGADORES);
    const { assignments, miObjetivo } = asignarObjetivos([...pool], JUGADORES, 'j2');
    const j2Assignment = assignments.find(a => a.userId === 'j2');
    expect(miObjetivo).toEqual(j2Assignment?.obj ?? null);
  });

  it('returns miObjetivo null when userId is not in jugadores', () => {
    const pool = generarObjetivosPool(JUGADORES);
    const { miObjetivo } = asignarObjetivos([...pool], JUGADORES, 'unknown');
    expect(miObjetivo).toBeNull();
  });

  it('does not mutate the input pool array', () => {
    const pool = generarObjetivosPool(JUGADORES);
    const original = [...pool];
    asignarObjetivos(pool, JUGADORES, 'j1');
    expect(pool.length).toBe(original.length);
  });
});

// ─── verificarVictoriaObjetivo ─────────────────────────────────────────────────
describe('verificarVictoriaObjetivo', () => {
  const JUGADORES_BASE = [
    { usuario_id: MY_ID, color: 'red' },
    { usuario_id: THEM,  color: 'blue' },
  ];

  // ── tipo: 'continentes' ──────────────────────────────────────────────────────
  describe("tipo 'continentes'", () => {
    const obj: ObjetivoSecreto = { tipo: 'continentes', ids: ['south_america', 'oceania'] };

    it('returns true when player owns all territories in both continents', () => {
      const territorios = myTerrs([...SA, ...OC]);
      const result = verificarVictoriaObjetivo(obj, SA[0], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeTrue();
    });

    it('returns true when conquistadoId completes the second continent', () => {
      // Own SA fully + OC minus the last one. conquistadoId = last OC territory.
      const lastOc = OC[OC.length - 1];
      const territorios = mixedTerrs([...SA, ...OC.slice(0, -1)], [lastOc]);
      const result = verificarVictoriaObjetivo(obj, lastOc, null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeTrue();
    });

    it('returns false when missing one territory in a continent (and not conquering it)', () => {
      // Own all SA but only OC[0..2] (missing OC[3]). Conquering an unrelated territory.
      const territorios = myTerrs([...SA, ...OC.slice(0, 3)]);
      const result = verificarVictoriaObjetivo(obj, SA[0], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeFalse();
    });

    it('returns false when one continent is completely missing', () => {
      const territorios = myTerrs([...SA]);
      const result = verificarVictoriaObjetivo(obj, SA[0], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeFalse();
    });
  });

  // ── tipo: 'destruir' con fallback ────────────────────────────────────────────
  describe("tipo 'destruir' with fallback", () => {
    const obj: ObjetivoSecreto = { tipo: 'destruir', color: 'blue', fallback: true };

    it('returns true when player owns >= 24 territories (counting conquistadoId)', () => {
      // Own 23 + the conquered territory = 24
      // In real game every territory exists in territorios (owned by someone).
      // Here: mine owns 23, THEM owns the 24th which we're about to conquer.
      const mine = [...SA, ...OC, ...AF, ...NA.slice(0, 9)]; // 4+4+6+9 = 23
      const conquista = NA[9]; // 'ontario' — owned by THEM
      const territorios = { ...myTerrs(mine), [conquista]: { usuario_id: THEM, territorio_id: conquista } };
      const result = verificarVictoriaObjetivo(obj, conquista, null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeTrue();
    });

    it('returns false when player owns < 24 territories', () => {
      const mine = [...SA, ...OC]; // 8 territories
      const territorios = myTerrs(mine);
      const result = verificarVictoriaObjetivo(obj, AF[0], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeFalse();
    });
  });

  // ── tipo: 'destruir' targeting a player ─────────────────────────────────────
  describe("tipo 'destruir' targeting a player", () => {
    const obj: ObjetivoSecreto = { tipo: 'destruir', color: 'blue' }; // THEM has color 'blue'

    it("returns true when target's last territory is conquered and eliminadoId matches", () => {
      // THEM owned only one territory; we conquer it → targetQuedan = 0
      const targetLastTerr = SA[0];
      const territorios = mixedTerrs(SA.slice(1), [targetLastTerr]);
      const result = verificarVictoriaObjetivo(obj, targetLastTerr, THEM, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeTrue();
    });

    it('returns false when target still has territories after conquest', () => {
      // THEM owns SA[0] and SA[1]. We conquer SA[0], but they still have SA[1].
      const territorios = mixedTerrs(OC, [SA[0], SA[1]]);
      const result = verificarVictoriaObjetivo(obj, SA[0], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeFalse();
    });

    it("returns true with 24 territories when target's last terr is ours after conquest but eliminadoId differs", () => {
      // targetQuedan = 0, eliminadoId does not match → fallback to 24-territory check
      const targetLastTerr = SA[0];
      const mine23 = [...OC, ...AF, ...EU.slice(0, 5)]; // 4+6+5 = 15, extend to 23
      const mine = [...mine23, ...NA.slice(0, 8)].slice(0, 23); // total 23
      const territorios = mixedTerrs(mine, [targetLastTerr]);
      // conquering their last territory makes us have 23+1=24
      const result = verificarVictoriaObjetivo(obj, targetLastTerr, 'someone-else', territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeTrue();
    });

    it('falls back to 24-territory check when target color is not found in jugadores', () => {
      const objUnknown: ObjetivoSecreto = { tipo: 'destruir', color: 'nonexistent' };
      // 23 mine + 1 THEM (the one we're conquering) = 24 via esMio
      const mine = [...SA, ...OC, ...AF, ...EU.slice(0, 7)]; // 4+4+6+7 = 21... add 2 from NA
      const mine23 = [...mine, ...NA.slice(0, 2)]; // 21+2 = 23
      const conquista = NA[2]; // 'greenland' — owned by THEM
      const territorios = { ...myTerrs(mine23), [conquista]: { usuario_id: THEM, territorio_id: conquista } };
      const result = verificarVictoriaObjetivo(objUnknown, conquista, null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeTrue();
    });
  });

  // ── tipo: 'tres_mayorias' ────────────────────────────────────────────────────
  describe("tipo 'tres_mayorias'", () => {
    // objective: majority in south_america, oceania, africa
    const obj: ObjetivoSecreto = { tipo: 'tres_mayorias', ids: ['south_america', 'oceania', 'africa'] };

    it('returns true when player has majority in all 3 specified continents', () => {
      // SA: own 3/4 (majority=3) ✓  OC: own 3/4 (majority=3) ✓  AF: own 4/6 (majority=4) ✓
      const territorios = myTerrs([...SA.slice(0, 3), ...OC.slice(0, 3), ...AF.slice(0, 4)]);
      const result = verificarVictoriaObjetivo(obj, SA[0], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeTrue();
    });

    it('returns true when player also has majority in extra continents beyond the 3 specified', () => {
      const territorios = myTerrs([...SA.slice(0, 3), ...OC.slice(0, 3), ...AF.slice(0, 4), ...EU.slice(0, 4)]);
      const result = verificarVictoriaObjetivo(obj, SA[0], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeTrue();
    });

    it('returns false when missing majority in one of the 3 specified continents', () => {
      // SA: 3/4 ✓, OC: 3/4 ✓, AF: only 2/6 ✗
      const territorios = myTerrs([...SA.slice(0, 3), ...OC.slice(0, 3), ...AF.slice(0, 2)]);
      const result = verificarVictoriaObjetivo(obj, SA[0], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeFalse();
    });

    it('returns false when player has majority in 3 continents but not the specified ones', () => {
      // Has majority in SA, OC, EU — but objective requires SA, OC, AF
      const territorios = myTerrs([...SA.slice(0, 3), ...OC.slice(0, 3), ...EU.slice(0, 4)]);
      const result = verificarVictoriaObjetivo(obj, SA[0], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeFalse();
    });

    it('counts conquistadoId toward majority', () => {
      // Own OC[0..1] (2/4, not yet majority) and SA (3/4) and AF (4/6).
      // Conquering OC[2] gives 3/4 = majority → all 3 specified continents have majority → true
      const territorios = mixedTerrs([...SA.slice(0, 3), ...OC.slice(0, 2), ...AF.slice(0, 4)], [OC[2]]);
      const result = verificarVictoriaObjetivo(obj, OC[2], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeTrue();
    });
  });

  // ── tipo: 'cuatro_mayorias' ──────────────────────────────────────────────────
  describe("tipo 'cuatro_mayorias'", () => {
    const obj: ObjetivoSecreto = { tipo: 'cuatro_mayorias' };

    it('returns true when player has majority in 4 continents', () => {
      // SA ✓ (3/4), OC ✓ (3/4), AF ✓ (4/6), EU ✓ (4/7)
      const territorios = myTerrs([...SA.slice(0, 3), ...OC.slice(0, 3), ...AF.slice(0, 4), ...EU.slice(0, 4)]);
      const result = verificarVictoriaObjetivo(obj, SA[0], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeTrue();
    });

    it('returns false when player has majority in only 3 continents', () => {
      // SA ✓ (3/4), OC ✓ (3/4), AF ✓ (4/6), EU: only 3/7 ✗
      const territorios = myTerrs([...SA.slice(0, 3), ...OC.slice(0, 3), ...AF.slice(0, 4), ...EU.slice(0, 3)]);
      const result = verificarVictoriaObjetivo(obj, SA[0], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeFalse();
    });

    it('returns true when player has majority in 5 continents', () => {
      // SA ✓, OC ✓, AF ✓, EU ✓, NA: 6/10 ✓
      const territorios = myTerrs([
        ...SA.slice(0, 3), ...OC.slice(0, 3), ...AF.slice(0, 4), ...EU.slice(0, 4), ...NA.slice(0, 6),
      ]);
      const result = verificarVictoriaObjetivo(obj, SA[0], null, territorios, MY_ID, JUGADORES_BASE);
      expect(result).toBeTrue();
    });
  });

  // ── edge cases ───────────────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('returns false for any objective type when territorios is empty (except valid destruir-fallback logic)', () => {
      const territorios = {};
      expect(verificarVictoriaObjetivo({ tipo: 'continentes', ids: ['south_america', 'oceania'] }, 'any', null, territorios, MY_ID, JUGADORES_BASE)).toBeFalse();
      expect(verificarVictoriaObjetivo({ tipo: 'tres_mayorias', ids: ['south_america', 'oceania', 'africa'] }, 'any', null, territorios, MY_ID, JUGADORES_BASE)).toBeFalse();
      expect(verificarVictoriaObjetivo({ tipo: 'cuatro_mayorias' }, 'any', null, territorios, MY_ID, JUGADORES_BASE)).toBeFalse();
    });
  });
});
