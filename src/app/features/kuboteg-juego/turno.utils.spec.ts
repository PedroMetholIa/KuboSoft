import { calcResumenTropas, countMayorias, calcBonusContinente } from './turno.utils';

// Real continent territory IDs (subset needed for tests)
const SA  = ['venezuela', 'peru', 'brazil', 'argentina'];             // 4 → totalidad bonus 3, mayoría bonus 2 (threshold=3)
const OC  = ['indonesia', 'new_guinea', 'western_australia', 'eastern_australia']; // 4 → totalidad bonus 3, mayoría bonus 2 (threshold=3)
const AF  = ['north_africa', 'egypt', 'east_africa', 'congo', 'south_africa', 'madagascar']; // 6 → totalidad bonus 4, mayoría bonus 3 (threshold=4)
const EU  = ['iceland', 'scandinavia', 'great_britain', 'northern_europe', 'western_europe', 'southern_europe', 'ukraine']; // 7 → totalidad 7, mayoría 5 (threshold=4)
const NA  = ['alaska', 'northwest_territory', 'greenland', 'alberta', 'ontario', 'quebec',
             'western_united_states', 'eastern_united_states', 'central_america', 'cuba'];   // 10 → totalidad 7, mayoría 5 (threshold=6)
const AS  = ['middle_east', 'afghanistan', 'ural', 'siberia', 'yakutsk', 'irkutsk',
             'kamchatka', 'japan', 'mongolia', 'china', 'india', 'siam'];                     // 12 → totalidad 10, mayoría 7 (threshold=7)

const MY_ID = 'me';
const OTHER = 'other';

function terrs(mine: string[], theirs: string[] = []) {
  const r: Record<string, { usuario_id: string }> = {};
  for (const id of mine)   r[id] = { usuario_id: MY_ID };
  for (const id of theirs) r[id] = { usuario_id: OTHER };
  return r;
}

// ─── calcResumenTropas ────────────────────────────────────────────────────────
describe('calcResumenTropas', () => {

  describe('tropasBase — base troop income', () => {
    it('returns 0 troops when player owns no territories', () => {
      const r = calcResumenTropas({}, MY_ID, 1);
      expect(r.cantTerritorios).toBe(0);
      expect(r.tropasBase).toBe(0);
      expect(r.total).toBe(0);
    });

    it('returns minimum 3 troops when owning 1 territory (ronda 1)', () => {
      const r = calcResumenTropas(terrs([SA[0]]), MY_ID, 1);
      expect(r.tropasBase).toBe(3); // max(3, floor(1/3)=0) = 3
    });

    it('returns minimum 3 troops when owning 5 territories (ronda 1, divisor 3)', () => {
      // floor(5/3) = 1 < 3 → minimum 3
      const r = calcResumenTropas(terrs([...SA, SA[0]].slice(0, 5)), MY_ID, 1);
      expect(r.tropasBase).toBe(3);
    });

    it('returns floor(n/3) troops when owning 9 territories in ronda 1', () => {
      const r = calcResumenTropas(terrs([...SA, ...OC, AF[0]]), MY_ID, 1);
      expect(r.cantTerritorios).toBe(9);
      expect(r.tropasBase).toBe(3); // max(3, floor(9/3)=3) = 3
    });

    it('returns floor(n/3) when result > 3 (ronda 1, 12 territories)', () => {
      const r = calcResumenTropas(terrs([...SA, ...OC, ...AF]), MY_ID, 1);
      expect(r.cantTerritorios).toBe(14);
      expect(r.tropasBase).toBe(4); // max(3, floor(14/3)=4) = 4
    });

    it('uses divisor 2 from ronda 2 onwards', () => {
      const r = calcResumenTropas(terrs([...SA, ...OC, ...AF]), MY_ID, 2);
      expect(r.cantTerritorios).toBe(14);
      expect(r.tropasBase).toBe(7); // max(3, floor(14/2)=7) = 7
    });

    it('uses divisor 2 for any ronda >= 2', () => {
      const r = calcResumenTropas(terrs([...SA, ...OC]), MY_ID, 10);
      expect(r.tropasBase).toBe(4); // max(3, floor(8/2)=4) = 4
    });
  });

  describe('continent bonuses', () => {
    it('grants totalidad bonus for owning all territories in a continent', () => {
      // SA totalidad bonus = 3
      const r = calcResumenTropas(terrs([...SA]), MY_ID, 2);
      const saCont = r.continentes.find(c => c.nombre === 'Sudamérica')!;
      expect(saCont.tipo).toBe('totalidad');
      expect(saCont.bonus).toBe(3);
      expect(r.bonusContinentes).toBe(3);
    });

    it('grants mayoria bonus for owning majority (but not all) in a continent', () => {
      // SA: 3/4 = majority (threshold=3). mayoría bonus = 2
      const r = calcResumenTropas(terrs(SA.slice(0, 3)), MY_ID, 2);
      const saCont = r.continentes.find(c => c.nombre === 'Sudamérica')!;
      expect(saCont.tipo).toBe('mayoria');
      expect(saCont.bonus).toBe(2);
    });

    it('returns no bonus for a continent where player has below majority', () => {
      // SA: 2/4 < threshold(3) → null
      const r = calcResumenTropas(terrs(SA.slice(0, 2)), MY_ID, 2);
      const saCont = r.continentes.find(c => c.nombre === 'Sudamérica')!;
      expect(saCont.tipo).toBeNull();
      expect(saCont.bonus).toBe(0);
    });

    it('accumulates bonuses from multiple continents', () => {
      // OC totalidad (3) + AF totalidad (4) = 7
      const r = calcResumenTropas(terrs([...OC, ...AF]), MY_ID, 2);
      expect(r.bonusContinentes).toBe(7);
    });

    it('adds continent bonus to base troops correctly', () => {
      // 4 SA territories (ronda 2): tropasBase=max(3,floor(4/2)=2)=3, bonus totalidad SA=3 → total=6
      const r = calcResumenTropas(terrs([...SA]), MY_ID, 2);
      expect(r.tropasBase).toBe(3);
      expect(r.bonusContinentes).toBe(3);
      expect(r.total).toBe(6);
    });

    it('includes correct misTerr and totalTerr counts per continent', () => {
      const r = calcResumenTropas(terrs(SA.slice(0, 3)), MY_ID, 2);
      const saCont = r.continentes.find(c => c.nombre === 'Sudamérica')!;
      expect(saCont.misTerr).toBe(3);
      expect(saCont.totalTerr).toBe(4);
    });

    it('AF majority requires 4 of 6 territories (threshold = floor(6/2)+1 = 4)', () => {
      const r3 = calcResumenTropas(terrs(AF.slice(0, 3)), MY_ID, 2);
      expect(r3.continentes.find(c => c.nombre === 'África')!.tipo).toBeNull();

      const r4 = calcResumenTropas(terrs(AF.slice(0, 4)), MY_ID, 2);
      expect(r4.continentes.find(c => c.nombre === 'África')!.tipo).toBe('mayoria');
    });

    it('produces 0 bonus for continent owned by opponent', () => {
      const r = calcResumenTropas(terrs([], [...SA, ...OC]), MY_ID, 2);
      expect(r.bonusContinentes).toBe(0);
    });
  });

  describe('output structure', () => {
    it('returns all 6 continents in result', () => {
      const r = calcResumenTropas({}, MY_ID, 1);
      expect(r.continentes.length).toBe(6);
    });

    it('total equals tropasBase + bonusContinentes', () => {
      const r = calcResumenTropas(terrs([...SA, ...OC, ...AF, ...EU.slice(0, 4)]), MY_ID, 3);
      expect(r.total).toBe(r.tropasBase + r.bonusContinentes);
    });
  });

  describe('conMayorias = false', () => {
    it('does not grant mayoria bonus when conMayorias is false', () => {
      // SA: 3/4 = majority → bonus 2 normally, but 0 when conMayorias=false
      const r = calcResumenTropas(terrs(SA.slice(0, 3)), MY_ID, 2, false);
      const saCont = r.continentes.find(c => c.nombre === 'Sudamérica')!;
      expect(saCont.tipo).toBeNull();
      expect(saCont.bonus).toBe(0);
      expect(r.bonusContinentes).toBe(0);
    });

    it('still grants totalidad bonus when conMayorias is false', () => {
      // SA owned completely → totalidad always applies
      const r = calcResumenTropas(terrs([...SA]), MY_ID, 2, false);
      const saCont = r.continentes.find(c => c.nombre === 'Sudamérica')!;
      expect(saCont.tipo).toBe('totalidad');
      expect(saCont.bonus).toBe(3);
    });

    it('total matches actual DB grant when conMayorias is false', () => {
      // SA majority (3/4) + OC majority (3/4): with conMayorias=false → no continent bonus
      const r = calcResumenTropas(terrs([...SA.slice(0, 3), ...OC.slice(0, 3)]), MY_ID, 2, false);
      expect(r.bonusContinentes).toBe(0);
      expect(r.total).toBe(r.tropasBase);
    });
  });
});

// ─── countMayorias ────────────────────────────────────────────────────────────
describe('countMayorias', () => {
  it('returns 0 when no territories owned', () => {
    expect(countMayorias({}, MY_ID)).toBe(0);
  });

  it('returns 1 for majority in one continent', () => {
    // SA: 3/4 = majority
    expect(countMayorias(terrs(SA.slice(0, 3)), MY_ID)).toBe(1);
  });

  it('counts totalidad as a majority too', () => {
    expect(countMayorias(terrs([...SA]), MY_ID)).toBe(1);
  });

  it('returns 3 when player has majority in SA, OC and AF', () => {
    const t = terrs([...SA.slice(0, 3), ...OC.slice(0, 3), ...AF.slice(0, 4)]);
    expect(countMayorias(t, MY_ID)).toBe(3);
  });

  it('does not count below-majority ownership', () => {
    // OC: 2/4 < threshold(3) → 0
    expect(countMayorias(terrs(OC.slice(0, 2)), MY_ID)).toBe(0);
  });
});

// ─── calcBonusContinente ──────────────────────────────────────────────────────
describe('calcBonusContinente', () => {
  it('returns 0 when no territories owned', () => {
    expect(calcBonusContinente({}, MY_ID, true)).toBe(0);
  });

  it('grants totalidad bonus when owning all territories in a continent', () => {
    // SA totalidad bonus = 3
    expect(calcBonusContinente(terrs([...SA]), MY_ID, true)).toBe(3);
  });

  it('grants mayoria bonus when owning majority (conMayorias = true)', () => {
    // SA: 3/4 = majority, bonus = 2
    expect(calcBonusContinente(terrs(SA.slice(0, 3)), MY_ID, true)).toBe(2);
  });

  it('does NOT grant mayoria bonus when conMayorias = false', () => {
    // SA: 3/4 = majority but conMayorias disabled → no bonus
    expect(calcBonusContinente(terrs(SA.slice(0, 3)), MY_ID, false)).toBe(0);
  });

  it('still grants totalidad bonus even when conMayorias = false', () => {
    // Owning all of SA (totalidad) is always counted regardless of conMayorias
    expect(calcBonusContinente(terrs([...SA]), MY_ID, false)).toBe(3);
  });

  it('accumulates bonus from multiple continents (conMayorias = true)', () => {
    // SA totalidad (3) + OC totalidad (3) = 6
    expect(calcBonusContinente(terrs([...SA, ...OC]), MY_ID, true)).toBe(6);
  });

  it('accumulates only totalidad bonuses when conMayorias = false', () => {
    // SA totalidad (3), OC majority only (2) → 0 for OC
    expect(calcBonusContinente(terrs([...SA, ...OC.slice(0, 3)]), MY_ID, false)).toBe(3);
  });

  it('gives totalidad bonus for SA and mayoria for OC (conMayorias = true)', () => {
    // SA totalidad (3) + OC mayoría 3/4 (2) = 5
    expect(calcBonusContinente(terrs([...SA, ...OC.slice(0, 3)]), MY_ID, true)).toBe(5);
  });

  it('does not double-count a continent', () => {
    // All SA owned → totalidad only (not totalidad + mayoria)
    expect(calcBonusContinente(terrs([...SA]), MY_ID, true)).toBe(3); // not 3+2
  });
});
