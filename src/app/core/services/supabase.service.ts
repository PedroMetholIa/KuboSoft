import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

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

export interface Partida {
  id: string;
  nombre: string;
  producto_id: string;
  host_id: string;
  limite_jugadores: number;
  jugadores_registrados: number;
  estado: 'Iniciada' | 'En juego' | 'Finalizada';
  ganador_id: string | null;
  requiere_contrasena: boolean;
  contrasena: string | null;
  turno_actual_usuario_id: string | null;
  tropas_iniciales?: number | null;
  fase_actual?: 'colocacion' | 'ataque' | 'reagrupacion' | null;
  ronda_actual?: number;
  orden_jugadores?: string[] | null;
  jugador_actual_index?: number;
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
}

export interface Turno {
  id: string;
  partida_id: string;
  usuario_id: string;
  numero_a: number;
  numero_b: number;
  respuesta_correcta: number;
  respuesta_ingresada: number | null;
  es_correcto: boolean | null;
  respondido_en: string | null;
  created_at: string;
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  partida_id: string | null;
  mensaje: string;
  leida: boolean;
  created_at: string;
}

export interface Suscripcion {
  id: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  usuario: { nombre: string | null; apellido: string | null; email: string } | null;
  producto: { nombre: string; categoria: string | null } | null;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null | undefined>(undefined);

  currentUser$: Observable<User | null | undefined> = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey, {
      global: {
        headers: {
          apikey: environment.supabase.anonKey,
        },
      },
    });

    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUserSubject.next(data.session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUserSubject.next(session?.user ?? null);
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
      .order('last_seen', { ascending: false, nullsFirst: false });
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
    const { data } = await this.supabase
      .from('suscripcion')
      .select('id')
      .eq('usuario_id', userId)
      .eq('producto_id', productId)
      .maybeSingle();
    return !!data;
  }

  async getUsuariosPorProducto(nombreProducto: string): Promise<{ data: any[] | null; error: any }> {
    const { data: prod, error: e1 } = await this.supabase
      .from('producto').select('id').eq('nombre', nombreProducto).single();
    if (e1 || !prod) return { data: [], error: e1 };

    const { data: subs, error: e2 } = await this.supabase
      .from('suscripcion').select('usuario_id').eq('producto_id', prod.id);
    if (e2) return { data: [], error: e2 };

    const ids = (subs ?? []).map((s: any) => s.usuario_id);
    if (ids.length === 0) return { data: [], error: null };

    return this.supabase.from('usuario').select('nombre, apellido, email, last_seen, mensaje, is_online').in('id', ids);
  }

  // ── Partidas ──────────────────────────────────────────
  getPartidas() {
    return this.supabase.from('partida').select('*').order('created_at', { ascending: false });
  }

  getPartidaById(id: string) {
    return this.supabase.from('partida').select('*').eq('id', id).single();
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
    return this.supabase.from('lider').select('*').order('nombre');
  }

  setTurnoActual(partidaId: string, usuarioId: string | null) {
    return this.supabase.from('partida')
      .update({ turno_actual_usuario_id: usuarioId }).eq('id', partidaId);
  }

  finalizarPartida(partidaId: string, ganadorId: string | null) {
    return this.supabase.from('partida').update({
      estado: 'Finalizada',
      ganador_id: ganadorId,
      turno_actual_usuario_id: null
    }).eq('id', partidaId);
  }

  unirsePartida(id: string, jugadoresActuales: number) {
    return this.supabase.from('partida')
      .update({ jugadores_registrados: jugadoresActuales + 1 }).eq('id', id);
  }

  // ── PartidaJugador ────────────────────────────────────
  insertPartidaJugador(partidaId: string, usuarioId: string, orden: number) {
    return this.supabase.from('partida_jugador')
      .insert({ partida_id: partidaId, usuario_id: usuarioId, orden_turno: orden });
  }

  getPartidaJugadores(partidaId: string) {
    return this.supabase.from('partida_jugador')
      .select('id, usuario_id, orden_turno, puntos, esta_dentro, tropas_por_colocar, color, lider, usuario(nombre, apellido, email)')
      .eq('partida_id', partidaId)
      .order('orden_turno');
  }

  updatePartidaJugadorPuntos(id: string, puntos: number) {
    return this.supabase.from('partida_jugador').update({ puntos }).eq('id', id);
  }

  eliminarPartidaJugador(partidaId: string, usuarioId: string) {
    return this.supabase.from('partida_jugador')
      .delete()
      .eq('partida_id', partidaId)
      .eq('usuario_id', usuarioId);
  }

  // ── Territorios ───────────────────────────────────────
  getTerritoriosEstado(partidaId: string) {
    return this.supabase.from('territorio_estado')
      .select('*')
      .eq('partida_id', partidaId);
  }

  initTerritorios(territorios: Omit<TerritorioEstado, 'id'>[]) {
    return this.supabase.from('territorio_estado').insert(territorios);
  }

  updateTerritorioEstado(partidaId: string, territorioId: string, data: Partial<Pick<TerritorioEstado, 'usuario_id' | 'tropas'>>) {
    return this.supabase.from('territorio_estado')
      .update(data)
      .eq('partida_id', partidaId)
      .eq('territorio_id', territorioId);
  }

  // ── Fases ─────────────────────────────────────────────
  iniciarFaseColocacion(partidaId: string, ordenJugadores: string[], ronda: number, indexInicio: number) {
    return this.supabase.from('partida').update({
      fase_actual: 'colocacion',
      orden_jugadores: ordenJugadores,
      jugador_actual_index: indexInicio,
      ronda_actual: ronda,
    }).eq('id', partidaId);
  }

  setFase(partidaId: string, fase: 'colocacion' | 'ataque' | 'reagrupacion', jugadorIndex?: number) {
    const payload: Partial<Partida> = { fase_actual: fase };
    if (jugadorIndex !== undefined) payload.jugador_actual_index = jugadorIndex;
    return this.supabase.from('partida').update(payload).eq('id', partidaId);
  }

  avanzarJugador(partidaId: string, nuevoIndex: number) {
    return this.supabase.from('partida')
      .update({ jugador_actual_index: nuevoIndex })
      .eq('id', partidaId);
  }

  setTropasPorColocar(partidaId: string, usuarioId: string, tropas: number) {
    return this.supabase.from('partida_jugador')
      .update({ tropas_por_colocar: tropas })
      .eq('partida_id', partidaId)
      .eq('usuario_id', usuarioId);
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
      .order('created_at', { ascending: false });
  }

  getJugadoresDe(partidaIds: string[]) {
    if (partidaIds.length === 0) return Promise.resolve({ data: [], error: null });
    return this.supabase.from('partida_jugador')
      .select('partida_id, usuario(nombre, apellido, email)')
      .in('partida_id', partidaIds);
  }

  // ── Categorias ────────────────────────────────────────
  getCategorias() {
    return this.supabase.from('categoria').select('*').order('nombre');
  }

  getCategoriaByNombre(nombre: string) {
    return this.supabase.from('categoria').select('id, nombre, logo').eq('nombre', nombre).single();
  }

  getProductosPorCategoria() {
    return this.supabase.from('categoria_producto')
      .select('categoria_id, producto:producto_id(id, nombre)');
  }

  async getProductosByCategoriaNombre(nombre: string): Promise<{ data: any[] | null; error: any }> {
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
      data: (data ?? []).map((r: any) => r.producto).filter(Boolean),
      error,
    };
  }

  getSuscripciones() {
    return this.supabase.from('suscripcion').select(`
        id, fecha_inicio, fecha_fin,
        usuario!suscripcion_usuario_id_fkey(nombre, apellido, email),
        producto!suscripcion_producto_id_fkey(nombre, categoria)
      `).order('fecha_inicio', { ascending: false });
  }

  insertContacto(data: { nombre: string; email: string; empresa: string; rubro: string; mensaje: string }) {
    return this.supabase.from('contacto').insert(data);
  }
}
