import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { AuthService } from '../../core/services/auth.service';
import {
  SupabaseService, Partida, PartidaJugador, Producto, Profile, Notificacion
} from '../../core/services/supabase.service';
import { JugadoresChatComponent } from './jugadores-chat/jugadores-chat.component';

interface Jugador {
  nombre: string | null;
  apellido: string | null;
  email: string;
  last_seen: string | null;
  mensaje: string | null;
  is_online: boolean | null;
}

interface PartidaFinalizada {
  id: string;
  nombre: string;
  created_at: string;
  ganador_id: string | null;
  jugadores: Array<{
    partida_id: string;
    usuario: { nombre: string | null; apellido: string | null; email: string } | null;
  }>;
}

@Component({
  selector: 'app-partida',
  standalone: true,
  imports: [CommonModule, FormsModule, JugadoresChatComponent],
  template: `
    <div class="partida">

      <!-- Notification banner -->
      <div class="notif-banner" *ngIf="notificacionActiva">
        <span class="notif-icon">🎮</span>
        <div class="notif-body">
          <strong>Partida iniciada</strong>
          <p>{{ notificacionActiva.mensaje }}</p>
        </div>
        <button class="btn-ir" (click)="irAPartida()">Ir a jugar →</button>
        <button class="btn-notif-close" (click)="cerrarNotificacion()">✕</button>
      </div>

      <!-- Header -->
      <header class="top-bar">
        <div class="container">
          <div class="title-block">
            <h1>Partidas</h1>
            <p>Gestión de partidas y suscriptores</p>
          </div>
        </div>
      </header>

      <!-- Main -->
      <main class="content">
        <div class="container">
        <div class="main-grid">

          <!-- Fila 1: Partidas creadas | En juego -->
          <div class="panel panel-creadas">
            <div class="panel-header">
              <span class="panel-icon red">🎮</span>
              <h3>Partidas creadas</h3>
              <span class="count-badge red">{{ misPartidas.length }}</span>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Partida</th>
                    <th>Jugadores</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of misPartidas">
                    <td>{{ p.nombre }}</td>
                    <td class="num-cell">{{ p.jugadores_registrados }} / {{ p.limite_jugadores }}</td>
                    <td class="actions-cell">
                      <button
                        class="btn-comenzar"
                        (click)="comenzarPartida(p)"
                        *ngIf="p.estado === 'Iniciada'"
                        [disabled]="p.jugadores_registrados < p.limite_jugadores || comenzando"
                        [title]="p.jugadores_registrados < p.limite_jugadores ? 'Faltan ' + (p.limite_jugadores - p.jugadores_registrados) + ' jugadores' : 'Iniciar partida'">
                        {{ comenzando ? '...' : '✓ Comenzar' }}
                      </button>
                      <button
                        class="btn-ir-juego"
                        *ngIf="p.estado === 'En juego' && p.host_id === userId"
                        (click)="irAJuego(p.id)">
                        Ir a jugar →
                      </button>
                      <button class="btn-icon-delete" (click)="eliminarPartida(p.id)" title="Eliminar">🗑</button>
                    </td>
                  </tr>
                  <tr *ngIf="misPartidas.length === 0">
                    <td colspan="4" class="empty-row">No tenés partidas creadas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="panel panel-disponibles" *ngIf="partidasDisponibles.length > 0">
            <div class="panel-header">
              <span class="panel-icon purple">🌐</span>
              <h3>Disponibles</h3>
              <span class="count-badge purple">{{ partidasDisponibles.length }}</span>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Partida</th>
                    <th>Jugadores</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of partidasDisponibles">
                    <td>{{ p.nombre }}</td>
                    <td class="num-cell">{{ p.jugadores_registrados }} / {{ p.limite_jugadores }}</td>
                    <td>
                      <button
                        *ngIf="!misPartidasIds.has(p.id)"
                        class="btn-unirse"
                        (click)="unirse(p)"
                        [disabled]="p.jugadores_registrados >= p.limite_jugadores">
                        Unirse
                      </button>
                      <button
                        *ngIf="misPartidasIds.has(p.id)"
                        class="btn-salirse"
                        (click)="salirse(p)">
                        Salirse
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="partidasDisponibles.length === 0">
                    <td colspan="3" class="empty-row">No hay partidas disponibles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="panel panel-en-juego" *ngIf="partidasEnJuego.length > 0">
            <div class="panel-header">
              <span class="panel-icon green">⚡</span>
              <h3>En juego</h3>
              <span class="count-badge green">{{ partidasEnJuego.length }}</span>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Partida</th>
                    <th>Jugadores</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of partidasEnJuego">
                    <td>{{ p.nombre }}</td>
                    <td class="num-cell">{{ p.jugadores_registrados }} / {{ p.limite_jugadores }}</td>
                    <td>
                      <button
                        class="btn-ir-juego"
                        *ngIf="misPartidasIds.has(p.id)"
                        (click)="irAJuego(p.id)">
                        Volver →
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="partidasEnJuego.length === 0">
                    <td colspan="3" class="empty-row">No hay partidas en curso</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="panel panel-finalizadas" [style.grid-column]="'span ' + finalizadasSpan">
            <div class="panel-header">
              <span class="panel-icon gold">🏆</span>
              <h3>Finalizadas</h3>
              <span class="count-badge gold">{{ partidasFinalizadas.length }}</span>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ganador</th>
                    <th>Partida</th>
                    <th>Día</th>
                    <th>Jugadores</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of partidasFinalizadas">
                    <td>
                      <span class="ganador-tag" *ngIf="p.ganador_id">{{ ganadorNombre(p.ganador_id) }}</span>
                      <span class="no-clave" *ngIf="!p.ganador_id">—</span>
                    </td>
                    <td>{{ p.nombre }}</td>
                    <td class="date-cell">{{ formatDay(p.created_at) }}</td>
                    <td class="jugadores-cell">
                      <button class="btn-ver-jugadores" (click)="verJugadores(p.jugadores)">👥</button>
                    </td>
                  </tr>
                  <tr *ngIf="partidasFinalizadas.length === 0">
                    <td colspan="4" class="empty-row">No hay partidas finalizadas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Jugadores (25%) -->
          <app-jugadores-chat
            title="Jugadores"
            icon="👥"
            [showForm]="false"
            [jugadores]="jugadores"
            [userEmail]="userEmail"
            [userId]="userId"
            [loading]="loadingJugadores">
          </app-jugadores-chat>

          <!-- Chat (75%) -->
          <app-jugadores-chat
            title="Chat"
            icon="💬"
            [showForm]="true"
            [chatMode]="true"
            [jugadores]="jugadores"
            [userEmail]="userEmail"
            [userId]="userId"
            [loading]="loadingJugadores">
          </app-jugadores-chat>

        </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="footer-bar">
        <div class="container">
          <button class="btn-footer btn-back" (click)="logout()">← Cerrar sesión</button>
          <button class="btn-footer btn-refresh" (click)="refresh()">↺ Refrescar</button>
          <button class="btn-footer btn-crear" (click)="showCreateForm = true">+ Crear nueva partida</button>
        </div>
      </footer>

      <!-- Modal crear partida -->
      <div class="modal-overlay" *ngIf="showCreateForm" (click)="cancelarForm()">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <h3>Nueva partida</h3>

          <div class="form-grid">
            <div class="field">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="form.nombre" placeholder="Nombre de la partida" />
            </div>
            <div class="field">
              <label>Producto</label>
              <select [(ngModel)]="form.producto_id">
                <option value="">Seleccioná...</option>
                <option *ngFor="let p of productos" [value]="p.id">{{ p.nombre }}</option>
              </select>
            </div>
            <div class="field">
              <label>Límite de jugadores (2–6)</label>
              <input type="number" [(ngModel)]="form.limite_jugadores" min="2" max="6" />
            </div>
          </div>

          <div class="field-check">
            <label>
              <input type="checkbox" [(ngModel)]="form.requiere_contrasena" />
              Requiere contraseña
            </label>
          </div>

          <div class="field" *ngIf="form.requiere_contrasena">
            <label>Contraseña</label>
            <input type="text" [(ngModel)]="form.contrasena" placeholder="Clave de acceso" />
          </div>

          <div class="form-actions">
            <button class="btn-crear-confirm" (click)="guardarPartida()"
              [disabled]="formLoading || !form.nombre || !form.producto_id">
              {{ formLoading ? 'Creando...' : 'Crear partida' }}
            </button>
            <button class="btn-cancel" (click)="cancelarForm()">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Modal jugadores finalizadas -->
      <div class="modal-overlay" *ngIf="showJugadoresModal" (click)="showJugadoresModal = false">
        <div class="modal-panel modal-jugadores" (click)="$event.stopPropagation()">
          <ul class="jugadores-list">
            <li *ngFor="let nombre of jugadoresModal">{{ nombre }}</li>
          </ul>
        </div>
      </div>

      <!-- Modal contraseña -->
      <div class="modal-overlay" *ngIf="showPasswordModal" (click)="cerrarPasswordModal()">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <h3>🔒 Partida con contraseña</h3>
          <p class="modal-sub">Ingresá la clave para unirte a <strong>{{ partidaParaUnirse?.nombre }}</strong></p>
          <div class="field">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="passwordInput" placeholder="••••••••" (keydown.enter)="confirmarUnirse()" autofocus />
          </div>
          <p class="password-error" *ngIf="passwordError">{{ passwordError }}</p>
          <div class="form-actions">
            <button class="btn-crear-confirm" (click)="confirmarUnirse()">Confirmar</button>
            <button class="btn-cancel" (click)="cerrarPasswordModal()">Cancelar</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styleUrl: './partida.component.scss'
})
export class PartidaComponent implements OnInit, OnDestroy {
  userEmail = '';
  userId = '';

  jugadores: Jugador[] = [];
  loadingJugadores = true;

  partidas: Partida[] = [];
  loadingPartidas = true;

  profiles: Profile[] = [];
  productos: Producto[] = [];

  misPartidasIds: Set<string> = new Set();
  partidasFinalizadas: PartidaFinalizada[] = [];

  showCreateForm = false;
  formLoading = false;
  comenzando = false;

  showPasswordModal = false;
  partidaParaUnirse: Partida | null = null;
  passwordInput = '';
  passwordError = '';

  showJugadoresModal = false;
  jugadoresModal: string[] = [];

  notificacionActiva: Notificacion | null = null;

  form = {
    nombre: '',
    producto_id: '',
    limite_jugadores: 2,
    requiere_contrasena: false,
    contrasena: ''
  };

  private channelUsuario: RealtimeChannel | null = null;
  private channelSuscripcion: RealtimeChannel | null = null;
  private channelPartida: RealtimeChannel | null = null;
  private channelNotif: RealtimeChannel | null = null;

  constructor(
    private auth: AuthService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.userEmail = user.email ?? '';
        this.userId = user.id;
        this.supabaseService.updateOnlineStatus(user.id, true);
        this.loadAll();
        this.subscribeRealtime();
        this.limpiarNotificacionesViejas();
      }
    });
  }

  ngOnDestroy() {
    if (this.userId) {
      this.supabaseService.updateOnlineStatus(this.userId, false);
    }
    this.channelUsuario?.unsubscribe();
    this.channelSuscripcion?.unsubscribe();
    this.channelPartida?.unsubscribe();
    this.channelNotif?.unsubscribe();
  }

  get misPartidas(): Partida[] {
    return this.partidas.filter(p => p.host_id === this.userId && p.estado !== 'Finalizada');
  }

  get partidasDisponibles(): Partida[] {
    return this.partidas.filter(p => p.estado === 'Iniciada' && p.host_id !== this.userId);
  }

  get partidasEnJuego(): Partida[] {
    return this.partidas.filter(p => p.estado === 'En juego' && p.host_id !== this.userId);
  }

  get finalizadasSpan(): number {
    let span = 1;
    if (this.partidasDisponibles.length === 0) span++;
    if (this.partidasEnJuego.length === 0) span++;
    return span;
  }

  async loadAll() {
    await Promise.all([
      this.loadJugadores(),
      this.loadPartidas(),
      this.loadProductos(),
      this.loadProfiles(),
      this.loadMisPartidasIds(),
      this.loadPartidasFinalizadas(),
    ]);
  }

  async loadPartidasFinalizadas() {
    const { data: partidas } = await this.supabaseService.getPartidasFinalizadas();
    if (!partidas || partidas.length === 0) {
      this.partidasFinalizadas = [];
      return;
    }
    const ids = (partidas as any[]).map(p => p.id);
    const { data: jugadores } = await this.supabaseService.getJugadoresDe(ids);
    this.partidasFinalizadas = (partidas as any[]).map(p => ({
      ...p,
      jugadores: ((jugadores as any[]) ?? []).filter(j => j.partida_id === p.id)
    }));
  }

  async loadMisPartidasIds() {
    const { data } = await this.supabaseService.client
      .from('partida_jugador')
      .select('partida_id')
      .eq('usuario_id', this.userId);
    this.misPartidasIds = new Set((data ?? []).map((r: any) => r.partida_id));
  }

  async loadJugadores() {
    this.loadingJugadores = true;
    const { data, error } = await this.supabaseService.getUsuariosPorProducto('NexaTeg');
    if (error) console.error('Error jugadores:', error.message);
    this.jugadores = (data as Jugador[]) ?? [];
    this.loadingJugadores = false;
  }

  async loadPartidas() {
    this.loadingPartidas = true;
    const { data, error } = await this.supabaseService.getPartidas();
    if (error) console.error('Error partidas:', error.message);
    this.partidas = (data as Partida[]) ?? [];
    this.loadingPartidas = false;
  }

  async loadProductos() {
    const { data } = await this.supabaseService.getProductos();
    this.productos = (data as Producto[]) ?? [];
  }

  async loadProfiles() {
    const { data } = await this.supabaseService.getAllProfiles();
    this.profiles = data ?? [];
  }

  subscribeRealtime() {
    this.channelUsuario = this.supabaseService.client
      .channel('usuario-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuario' }, () => {
        this.loadJugadores();
        this.loadProfiles();
      })
      .subscribe();

    this.channelSuscripcion = this.supabaseService.client
      .channel('suscripcion-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suscripcion' }, () => {
        this.loadJugadores();
      })
      .subscribe();

    this.channelPartida = this.supabaseService.client
      .channel('partida-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partida' }, () => {
        this.loadPartidas();
        this.loadPartidasFinalizadas();
      })
      .subscribe();

    this.channelNotif = this.supabaseService.client
      .channel(`notif-${this.userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacion'
      }, (payload) => {
        if (payload.new['usuario_id'] === this.userId && !payload.new['leida']) {
          this.notificacionActiva = payload.new as Notificacion;
        }
      })
      .subscribe();
  }

  private async limpiarNotificacionesViejas() {
    await this.supabaseService.client
      .from('notificacion')
      .update({ leida: true })
      .eq('usuario_id', this.userId)
      .eq('leida', false);
  }

  refresh() { this.loadAll(); }

  irAPartida() {
    if (!this.notificacionActiva?.partida_id) return;
    this.supabaseService.marcarLeida(this.notificacionActiva.id);
    const pid = this.notificacionActiva.partida_id;
    this.notificacionActiva = null;
    this.router.navigate(['/mat-juego', pid]);
  }

  irAJuego(partidaId: string) {
    this.router.navigate(['/mat-juego', partidaId]);
  }

  cerrarNotificacion() {
    if (this.notificacionActiva) {
      this.supabaseService.marcarLeida(this.notificacionActiva.id);
      this.notificacionActiva = null;
    }
  }

  cancelarForm() {
    this.showCreateForm = false;
    this.form = { nombre: '', producto_id: '', limite_jugadores: 2, requiere_contrasena: false, contrasena: '' };
  }

  async guardarPartida() {
    if (!this.form.nombre || !this.form.producto_id) return;
    this.form.limite_jugadores = Math.min(6, Math.max(2, this.form.limite_jugadores));
    this.formLoading = true;
    const { data: nuevaPartida } = await this.supabaseService.createPartida({
      nombre: this.form.nombre,
      producto_id: this.form.producto_id,
      host_id: this.userId,
      limite_jugadores: this.form.limite_jugadores,
      jugadores_registrados: 1,
      estado: 'Iniciada',
      ganador_id: null,
      requiere_contrasena: this.form.requiere_contrasena,
      contrasena: this.form.requiere_contrasena ? this.form.contrasena : null,
      turno_actual_usuario_id: null
    });
    if (nuevaPartida) {
      await this.supabaseService.insertPartidaJugador(nuevaPartida.id, this.userId, 0);
      this.misPartidasIds.add(nuevaPartida.id);
    }
    this.cancelarForm();
    this.formLoading = false;
  }

  async eliminarPartida(id: string) {
    await this.supabaseService.deletePartida(id);
  }

  async comenzarPartida(p: Partida) {
    if (p.jugadores_registrados < p.limite_jugadores || this.comenzando) return;
    this.comenzando = true;

    const { data: jugadores } = await this.supabaseService.getPartidaJugadores(p.id);
    const pjs = (jugadores as unknown as PartidaJugador[]) ?? [];

    if (pjs.length === 0) { this.comenzando = false; return; }

    for (const j of pjs) {
      await this.supabaseService.crearNotificacion(
        j.usuario_id,
        p.id,
        `¡La partida "${p.nombre}" comenzó! Hacé clic para jugar.`
      );
    }

    await this.supabaseService.comenzarPartida(p.id);
    this.comenzando = false;
    this.router.navigate(['/mat-juego', p.id]);
  }

  unirse(p: Partida) {
    if (p.jugadores_registrados >= p.limite_jugadores) return;
    if (p.requiere_contrasena) {
      this.partidaParaUnirse = p;
      this.passwordInput = '';
      this.passwordError = '';
      this.showPasswordModal = true;
      return;
    }
    this.ejecutarUnirse(p);
  }

  async confirmarUnirse() {
    if (!this.partidaParaUnirse) return;
    if (this.passwordInput !== this.partidaParaUnirse.contrasena) {
      this.passwordError = 'Contraseña incorrecta';
      return;
    }
    await this.ejecutarUnirse(this.partidaParaUnirse);
    this.cerrarPasswordModal();
  }

  cerrarPasswordModal() {
    this.showPasswordModal = false;
    this.partidaParaUnirse = null;
    this.passwordInput = '';
    this.passwordError = '';
  }

  async salirse(p: Partida) {
    await this.supabaseService.eliminarPartidaJugador(p.id, this.userId);
    await this.supabaseService.updatePartida(p.id, {
      jugadores_registrados: Math.max(0, p.jugadores_registrados - 1)
    });
    this.misPartidasIds.delete(p.id);
  }

  private async ejecutarUnirse(p: Partida) {
    const { data: currentPlayers } = await this.supabaseService.getPartidaJugadores(p.id);
    const orden = ((currentPlayers as unknown as PartidaJugador[]) ?? []).length;
    await this.supabaseService.insertPartidaJugador(p.id, this.userId, orden);
    await this.supabaseService.unirsePartida(p.id, p.jugadores_registrados);
    this.misPartidasIds.add(p.id);
  }

  productoNombre(productoId: string): string {
    return this.productos.find(p => p.id === productoId)?.nombre ?? '—';
  }

  hostNombre(hostId: string): string {
    const p = this.profiles.find(p => p.id === hostId);
    if (!p) return '—';
    const nombre = [p.nombre, p.apellido].filter(Boolean).join(' ');
    return nombre || p.email;
  }

  ganadorNombre(ganadorId: string | null): string {
    if (!ganadorId) return '—';
    return this.hostNombre(ganadorId);
  }

  verJugadores(jugadores: PartidaFinalizada['jugadores']) {
    this.jugadoresModal = jugadores.map(j => {
      const u = j.usuario;
      if (!u) return '—';
      return [u.nombre, u.apellido].filter(Boolean).join(' ') || u.email;
    });
    this.showJugadoresModal = true;
  }

  jugadoresNombresDePartida(jugadores: PartidaFinalizada['jugadores']): string {
    return jugadores.map(j => {
      const u = j.usuario;
      if (!u) return '—';
      const nombre = [u.nombre, u.apellido].filter(Boolean).join(' ');
      return nombre || u.email;
    }).join(', ');
  }

  estadoClass(estado: string): string {
    if (estado === 'En juego') return 'online';
    if (estado === 'Finalizada') return 'vencida';
    return 'iniciada';
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  }

  formatDay(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(new Date(dateStr));
  }

  logout() { this.auth.signOut(); }
}
