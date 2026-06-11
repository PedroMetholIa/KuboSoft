import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService, Partida, PartidaJugador, TerritorioEstado, Lider } from '../../core/services/supabase.service';
import { ToastService } from '../../core/services/toast.service';
import { MapComponent } from './map/map.component';
import { TERRITORIES } from './map/territories.data';

interface ResultadoCombate {
  dadosAtaque: number[];
  dadosDefensa: number[];
  bajasAtacante: number;
  bajasDefensor: number;
  conquista: boolean;
}

interface ConquistaPendiente {
  origenId: string;
  destinoId: string;
  tropasOrigenFinal: number;
}

interface CombateRpc {
  error?: string;
  dados_ataque?: number[];
  dados_defensa?: number[];
  bajas_atacante?: number;
  bajas_defensor?: number;
  conquista?: boolean;
  tropas_origen_final?: number;
  tropas_destino_final?: number;
}

@Component({
  selector: 'app-nexateg-juego',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
  template: `
    <div class="nexateg-juego">

      <!-- Overlay: rotar dispositivo (mostrado en portrait mobile via CSS) -->
      <div class="rotate-overlay">
        <div class="rotate-icon">&#8635;</div>
        <p>Girá el dispositivo para jugar</p>
      </div>

      <!-- Loading -->
      <div class="loading-screen" *ngIf="loading">
        <div class="spinner"></div>
        <p>Cargando partida...</p>
      </div>

      <!-- Error de carga -->
      <div class="loading-screen" *ngIf="!loading && loadError">
        <p style="color:#f87171;font-size:1.1rem">No se pudo conectar con el servidor.</p>
        <button class="btn-back" style="margin-top:1rem" (click)="loadGameState()">↺ Reintentar</button>
      </div>

      <!-- Modal: selección de color y líder -->
      <div class="color-selector-overlay" *ngIf="!loading && mostrarSelectorModal">
        <div class="color-selector-modal" [class.modal-wide]="pasoModal === 'lider'">

          <div class="step-indicator">
            <div class="step-dot" [class.active]="pasoModal === 'color'" [class.done]="pasoModal === 'lider'"><span>1</span></div>
            <div class="step-line"></div>
            <div class="step-dot" [class.active]="pasoModal === 'lider'"><span>2</span></div>
          </div>

          <ng-container *ngIf="pasoModal === 'color'">
            <div class="modal-top-row">
              <div class="color-icon-inline">🎨</div>
              <div class="lider-header-text">
                <h2>Elegí tu color</h2>
                <p>Cada jugador debe tener un color único</p>
              </div>
            </div>
            <div class="colores-grid">
              <button
                class="color-btn"
                *ngFor="let c of coloresDisponibles"
                [style.background-color]="c.hex"
                [class.selected]="colorPreseleccionado === c.hex"
                [class.ocupado]="estaColorOcupado(c.hex)"
                (click)="!estaColorOcupado(c.hex) && preseleccionarColor(c.hex)"
                [title]="estaColorOcupado(c.hex) ? 'Ocupado' : c.nombre">
              </button>
            </div>
            <button
              class="btn-confirmar-color"
              [disabled]="!colorPreseleccionado"
              [style.background-color]="colorPreseleccionado || ''"
              (click)="avanzarALider()">
              Siguiente →
            </button>
          </ng-container>

          <ng-container *ngIf="pasoModal === 'lider'">
            <div class="modal-top-row">
              <span class="lider-header-icon">👑</span>
              <div class="lider-header-text">
                <h2>Elegí tu líder</h2>
                <p>Figura política que te representará. No se pueden repetir.</p>
              </div>
            </div>
            <div class="lideres-grid">
              <button
                class="lider-btn"
                *ngFor="let l of lideres"
                [class.selected]="liderPreseleccionado === l.nombre"
                [class.ocupado]="lideresOcupados.has(l.nombre)"
                [disabled]="lideresOcupados.has(l.nombre)"
                [title]="l.nombre"
                (click)="preseleccionarLider(l.nombre)">
                <div class="lider-img-wrap">
                  <img *ngIf="getLiderImgPath(l)" [src]="getLiderImgPath(l)" [alt]="l.nombre" class="lider-img"
                       (error)="onImgError($event, l.nombre)" />
                  <span *ngIf="!getLiderImgPath(l)" class="lider-initials">{{ l.nombre[0] }}</span>
                </div>
              </button>
            </div>
            <div class="modal-actions">
              <button class="btn-volver-paso" (click)="volverAColor()">← Atrás</button>
              <button
                class="btn-confirmar-color"
                style="background-color:#7c3aed"
                [disabled]="!liderPreseleccionado"
                (click)="confirmarSeleccion()">
                Confirmar
              </button>
            </div>
          </ng-container>

        </div>
      </div>

      <ng-container *ngIf="!loading && partida">
        <div class="game-body">

          <!-- Panel izquierdo -->
          <aside class="scoreboard" [class.panel-cerrado]="!panelAbierto">
            <h3 class="score-title">Jugadores</h3>
            <div class="score-list">
              <div
                class="score-item"
                *ngFor="let j of jugadoresEnOrden; let i = index"
                [class.active]="j.usuario_id === jugadorActualId && !!fase"
                [class.me]="j.usuario_id === userId"
                [class.fuera]="!j.esta_dentro">
                <span class="pos">{{ i + 1 }}</span>
                <span class="player-color-dot" *ngIf="jugadorColores[j.usuario_id]"
                  [style.background-color]="jugadorColores[j.usuario_id]"></span>
                <div class="player-info">
                  <span class="player-name">{{ nombreJugador(j) }}</span>
                  <span class="player-lider" *ngIf="jugadorLideres[j.usuario_id]">{{ jugadorLideres[j.usuario_id] }}</span>
                  <span class="player-tag" *ngIf="j.usuario_id === userId">tú</span>
                </div>
                <span class="troop-count" *ngIf="fase === 'colocacion' && (j.tropas_por_colocar ?? 0) > 0">
                  +{{ j.tropas_por_colocar }}
                </span>
                <span class="dentro-dot" [class.dentro]="j.esta_dentro">
                  {{ j.esta_dentro ? '●' : '○' }}
                </span>
              </div>
            </div>

            <p class="waiting-legend" *ngIf="!todosAdentro">● dentro &nbsp; ○ esperando</p>
            <div class="panel-divider"></div>

            <!-- Finalizada -->
            <div class="game-over" *ngIf="partida.estado === 'Finalizada'">
              <div class="trophy">🏆</div>
              <h2>Partida finalizada</h2>
              <p class="winner-text" *ngIf="ganador">Ganó <strong>{{ nombreJugador(ganador) }}</strong></p>
              <p class="winner-text" *ngIf="!ganador">Empate</p>
              <button class="btn-volver" (click)="volver()">← Volver al inicio</button>
            </div>

            <!-- Sala de espera -->
            <div class="sala-espera" *ngIf="partida.estado === 'En juego' && !todosAdentro">
              <div class="wait-icon">🎮</div>
              <h2>Sala de espera</h2>
              <p>Esperando que todos los jugadores ingresen...</p>
            </div>

            <!-- Host: configurar partida -->
            <div class="config-host" *ngIf="mostrarConfigHost">
              <div class="turn-label">Configurar partida</div>
              <p class="config-sub">Tropas iniciales por jugador</p>
              <div class="tropas-control">
                <button class="btn-tropas" (click)="decrementarTropas()">−</button>
                <span class="tropas-valor">{{ tropasIniciales }}</span>
                <button class="btn-tropas" (click)="incrementarTropas()">+</button>
              </div>
              <p class="tropas-rango">Mín: 4 &nbsp;·&nbsp; Máx: 10</p>
              <button class="btn-iniciar-partida" (click)="confirmarConfiguracion()" [disabled]="iniciandoJuego">
                {{ iniciandoJuego ? 'Iniciando...' : '▶ Iniciar partida' }}
              </button>
            </div>

            <!-- No-host esperando config -->
            <div class="esperando" *ngIf="esperandoConfig">
              <div class="wait-icon">⚙️</div>
              <h3>Configurando partida</h3>
              <p>El host está configurando las tropas iniciales...</p>
            </div>

            <!-- FASE: Colocación - mi turno -->
            <div class="phase-panel" *ngIf="fase === 'colocacion' && esMiTurno">
              <div class="phase-title">📦 Colocación de tropas</div>
              <p class="phase-sub">Tropas por colocar: <strong>{{ misTropasParaColocar }}</strong></p>
              <p class="phase-hint">Clic en un territorio tuyo para colocar una tropa</p>
              <button class="btn-phase-action"
                [disabled]="misTropasParaColocar > 0"
                (click)="confirmarColocacion()">
                Confirmar colocación →
              </button>
            </div>

            <!-- FASE: Colocación - turno ajeno -->
            <div class="phase-panel" *ngIf="fase === 'colocacion' && !esMiTurno">
              <div class="phase-title">📦 Colocación de tropas</div>
              <p>Colocando <strong>{{ jugadorActualNombre }}</strong>...</p>
            </div>

            <!-- FASE: Ataque - mi turno -->
            <div class="phase-panel" *ngIf="fase === 'ataque' && esMiTurno">
              <div class="phase-title">⚔️ Fase de Ataque</div>

              <!-- Conquista pendiente: elegir tropas a mover -->
              <ng-container *ngIf="conquistaPendiente">
                <p class="phase-hint conquista-hint">
                  ¡Territorio conquistado! Movés tropas a<br>
                  <strong>{{ nombreTerritorio(conquistaPendiente.destinoId) }}</strong>
                </p>
                <div class="tropas-control">
                  <button class="btn-tropas"
                    [disabled]="conquistaTropasAMover <= 1"
                    (click)="conquistaTropasAMover = conquistaTropasAMover - 1">−</button>
                  <span class="tropas-valor">{{ conquistaTropasAMover }}</span>
                  <button class="btn-tropas"
                    [disabled]="conquistaTropasAMover >= maxTropasMovibles"
                    (click)="conquistaTropasAMover = conquistaTropasAMover + 1">+</button>
                </div>
                <p class="tropas-rango">Mín: 1 &nbsp;·&nbsp; Máx: {{ maxTropasMovibles }}</p>
                <button class="btn-phase-action" (click)="confirmarMovimientoConquista()">
                  Mover tropas →
                </button>
              </ng-container>

              <!-- Estado normal del ataque -->
              <ng-container *ngIf="!conquistaPendiente">
                <p class="phase-hint" *ngIf="!territorioAtacanteId">
                  Seleccioná un territorio con más de 1 tropa para atacar
                </p>
                <p class="phase-hint" *ngIf="territorioAtacanteId">
                  <strong>{{ nombreTerritorio(territorioAtacanteId) }}</strong> seleccionado —
                  elegí un enemigo adyacente destacado
                </p>

                <!-- Resultado combate -->
                <div class="combate-result" *ngIf="resultadoCombate">
                  <div class="dados-row">
                    <span class="dado dado-ataque" *ngFor="let d of resultadoCombate.dadosAtaque">{{ d }}</span>
                  </div>
                  <div class="dados-row">
                    <span class="dado dado-defensa" *ngFor="let d of resultadoCombate.dadosDefensa">{{ d }}</span>
                  </div>
                  <p class="combate-summary">
                    Bajas — vos: {{ resultadoCombate.bajasAtacante }} · rival: {{ resultadoCombate.bajasDefensor }}
                  </p>
                </div>

                <button class="btn-phase-action btn-end-attack"
                  [disabled]="procesandoTurno"
                  (click)="terminarAtaque()">
                  {{ procesandoTurno ? 'Procesando...' : 'Terminar ataque →' }}
                </button>
              </ng-container>
            </div>

            <!-- FASE: Ataque - turno ajeno -->
            <div class="phase-panel" *ngIf="fase === 'ataque' && !esMiTurno">
              <div class="phase-title">⚔️ Fase de Ataque</div>
              <p>Atacando <strong>{{ jugadorActualNombre }}</strong>...</p>
            </div>

            <!-- FASE: Reagrupación - mi turno -->
            <div class="phase-panel" *ngIf="fase === 'reagrupacion' && esMiTurno">
              <div class="phase-title">🔄 Reagrupación</div>
              <p class="phase-hint" *ngIf="!territorioOrigenId">
                Seleccioná un territorio tuyo para mover tropas (opcional)
              </p>
              <p class="phase-hint" *ngIf="territorioOrigenId">
                <strong>{{ nombreTerritorio(territorioOrigenId) }}</strong> —
                elegí un territorio propio adyacente
              </p>
              <button class="btn-phase-action btn-skip"
                [disabled]="procesandoTurno"
                (click)="saltarReagrupacion()">
                {{ procesandoTurno ? 'Procesando...' : 'Saltar →' }}
              </button>
            </div>

            <!-- FASE: Reagrupación - turno ajeno -->
            <div class="phase-panel" *ngIf="fase === 'reagrupacion' && !esMiTurno">
              <div class="phase-title">🔄 Reagrupación</div>
              <p>Reagrupando <strong>{{ jugadorActualNombre }}</strong>...</p>
            </div>

            <!-- Declarar ganador (solo si en juego y hay fase activa) -->
            <div class="declare-winner" *ngIf="esMiTurno && partida.estado === 'En juego' && !!fase">
              <button class="btn-ganar" (click)="declararseGanador()" [disabled]="declarando">
                {{ declarando ? 'Declarando...' : '🏆 Declararme ganador' }}
              </button>
            </div>

          </aside>

          <!-- Mapa -->
          <main class="game-area">
            <button class="panel-toggle-btn" (click)="togglePanel()" [attr.aria-label]="panelAbierto ? 'Cerrar panel' : 'Abrir panel'">
              {{ panelAbierto ? '✕' : '☰' }}
            </button>
            <app-map
              [territoriosOwner]="territoriosOwnerMap"
              [jugadorColores]="jugadorColores"
              [currentUserId]="userId"
              [tropas]="tropasMap"
              [jugadorNombres]="jugadorNombres"
              [territorioSeleccionado]="territorioSeleccionado"
              [territoriosDestacados]="territoriosDestacados"
              (territorioClick)="onMapTerritoryClick($event)"
              (territorioRightClick)="onMapTerritoryRightClick($event)"
              (deseleccionar)="onMapDeseleccionar()"
            />
          </main>

          <!-- Panel derecho -->
          <aside class="side-panel-right">
            <div class="game-info">
              <div class="game-title-block">
                <h1 class="game-name">{{ partida.nombre }}</h1>
                <span class="estado-tag" [ngClass]="partida.estado === 'En juego' ? 'live' : 'done'">
                  {{ partida.estado }}
                </span>
              </div>
              <div class="ronda-info" *ngIf="partida.ronda_actual">
                <span class="ronda-label">Ronda</span>
                <span class="ronda-num">{{ partida.ronda_actual }}</span>
              </div>
              <div class="tropas-info" *ngIf="partida.tropas_iniciales">
                <span class="tropas-info-label">Tropas iniciales</span>
                <span class="tropas-info-num">{{ partida.tropas_iniciales }}</span>
              </div>
              <button class="btn-back" (click)="volver()">← Salir</button>
            </div>
          </aside>

        </div>
      </ng-container>
    </div>
  `,
  styleUrl: './nexateg-juego.component.scss'
})
export class NexaTegJuegoComponent implements OnInit, OnDestroy {
  partida: Partida | null = null;
  jugadores: PartidaJugador[] = [];
  lideres: Lider[] = [];
  territorios: Record<string, TerritorioEstado> = {};

  userId = '';
  loading = true;
  loadError = false;
  declarando = false;
  procesandoTurno = false;
  panelAbierto = true;

  // ── Color / Lider modal ────────────────────────────────
  readonly coloresDisponibles = [
    { hex: 'rgb(185, 28, 28)',   nombre: 'Rojo' },
    { hex: 'rgb(57, 93, 194)',   nombre: 'Azul' },
    { hex: 'rgb(255, 182, 77)',  nombre: 'Amarillo' },
    { hex: 'rgb(32, 161, 80)',   nombre: 'Verde' },
    { hex: 'rgb(252, 101, 39)',  nombre: 'Naranja' },
    { hex: 'rgb(200, 71, 249)',  nombre: 'Violeta' },
    { hex: 'rgb(205, 205, 205)', nombre: 'Blanco' },
    { hex: 'rgb(33, 33, 33)',    nombre: 'Negro' },
  ];
  mostrarSelectorModal = false;
  pasoModal: 'color' | 'lider' = 'color';
  colorPreseleccionado: string | null = null;
  liderPreseleccionado: string | null = null;
  jugadorColores: Record<string, string> = {};
  jugadorLideres: Record<string, string> = {};

  // ── Host config ───────────────────────────────────────
  tropasIniciales = 5;
  iniciandoJuego = false;

  // ── Phase state ───────────────────────────────────────
  tropasColocadasEstaFase: Record<string, number> = {};
  territorioAtacanteId: string | null = null;
  resultadoCombate: ResultadoCombate | null = null;
  procesandoCombate = false;
  territorioOrigenId: string | null = null;
  conquistaPendiente: ConquistaPendiente | null = null;
  conquistaTropasAMover = 1;

  private partidaId = '';
  private channelPartida: RealtimeChannel | null = null;
  private channelPJ: RealtimeChannel | null = null;
  private channelTerritorio: RealtimeChannel | null = null;
  private reloadJugadoresTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: SupabaseService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.partidaId = this.route.snapshot.paramMap.get('id') ?? '';
    const user = this.service.getCurrentUser();
    if (user) {
      this.userId = user.id;
      this.loadGameState();
      this.subscribeRealtime();
    }
  }

  ngOnDestroy() {
    this.channelPartida?.unsubscribe();
    this.channelPJ?.unsubscribe();
    this.channelTerritorio?.unsubscribe();
    if (this.reloadJugadoresTimer) clearTimeout(this.reloadJugadoresTimer);
  }

  // ── Computed ──────────────────────────────────────────
  get fase() { return this.partida?.fase_actual ?? null; }

  get jugadorActualId(): string {
    const orden = this.partida?.orden_jugadores ?? [];
    const idx = this.partida?.jugador_actual_index ?? 0;
    return orden[idx] ?? '';
  }

  get esMiTurno(): boolean { return !!this.jugadorActualId && this.jugadorActualId === this.userId; }
  get esHost(): boolean { return this.partida?.host_id === this.userId; }

  get todosAdentro(): boolean {
    return this.jugadores.length > 0 && this.jugadores.every(j => j.esta_dentro);
  }

  get tropasPorColocarBase(): number {
    return this.jugadores.find(j => j.usuario_id === this.userId)?.tropas_por_colocar ?? 0;
  }

  get misTropasParaColocar(): number {
    const placed = Object.values(this.tropasColocadasEstaFase).reduce((a, b) => a + b, 0);
    return this.tropasPorColocarBase - placed;
  }

  get territoriosOwnerMap(): Record<string, string> {
    const map: Record<string, string> = {};
    Object.values(this.territorios).forEach(t => { map[t.territorio_id] = t.usuario_id; });
    return map;
  }

  get tropasMap(): Record<string, number> {
    const map: Record<string, number> = {};
    Object.values(this.territorios).forEach(t => {
      map[t.territorio_id] = t.tropas + (this.tropasColocadasEstaFase[t.territorio_id] ?? 0);
    });
    return map;
  }

  get jugadorNombres(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const j of this.jugadores) {
      const u = j.usuario;
      map[j.usuario_id] = u
        ? ([u.nombre, u.apellido].filter(Boolean).join(' ') || u.email)
        : j.usuario_id.slice(0, 8);
    }
    return map;
  }

  get territorioSeleccionado(): string | null {
    return this.territorioAtacanteId ?? this.territorioOrigenId;
  }

  get territoriosDestacados(): string[] {
    if (this.fase === 'ataque' && this.esMiTurno && this.territorioAtacanteId) {
      const terr = TERRITORIES.find(t => t.id === this.territorioAtacanteId);
      return (terr?.neighbors ?? []).filter(nid => {
        const e = this.territorios[nid];
        return e && e.usuario_id !== this.userId;
      });
    }
    if (this.fase === 'reagrupacion' && this.esMiTurno && this.territorioOrigenId) {
      const terr = TERRITORIES.find(t => t.id === this.territorioOrigenId);
      return (terr?.neighbors ?? []).filter(nid => {
        const e = this.territorios[nid];
        return e && e.usuario_id === this.userId;
      });
    }
    return [];
  }

  get jugadorActualNombre(): string {
    const j = this.jugadores.find(j => j.usuario_id === this.jugadorActualId);
    return j ? this.nombreJugador(j) : '...';
  }

  get jugadoresEnOrden(): PartidaJugador[] {
    const orden = this.partida?.orden_jugadores ?? [];
    if (!orden.length) return this.jugadores;
    return [...this.jugadores].sort((a, b) =>
      orden.indexOf(a.usuario_id) - orden.indexOf(b.usuario_id)
    );
  }

  get maxTropasMovibles(): number {
    if (!this.conquistaPendiente) return 1;
    return Math.min(3, this.conquistaPendiente.tropasOrigenFinal - 1);
  }

  get lideresOcupados(): Set<string> {
    const set = new Set<string>();
    for (const j of this.jugadores) {
      if (j.usuario_id !== this.userId && j.lider) set.add(j.lider);
    }
    return set;
  }

  get mostrarConfigHost(): boolean {
    return this.esHost && this.todosAdentro &&
      this.partida?.estado === 'En juego' && !this.partida?.fase_actual;
  }

  get esperandoConfig(): boolean {
    return !this.esHost && this.todosAdentro &&
      this.partida?.estado === 'En juego' && !this.partida?.fase_actual;
  }

  get ganador(): PartidaJugador | null {
    if (!this.partida?.ganador_id) return null;
    return this.jugadores.find(j => j.usuario_id === this.partida!.ganador_id) ?? null;
  }

  // ── Load ──────────────────────────────────────────────
  async loadGameState() {
    this.loading = true;
    this.loadError = false;

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 12000)
    );

    try {
      const [{ data: partida }, { data: jugadores }, { data: lideres }, { data: territorios }] =
        await Promise.race([
          Promise.all([
            this.service.getPartidaById(this.partidaId),
            this.service.getPartidaJugadores(this.partidaId),
            this.service.getLideres(),
            this.service.getTerritoriosEstado(this.partidaId),
          ]),
          timeout,
        ]);

      this.partida   = partida as Partida | null;
      this.jugadores = (jugadores as unknown as PartidaJugador[]) ?? [];
      this.lideres   = (lideres as Lider[] | null) ?? [];

      const terrArray = (territorios as TerritorioEstado[] | null) ?? [];
      this.territorios = {};
      terrArray.forEach(t => { this.territorios[t.territorio_id] = t; });

      this.buildJugadorColores();
      this.buildJugadorLideres();
      this.loading = false;

      const miJugador = this.jugadores.find(j => j.usuario_id === this.userId);
      if (miJugador) {
        // BD es fuente de verdad; localStorage es fallback por si la BD aún no lo tiene
        const color = miJugador.color
          || localStorage.getItem(`mat-color-${this.partidaId}-${this.userId}`);
        const lider = miJugador.lider
          || localStorage.getItem(`mat-lider-${this.partidaId}-${this.userId}`);

        if (color && lider) {
          // Resincronizar localStorage con los valores actuales
          localStorage.setItem(`mat-color-${this.partidaId}-${this.userId}`, color);
          localStorage.setItem(`mat-lider-${this.partidaId}-${this.userId}`, lider);
          await this.service.marcarEstaDentroConColor(this.partidaId, this.userId, color, lider);
        } else {
          this.mostrarSelectorModal = true;
        }
      }
    } catch {
      this.loading = false;
      this.loadError = true;
    }
  }

  togglePanel() { this.panelAbierto = !this.panelAbierto; }

  private scheduleReloadJugadores() {
    if (this.reloadJugadoresTimer) clearTimeout(this.reloadJugadoresTimer);
    this.reloadJugadoresTimer = setTimeout(() => this.reloadJugadores(), 400);
  }

  private async reloadJugadores() {
    const { data } = await this.service.getPartidaJugadores(this.partidaId);
    this.jugadores = (data as unknown as PartidaJugador[]) ?? [];
    this.buildJugadorColores();
    this.buildJugadorLideres();
  }

  // ── Realtime ──────────────────────────────────────────
  subscribeRealtime() {
    this.channelPartida = this.service.client
      .channel(`nexateg-partida-${this.partidaId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partida' }, (payload) => {
        if (payload.new['id'] === this.partidaId) {
          this.partida = payload.new as Partida;
        }
      })
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.toast.show('Conexión perdida. Reconectando...', 'error');
          setTimeout(() => this.loadGameState(), 3000);
        }
        if (err) console.error('[Realtime partida]', err);
      });

    this.channelPJ = this.service.client
      .channel(`nexateg-pj-${this.partidaId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partida_jugador' }, () => {
        this.scheduleReloadJugadores();
      })
      .subscribe((status, err) => {
        if (err) console.error('[Realtime partida_jugador]', err);
      });

    this.channelTerritorio = this.service.client
      .channel(`nexateg-terr-${this.partidaId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'territorio_estado' }, (payload) => {
        const row = payload.new as any;
        if (row['partida_id'] === this.partidaId) {
          const t = row as TerritorioEstado;
          this.territorios = { ...this.territorios, [t.territorio_id]: t };
        }
      })
      .subscribe((status, err) => {
        if (err) console.error('[Realtime territorio_estado]', err);
      });
  }

  // ── Host: iniciar juego ───────────────────────────────
  async confirmarConfiguracion() {
    if (this.iniciandoJuego || !this.partida) return;
    this.iniciandoJuego = true;

    const { error: errTropas } = await this.service.setTropasIniciales(this.partidaId, this.tropasIniciales);
    if (errTropas) {
      this.toast.show('Error al guardar tropas iniciales.', 'error');
      this.iniciandoJuego = false;
      return;
    }

    const ids = this.jugadores.map(j => j.usuario_id);
    const orden = this.randomShuffle(ids);

    const terrIds = TERRITORIES.map(t => t.id);
    const shuffled = this.seededShuffle(terrIds, this.partidaId);
    const territoriosData = shuffled.map((tid, i) => ({
      partida_id:    this.partidaId,
      territorio_id: tid,
      usuario_id:    orden[i % orden.length],
      tropas:        1,
    }));

    const { error: errTerr } = await this.service.initTerritorios(territoriosData);
    if (errTerr) {
      this.toast.show('Error al inicializar territorios.', 'error');
      this.iniciandoJuego = false;
      return;
    }

    const resultadosTropas = await Promise.all(
      orden.map(uid => this.service.setTropasPorColocar(this.partidaId, uid, this.tropasIniciales))
    );
    if (resultadosTropas.some(r => r.error)) {
      this.toast.show('Error al asignar tropas a los jugadores.', 'error');
      this.iniciandoJuego = false;
      return;
    }

    const { error: errFase } = await this.service.iniciarFaseColocacion(this.partidaId, orden, 1, 0);
    if (errFase) {
      this.toast.show('Error al iniciar la fase de colocación.', 'error');
      this.iniciandoJuego = false;
      return;
    }

    this.iniciandoJuego = false;
  }

  incrementarTropas() { if (this.tropasIniciales < 10) this.tropasIniciales++; }
  decrementarTropas() { if (this.tropasIniciales > 4)  this.tropasIniciales--; }

  // ── Map events ────────────────────────────────────────
  onMapTerritoryClick(territorioId: string) {
    if (!this.esMiTurno) return;
    switch (this.fase) {
      case 'colocacion':   this.colocarTropa(territorioId); break;
      case 'ataque':       this.handleAtaqueClick(territorioId); break;
      case 'reagrupacion': this.handleReagrupacionClick(territorioId); break;
    }
  }

  onMapDeseleccionar() {
    this.territorioAtacanteId = null;
    this.territorioOrigenId = null;
  }

  onMapTerritoryRightClick(territorioId: string) {
    if (this.esMiTurno && this.fase === 'colocacion') {
      this.quitarTropa(territorioId);
    }
  }

  // ── Colocación ────────────────────────────────────────
  colocarTropa(territorioId: string) {
    const estado = this.territorios[territorioId];
    if (!estado || estado.usuario_id !== this.userId) return;
    if (this.misTropasParaColocar <= 0) return;
    const current = this.tropasColocadasEstaFase[territorioId] ?? 0;
    this.tropasColocadasEstaFase = { ...this.tropasColocadasEstaFase, [territorioId]: current + 1 };
  }

  quitarTropa(territorioId: string) {
    const added = this.tropasColocadasEstaFase[territorioId] ?? 0;
    if (added <= 0) return;
    this.tropasColocadasEstaFase = { ...this.tropasColocadasEstaFase, [territorioId]: added - 1 };
  }

  async confirmarColocacion() {
    if (this.misTropasParaColocar !== 0 || !this.partida) return;

    for (const [tid, added] of Object.entries(this.tropasColocadasEstaFase)) {
      if (added > 0) {
        const estado = this.territorios[tid];
        if (estado) {
          await this.updateTerritorio(tid, { tropas: estado.tropas + added });
        }
      }
    }
    await this.service.setTropasPorColocar(this.partidaId, this.userId, 0);
    this.tropasColocadasEstaFase = {};

    const orden = this.partida.orden_jugadores!;
    const idx   = this.partida.jugador_actual_index!;
    const nextIdx = idx + 1;

    if (nextIdx >= orden.length) {
      const startIdx = (this.partida.ronda_actual! - 1) % orden.length;
      await this.service.setFase(this.partidaId, 'ataque', startIdx);
    } else {
      await this.service.avanzarJugador(this.partidaId, nextIdx);
    }
  }

  // ── Ataque ────────────────────────────────────────────
  handleAtaqueClick(territorioId: string) {
    if (this.conquistaPendiente) return;
    const estado = this.territorios[territorioId];
    if (!estado) return;

    if (!this.territorioAtacanteId) {
      if (estado.usuario_id === this.userId && estado.tropas > 1) {
        this.territorioAtacanteId = territorioId;
        this.resultadoCombate = null;
      }
      return;
    }

    if (territorioId === this.territorioAtacanteId) {
      this.territorioAtacanteId = null;
      return;
    }

    const atacanteTerr = TERRITORIES.find(t => t.id === this.territorioAtacanteId);
    const esAdyacente  = atacanteTerr?.neighbors.includes(territorioId) ?? false;
    const esEnemigo    = estado.usuario_id !== this.userId;

    if (esAdyacente && esEnemigo && !this.procesandoCombate) {
      this.ejecutarAtaque(this.territorioAtacanteId, territorioId);
    }
  }

  async ejecutarAtaque(origenId: string, destinoId: string) {
    this.procesandoCombate = true;

    const { data: rpcData, error } = await this.service.resolverCombate(this.partidaId, origenId, destinoId);
    if (error) {
      this.toast.show('Error en el servidor al resolver el combate.', 'error');
      this.procesandoCombate = false;
      return;
    }

    const res = rpcData as CombateRpc;
    if (res.error) {
      this.toast.show(res.error, 'error');
      this.procesandoCombate = false;
      return;
    }

    const conquista = res.conquista ?? false;
    this.resultadoCombate = {
      dadosAtaque:   res.dados_ataque   ?? [],
      dadosDefensa:  res.dados_defensa  ?? [],
      bajasAtacante: res.bajas_atacante ?? 0,
      bajasDefensor: res.bajas_defensor ?? 0,
      conquista,
    };

    if (conquista) {
      this.conquistaTropasAMover = 1;
      this.conquistaPendiente = {
        origenId,
        destinoId,
        tropasOrigenFinal: res.tropas_origen_final ?? 1,
      };
      this.territorioAtacanteId = null;
    }

    this.procesandoCombate = false;
  }

  async confirmarMovimientoConquista() {
    if (!this.conquistaPendiente) return;
    const { origenId, destinoId } = this.conquistaPendiente;
    const aMover = Math.max(1, Math.min(this.conquistaTropasAMover, this.maxTropasMovibles));

    const { data: rpcData, error } = await this.service.moverTropasConquista(
      this.partidaId, origenId, destinoId, aMover
    );
    if (error || (rpcData as any)?.error) {
      this.toast.show((rpcData as any)?.error ?? 'Error al mover tropas.', 'error');
      return;
    }

    this.conquistaPendiente = null;
    this.resultadoCombate = null;
  }

  async terminarAtaque() {
    if (!this.partida || this.conquistaPendiente || this.procesandoTurno) return;
    this.procesandoTurno = true;
    this.territorioAtacanteId = null;
    this.resultadoCombate = null;
    await this.service.setFase(this.partidaId, 'reagrupacion', this.partida.jugador_actual_index!);
    this.procesandoTurno = false;
  }

  // ── Reagrupación ──────────────────────────────────────
  handleReagrupacionClick(territorioId: string) {
    const estado = this.territorios[territorioId];
    if (!estado) return;

    if (!this.territorioOrigenId) {
      if (estado.usuario_id === this.userId && estado.tropas > 1) {
        this.territorioOrigenId = territorioId;
      }
      return;
    }

    if (territorioId === this.territorioOrigenId) {
      this.territorioOrigenId = null;
      return;
    }

    const origenTerr   = TERRITORIES.find(t => t.id === this.territorioOrigenId);
    const esAdyacente  = origenTerr?.neighbors.includes(territorioId) ?? false;
    const esPropio     = estado.usuario_id === this.userId;

    if (esAdyacente && esPropio) {
      this.ejecutarReagrupacion(this.territorioOrigenId, territorioId);
    }
  }

  async ejecutarReagrupacion(origenId: string, destinoId: string) {
    const origen  = this.territorios[origenId];
    const destino = this.territorios[destinoId];
    if (!origen || !destino) return;

    const aMover = origen.tropas - 1;
    await this.updateTerritorio(origenId,  { tropas: 1 });
    await this.updateTerritorio(destinoId, { tropas: destino.tropas + aMover });

    this.territorioOrigenId = null;
    await this.avanzarTurno();
  }

  async saltarReagrupacion() {
    if (this.procesandoTurno) return;
    this.territorioOrigenId = null;
    await this.avanzarTurno();
  }

  // ── Rotación de turnos ────────────────────────────────
  async avanzarTurno() {
    if (!this.partida || this.procesandoTurno) return;
    this.procesandoTurno = true;
    try {
      const orden    = this.partida.orden_jugadores!;
      const ronda    = this.partida.ronda_actual!;
      const startIdx = (ronda - 1) % orden.length;
      const nextIdx  = (this.partida.jugador_actual_index! + 1) % orden.length;

      if (nextIdx === startIdx) {
        await this.iniciarNuevaRonda();
      } else {
        await this.service.setFase(this.partidaId, 'ataque', nextIdx);
      }
    } finally {
      this.procesandoTurno = false;
    }
  }

  async iniciarNuevaRonda() {
    if (!this.partida) return;
    const orden    = this.partida.orden_jugadores!;
    const newRonda = this.partida.ronda_actual! + 1;
    const newStart = (newRonda - 1) % orden.length;

    const resultados = await Promise.all(
      this.jugadores.map(jugador => {
        const uid    = jugador.usuario_id;
        const misIds = Object.values(this.territorios)
          .filter(t => t.usuario_id === uid)
          .map(t => t.territorio_id);
        const base   = Math.max(1, Math.floor(misIds.length / 2));
        const bonus  = this.calcularBonusContinente(uid, misIds);
        return this.service.setTropasPorColocar(this.partidaId, uid, base + bonus);
      })
    );

    if (resultados.some(r => r.error)) {
      this.toast.show('Error al calcular tropas para la nueva ronda.', 'error');
      return;
    }

    await this.service.iniciarFaseColocacion(this.partidaId, orden, newRonda, newStart);
  }

  async declararseGanador() {
    if (this.declarando) return;
    this.declarando = true;
    const { data: rpcData, error } = await this.service.declararGanador(this.partidaId);
    if (error || (rpcData as any)?.error) {
      this.toast.show((rpcData as any)?.error ?? 'No se pudo declarar ganador.', 'error');
    }
    this.declarando = false;
  }

  // ── Helpers ───────────────────────────────────────────
  calcularDadosAtaque(tropas: number): number {
    if (tropas >= 4) return 3;
    if (tropas === 3) return 2;
    if (tropas === 2) return 1;
    return 0;
  }

  calcularDadosDefensa(tropas: number): number {
    if (tropas >= 3) return 3;
    if (tropas === 2) return 2;
    return 1;
  }

  tirarDados(cantidad: number): number[] {
    return Array.from({ length: cantidad }, () => Math.floor(Math.random() * 6) + 1);
  }

  calcularBonusContinente(userId: string, misIds: string[]): number {
    const continentes = [
      { id: 'north_america', bonus: 5 },
      { id: 'south_america', bonus: 3 },
      { id: 'europe',        bonus: 5 },
      { id: 'africa',        bonus: 4 },
      { id: 'asia',          bonus: 7 },
      { id: 'oceania',       bonus: 2 },
    ];
    return continentes.reduce((total, cont) => {
      const terrs = TERRITORIES.filter(t => t.continent === cont.id).map(t => t.id);
      return total + (terrs.every(tid => misIds.includes(tid)) ? cont.bonus : 0);
    }, 0);
  }

  nombreJugador(j: PartidaJugador | null): string {
    if (!j) return '—';
    const u = j.usuario;
    if (u) return [u.nombre, u.apellido].filter(Boolean).join(' ') || u.email;
    return j.usuario_id.slice(0, 8) + '...';
  }

  nombreTerritorio(id: string): string {
    return TERRITORIES.find(t => t.id === id)?.name ?? id;
  }

  getLiderImgPath(l: Lider): string {
    const p = l.img_neutra ?? '';
    if (!p.startsWith('/assets/') && !p.startsWith('assets/')) return '';
    return encodeURI(p);
  }

  onImgError(event: Event, nombre: string) {
    const el = event.target as HTMLImageElement;
    el.style.display = 'none';
    const wrap = el.parentElement;
    if (wrap && !wrap.querySelector('.lider-initials')) {
      const span = document.createElement('span');
      span.className = 'lider-initials';
      span.textContent = nombre[0];
      wrap.appendChild(span);
    }
  }

  estaColorOcupado(hex: string): boolean {
    return Object.entries(this.jugadorColores).some(([uid, c]) => uid !== this.userId && c === hex);
  }

  preseleccionarColor(hex: string)  { this.colorPreseleccionado = hex; }
  preseleccionarLider(id: string)   { this.liderPreseleccionado = id; }
  avanzarALider()                   { if (this.colorPreseleccionado) this.pasoModal = 'lider'; }
  volverAColor()                    { this.pasoModal = 'color'; this.liderPreseleccionado = null; }

  async confirmarSeleccion() {
    if (!this.colorPreseleccionado || !this.liderPreseleccionado) return;
    this.jugadorColores[this.userId] = this.colorPreseleccionado;
    this.jugadorLideres[this.userId] = this.liderPreseleccionado;
    localStorage.setItem(`mat-color-${this.partidaId}-${this.userId}`, this.colorPreseleccionado);
    localStorage.setItem(`mat-lider-${this.partidaId}-${this.userId}`, this.liderPreseleccionado);
    this.mostrarSelectorModal = false;
    await this.service.marcarEstaDentroConColor(this.partidaId, this.userId, this.colorPreseleccionado, this.liderPreseleccionado);
  }

  private buildJugadorColores() {
    for (const j of this.jugadores) {
      if (j.color) this.jugadorColores[j.usuario_id] = j.color;
    }
    // Solo usar localStorage si la BD no devolvió color para este jugador
    if (!this.jugadorColores[this.userId]) {
      const local = localStorage.getItem(`mat-color-${this.partidaId}-${this.userId}`);
      if (local) this.jugadorColores[this.userId] = local;
    }
  }

  private buildJugadorLideres() {
    for (const j of this.jugadores) {
      if (j.lider) this.jugadorLideres[j.usuario_id] = j.lider;
    }
    // Solo usar localStorage si la BD no devolvió líder para este jugador
    if (!this.jugadorLideres[this.userId]) {
      const local = localStorage.getItem(`mat-lider-${this.partidaId}-${this.userId}`);
      if (local) this.jugadorLideres[this.userId] = local;
    }
  }

  private randomShuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private seededShuffle<T>(arr: T[], seed: string): T[] {
    const result = [...arr];
    let s = 0;
    for (let i = 0; i < seed.length; i++) s = (Math.imul(31, s) + seed.charCodeAt(i)) | 0;
    for (let i = result.length - 1; i > 0; i--) {
      s = (Math.imul(1664525, s) + 1013904223) | 0;
      const j = Math.abs(s) % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private async updateTerritorio(
    territorioId: string,
    data: Partial<Pick<TerritorioEstado, 'usuario_id' | 'tropas'>>
  ) {
    const { error } = await this.service.updateTerritorioEstado(this.partidaId, territorioId, data);
    if (error) { this.toast.show('Error al actualizar territorio.', 'error'); return; }
    const existing = this.territorios[territorioId];
    if (existing) {
      this.territorios = { ...this.territorios, [territorioId]: { ...existing, ...data } };
    }
  }

  volver() { this.router.navigate(['/nexateg']); }
}
