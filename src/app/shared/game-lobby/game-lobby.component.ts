import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import {
  SupabaseService, Partida, PartidaJugador, Producto, Profile, Notificacion, BOT_USER_ID
} from '../../core/services/supabase.service';
import { ToastService } from '../../core/services/toast.service';
import { JugadoresChatComponent } from '../jugadores-chat/jugadores-chat.component';

export interface LobbyConfig {
  productNombre: string;
  channelPrefix: string;
  showBrand: boolean;
  showProductSelector: boolean;
  finalizadasLabel: string;
  showNavBack: boolean;
}

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
  selector: 'app-game-lobby',
  standalone: true,
  imports: [FormsModule, JugadoresChatComponent],
  template: `
    <div class="partida" style="background-image: linear-gradient(rgba(4,6,16,.45), rgba(4,6,16,.45)), url('/assets/KuboTeg/MundoFondoNegro.webp'); background-size: cover; background-position: center; background-attachment: fixed;">

      @if (notificacionActiva) {
        <div class="notif-overlay">
          <div class="notif-modal">
            <button class="notif-close-btn" (click)="cerrarNotificacion()">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="notif-logo-wrap">
              <img loading="lazy" src="assets/productos/favicon-kuboteg.svg" alt="KuboTeg" class="notif-logo">
            </div>
            <div class="notif-title">¡Partida iniciada!</div>
            <p class="notif-msg">{{ notifMsgFormatted }}</p>
            <button class="btn-ir" (click)="irAPartida()">Ir a jugar →</button>
          </div>
        </div>
      }

      @if (config.showBrand) {
        <div class="page-header">
          <div class="container">
            <div class="page-brand">
              <img loading="lazy" class="page-logo" src="assets/productos/favicon-kuboteg.svg" alt="KuboTeg">
              <h1 class="page-title" style="color:#FF4757">HEGEMONY</h1>
            </div>
            <div class="page-actions">
              <button class="btn-footer btn-back" (click)="volver()">← Volver atrás</button>
              <button class="btn-footer btn-refresh" (click)="refresh()">↺ Refrescar</button>
              <button class="btn btn-fill" (click)="showCreateForm = true">+ Crear nueva partida</button>
            </div>
          </div>
        </div>
      }

      @if (!config.showBrand) {
        <header class="top-bar">
          <div class="container">
            <div class="title-block">
              <h1>Partidas</h1>
              <p>Gestión de partidas y suscriptores</p>
            </div>
          </div>
        </header>
      }

      <main class="content">
        <div class="container">
          <div class="main-grid">

            <div class="panel panel-creadas">
              <div class="panel-header">
                <span class="panel-icon red">🎮</span>
                <h3>Partidas creadas</h3>
                <span class="count-badge red">{{ misPartidas.length }}</span>
              </div>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr><th>Partida</th><th>Jugadores</th><th></th></tr>
                  </thead>
                  <tbody>
                    @for (p of misPartidas; track p.id) {
                      <tr>
                        <td>{{ p.nombre }}</td>
                        <td class="num-cell">{{ p.jugadores_registrados }} / {{ p.limite_jugadores }}</td>
                        <td class="actions-cell">
                          @if (p.estado === 'Iniciada') {
                            <button
                              class="btn-comenzar"
                              (click)="comenzarPartida(p)"
                              [disabled]="p.jugadores_registrados < p.limite_jugadores || comenzando"
                              [title]="p.jugadores_registrados < p.limite_jugadores ? 'Faltan ' + (p.limite_jugadores - p.jugadores_registrados) + ' jugadores' : 'Iniciar partida'">
                              {{ comenzando ? '...' : '✓ Comenzar' }}
                            </button>
                          }
                          @if (p.estado === 'En juego' && p.host_id === userId) {
                            <button class="btn-ir-juego" (click)="irAJuego(p.id)">Ir a jugar →</button>
                          }
                          <button class="btn-icon-delete" (click)="eliminarPartida(p.id)" title="Eliminar">🗑</button>
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="4" class="empty-row">No tenés partidas creadas</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            @if (partidasDisponibles.length > 0) {
              <div class="panel panel-disponibles">
                <div class="panel-header">
                  <span class="panel-icon purple">🌐</span>
                  <h3>Disponibles</h3>
                  <span class="count-badge purple">{{ partidasDisponibles.length }}</span>
                </div>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Partida</th><th>Jugadores</th><th></th></tr>
                    </thead>
                    <tbody>
                      @for (p of partidasDisponibles; track p.id) {
                        <tr>
                          <td>{{ p.nombre }}</td>
                          <td class="num-cell">{{ p.jugadores_registrados }} / {{ p.limite_jugadores }}</td>
                          <td>
                            @if (!misPartidasIds.has(p.id)) {
                              <button
                                class="btn-unirse"
                                (click)="unirse(p)"
                                [disabled]="p.jugadores_registrados >= p.limite_jugadores">
                                Unirse
                              </button>
                            } @else {
                              <button class="btn-salirse" (click)="salirse(p)">Salirse</button>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            @if (partidasEnJuego.length > 0) {
              <div class="panel panel-en-juego">
                <div class="panel-header">
                  <span class="panel-icon green">⚡</span>
                  <h3>En juego</h3>
                  <span class="count-badge green">{{ partidasEnJuego.length }}</span>
                </div>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Partida</th><th>Jugadores</th><th></th></tr>
                    </thead>
                    <tbody>
                      @for (p of partidasEnJuego; track p.id) {
                        <tr>
                          <td>{{ p.nombre }}</td>
                          <td class="num-cell">{{ p.jugadores_registrados }} / {{ p.limite_jugadores }}</td>
                          <td>
                            @if (misPartidasIds.has(p.id)) {
                              <button class="btn-ir-juego" (click)="irAJuego(p.id)">Volver →</button>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            <div class="panel panel-finalizadas" [style.grid-column]="'span ' + finalizadasSpan">
              <div class="panel-header">
                <span class="panel-icon gold">🏆</span>
                <h3>{{ config.finalizadasLabel }}</h3>
                <span class="count-badge gold">{{ partidasFinalizadas.length }}</span>
              </div>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr><th>Ganador</th><th>Partida</th><th>Día</th><th>Jugadores</th></tr>
                  </thead>
                  <tbody>
                    @for (p of partidasFinalizadas; track p.id) {
                      <tr>
                        <td>
                          @if (p.ganador_id) {
                            <span class="ganador-tag">{{ ganadorNombre(p.ganador_id) }}</span>
                          } @else {
                            <span class="no-clave">—</span>
                          }
                        </td>
                        <td>{{ p.nombre }}</td>
                        <td class="date-cell">{{ formatDay(p.created_at) }}</td>
                        <td class="jugadores-cell">
                          <button class="btn-ver-jugadores" (click)="verJugadores(p.jugadores)">👥</button>
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="4" class="empty-row">No hay partidas finalizadas</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div class="bottom-panel-row" [style.--jug-height]="jugadoresHeight + 'px'">
              <app-jugadores-chat
                #jugRef
                title="Jugadores"
                icon="👥"
                [showForm]="false"
                [jugadores]="jugadores"
                [userEmail]="userEmail"
                [userId]="userId"
                [loading]="loadingJugadores"
                [channelName]="config.channelPrefix + '-chat'">
              </app-jugadores-chat>

              <app-jugadores-chat
                title="Chat"
                icon="💬"
                [showForm]="true"
                [chatMode]="true"
                [jugadores]="jugadores"
                [userEmail]="userEmail"
                [userId]="userId"
                [loading]="loadingJugadores"
                [channelName]="config.channelPrefix + '-chat'">
              </app-jugadores-chat>
            </div>

          </div>
        </div>
      </main>

      @if (!config.showNavBack) {
        <footer class="footer-bar">
          <div class="container">
            <button class="btn-footer btn-back" (click)="logout()">← Cerrar sesión</button>
            <button class="btn-footer btn-refresh" (click)="refresh()">↺ Refrescar</button>
            <button class="btn-footer btn-crear" (click)="showCreateForm = true">+ Crear nueva partida</button>
          </div>
        </footer>
      }

      @if (showCreateForm) {
        <div class="modal-overlay" (click)="cancelarForm()">
          <div class="modal-panel" (click)="$event.stopPropagation()">
            <h3>Nueva partida</h3>
            <div class="form-grid">
              <div class="field">
                <label>Nombre</label>
                <input type="text" [(ngModel)]="form.nombre" placeholder="Nombre de la partida" />
              </div>
              @if (config.showProductSelector) {
                <div class="field">
                  <label>Producto</label>
                  <select [(ngModel)]="form.producto_id">
                    <option value="">Seleccioná...</option>
                    @for (p of productos; track p.id) {
                      <option [value]="p.id">{{ p.nombre }}</option>
                    }
                  </select>
                </div>
              }
              <div class="form-row">
                <div class="field field-narrow">
                  <label>Límite de jugadores</label>
                  <div class="num-stepper">
                    <button type="button" class="step-btn" [disabled]="form.limite_jugadores <= 2" (click)="reducirLimiteJugadores()">−</button>
                    <span class="step-value">{{ form.limite_jugadores }}</span>
                    <button type="button" class="step-btn" [disabled]="form.limite_jugadores >= 8" (click)="form.limite_jugadores = form.limite_jugadores + 1">+</button>
                  </div>
                </div>
                <div class="field field-narrow">
                  <label>🤖 Jugadores IA</label>
                  <div class="num-stepper">
                    <button type="button" class="step-btn" [disabled]="form.cantBots <= 0" (click)="form.cantBots = form.cantBots - 1">−</button>
                    <span class="step-value">{{ form.cantBots }}</span>
                    <button type="button" class="step-btn" [disabled]="form.cantBots >= 1 || form.cantBots >= form.limite_jugadores - 1" (click)="form.cantBots = form.cantBots + 1">+</button>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="field-check field-check-inline">
                  <label>
                    <input type="checkbox" [(ngModel)]="form.requiere_contrasena" />
                    Requiere contraseña
                  </label>
                </div>
              </div>
              <div class="form-row">
                <div class="field field-narrow">
                  <label>Tropas iniciales (4–10)</label>
                  <div class="num-stepper">
                    <button type="button" class="step-btn" [disabled]="form.tropas_iniciales <= 4" (click)="form.tropas_iniciales = form.tropas_iniciales - 1">−</button>
                    <span class="step-value">{{ form.tropas_iniciales }}</span>
                    <button type="button" class="step-btn" [disabled]="form.tropas_iniciales >= 10" (click)="form.tropas_iniciales = form.tropas_iniciales + 1">+</button>
                  </div>
                </div>
                <div class="field field-narrow">
                  <label>Límite de rondas (mín. 10)</label>
                  <div class="num-stepper">
                    <button type="button" class="step-btn" [disabled]="form.limite_rondas <= 10" (click)="form.limite_rondas = form.limite_rondas - 5">−</button>
                    <span class="step-value">{{ form.limite_rondas }}</span>
                    <button type="button" class="step-btn" (click)="form.limite_rondas = form.limite_rondas + 5">+</button>
                  </div>
                </div>
              </div>
            </div>
            @if (form.requiere_contrasena) {
              <div class="field">
                <label>Contraseña</label>
                <input type="text" [(ngModel)]="form.contrasena" placeholder="Clave de acceso" />
              </div>
            }
            <div class="form-actions">
              <button class="btn-cancel" (click)="cancelarForm()">Cancelar</button>
              <button class="btn-crear-confirm" (click)="guardarPartida()"
                [disabled]="formLoading || !form.nombre || (config.showProductSelector && !form.producto_id)">
                {{ formLoading ? 'Creando...' : '+ Crear partida' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (showJugadoresModal) {
        <div class="modal-overlay" (click)="showJugadoresModal = false">
          <div class="modal-panel modal-jugadores" (click)="$event.stopPropagation()">
            <ul class="jugadores-list">
              @for (nombre of jugadoresModal; track $index) {
                <li>{{ nombre }}</li>
              }
            </ul>
          </div>
        </div>
      }

      @if (showPasswordModal) {
        <div class="modal-overlay" (click)="cerrarPasswordModal()">
          <div class="modal-panel" (click)="$event.stopPropagation()">
            <h3>🔒 Partida con contraseña</h3>
            <p class="modal-sub">Ingresá la clave para unirte a <strong>{{ partidaParaUnirse?.nombre }}</strong></p>
            <div class="field">
              <label>Contraseña</label>
              <input type="password" [(ngModel)]="passwordInput" placeholder="••••••••"
                     (keydown.enter)="confirmarUnirse()" autofocus />
            </div>
            @if (passwordError) {
              <p class="password-error">{{ passwordError }}</p>
            }
            <div class="form-actions">
              <button class="btn-cancel" (click)="cerrarPasswordModal()">Cancelar</button>
              <button class="btn-crear-confirm" (click)="confirmarUnirse()">Confirmar</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styleUrl: './game-lobby.component.scss'
})
export class GameLobbyComponent implements OnInit, AfterViewInit, OnDestroy {
  config!: LobbyConfig;

  userEmail = '';
  userId = '';

  jugadores: Jugador[] = [];
  loadingJugadores = true;

  partidas: Partida[] = [];
  loadingPartidas = true;

  profiles: Profile[] = [];
  productos: Producto[] = [];
  private autoProductoId = '';

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

  get notifMsgFormatted(): string {
    return (this.notificacionActiva?.mensaje ?? '').replace('! Hacé', '!\nHacé');
  }

  form = {
    nombre: '',
    producto_id: '',
    limite_jugadores: 2,
    cantBots: 0,
    tropas_iniciales: 5,
    limite_rondas: 30,
    requiere_contrasena: false,
    contrasena: ''
  };

  private channelUsuario: RealtimeChannel | null = null;
  private channelSuscripcion: RealtimeChannel | null = null;
  private channelPartida: RealtimeChannel | null = null;
  private channelNotif: RealtimeChannel | null = null;

  @ViewChild('jugRef', { read: ElementRef }) jugRef!: ElementRef<HTMLElement>;
  jugadoresHeight = 0;
  private resizeObs?: ResizeObserver;

  constructor(
    private auth: AuthService,
    private supabaseService: SupabaseService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.config = this.route.snapshot.data as LobbyConfig;

    this.auth.currentUser$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(async user => {
      this.userEmail = user!.email ?? '';
      this.userId = user!.id;
      await this.supabaseService.updateOnlineStatus(user!.id, true);
      this.loadAll();
      this.subscribeRealtime();
      this.limpiarNotificacionesViejas();
    });
  }

  ngAfterViewInit() {
    this.resizeObs = new ResizeObserver(entries => {
      const h = Math.round(entries[0]?.contentRect.height ?? 0);
      if (h !== this.jugadoresHeight) {
        this.jugadoresHeight = h;
        this.cdr.detectChanges();
      }
    });
    if (this.jugRef) this.resizeObs.observe(this.jugRef.nativeElement);
  }

  ngOnDestroy() {
    this.resizeObs?.disconnect();
    if (this.userId) this.supabaseService.updateOnlineStatus(this.userId, false);
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

  async loadJugadores() {
    this.loadingJugadores = true;
    const { data, error } = await this.supabaseService.getUsuariosPorProducto(this.config.productNombre);
    if (error) this.toast.show('Error al cargar jugadores.', 'error');
    this.jugadores = (data as Jugador[]) ?? [];
    this.loadingJugadores = false;
  }

  async loadPartidas() {
    this.loadingPartidas = true;
    const { data, error } = await this.supabaseService.getPartidas();
    if (error) this.toast.show('Error al cargar partidas.', 'error');
    this.partidas = (data as Partida[]) ?? [];
    this.loadingPartidas = false;
  }

  async loadProductos() {
    const { data } = await this.supabaseService.getProductos();
    this.productos = (data as Producto[]) ?? [];
    if (!this.config.showProductSelector) {
      const match = this.productos.find(p => p.nombre === this.config.productNombre);
      if (match) {
        this.autoProductoId = match.id;
        this.form.producto_id = match.id;
      }
    }
  }

  async loadProfiles() {
    const { data } = await this.supabaseService.getAllProfiles();
    this.profiles = data ?? [];
  }

  async loadMisPartidasIds() {
    const { data } = await this.supabaseService.getMisPartidasIds(this.userId);
    this.misPartidasIds = new Set((data ?? []).map(r => r.partida_id));
  }

  async loadPartidasFinalizadas() {
    const { data: partidas } = await this.supabaseService.getPartidasFinalizadas();
    if (!partidas || partidas.length === 0) { this.partidasFinalizadas = []; return; }
    const ids = partidas.map(p => p.id);
    const { data: jugadores } = await this.supabaseService.getJugadoresDe(ids);
    this.partidasFinalizadas = partidas.map(p => ({
      ...p,
      jugadores: (jugadores ?? []).filter(j => j.partida_id === p.id)
    }));
  }

  subscribeRealtime() {
    const p = this.config.channelPrefix;

    this.channelUsuario = this.supabaseService.client
      .channel(`${p}-usuario-rt`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuario' }, () => {
        this.loadJugadores();
        this.loadProfiles();
      })
      .subscribe();

    this.channelSuscripcion = this.supabaseService.client
      .channel(`${p}-suscripcion-rt`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suscripcion' }, () => {
        this.loadJugadores();
      })
      .subscribe();

    this.channelPartida = this.supabaseService.client
      .channel(`${p}-partida-rt`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'partida' }, (payload) => {
        this.partidas = [payload.new as Partida, ...this.partidas];
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partida' }, (payload) => {
        const updated = payload.new as Partida;
        this.partidas = this.partidas.map(p => p.id === updated.id ? updated : p);
        if (updated.estado === 'Finalizada') this.loadPartidasFinalizadas();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'partida' }, (payload) => {
        this.partidas = this.partidas.filter(p => p.id !== (payload.old as { id: string }).id);
      })
      .subscribe();

    this.channelNotif = this.supabaseService.client
      .channel(`${p}-notif-${this.userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificacion' }, (payload) => {
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

  refresh() {
    if (this.config.showBrand) {
      window.location.reload();
    } else {
      this.loadAll();
    }
  }

  irAPartida() {
    if (!this.notificacionActiva?.partida_id) return;
    this.supabaseService.marcarLeida(this.notificacionActiva.id);
    const pid = this.notificacionActiva.partida_id;
    this.notificacionActiva = null;
    this.router.navigate(['/kuboteg-juego', pid]);
  }

  irAJuego(partidaId: string) {
    this.router.navigate(['/kuboteg-juego', partidaId]);
  }

  cerrarNotificacion() {
    if (this.notificacionActiva) {
      this.supabaseService.marcarLeida(this.notificacionActiva.id);
      this.notificacionActiva = null;
    }
  }

  reducirLimiteJugadores() {
    this.form.limite_jugadores--;
    if (this.form.cantBots >= this.form.limite_jugadores) {
      this.form.cantBots = this.form.limite_jugadores - 1;
    }
  }

  cancelarForm() {
    this.showCreateForm = false;
    this.form = {
      nombre: '',
      producto_id: this.config.showProductSelector ? '' : this.autoProductoId,
      limite_jugadores: 2,
      cantBots: 0,
      tropas_iniciales: 5,
      limite_rondas: 30,
      requiere_contrasena: false,
      contrasena: ''
    };
  }

  async guardarPartida() {
    if (!this.form.nombre || !this.form.producto_id) return;
    this.form.limite_jugadores = Math.min(8, Math.max(2, this.form.limite_jugadores));
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
      turno_actual_usuario_id: null,
      tropas_iniciales: this.form.tropas_iniciales,
      limite_rondas: this.form.limite_rondas
    });
    if (nuevaPartida) {
      const hostResult = await this.supabaseService.insertPartidaJugador(nuevaPartida.id, this.userId, 0);
      console.log('[insertHost] resultado:', JSON.stringify(hostResult));
      for (let i = 0; i < this.form.cantBots; i++) {
        const botResult = await this.supabaseService.agregarBotAPartida(nuevaPartida.id);
        console.log('[agregarBot] resultado:', JSON.stringify(botResult));
      }
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
    const pjs = jugadores ?? [];
    if (pjs.length === 0) { this.comenzando = false; return; }
    for (const j of pjs) {
      if (j.usuario_id === BOT_USER_ID) continue;
      await this.supabaseService.crearNotificacion(
        j.usuario_id, p.id, `¡La partida "${p.nombre}" comenzó! Hacé clic para jugar.`
      );
    }
    await this.supabaseService.comenzarPartida(p.id);
    this.comenzando = false;
    this.router.navigate(['/kuboteg-juego', p.id]);
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
    const { match, error } = await this.supabaseService.verificarContrasena(
      this.partidaParaUnirse.id, this.passwordInput
    );
    if (error || !match) {
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
    const orden = (currentPlayers ?? []).length;
    await this.supabaseService.insertPartidaJugador(p.id, this.userId, orden);
    await this.supabaseService.unirsePartida(p.id, p.jugadores_registrados);
    this.misPartidasIds.add(p.id);
  }

  private hostNombre(hostId: string): string {
    const p = this.profiles.find(p => p.id === hostId);
    if (!p) return '—';
    return [p.nombre, p.apellido].filter(Boolean).join(' ') || p.email;
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

  formatDay(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(new Date(dateStr));
  }

  volver() { this.location.back(); }
  logout() { this.auth.signOut(); }
}
