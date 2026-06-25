import { estaVivo, primerVivoDesde, siguienteVivoIdx, randomShuffle, seededShuffle } from './game.utils';

// ─── Helpers ────────────────────────────────────────────────────────────────

function mkJ(id: string, rendido = false) {
  return { usuario_id: id, rendido };
}

function mkT(entries: [id: string, dueño: string][]) {
  return Object.fromEntries(entries.map(([id, uid]) => [id, { usuario_id: uid }]));
}

// ─── estaVivo ────────────────────────────────────────────────────────────────

describe('estaVivo', () => {
  it('devuelve true si el jugador controla al menos un territorio', () => {
    const jugadores = [mkJ('A')];
    const territorios = mkT([['t1', 'A']]);
    expect(estaVivo('A', jugadores, territorios)).toBeTrue();
  });

  it('devuelve false si rendido=true aunque tenga territorios', () => {
    const jugadores = [mkJ('A', true)];
    const territorios = mkT([['t1', 'A']]);
    expect(estaVivo('A', jugadores, territorios)).toBeFalse();
  });

  it('devuelve false si no controla ningún territorio', () => {
    const jugadores = [mkJ('A')];
    const territorios = mkT([['t1', 'B']]);
    expect(estaVivo('A', jugadores, territorios)).toBeFalse();
  });

  it('devuelve false si el jugador no existe en la lista', () => {
    const jugadores = [mkJ('B')];
    const territorios = mkT([['t1', 'B']]);
    expect(estaVivo('A', jugadores, territorios)).toBeFalse();
  });

  it('devuelve false con territorios vacíos', () => {
    const jugadores = [mkJ('A')];
    expect(estaVivo('A', jugadores, {})).toBeFalse();
  });

  it('devuelve true cuando el jugador tiene múltiples territorios', () => {
    const jugadores = [mkJ('A')];
    const territorios = mkT([['t1', 'A'], ['t2', 'A'], ['t3', 'B']]);
    expect(estaVivo('A', jugadores, territorios)).toBeTrue();
  });

  it('rendido=false explícito con territories → vivo', () => {
    const jugadores = [mkJ('A', false)];
    const territorios = mkT([['t1', 'A']]);
    expect(estaVivo('A', jugadores, territorios)).toBeTrue();
  });
});

// ─── primerVivoDesde ─────────────────────────────────────────────────────────

describe('primerVivoDesde', () => {
  it('devuelve fromIdx si ese jugador ya está vivo', () => {
    const jugadores = [mkJ('A'), mkJ('B'), mkJ('C')];
    const territorios = mkT([['t1', 'A'], ['t2', 'B'], ['t3', 'C']]);
    expect(primerVivoDesde(0, ['A', 'B', 'C'], jugadores, territorios)).toBe(0);
    expect(primerVivoDesde(1, ['A', 'B', 'C'], jugadores, territorios)).toBe(1);
  });

  it('salta al primer jugador muerto y devuelve el siguiente vivo', () => {
    const jugadores = [mkJ('A', true), mkJ('B'), mkJ('C')];
    const territorios = mkT([['t1', 'B'], ['t2', 'C']]);
    expect(primerVivoDesde(0, ['A', 'B', 'C'], jugadores, territorios)).toBe(1);
  });

  it('salta múltiples jugadores muertos', () => {
    const jugadores = [mkJ('A', true), mkJ('B', true), mkJ('C')];
    const territorios = mkT([['t1', 'C']]);
    expect(primerVivoDesde(0, ['A', 'B', 'C'], jugadores, territorios)).toBe(2);
  });

  it('envuelve circularmente cuando los últimos están muertos', () => {
    const jugadores = [mkJ('A'), mkJ('B', true), mkJ('C', true)];
    const territorios = mkT([['t1', 'A']]);
    // Empieza en 1 (B muerto), 2 (C muerto), envuelve a 0 (A vivo)
    expect(primerVivoDesde(1, ['A', 'B', 'C'], jugadores, territorios)).toBe(0);
  });

  it('devuelve fromIdx si todos están muertos', () => {
    const jugadores = [mkJ('A', true), mkJ('B', true)];
    expect(primerVivoDesde(0, ['A', 'B'], jugadores, {})).toBe(0);
  });

  it('maneja orden vacío devolviendo fromIdx', () => {
    expect(primerVivoDesde(3, [], [], {})).toBe(3);
  });

  it('maneja fromIdx negativo normalizándolo', () => {
    const jugadores = [mkJ('A'), mkJ('B')];
    const territorios = mkT([['t1', 'A'], ['t2', 'B']]);
    // -1 mod 2 → índice 1 (B vivo)
    expect(primerVivoDesde(-1, ['A', 'B'], jugadores, territorios)).toBe(1);
  });

  it('maneja fromIdx mayor que la longitud del orden', () => {
    const jugadores = [mkJ('A'), mkJ('B')];
    const territorios = mkT([['t1', 'A'], ['t2', 'B']]);
    // fromIdx=5 mod 2 → índice 1 (B)
    expect(primerVivoDesde(5, ['A', 'B'], jugadores, territorios)).toBe(1);
  });
});

// ─── siguienteVivoIdx ─────────────────────────────────────────────────────────

describe('siguienteVivoIdx', () => {
  it('devuelve el índice inmediatamente siguiente si está vivo', () => {
    const jugadores = [mkJ('A'), mkJ('B'), mkJ('C')];
    const territorios = mkT([['t1', 'A'], ['t2', 'B'], ['t3', 'C']]);
    expect(siguienteVivoIdx(0, ['A', 'B', 'C'], jugadores, territorios)).toBe(1);
    expect(siguienteVivoIdx(1, ['A', 'B', 'C'], jugadores, territorios)).toBe(2);
  });

  it('salta jugadores muertos en la secuencia', () => {
    const jugadores = [mkJ('A'), mkJ('B', true), mkJ('C')];
    const territorios = mkT([['t1', 'A'], ['t2', 'C']]);
    // Desde 0 (A), el siguiente es 1 (B muerto) → salta a 2 (C)
    expect(siguienteVivoIdx(0, ['A', 'B', 'C'], jugadores, territorios)).toBe(2);
  });

  it('envuelve desde el último al primero', () => {
    const jugadores = [mkJ('A'), mkJ('B'), mkJ('C')];
    const territorios = mkT([['t1', 'A'], ['t2', 'B'], ['t3', 'C']]);
    expect(siguienteVivoIdx(2, ['A', 'B', 'C'], jugadores, territorios)).toBe(0);
  });

  it('envuelve y salta muertos al mismo tiempo', () => {
    const jugadores = [mkJ('A'), mkJ('B', true), mkJ('C')];
    const territorios = mkT([['t1', 'A'], ['t2', 'C']]);
    // Desde 2 (C), siguiente es 0 (A) después de envolver y saltando 1 (B muerto)
    expect(siguienteVivoIdx(2, ['A', 'B', 'C'], jugadores, territorios)).toBe(0);
  });

  it('devuelve fromIdx si todos están muertos', () => {
    const jugadores = [mkJ('A', true), mkJ('B', true)];
    expect(siguienteVivoIdx(0, ['A', 'B'], jugadores, {})).toBe(0);
  });

  it('maneja orden vacío devolviendo fromIdx', () => {
    expect(siguienteVivoIdx(0, [], [], {})).toBe(0);
  });

  it('con un único jugador vivo siempre devuelve su índice', () => {
    const jugadores = [mkJ('A'), mkJ('B', true), mkJ('C', true)];
    const territorios = mkT([['t1', 'A']]);
    expect(siguienteVivoIdx(0, ['A', 'B', 'C'], jugadores, territorios)).toBe(0);
    expect(siguienteVivoIdx(1, ['A', 'B', 'C'], jugadores, territorios)).toBe(0);
    expect(siguienteVivoIdx(2, ['A', 'B', 'C'], jugadores, territorios)).toBe(0);
  });
});

// ─── seededShuffle ────────────────────────────────────────────────────────────

describe('seededShuffle', () => {
  const arr = ['a', 'b', 'c', 'd', 'e', 'f'];

  it('es determinístico: misma semilla produce el mismo resultado', () => {
    const r1 = seededShuffle(arr, 'semilla-abc');
    const r2 = seededShuffle(arr, 'semilla-abc');
    expect(r1).toEqual(r2);
  });

  it('distintas semillas producen distintos resultados', () => {
    const r1 = seededShuffle(arr, 'semilla-1');
    const r2 = seededShuffle(arr, 'semilla-2');
    expect(r1).not.toEqual(r2);
  });

  it('conserva todos los elementos sin duplicados ni pérdidas', () => {
    const result = seededShuffle(arr, 'test');
    expect(result.slice().sort()).toEqual(arr.slice().sort());
  });

  it('devuelve un nuevo array sin mutar el original', () => {
    const original = ['x', 'y', 'z'];
    const result = seededShuffle(original, 'test');
    expect(result).not.toBe(original);
    expect(original).toEqual(['x', 'y', 'z']);
  });

  it('maneja array vacío', () => {
    expect(seededShuffle([], 'test')).toEqual([]);
  });

  it('maneja array de un elemento', () => {
    expect(seededShuffle(['solo'], 'test')).toEqual(['solo']);
  });

  it('trabaja con distintos tipos (números)', () => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = seededShuffle(nums, 'partida-id-123');
    expect(result.slice().sort((a, b) => a - b)).toEqual(nums);
  });

  it('una semilla de string vacío produce un resultado válido', () => {
    const result = seededShuffle(arr, '');
    expect(result.slice().sort()).toEqual(arr.slice().sort());
  });

  it('IDs de partida reales producen distribuciones diferentes', () => {
    const territorios = Array.from({ length: 42 }, (_, i) => `t${i}`);
    const r1 = seededShuffle(territorios, 'abc-111-def');
    const r2 = seededShuffle(territorios, 'abc-222-def');
    expect(r1).not.toEqual(r2);
    // Ambos deben tener todos los elementos
    expect(r1.slice().sort()).toEqual(territorios.slice().sort());
    expect(r2.slice().sort()).toEqual(territorios.slice().sort());
  });
});

// ─── randomShuffle ────────────────────────────────────────────────────────────

describe('randomShuffle', () => {
  it('conserva todos los elementos', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    const result = randomShuffle(arr);
    expect(result.slice().sort()).toEqual(arr.slice().sort());
  });

  it('devuelve un nuevo array sin mutar el original', () => {
    const original = ['x', 'y', 'z'];
    const result = randomShuffle(original);
    expect(result).not.toBe(original);
    expect(original).toEqual(['x', 'y', 'z']);
  });

  it('maneja array vacío', () => {
    expect(randomShuffle([])).toEqual([]);
  });

  it('maneja array de un elemento', () => {
    expect(randomShuffle(['único'])).toEqual(['único']);
  });

  it('produce al menos dos órdenes distintos en múltiples llamadas (probabilístico)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const resultados = new Set<string>();
    for (let i = 0; i < 20; i++) {
      resultados.add(randomShuffle(arr).join(','));
    }
    // Con 8 elementos y 20 llamadas, la probabilidad de siempre obtener el mismo orden es negligible
    expect(resultados.size).toBeGreaterThan(1);
  });
});
