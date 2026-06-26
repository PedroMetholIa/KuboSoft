import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

export const BOT_USER_ID = '9ee14107-478e-4a24-bec4-aceb9f550884';

export interface Profile {
  id: string;
  email: string;
  nombre: string | null;
  apellido: string | null;
  mensaje: string | null;
  is_online: boolean;
  last_seen: string | null;
  created_at: string;
}

export interface Producto {
  id: string;
  nombre: string;
}

export interface UltimoCombate {
  dadosAtaque: number[];
  dadosDefensa: number[];
  bajasAtacante: number;
  bajasDefensor: number;
  conquista: boolean;
  atacanteNombre: string;
  defensorNombre: string;
  origenNombre: string;
  destinoNombre: string;
  colorAtacante: string;
  colorDefensor: string;
  liderAtacanteImg: string;
  liderDefensorImg: string;
  ts: number;
  origenId?: string;
  destinoId?: string;
}

export interface UltimaConquista {
  territorioNombre: string;
  atacanteNombre: string;
  defensorNombre: string;
  colorAtacante: string;
  ts: number;
}

export interface Partida {
  id: string;
  nombre: string;
  producto_id: string;
  host_id: string;
  limite_jugadores: number;
  jugadores_registrados: number;
  estado: 'Iniciada' | 'En juego' | 'En pausa' | 'Finalizada';
  ganador_id: string | null;
  requiere_contrasena: boolean;
  contrasena?: string | null;
  pactos?: unknown[] | null;
  turno_actual_usuario_id: string | null;
  tropas_iniciales?: number | null;
  limite_rondas?: number | null;
  fase_actual?: 'colocacion' | 'ataque' | 'reagrupacion' | null;
  ronda_actual?: number;
  orden_jugadores?: string[] | null;
  jugador_actual_index?: number;
  ultimo_combate?: UltimoCombate | null;
  ultima_conquista?: UltimaConquista | null;
  acumulado_territorios?: Record<string, number> | null;
  pausado_por?: string | null;
  con_bomba_atomica?: boolean | null;
  cartas_para_bomba?: number | null;
  con_mayorias?: boolean | null;
  colocacion_simultanea?: boolean | null;
  created_at: string;
}

export interface PartidaJugador {
  id: string;
  partida_id: string;
  usuario_id: string;
  orden_turno: number;
  puntos: number;
  esta_dentro: boolean;
  tropas_por_colocar?: number;
  color?: string | null;
  lider?: string | null;
  objetivo?: unknown;
  cartas?: string[] | null;
  posturas?: Record<string, 'amigable' | 'neutral' | 'hostil'> | null;
  rendido?: boolean;
  bomba_territorio?: string | null;
  bomba_territorio_2?: string | null;
  usuario?: { nombre: string | null; apellido: string | null; email: string } | null;
  created_at: string;
}

export interface TerritorioEstado {
  id: string;
  partida_id: string;
  territorio_id: string;
  usuario_id: string;
  tropas: number;
}

export interface Lider {
  nombre: string;
  img_neutra: string | null;
  img_amigable: string | null;
  img_hostil: string | null;
  sonido: string | null;
  volumen: number | null;
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  partida_id: string | null;
  mensaje: string;
  leida: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null | undefined>(undefined);

  currentUser$: Observable<User | null | undefined> = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);

    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUserSubject.next(data.session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUserSubject.next(session?.user ?? null);
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        this.updateOnlineStatus(session.user.id, true);
      }
    });
  }

  get client(): SupabaseClient { return this.supabase; }

  // ── Auth ──────────────────────────────────────────────
  signUp(email: string, password: string, metadata?: { nombre: string; apellido: string }) {
    return this.supabase.auth.signUp({ email, password, options: { data: metadata ?? {} } });
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signOut() { return this.supabase.auth.signOut(); }

  getCurrentUser(): User | null { return this.currentUserSubject.getValue() ?? null; }

  // ── Profiles ──────────────────────────────────────────
  getProfileById(userId: string) {
    return this.supabase.from('usuario').select('nombre, apellido').eq('id', userId).single();
  }

  getAllProfiles() {
    return this.supabase.from('usuario').select('*')
      .order('is_online', { ascending: false })
      .order('last_seen', { ascending: false, nullsFirst: false })
      .then(r => ({ ...r, data: r.data as Profile[] | null }));
  }

  updateOnlineStatus(userId: string, isOnline: boolean) {
    return this.supabase.from('usuario')
      .update({ is_online: isOnline, last_seen: new Date().toISOString() })
      .eq('id', userId);
  }

  updateMensaje(userId: string, mensaje: string) {
    return this.supabase.from('usuario').update({ mensaje }).eq('id', userId);
  }

  // ── Suscripciones ─────────────────────────────────────
  async isSubscribedToProduct(userId: string, productId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await this.supabase
      .from('suscripcion')
      .select('id')
      .eq('usuario_id', userId)
      .eq('producto_id', productId)
      .or(`fecha_fin.is.null,fecha_fin.gte.${today}`)
      .maybeSingle();
    return !!data;
  }

  async subscribeToProduct(userId: string, productId: string): Promise<{ data: null; error: { message: string } | null }> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) return { data: null, error: { message: 'No autenticado' } };

    const res = await fetch(
      `${environment.supabase.url}/rest/v1/suscripcion?on_conflict=usuario_id,producto_id`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'resolution=ignore-duplicates,return=minimal',
        },
        body: JSON.stringify({ usuario_id: userId, producto_id: productId }),
      }
    );

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      return { data: null, error };
    }
    return { data: null, error: null };
  }

  async getUsuariosPorProducto(nombreProducto: string): Promise<{ data: unknown[] | null; error: unknown }> {
    const { data: prod, error: e1 } = await this.supabase
      .from('producto').select('id').eq('nombre', nombreProducto).single();
    if (e1 || !prod) return { data: [], error: e1 };

    const { data: subs, error: e2 } = await this.supabase
      .from('suscripcion').select('usuario_id').eq('producto_id', prod.id);
    if (e2) return { data: [], error: e2 };

    const ids = (subs ?? []).map((s: { usuario_id: string }) => s.usuario_id);
    if (ids.length === 0) return { data: [], error: null };

    const { data: usuarios, error: e3 } = await this.supabase
      .from('usuario').select('nombre, apellido, email, last_seen, mensaje, is_online').in('id', ids);
    return { data: usuarios, error: e3 };
  }

  // ── Partidas ──────────────────────────────────────────
  getPartidas() {
    return this.supabase.from('partida').select('*').order('created_at', { ascending: false });
  }

  getMisPartidasIds(userId: string) {
    return this.supabase.from('partida_jugador')
      .select('partida_id')
      .eq('usuario_id', userId)
      .then(r => ({ ...r, data: r.data as Array<{ partida_id: string }> | null }));
  }

  verificarContrasena(partidaId: string, password: string) {
    return this.supabase.from('partida')
      .select('id')
      .eq('id', partidaId)
      .eq('contrasena', password)
      .maybeSingle()
      .then(r => ({ match: !!r.data, error: r.error }));
  }

  getPartidaById(id: string) {
    return this.supabase.from('partida').select('*').eq('id', id).single()
      .then(r => ({ ...r, data: r.data as unknown as Partida | null }));
  }

  getProductos() {
    return this.supabase.from('producto').select('id, nombre').order('nombre');
  }

  createPartida(data: Omit<Partida, 'id' | 'created_at'>) {
    return this.supabase.from('partida').insert(data).select().single();
  }

  updatePartida(id: string, data: Partial<Partida>) {
    return this.supabase.from('partida').update(data).eq('id', id);
  }

  deletePartida(id: string) {
    return this.supabase.from('partida').delete().eq('id', id);
  }

  comenzarPartida(id: string) {
    return this.supabase.from('partida').update({ estado: 'En juego' }).eq('id', id);
  }

  marcarEstaDentro(partidaId: string, usuarioId: string) {
    return this.supabase.from('partida_jugador')
      .update({ esta_dentro: true })
      .eq('partida_id', partidaId)
      .eq('usuario_id', usuarioId);
  }

  reservarColor(partidaId: string, usuarioId: string, color: string | null) {
    return this.supabase.from('partida_jugador')
      .update({ color })
      .eq('partida_id', partidaId)
      .eq('usuario_id', usuarioId);
  }

  marcarEstaDentroConColor(partidaId: string, usuarioId: string, color: string, lider?: string) {
    const payload: Record<string, unknown> = { esta_dentro: true, color };
    if (lider) payload['lider'] = lider;
    return this.supabase.from('partida_jugador')
      .update(payload)
      .eq('partida_id', partidaId)
      .eq('usuario_id', usuarioId);
  }

  setTropasIniciales(partidaId: string, tropas: number) {
    return this.supabase.from('partida').update({ tropas_iniciales: tropas }).eq('id', partidaId);
  }

  getLideres() {
    return this.supabase.from('lider').select('*').order('nombre')
      .then(r => ({ ...r, data: r.data as unknown as Lider[] | null }));
  }

  unirsePartida(id: string, jugadoresActuales: number) {
    return this.supabase.from('partida')
      .update({ jugadores_registrados: jugadoresActuales + 1 }).eq('id', id);
  }

  // ── PartidaJugador ────────────────────────────────────
  insertPartidaJugador(partidaId: string, usuarioId: string, orden: number, estaDentro = false) {
    return this.supabase.from('partida_jugador')
      .insert({ partida_id: partidaId, usuario_id: usuarioId, orden_turno: orden, esta_dentro: estaDentro });
  }

  getPartidaJugadores(partidaId: string) {
    return this.supabase.from('partida_jugador')
      .select('id, usuario_id, orden_turno, puntos, esta_dentro, tropas_por_colocar, color, lider, objetivo, posturas, rendido, bomba_territorio, bomba_territorio_2, usuario!left(nombre, apellido, email)')
      .eq('partida_id', partidaId)
      .order('orden_turno')
      .then(r => ({ ...r, data: r.data as unknown as PartidaJugador[] | null }));
  }

  setBombaTerritorios(partidaId: string, usuarioId: string, t1: string | null, t2: string | null) {
    return this.supabase.from('partida_jugador')
      .update({ bomba_territorio: t1, bomba_territorio_2: t2 })
      .eq('partida_id', partidaId)
      .eq('usuario_id', usuarioId);
  }

  rendirJugador(partidaId: string, usuarioId: string) {
    return this.supabase.from('partida_jugador')
      .update({ rendido: true })
      .eq('partida_id', partidaId)
      .eq('usuario_id', usuarioId);
  }

  eliminarPartidaJugador(partidaId: string, usuarioId: string) {
    return this.supabase.from('partida_jugador')
      .delete()
      .eq('partida_id', partidaId)
      .eq('usuario_id', usuarioId);
  }

  // ── RPCs de juego ─────────────────────────────────────
  // Usa fetch directo con el token explícito para evitar race conditions
  // del GoTrueClient al obtener el header de Authorization internamente.
  private async _authHeaders() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) return null;
    return {
      'Content-Type': 'application/json',
      'apikey': environment.supabase.anonKey,
      'Authorization': `Bearer ${session.access_token}`,
    };
  }

  private async _rpc(fn: string, params: Record<string, unknown>) {
    const headers = await this._authHeaders();
    if (!headers) return { data: null, error: { message: 'Sesión expirada. Recargá la página.' } };

    const res = await fetch(`${environment.supabase.url}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      console.error(`[RPC ${fn}] HTTP ${res.status}`, body);
      return { data: null, error: body ?? { message: `HTTP ${res.status}` } };
    }
    return { data: body, error: null };
  }

  private async _insert(table: string, rows: unknown[]) {
    const headers = await this._authHeaders();
    if (!headers) return { data: null, error: { message: 'Sesión expirada. Recargá la página.' } };

    const res = await fetch(`${environment.supabase.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(rows),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      console.error(`[INSERT ${table}] HTTP ${res.status}`, body);
      return { data: null, error: body ?? { message: `HTTP ${res.status}` } };
    }
    return { data: null, error: null };
  }

  private async _patch(table: string, where: Record<string, string>, data: Record<string, unknown>) {
    const headers = await this._authHeaders();
    if (!headers) return { data: null, error: { message: 'Sesión expirada. Recargá la página.' } };

    const params = Object.entries(where).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
    const res = await fetch(`${environment.supabase.url}/rest/v1/${table}?${params}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      console.error(`[PATCH ${table}] HTTP ${res.status}`, body);
      return { data: null, error: body ?? { message: `HTTP ${res.status}` } };
    }
    return { data: null, error: null };
  }

  agregarBotAPartida(partidaId: string) {
    return this._rpc('agregar_bot_a_partida', { p_partida_id: partidaId });
  }

  resolverCombate(partidaId: string, origenId: string, destinoId: string) {
    return this._rpc('resolver_combate', {
      p_partida_id: partidaId,
      p_origen_id:  origenId,
      p_destino_id: destinoId,
    });
  }

  moverTropasConquista(partidaId: string, origenId: string, destinoId: string, tropas: number) {
    return this._rpc('mover_tropas_conquista', {
      p_partida_id: partidaId,
      p_origen_id:  origenId,
      p_destino_id: destinoId,
      p_tropas:     tropas,
    });
  }

  declararGanador(partidaId: string) {
    return this._rpc('declarar_ganador', { p_partida_id: partidaId });
  }

  declararGanadorObjetivo(partidaId: string) {
    return this._rpc('declarar_ganador_objetivo', { p_partida_id: partidaId });
  }

  pausarPartida(partidaId: string, pausadoPor: string) {
    return this.supabase.from('partida')
      .update({ estado: 'En pausa', pausado_por: pausadoPor })
      .eq('id', partidaId);
  }

  reanudarPartida(partidaId: string) {
    return this.supabase.from('partida')
      .update({ estado: 'En juego', pausado_por: null })
      .eq('id', partidaId);
  }

  updateAcumuladoTerritorios(partidaId: string, acumulado: Record<string, number>) {
    return this.supabase.from('partida').update({ acumulado_territorios: acumulado }).eq('id', partidaId);
  }

  declararGanadorAcumulacion(partidaId: string, ganadorId: string) {
    return this.supabase.from('partida')
      .update({ ganador_id: ganadorId, estado: 'Finalizada' })
      .eq('id', partidaId);
  }

  setCartas(partidaId: string, usuarioId: string, cartas: string[]) {
    return this.supabase.from('partida_jugador')
      .update({ cartas })
      .eq('partida_id', partidaId)
      .eq('usuario_id', usuarioId);
  }

  setPactos(partidaId: string, pactos: unknown[]) {
    return this.supabase.from('partida').update({ pactos }).eq('id', partidaId);
  }

  setObjetivo(partidaId: string, usuarioId: string, objetivo: unknown) {
    return this.supabase.from('partida_jugador')
      .update({ objetivo })
      .eq('partida_id', partidaId)
      .eq('usuario_id', usuarioId);
  }

  setPosturas(partidaId: string, usuarioId: string, posturas: Record<string, 'amigable' | 'neutral' | 'hostil'>) {
    return this.supabase.from('partida_jugador')
      .update({ posturas })
      .eq('partida_id', partidaId)
      .eq('usuario_id', usuarioId);
  }

  // ── Grupos de chat ────────────────────────────────────
  getGruposChat(partidaId: string) {
    return this.supabase
      .from('grupo_chat')
      .select('*, grupo_chat_miembro(usuario_id)')
      .eq('partida_id', partidaId);
  }

  crearGrupoChat(grupo: { id: string; partida_id: string; nombre: string; bandera: string; creado_por: string }) {
    return this.supabase.from('grupo_chat').insert(grupo);
  }

  unirseGrupoChat(grupoId: string, usuarioId: string) {
    return this.supabase.from('grupo_chat_miembro').insert({ grupo_id: grupoId, usuario_id: usuarioId });
  }

  eliminarGrupoChat(grupoId: string) {
    return this.supabase.from('grupo_chat').delete().eq('id', grupoId);
  }

  // ── Territorios ───────────────────────────────────────
  getTerritoriosEstado(partidaId: string) {
    return this.supabase.from('territorio_estado')
      .select('*')
      .eq('partida_id', partidaId)
      .then(r => ({ ...r, data: r.data as unknown as TerritorioEstado[] | null }));
  }

  initTerritorios(territorios: Omit<TerritorioEstado, 'id'>[]) {
    return this.supabase.from('territorio_estado')
      .upsert(territorios, { onConflict: 'partida_id,territorio_id' });
  }

  updateTerritorioEstado(partidaId: string, territorioId: string, data: Partial<Pick<TerritorioEstado, 'usuario_id' | 'tropas'>>) {
    return this.supabase.from('territorio_estado')
      .update(data)
      .eq('partida_id', partidaId)
      .eq('territorio_id', territorioId);
  }

  // ── Fases ─────────────────────────────────────────────
  iniciarFaseColocacion(partidaId: string, ordenJugadores: string[], ronda: number, indexInicio: number) {
    return this._patch('partida', { id: partidaId }, {
      fase_actual: 'colocacion',
      orden_jugadores: ordenJugadores,
      jugador_actual_index: indexInicio,
      ronda_actual: ronda,
    });
  }

  setFase(partidaId: string, fase: 'colocacion' | 'ataque' | 'reagrupacion', jugadorIndex?: number) {
    const data: Record<string, unknown> = { fase_actual: fase };
    if (jugadorIndex !== undefined) data['jugador_actual_index'] = jugadorIndex;
    return this._patch('partida', { id: partidaId }, data);
  }

  avanzarJugador(partidaId: string, nuevoIndex: number) {
    return this._patch('partida', { id: partidaId }, { jugador_actual_index: nuevoIndex });
  }

  setTropasPorColocar(partidaId: string, usuarioId: string, tropas: number) {
    return this._patch('partida_jugador',
      { partida_id: partidaId, usuario_id: usuarioId },
      { tropas_por_colocar: tropas }
    );
  }

  // ── Notificaciones ────────────────────────────────────
  crearNotificacion(usuarioId: string, partidaId: string, mensaje: string) {
    return this.supabase.from('notificacion')
      .insert({ usuario_id: usuarioId, partida_id: partidaId, mensaje });
  }

  marcarLeida(id: string) {
    return this.supabase.from('notificacion').update({ leida: true }).eq('id', id);
  }

  getPartidasFinalizadas() {
    return this.supabase.from('partida')
      .select('id, nombre, created_at, ganador_id')
      .eq('estado', 'Finalizada')
      .order('created_at', { ascending: false })
      .then(r => ({ ...r, data: r.data as Array<Pick<Partida, 'id' | 'nombre' | 'created_at' | 'ganador_id'>> | null }));
  }

  getJugadoresDe(partidaIds: string[]) {
    type JugadorDePartida = { partida_id: string; usuario: { nombre: string | null; apellido: string | null; email: string } | null };
    if (partidaIds.length === 0) return Promise.resolve({ data: [] as JugadorDePartida[], error: null });
    return this.supabase.from('partida_jugador')
      .select('partida_id, usuario(nombre, apellido, email)')
      .in('partida_id', partidaIds)
      .then(r => ({ ...r, data: r.data as JugadorDePartida[] | null }));
  }

  getDedicatorias() {
    return this.supabase
      .from('dedicatorias')
      .select('id, partida_id, nombre_partida, fecha_partida, jugadores, ganador_nombre, ganador_lider, dedicatoria, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
  }

  insertDedicatoria(data: {
    partida_id: string;
    nombre_partida: string;
    fecha_partida: string;
    jugadores: unknown[];
    ganador_id: string;
    ganador_nombre: string;
    ganador_lider: string | null;
    dedicatoria: string;
    rondas_jugadas: number | null;
    rondas_limite: number | null;
    duracion_minutos: number | null;
    tipo_victoria: 'objetivo' | 'limite_rondas' | 'rendicion' | null;
  }) {
    return this.supabase.from('dedicatorias').insert(data);
  }

  // ── Categorias ────────────────────────────────────────
  getCategorias() {
    return this.supabase.from('categoria').select('*').order('nombre');
  }

  getCategoriaByNombre(nombre: string) {
    return this.supabase.from('categoria').select('id, nombre, logo').eq('nombre', nombre).single();
  }

  async getProductosByCategoriaNombre(nombre: string): Promise<{ data: unknown[] | null; error: unknown }> {
    const { data: cat, error: e1 } = await this.supabase
      .from('categoria')
      .select('id')
      .eq('nombre', nombre)
      .single();

    if (e1 || !cat) return { data: [], error: e1 };

    const { data, error } = await this.supabase
      .from('categoria_producto')
      .select('producto:producto_id(*)')
      .eq('categoria_id', cat.id);

    return {
      data: (data ?? []).map((r: { producto: unknown }) => r.producto).filter(Boolean),
      error,
    };
  }

  insertContacto(data: { nombre: string; email: string; empresa: string; rubro: string; mensaje: string }) {
    return this.supabase.from('contacto').insert(data);
  }
}
