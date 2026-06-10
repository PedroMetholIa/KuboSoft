import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService, Partida, PartidaJugador, Turno } from '../../core/services/supabase.service';
import { MapComponent } from '../pruebateg33/map/map.component';

@Component({
  selector: 'app-mat-juego',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
  template: `
    <div class="mat-juego">

      <!-- Loading -->
      <div class="loading-screen" *ngIf="loading">
        <div class="spinner"></div>
        <p>Cargando partida...</p>
      </div>

      <ng-container *ngIf="!loading && partida">

        <!-- Body -->
        <div class="game-body">

          <!-- Panel izquierdo: jugadores + juego -->
          <aside class="scoreboard">
            <h3 class="score-title">Jugadores</h3>
            <div class="score-list">
              <div
                class="score-item"
                *ngFor="let j of jugadores; let i = index"
                [class.active]="j.usuario_id === partida.turno_actual_usuario_id"
                [class.me]="j.usuario_id === userId"
                [class.fuera]="!j.esta_dentro">
                <span class="pos">{{ i + 1 }}</span>
                <div class="player-info">
                  <span class="player-name">{{ nombreJugador(j) }}</span>
                  <span class="player-tag" *ngIf="j.usuario_id === userId">tú</span>
                  <span class="turn-arrow" *ngIf="j.usuario_id === partida.turno_actual_usuario_id && todosAdentro">▶</span>
                </div>
                <span class="dentro-dot" [class.dentro]="j.esta_dentro" [title]="j.esta_dentro ? 'Dentro' : 'Esperando'">
                  {{ j.esta_dentro ? '●' : '○' }}
                </span>
                <span class="pts" *ngIf="todosAdentro">{{ j.puntos }}</span>
              </div>
            </div>

            <p class="waiting-legend" *ngIf="!todosAdentro">
              ● dentro &nbsp; ○ esperando
            </p>

            <div class="panel-divider"></div>

            <!-- Finalizada -->
            <div class="game-over" *ngIf="partida.estado === 'Finalizada'">
              <div class="trophy">🏆</div>
              <h2>Partida finalizada</h2>
              <p class="winner-text" *ngIf="ganador">
                Ganó <strong>{{ nombreJugador(ganador) }}</strong> con {{ ganador.puntos }} puntos
              </p>
              <p class="winner-text" *ngIf="!ganador">Empate</p>
              <div class="final-table">
                <div class="final-row" *ngFor="let j of jugadoresOrdenados">
                  <span class="final-name">{{ nombreJugador(j) }}</span>
                  <span class="final-pts">{{ j.puntos }} pts</span>
                </div>
              </div>
              <button class="btn-volver" (click)="volver()">← Volver al inicio</button>
            </div>

            <!-- Sala de espera -->
            <div class="sala-espera" *ngIf="partida.estado === 'En juego' && !todosAdentro">
              <div class="wait-icon">🎮</div>
              <h2>Sala de espera</h2>
              <p>Esperando que todos los jugadores ingresen...</p>
              <div class="jugadores-espera">
                <div class="espera-row" *ngFor="let j of jugadores">
                  <span class="espera-name">{{ nombreJugador(j) }}</span>
                  <span class="espera-status dentro" *ngIf="j.esta_dentro">Listo ✓</span>
                  <span class="espera-status fuera" *ngIf="!j.esta_dentro">Esperando...</span>
                </div>
              </div>
            </div>

            <!-- Mi turno -->
            <div class="mi-turno" *ngIf="todosAdentro && esMiTurno && turnoActual">
              <div class="turn-label">¡Tu turno!</div>
              <p class="turn-sub">Resolvé la siguiente suma</p>
              <div class="suma-display">
                <span class="num">{{ turnoActual.numero_a }}</span>
                <span class="op">+</span>
                <span class="num">{{ turnoActual.numero_b }}</span>
                <span class="op">=</span>
                <span class="num question">?</span>
              </div>
              <div class="answer-row">
                <input
                  class="answer-input"
                  type="number"
                  [(ngModel)]="respuestaInput"
                  placeholder="Tu respuesta"
                  (keyup.enter)="responder()"
                  [disabled]="respondiendo"
                  autofocus
                />
                <button
                  class="btn-responder"
                  (click)="responder()"
                  [disabled]="respondiendo || respuestaInput === null">
                  {{ respondiendo ? 'Enviando...' : 'Responder' }}
                </button>
              </div>
              <div
                class="feedback-msg"
                *ngIf="feedback"
                [class.correcto]="feedbackCorrecto"
                [class.incorrecto]="!feedbackCorrecto">
                {{ feedback }}
              </div>
            </div>

            <!-- Esperando turno de otro jugador -->
            <div class="esperando" *ngIf="todosAdentro && !esMiTurno && partida.estado === 'En juego'">
              <div class="wait-icon">⏳</div>
              <h3>Turno de <strong>{{ turnoActualNombre }}</strong></h3>
              <p>Esperá tu turno para resolver la suma</p>
            </div>

            <!-- Turno aún no listo -->
            <div class="esperando" *ngIf="todosAdentro && esMiTurno && !turnoActual && partida.estado === 'En juego'">
              <div class="wait-icon">⏳</div>
              <p>Preparando tu suma...</p>
            </div>

          </aside>

          <!-- Panel central: mapa -->
          <main class="game-area">
            <app-map />
          </main>

          <!-- Panel derecho: info de partida -->
          <aside class="side-panel-right">
            <div class="game-info">
              <div class="game-title-block">
                <h1 class="game-name">{{ partida.nombre }}</h1>
                <span class="estado-tag" [ngClass]="partida.estado === 'En juego' ? 'live' : 'done'">
                  {{ partida.estado }}
                </span>
              </div>
              <button class="btn-back" (click)="volver()">← Salir</button>
            </div>
          </aside>
        </div>

      </ng-container>
    </div>
  `,
  styleUrl: './mat-juego.component.scss'
})
export class MatJuegoComponent implements OnInit, OnDestroy {
  partida: Partida | null = null;
  jugadores: PartidaJugador[] = [];
  turnoActual: Turno | null = null;
  miJugador: PartidaJugador | null = null;

  userId = '';
  loading = true;

  respuestaInput: number | null = null;
  respondiendo = false;
  feedback = '';
  feedbackCorrecto = false;

  private partidaId = '';
  private iniciandoJuego = false;
  private channelPartida: RealtimeChannel | null = null;
  private channelTurno: RealtimeChannel | null = null;
  private channelPJ: RealtimeChannel | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: SupabaseService
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
    this.channelTurno?.unsubscribe();
    this.channelPJ?.unsubscribe();
  }

  // ── Computed ──────────────────────────────────────────
  get esMiTurno(): boolean {
    return !!this.partida && this.partida.turno_actual_usuario_id === this.userId;
  }

  get esHost(): boolean {
    return !!this.partida && this.partida.host_id === this.userId;
  }

  get todosAdentro(): boolean {
    return this.jugadores.length > 0 && this.jugadores.every(j => j.esta_dentro);
  }

  get ganador(): PartidaJugador | null {
    if (!this.partida?.ganador_id) return null;
    return this.jugadores.find(j => j.usuario_id === this.partida!.ganador_id) ?? null;
  }

  get jugadoresOrdenados(): PartidaJugador[] {
    return [...this.jugadores].sort((a, b) => b.puntos - a.puntos);
  }

  get turnoActualNombre(): string {
    if (!this.partida?.turno_actual_usuario_id) return '...';
    const j = this.jugadores.find(j => j.usuario_id === this.partida!.turno_actual_usuario_id);
    return j ? this.nombreJugador(j) : '...';
  }

  // ── Load ──────────────────────────────────────────────
  async loadGameState() {
    this.loading = true;
    const [{ data: partida }, { data: jugadores }, { data: turno }] = await Promise.all([
      this.service.getPartidaById(this.partidaId),
      this.service.getPartidaJugadores(this.partidaId),
      this.service.getTurnoActual(this.partidaId)
    ]);
    this.partida     = partida as Partida | null;
    this.jugadores   = (jugadores as unknown as PartidaJugador[]) ?? [];
    this.turnoActual = turno as Turno | null;
    this.miJugador   = this.jugadores.find(j => j.usuario_id === this.userId) ?? null;
    this.loading = false;

    if (this.miJugador) {
      await this.service.marcarEstaDentro(this.partidaId, this.userId);
      await this.reloadJugadores();
    }
  }

  private async reloadJugadores() {
    const { data } = await this.service.getPartidaJugadores(this.partidaId);
    this.jugadores = (data as unknown as PartidaJugador[]) ?? [];
    this.miJugador = this.jugadores.find(j => j.usuario_id === this.userId) ?? null;

    if (
      this.esHost &&
      this.todosAdentro &&
      !this.partida?.turno_actual_usuario_id &&
      !this.iniciandoJuego
    ) {
      await this.iniciarJuego();
    }
  }

  private async iniciarJuego() {
    this.iniciandoJuego = true;
    const primerJugador = this.jugadores[0];
    if (!primerJugador) return;
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    await this.service.crearTurno({
      partida_id: this.partidaId,
      usuario_id: primerJugador.usuario_id,
      numero_a: a,
      numero_b: b,
      respuesta_correcta: a + b
    });
    await this.service.setTurnoActual(this.partidaId, primerJugador.usuario_id);
  }

  // ── Realtime ──────────────────────────────────────────
  subscribeRealtime() {
    this.channelPartida = this.service.client
      .channel(`mat-partida-${this.partidaId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partida' }, (payload) => {
        if (payload.new['id'] === this.partidaId) {
          this.partida = payload.new as Partida;
        }
      })
      .subscribe();

    this.channelTurno = this.service.client
      .channel(`mat-turno-${this.partidaId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'turno' }, (payload) => {
        if (payload.new['partida_id'] === this.partidaId) {
          this.turnoActual = payload.new as Turno;
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'turno' }, (payload) => {
        if (payload.new['partida_id'] === this.partidaId && payload.new['respondido_en']) {
          if (this.turnoActual?.id === payload.new['id']) {
            this.turnoActual = null;
          }
        }
      })
      .subscribe();

    this.channelPJ = this.service.client
      .channel(`mat-pj-${this.partidaId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partida_jugador' }, (payload) => {
        if (payload.new['partida_id'] === this.partidaId) {
          this.reloadJugadores();
        }
      })
      .subscribe();
  }

  // ── Game logic ────────────────────────────────────────
  async responder() {
    if (!this.turnoActual || this.respuestaInput === null || this.respondiendo) return;
    this.respondiendo = true;

    const esCorrecta = this.respuestaInput === this.turnoActual.respuesta_correcta;
    this.feedback = esCorrecta
      ? `¡Correcto! +10 puntos`
      : `Incorrecto. La respuesta era ${this.turnoActual.respuesta_correcta}`;
    this.feedbackCorrecto = esCorrecta;

    await this.service.responderTurno(this.turnoActual.id, this.respuestaInput, esCorrecta);

    if (esCorrecta && this.miJugador) {
      const nuevoPuntos = this.miJugador.puntos + 10;
      await this.service.updatePartidaJugadorPuntos(this.miJugador.id, nuevoPuntos);
      this.miJugador.puntos = nuevoPuntos;
    }

    await new Promise(r => setTimeout(r, 2000));

    const miIndex = this.jugadores.findIndex(j => j.usuario_id === this.userId);
    const nextPlayer = this.jugadores[miIndex + 1] ?? null;

    if (nextPlayer) {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      await this.service.crearTurno({
        partida_id: this.partidaId,
        usuario_id: nextPlayer.usuario_id,
        numero_a: a,
        numero_b: b,
        respuesta_correcta: a + b
      });
      await this.service.setTurnoActual(this.partidaId, nextPlayer.usuario_id);
    } else {
      const { data: pjs } = await this.service.getPartidaJugadores(this.partidaId);
      const updated = (pjs as unknown as PartidaJugador[]) ?? this.jugadores;
      const winner = updated.reduce((best, j) => j.puntos > best.puntos ? j : best, updated[0]);
      await this.service.finalizarPartida(this.partidaId, winner?.usuario_id ?? null);
    }

    this.feedback = '';
    this.respuestaInput = null;
    this.respondiendo = false;
  }

  // ── Helpers ───────────────────────────────────────────
  nombreJugador(j: PartidaJugador | null): string {
    if (!j) return '—';
    const u = j.usuario;
    if (u) {
      const nombre = [u.nombre, u.apellido].filter(Boolean).join(' ');
      return nombre || u.email;
    }
    return j.usuario_id.slice(0, 8) + '...';
  }

  volver() {
    this.router.navigate(['/partida']);
  }
}
