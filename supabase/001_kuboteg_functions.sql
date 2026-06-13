-- =============================================================
-- KuboTeg – Funciones de servidor y políticas RLS
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================================


-- =============================================================
-- 1. FUNCIÓN: resolver_combate
--    Tira los dados, calcula bajas y actualiza territorios
--    de forma atómica. El userId viene del JWT (auth.uid()).
-- =============================================================
CREATE OR REPLACE FUNCTION resolver_combate(
  p_partida_id   uuid,
  p_origen_id    text,
  p_destino_id   text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid            uuid := auth.uid();
  v_partida        partida%ROWTYPE;
  v_origen         territorio_estado%ROWTYPE;
  v_destino        territorio_estado%ROWTYPE;
  v_n_ataque       int;
  v_n_defensa      int;
  v_dados_ataque   int[];
  v_dados_defensa  int[];
  v_bajas_at       int := 0;
  v_bajas_def      int := 0;
  v_pares          int;
  v_tropas_orig    int;
  v_tropas_dest    int;
  v_conquista      bool;
  i                int;
BEGIN
  -- Validar que el usuario está autenticado
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;

  -- Obtener partida
  SELECT * INTO v_partida FROM partida WHERE id = p_partida_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Partida no encontrada');
  END IF;
  IF v_partida.fase_actual != 'ataque' THEN
    RETURN jsonb_build_object('error', 'No es la fase de ataque');
  END IF;

  -- Verificar que es el turno del jugador
  IF (v_partida.orden_jugadores->>(v_partida.jugador_actual_index)) != v_uid::text THEN
    RETURN jsonb_build_object('error', 'No es tu turno');
  END IF;

  -- Obtener territorio origen
  SELECT * INTO v_origen
  FROM territorio_estado
  WHERE partida_id = p_partida_id AND territorio_id = p_origen_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Territorio origen no encontrado');
  END IF;
  IF v_origen.usuario_id != v_uid THEN
    RETURN jsonb_build_object('error', 'No sos dueño del territorio origen');
  END IF;
  IF v_origen.tropas <= 1 THEN
    RETURN jsonb_build_object('error', 'El origen necesita más de 1 tropa para atacar');
  END IF;

  -- Obtener territorio destino
  SELECT * INTO v_destino
  FROM territorio_estado
  WHERE partida_id = p_partida_id AND territorio_id = p_destino_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Territorio destino no encontrado');
  END IF;
  IF v_destino.usuario_id = v_uid THEN
    RETURN jsonb_build_object('error', 'No podés atacar tu propio territorio');
  END IF;

  -- Calcular cantidad de dados
  v_n_ataque  := LEAST(3, v_origen.tropas  - 1);
  v_n_defensa := LEAST(3, v_destino.tropas);

  -- Tirar dados server-side (ordenados de mayor a menor)
  SELECT array_agg(v ORDER BY v DESC)
  INTO v_dados_ataque
  FROM (
    SELECT floor(random() * 6 + 1)::int AS v
    FROM generate_series(1, v_n_ataque)
  ) sub;

  SELECT array_agg(v ORDER BY v DESC)
  INTO v_dados_defensa
  FROM (
    SELECT floor(random() * 6 + 1)::int AS v
    FROM generate_series(1, v_n_defensa)
  ) sub;

  -- Comparación par a par (empate gana el defensor)
  v_pares := LEAST(array_length(v_dados_ataque, 1), array_length(v_dados_defensa, 1));
  FOR i IN 1..v_pares LOOP
    IF v_dados_ataque[i] > v_dados_defensa[i] THEN
      v_bajas_def := v_bajas_def + 1;
    ELSE
      v_bajas_at := v_bajas_at + 1;
    END IF;
  END LOOP;

  v_tropas_orig := v_origen.tropas  - v_bajas_at;
  v_tropas_dest := v_destino.tropas - v_bajas_def;
  v_conquista   := v_tropas_dest <= 0;

  -- Actualizar territorios atómicamente
  IF v_conquista THEN
    -- Origen queda con las tropas restantes (movimiento se confirma aparte)
    UPDATE territorio_estado
    SET tropas = v_tropas_orig
    WHERE partida_id = p_partida_id AND territorio_id = p_origen_id;

    -- Destino queda en 0 tropas, cambia dueño
    UPDATE territorio_estado
    SET tropas = 0, usuario_id = v_uid
    WHERE partida_id = p_partida_id AND territorio_id = p_destino_id;
  ELSE
    UPDATE territorio_estado
    SET tropas = GREATEST(1, v_tropas_orig)
    WHERE partida_id = p_partida_id AND territorio_id = p_origen_id;

    UPDATE territorio_estado
    SET tropas = GREATEST(1, v_tropas_dest)
    WHERE partida_id = p_partida_id AND territorio_id = p_destino_id;
  END IF;

  RETURN jsonb_build_object(
    'dados_ataque',      to_json(v_dados_ataque),
    'dados_defensa',     to_json(v_dados_defensa),
    'bajas_atacante',    v_bajas_at,
    'bajas_defensor',    v_bajas_def,
    'conquista',         v_conquista,
    'tropas_origen_final', v_tropas_orig,
    'tropas_destino_final', v_tropas_dest
  );
END;
$$;


-- =============================================================
-- 2. FUNCIÓN: mover_tropas_conquista
--    Valida y ejecuta el movimiento post-conquista (1–3 tropas).
-- =============================================================
CREATE OR REPLACE FUNCTION mover_tropas_conquista(
  p_partida_id   uuid,
  p_origen_id    text,
  p_destino_id   text,
  p_tropas       int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid      uuid := auth.uid();
  v_partida  partida%ROWTYPE;
  v_origen   territorio_estado%ROWTYPE;
  v_destino  territorio_estado%ROWTYPE;
  v_max      int;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;

  SELECT * INTO v_partida FROM partida WHERE id = p_partida_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Partida no encontrada'); END IF;
  IF v_partida.fase_actual != 'ataque' THEN
    RETURN jsonb_build_object('error', 'No es la fase de ataque');
  END IF;
  IF (v_partida.orden_jugadores->>(v_partida.jugador_actual_index)) != v_uid::text THEN
    RETURN jsonb_build_object('error', 'No es tu turno');
  END IF;

  SELECT * INTO v_origen  FROM territorio_estado WHERE partida_id = p_partida_id AND territorio_id = p_origen_id;
  SELECT * INTO v_destino FROM territorio_estado WHERE partida_id = p_partida_id AND territorio_id = p_destino_id;

  IF v_origen.usuario_id  != v_uid THEN RETURN jsonb_build_object('error', 'Origen no es tuyo'); END IF;
  IF v_destino.usuario_id != v_uid THEN RETURN jsonb_build_object('error', 'Destino no es tuyo'); END IF;
  IF v_destino.tropas     != 0     THEN RETURN jsonb_build_object('error', 'El destino no está recién conquistado'); END IF;

  v_max := LEAST(3, v_origen.tropas - 1);
  IF p_tropas < 1 OR p_tropas > v_max THEN
    RETURN jsonb_build_object('error', 'Cantidad de tropas fuera de rango (1–' || v_max || ')');
  END IF;

  UPDATE territorio_estado SET tropas = v_origen.tropas - p_tropas WHERE partida_id = p_partida_id AND territorio_id = p_origen_id;
  UPDATE territorio_estado SET tropas = p_tropas          WHERE partida_id = p_partida_id AND territorio_id = p_destino_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;


-- =============================================================
-- 3. FUNCIÓN: declarar_ganador
--    Solo finaliza la partida si el jugador realmente posee
--    todos los territorios.
-- =============================================================
CREATE OR REPLACE FUNCTION declarar_ganador(
  p_partida_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid        uuid := auth.uid();
  v_partida    partida%ROWTYPE;
  v_total      int;
  v_propios    int;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;

  SELECT * INTO v_partida FROM partida WHERE id = p_partida_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Partida no encontrada'); END IF;
  IF v_partida.estado != 'En juego' THEN
    RETURN jsonb_build_object('error', 'La partida no está en juego');
  END IF;

  SELECT COUNT(*) INTO v_total  FROM territorio_estado WHERE partida_id = p_partida_id;
  SELECT COUNT(*) INTO v_propios FROM territorio_estado WHERE partida_id = p_partida_id AND usuario_id = v_uid;

  IF v_total = 0 THEN RETURN jsonb_build_object('error', 'La partida no tiene territorios'); END IF;
  IF v_propios < v_total THEN
    RETURN jsonb_build_object('error', 'Todavía hay territorios de otros jugadores');
  END IF;

  UPDATE partida
  SET estado = 'Finalizada', ganador_id = v_uid, turno_actual_usuario_id = NULL
  WHERE id = p_partida_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;


-- =============================================================
-- 4. ROW LEVEL SECURITY (RLS)
--    Habilita RLS y define políticas para las tablas del juego.
--    Las funciones SECURITY DEFINER arriba bypasean RLS cuando
--    necesitan escribir en nombre del jugador.
-- =============================================================

-- ── partida ──────────────────────────────────────────────────
ALTER TABLE partida ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kuboteg_partida_select" ON partida;
DROP POLICY IF EXISTS "kuboteg_partida_insert" ON partida;
DROP POLICY IF EXISTS "kuboteg_partida_update" ON partida;
DROP POLICY IF EXISTS "kuboteg_partida_delete" ON partida;

-- Cualquier usuario autenticado puede leer partidas
CREATE POLICY "kuboteg_partida_select"
ON partida FOR SELECT TO authenticated USING (true);

-- Solo el host puede crear
CREATE POLICY "kuboteg_partida_insert"
ON partida FOR INSERT TO authenticated
WITH CHECK (host_id = auth.uid());

-- Solo jugadores de la partida pueden actualizarla (gestión de turnos/fases)
CREATE POLICY "kuboteg_partida_update"
ON partida FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM partida_jugador
    WHERE partida_jugador.partida_id = partida.id
      AND partida_jugador.usuario_id = auth.uid()
  )
  OR host_id = auth.uid()
);

-- Solo el host puede eliminar
CREATE POLICY "kuboteg_partida_delete"
ON partida FOR DELETE TO authenticated
USING (host_id = auth.uid());


-- ── partida_jugador ──────────────────────────────────────────
ALTER TABLE partida_jugador ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kuboteg_pj_select" ON partida_jugador;
DROP POLICY IF EXISTS "kuboteg_pj_insert" ON partida_jugador;
DROP POLICY IF EXISTS "kuboteg_pj_update" ON partida_jugador;
DROP POLICY IF EXISTS "kuboteg_pj_delete" ON partida_jugador;

CREATE POLICY "kuboteg_pj_select"
ON partida_jugador FOR SELECT TO authenticated
USING (true);

-- Cualquier autenticado puede inscribirse
CREATE POLICY "kuboteg_pj_insert"
ON partida_jugador FOR INSERT TO authenticated
WITH CHECK (usuario_id = auth.uid());

-- Cada jugador solo actualiza su propia fila
CREATE POLICY "kuboteg_pj_update"
ON partida_jugador FOR UPDATE TO authenticated
USING (usuario_id = auth.uid());

-- Solo el propio jugador puede salir
CREATE POLICY "kuboteg_pj_delete"
ON partida_jugador FOR DELETE TO authenticated
USING (
  usuario_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM partida WHERE partida.id = partida_jugador.partida_id AND partida.host_id = auth.uid()
  )
);


-- ── territorio_estado ────────────────────────────────────────
ALTER TABLE territorio_estado ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kuboteg_te_select" ON territorio_estado;
DROP POLICY IF EXISTS "kuboteg_te_insert" ON territorio_estado;
DROP POLICY IF EXISTS "kuboteg_te_update" ON territorio_estado;
DROP POLICY IF EXISTS "kuboteg_te_delete" ON territorio_estado;

-- Todos los jugadores de la partida pueden leer los territorios
CREATE POLICY "kuboteg_te_select"
ON territorio_estado FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM partida_jugador
    WHERE partida_jugador.partida_id = territorio_estado.partida_id
      AND partida_jugador.usuario_id = auth.uid()
  )
);

-- Solo el host puede insertar (inicialización de territorios)
CREATE POLICY "kuboteg_te_insert"
ON territorio_estado FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM partida
    WHERE partida.id = territorio_estado.partida_id
      AND partida.host_id = auth.uid()
  )
);

-- Un jugador solo puede hacer UPDATE directo a sus propios territorios
-- (colocación de tropas y reagrupación). El combate va por RPC.
CREATE POLICY "kuboteg_te_update"
ON territorio_estado FOR UPDATE TO authenticated
USING (
  usuario_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM partida_jugador
    WHERE partida_jugador.partida_id = territorio_estado.partida_id
      AND partida_jugador.usuario_id = auth.uid()
  )
);
