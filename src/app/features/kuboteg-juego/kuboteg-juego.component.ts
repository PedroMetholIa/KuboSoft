import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService, Partida, PartidaJugador, TerritorioEstado, Lider, UltimoCombate, UltimaConquista } from '../../core/services/supabase.service';
import { ToastService } from '../../core/services/toast.service';
import { MapComponent } from './map/map.component';
import { NotificacionesComponent, NotifItem } from './notificaciones/notificaciones.component';
import { CombatePanelComponent } from './combate-panel/combate-panel.component';
import { KubotegChatComponent, ChatMensaje } from './chat/chat.component';
import { PartidaInfoComponent } from './partida-info/partida-info.component';
import { MenuJugadorComponent } from './menu-jugador/menu-jugador.component';
import { TERRITORIES } from './map/territories.data';

interface ConquistaPendiente {
  origenId: string;
  destinoId: string;
  tropasOrigenFinal: number;
  defensorNombre: string;
  defensorColor: string;
}

interface RpcError {
  error?: string;
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
  selector: 'app-kuboteg-juego',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent, NotificacionesComponent, CombatePanelComponent, KubotegChatComponent, PartidaInfoComponent, MenuJugadorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kuboteg-juego">

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
                (mouseenter)="reproducirSeleccion()"
                (click)="!estaColorOcupado(c.hex) && preseleccionarColor(c.hex)"
                [title]="estaColorOcupado(c.hex) ? 'Ocupado' : c.nombre">
              </button>
            </div>
            <button
              class="btn-confirmar-color"
              [disabled]="!colorPreseleccionado || avanzandoALider"
              [style.background-color]="colorPreseleccionado || ''"
              (click)="avanzarALider()">
              {{ avanzandoALider ? '...' : 'Siguiente →' }}
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
                (mouseenter)="!lideresOcupados.has(l.nombre) && (liderHovered = l.nombre) && reproducirSeleccion()"
                (mouseleave)="liderHovered = null"
                (click)="preseleccionarLider(l.nombre)">
                <div class="lider-img-wrap">
                  <img *ngIf="getLiderImgActiva(l)" [src]="getLiderImgActiva(l)" [alt]="l.nombre" class="lider-img"
                       (error)="onImgError($event, l.nombre)" />
                  <span *ngIf="!getLiderImgActiva(l)" class="lider-initials">{{ l.nombre[0] }}</span>
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

      <!-- Header del juego -->
      <header class="game-header" *ngIf="!loading && partida">
        <div class="game-header-left">
          <img src="assets/productos/favicon-kuboteg.svg" alt="KuboTeg" class="header-logo">
          <span class="header-brand">Kubo<span style="color:#FF4757">TEG</span></span>
        </div>
        <div class="game-header-center">
          <app-partida-info
            [nombre]="partida.nombre"
            [estado]="partida.estado"
            [rondaActual]="partida.ronda_actual ?? null"
            [tiempoPartida]="tiempoPartida"
            [jugadorNombre]="jugadorActualNombre"
            [jugadorColor]="jugadorColores[jugadorActualId] || ''"
            [esMiTurno]="esMiTurno"
            [fase]="fase"
          />
        </div>
        <div class="game-header-right">
          <button class="btn-back" (click)="volver()">← Salir</button>
        </div>
      </header>

      <ng-container *ngIf="!loading && partida">
        <div class="game-body">

          <!-- Panel izquierdo -->
          <aside class="scoreboard" [class.panel-cerrado]="!panelAbierto">

            <!-- Líder del turno actual -->
            <div class="turno-lider-banner" *ngIf="fase && liderActualImgPath"
                 [style.border-color]="jugadorColores[jugadorActualId]"
                 [style.box-shadow]="'0 0 12px ' + jugadorColores[jugadorActualId] + '55'">
              <img class="turno-lider-img"
                   [src]="liderActualImgPath"
                   [alt]="jugadorLideres[jugadorActualId]">
              <div class="turno-lider-footer">
                <span class="turno-color-dot"
                      [style.background-color]="jugadorColores[jugadorActualId]"></span>
                <div class="turno-lider-text">
                  <span class="turno-nombre">{{ jugadorActualNombre }}</span>
                  <span class="turno-label" [class.mi-turno]="esMiTurno">
                    {{ fase === 'colocacion' ? 'Colocando tropas' : fase === 'ataque' ? 'Atacando' : fase === 'reagrupacion' ? 'Reagrupando' : 'Turno de...' }}
                  </span>
                </div>
              </div>
            </div>

            <app-menu-jugador [panelActivo]="panelActivo">
              <ng-container [ngSwitch]="panelActivo">

                <!-- Jugadores -->
                <ng-container *ngSwitchCase="'jugadores'">
                  <div class="score-list">
                    <ng-container *ngFor="let j of jugadoresEnOrden; let i = index">
                      <div
                        class="score-item"
                        *ngIf="i > 0"
                        [class.active]="j.usuario_id === jugadorActualId && !!fase"
                        [class.me]="j.usuario_id === userId"
                        [class.fuera]="!j.esta_dentro">
                        <span class="pos">{{ i + 1 }}</span>
                        <img *ngIf="getLiderImgByUserId(j.usuario_id)"
                             [src]="getLiderImgByUserId(j.usuario_id)"
                             class="score-lider-img"
                             [style.border-color]="jugadorColores[j.usuario_id]"
                             alt="">
                        <div class="player-info">
                          <span class="player-name">{{ nombreJugador(j) }}</span>
                          <span class="player-lider" *ngIf="jugadorLideres[j.usuario_id]" [style.color]="jugadorColores[j.usuario_id]">{{ jugadorLideres[j.usuario_id] }}</span>
                        </div>
                        <span class="dentro-dot" [class.dentro]="j.esta_dentro">
                          {{ j.esta_dentro ? '●' : '○' }}
                        </span>
                      </div>
                    </ng-container>
                  </div>
                  <p class="waiting-legend" *ngIf="!todosAdentro">● dentro &nbsp; ○ esperando</p>
                </ng-container>

                <!-- Otros paneles (placeholder por ahora) -->
                <!-- Inicio: desglose de tropas -->
                <ng-container *ngSwitchCase="'inicio'">
                  <div class="tr-section" *ngIf="resumenTropas.cantTerritorios > 0; else sinTerritorios">

                    <div class="tr-row">
                      <span class="tr-label">Territorios</span>
                      <span class="tr-valor">{{ resumenTropas.cantTerritorios }}</span>
                    </div>
                    <div class="tr-row tr-base">
                      <span class="tr-label">Tropas base</span>
                      <span class="tr-valor">+{{ resumenTropas.tropasBase }}</span>
                    </div>

                    <ng-container *ngIf="resumenTropas.bonusContinentes > 0">
                      <div class="tr-sep"></div>

                      <ng-container *ngFor="let c of resumenTropas.continentes">
                        <div class="tr-cont-row tr-controlado" *ngIf="c.controlado">
                          <span class="tr-cont-nombre">{{ c.nombre }}</span>
                          <span class="tr-cont-bonus">+{{ c.bonus }}</span>
                        </div>
                      </ng-container>

                      <div class="tr-sep"></div>
                    </ng-container>

                    <div class="tr-total">
                      <span>Próxima ronda</span>
                      <strong>{{ resumenTropas.total }}</strong>
                    </div>

                  </div>
                  <ng-template #sinTerritorios>
                    <div class="mj-placeholder">Sin territorios aún</div>
                  </ng-template>
                </ng-container>
                <div *ngSwitchCase="'notificaciones'" class="mj-placeholder">Notificaciones</div>
                <div *ngSwitchCase="'informacion'" class="mj-placeholder">Información</div>
                <div *ngSwitchCase="'tratado'" class="mj-placeholder">Tratado</div>
                <div *ngSwitchCase="'chat'" class="mj-placeholder">Chat</div>
                <div *ngSwitchCase="'diploma'" class="mj-placeholder">Diploma</div>
                <div *ngSwitchCase="'musica'" class="mj-placeholder">Música</div>
                <div *ngSwitchCase="'configuracion'" class="mj-placeholder">Configuración</div>

              </ng-container>
            </app-menu-jugador>

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

            <!-- Distribuyendo territorios (automático) -->
            <div class="esperando" *ngIf="distribuyendoTerritorios">
              <div class="wait-icon">🗺️</div>
              <h3>Distribuyendo territorios</h3>
              <p>Repartiendo territorios entre los jugadores...</p>
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


          </aside>

          <!-- Barra de herramientas vertical -->
          <nav class="toolbar-vertical">

            <div class="tb-group-top">
              <button class="tb-btn tb-music-btn"
                [class.muted]="musicaMuteada"
                [class.tb-active]="panelActivo === 'musica'"
                (click)="toggleMusica(); setPanelActivo('musica')"
                [attr.data-tooltip]="musicaMuteada ? 'Activar música' : 'Silenciar música'">♪</button>
              <button class="tb-btn"
                [class.tb-active]="panelActivo === 'configuracion'"
                (click)="setPanelActivo('configuracion')"
                data-tooltip="Configuración">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </div>

            <div class="tb-group-bottom">
              <button class="tb-btn"
                [class.tb-active]="panelActivo === 'jugadores'"
                (click)="setPanelActivo('jugadores')"
                data-tooltip="Jugadores">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </button>
              <button class="tb-btn"
                [class.tb-active]="panelActivo === 'inicio'"
                (click)="setPanelActivo('inicio')"
                data-tooltip="Inicio">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </button>

              <button class="tb-btn"
                [class.tb-active]="panelActivo === 'notificaciones'"
                (click)="setPanelActivo('notificaciones')"
                data-tooltip="Notificaciones">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>

              <button class="tb-btn"
                [class.tb-active]="panelActivo === 'informacion'"
                (click)="setPanelActivo('informacion')"
                data-tooltip="Información">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </button>

              <button class="tb-btn"
                [class.tb-active]="panelActivo === 'tratado'"
                (click)="setPanelActivo('tratado')"
                data-tooltip="Tratado">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </button>

              <button class="tb-btn"
                [class.tb-active]="panelActivo === 'chat'"
                (click)="setPanelActivo('chat')"
                data-tooltip="Chat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>

              <button class="tb-btn"
                [class.tb-active]="panelActivo === 'diploma'"
                (click)="setPanelActivo('diploma')"
                data-tooltip="Diploma">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="6"/>
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
              </button>
            </div>

          </nav>

          <!-- Mapa -->
          <main class="game-area">
            <button class="panel-toggle-btn" (click)="togglePanel()" [attr.aria-label]="panelAbierto ? 'Cerrar panel' : 'Abrir panel'">
              {{ panelAbierto ? '✕' : '☰' }}
            </button>

            <!-- Banner conquista (visible para todos) -->
            <div class="conquista-banner" *ngIf="notifConquista">
              <span class="conquista-flag">🏴</span>
              <span class="conquista-dot" [style.background-color]="notifConquista.colorAtacante"></span>
              <span class="conquista-text">
                <strong>{{ notifConquista.atacanteNombre }}</strong>
                conquistó <strong>{{ notifConquista.territorioNombre }}</strong>
                <span class="conquista-de"> (de {{ notifConquista.defensorNombre }})</span>
              </span>
            </div>

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

            <!-- Acciones -->
            <div class="acciones-panel">

              <!-- FASE: Colocación - mi turno -->
              <div class="phase-panel" *ngIf="fase === 'colocacion' && esMiTurno">
                <div class="phase-title">📦 Fase de Colocación</div>

                <!-- Sub-fase: tropas de continente -->
                <ng-container *ngIf="subFaseColocacion === 'continentes' && continenteActualColocacion; let cont">
                  <p class="phase-sub">
                    Continente <strong>{{ continenteColocacionIdx + 1 }}</strong> de <strong>{{ continentesColocacion.length }}</strong>
                  </p>
                  <p class="phase-sub"><strong>{{ cont.nombre }}</strong> — +{{ cont.bonus }}</p>
                  <p class="phase-sub">
                    Tropas a colocar: <strong>{{ cont.bonus - cont.colocadas }}</strong>
                  </p>
                  <p class="phase-hint">Solo podés colocar en territorios de este continente</p>
                </ng-container>

                <!-- Sub-fase: tropas base -->
                <ng-container *ngIf="subFaseColocacion === 'base'">
                  <p class="phase-sub">Tropas por colocar: <strong>{{ misTropasParaColocar }}</strong></p>
                  <p class="phase-hint" *ngIf="misTropasParaColocar > 0">Hacé clic en uno de tus territorios para colocar una tropa. Clic derecho para quitar.</p>
                  <button class="btn-phase-action" *ngIf="misTropasParaColocar === 0" (click)="confirmarColocacion()">
                    Confirmar colocación →
                  </button>
                </ng-container>
              </div>

              <!-- FASE: Colocación - turno ajeno -->
              <div class="phase-panel" *ngIf="fase === 'colocacion' && !esMiTurno">
                <div class="phase-title">📦 Colocación de tropas</div>
                <p class="phase-sub">Colocando <strong>{{ jugadorActualNombre }}</strong>...</p>
              </div>

              <!-- FASE: Ataque - mi turno -->
              <div class="phase-panel" *ngIf="fase === 'ataque' && esMiTurno">
                <div class="phase-title">⚔️ Fase de Ataque</div>
                <p class="phase-hint" *ngIf="territorioAtacanteId && !conquistaPendiente">
                  <strong>{{ nombreTerritorio(territorioAtacanteId) }}</strong> — elegí un enemigo adyacente
                </p>
                <button class="btn-phase-action btn-end-attack"
                  [disabled]="procesandoTurno || !!conquistaPendiente" (click)="terminarAtaque()">
                  {{ procesandoTurno ? 'Procesando...' : 'Finalizar turno →' }}
                </button>
              </div>

              <!-- FASE: Ataque - turno ajeno -->
              <div class="phase-panel" *ngIf="fase === 'ataque' && !esMiTurno">
                <div class="phase-title">⚔️ Fase de Ataque</div>
                <p class="phase-sub">Atacando <strong>{{ jugadorActualNombre }}</strong>...</p>
              </div>

              <!-- FASE: Reagrupación - mi turno -->
              <div class="phase-panel" *ngIf="fase === 'reagrupacion' && esMiTurno">
                <div class="phase-title">🔄 Reagrupación</div>

                <ng-container *ngIf="!territorioOrigenId">
                  <button class="btn-phase-action btn-skip" [disabled]="procesandoTurno" (click)="saltarReagrupacion()">
                    {{ procesandoTurno ? 'Procesando...' : 'Finalizar reagrupación →' }}
                  </button>
                </ng-container>

                <ng-container *ngIf="territorioOrigenId && !reagrupacionDestinoId">
                  <p class="phase-hint">
                    <strong>{{ nombreTerritorio(territorioOrigenId) }}</strong> — elegí un territorio propio adyacente
                  </p>
                  <button class="btn-phase-action btn-skip" [disabled]="procesandoTurno" (click)="saltarReagrupacion()">Finalizar reagrupación →</button>
                </ng-container>
              </div>

              <!-- FASE: Reagrupación - turno ajeno -->
              <div class="phase-panel" *ngIf="fase === 'reagrupacion' && !esMiTurno">
                <div class="phase-title">🔄 Reagrupación</div>
                <p class="phase-sub">Reagrupando <strong>{{ jugadorActualNombre }}</strong>...</p>
              </div>

            </div>

            <!-- Notificaciones -->
            <app-notificaciones [items]="notifItems"></app-notificaciones>

            <!-- Chat -->
            <app-kuboteg-chat
              [messages]="chatMensajes"
              [userId]="userId"
              [playerColors]="jugadorColores"
              (sendMessage)="onChatSend($event)">
            </app-kuboteg-chat>
          </aside>

          <!-- Popup: mover tropas en reagrupación -->
          <div class="conquista-popup-overlay" *ngIf="fase === 'reagrupacion' && esMiTurno && territorioOrigenId && reagrupacionDestinoId">
            <div class="conquista-popup">
              <div class="conquista-popup-header">
                <span class="conquista-popup-icon">🔄</span>
                <div>
                  <div class="conquista-popup-title">Reagrupación de tropas</div>
                  <div class="conquista-popup-sub">
                    De <strong>{{ nombreTerritorio(territorioOrigenId!) }}</strong>
                    a <strong>{{ nombreTerritorio(reagrupacionDestinoId) }}</strong>
                  </div>
                </div>
              </div>
              <div class="conquista-popup-body">
                <div class="tropas-control">
                  <button class="btn-tropas" [disabled]="reagrupacionTropasAMover <= 1"
                    (click)="reagrupacionTropasAMover = reagrupacionTropasAMover - 1">−</button>
                  <span class="tropas-valor">{{ reagrupacionTropasAMover }}</span>
                  <button class="btn-tropas" [disabled]="reagrupacionTropasAMover >= maxTropasReagrupacion"
                    (click)="reagrupacionTropasAMover = reagrupacionTropasAMover + 1">+</button>
                </div>
                <p class="tropas-rango">Mín: 1 &nbsp;·&nbsp; Máx: {{ maxTropasReagrupacion }}</p>
              </div>
              <button class="conquista-popup-btn" [disabled]="procesandoTurno" (click)="confirmarReagrupacion()">
                {{ procesandoTurno ? 'Procesando...' : 'Confirmar →' }}
              </button>
              <button class="conquista-popup-btn-cancel" [disabled]="procesandoTurno" (click)="cancelarReagrupacion()">Cancelar</button>
            </div>
          </div>

          <!-- Popup: mover tropas tras conquista -->
          <div class="conquista-popup-overlay" *ngIf="conquistaPendiente">
            <div class="conquista-popup">
              <div class="conquista-popup-header">
                <span class="conquista-popup-icon">🏴</span>
                <div>
                  <div class="conquista-popup-title">¡Territorio conquistado!</div>
                  <div class="conquista-popup-sub">
                    Movés tropas a <strong>{{ nombreTerritorio(conquistaPendiente.destinoId) }}</strong>
                    <span class="conquista-popup-defensor" [style.color]="conquistaPendiente.defensorColor">
                      (de {{ conquistaPendiente.defensorNombre }})
                    </span>
                  </div>
                </div>
              </div>
              <div class="conquista-popup-body">
                <div class="tropas-control">
                  <button class="btn-tropas" [disabled]="conquistaTropasAMover <= 1"
                    (click)="conquistaTropasAMover = conquistaTropasAMover - 1">−</button>
                  <span class="tropas-valor">{{ conquistaTropasAMover }}</span>
                  <button class="btn-tropas" [disabled]="conquistaTropasAMover >= maxTropasMovibles"
                    (click)="conquistaTropasAMover = conquistaTropasAMover + 1">+</button>
                </div>
                <p class="tropas-rango">Mín: 1 &nbsp;·&nbsp; Máx: {{ maxTropasMovibles }}</p>
              </div>
              <button class="conquista-popup-btn" (click)="confirmarMovimientoConquista()">
                Mover tropas →
              </button>
            </div>
          </div>

        </div>
      </ng-container>

      <!-- Footer del juego — Campo de batalla -->
      <footer class="game-footer" *ngIf="!loading && partida">
        <div class="footer-left">
          <span class="footer-players">{{ jugadoresEnOrden.length }} jugadores</span>
        </div>
        <div class="footer-center">
          <app-combate-panel
            [combate]="popupCombate"
            [mostrarContinuar]="puedeReataque"
            (continuarAtacando)="onContinuarAtacando()">
          </app-combate-panel>
        </div>
        <div class="footer-right">
          <span class="footer-brand">KuboSoft</span>
        </div>
      </footer>

    </div>
  `,
  styleUrl: './kuboteg-juego.component.scss'
})
export class KuboTegJuegoComponent implements OnInit, OnDestroy {
  private static readonly CONTINENT_BONUSES = [
    { id: 'north_america', bonus: 5 },
    { id: 'south_america', bonus: 3 },
    { id: 'europe',        bonus: 5 },
    { id: 'africa',        bonus: 4 },
    { id: 'asia',          bonus: 7 },
    { id: 'oceania',       bonus: 2 },
  ] as const;

  private static readonly CONTINENT_TERRITORIES: Record<string, string[]> = (() => {
    const ids = (cid: string) => TERRITORIES.filter(t => t.continent === cid).map(t => t.id);
    return {
      north_america: ids('north_america'),
      south_america: ids('south_america'),
      europe:        ids('europe'),
      africa:        ids('africa'),
      asia:          ids('asia'),
      oceania:       ids('oceania'),
    };
  })();

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
    { hex: 'rgb(159, 3, 3)',     nombre: 'Rojo' },
    { hex: 'rgb(60, 44, 186)',   nombre: 'Azul' },
    { hex: 'rgb(255, 182, 77)',  nombre: 'Amarillo' },
    { hex: 'rgb(32, 161, 80)',   nombre: 'Verde' },
    { hex: 'rgb(252, 101, 39)',  nombre: 'Naranja' },
    { hex: 'rgb(200, 71, 249)',  nombre: 'Violeta' },
    { hex: 'rgb(188, 186, 186)', nombre: 'Blanco' },
    { hex: 'rgb(47, 47, 47)',    nombre: 'Negro' },
  ];
  mostrarSelectorModal = false;
  pasoModal: 'color' | 'lider' = 'color';
  colorPreseleccionado: string | null = null;
  liderPreseleccionado: string | null = null;
  liderHovered: string | null = null;
  avanzandoALider = false;
  jugadorColores: Record<string, string> = {};
  jugadorLideres: Record<string, string> = {};
  coloresOcupados = new Set<string>();

  private _territoriosOwnerMap: Record<string, string> = {};
  private _tropasMap: Record<string, number> = {};
  private _jugadorNombres: Record<string, string> = {};

  // ── Host config ───────────────────────────────────────
  tropasIniciales = 5;
  iniciandoJuego = false;
  distribuyendoTerritorios = false;
  private ordenGenerado: string[] = [];

  // ── Phase state ───────────────────────────────────────
  tropasColocadasContinentes: Record<string, number> = {};
  tropasColocadasBase: Record<string, number> = {};
  subFaseColocacion: 'continentes' | 'base' = 'base';
  continentesColocacion: Array<{
    id: string; nombre: string; bonus: number; colocadas: number; territoriosPermitidos: string[];
  }> = [];
  continenteColocacionIdx = 0;
  territorioAtacanteId: string | null = null;
  procesandoCombate = false;
  popupCombate: UltimoCombate | null = null;
  private _lastCombateTs = 0;
  private _ultimoOrigenId: string | null = null;
  private _ultimoDestinoId: string | null = null;
  notifConquista: UltimaConquista | null = null;
  private notifConquistaTimer: ReturnType<typeof setTimeout> | null = null;
  private _lastConquistaTs = 0;
  territorioOrigenId: string | null = null;
  conquistaPendiente: ConquistaPendiente | null = null;
  conquistaTropasAMover = 1;
  reagrupacionDestinoId: string | null = null;
  reagrupacionTropasAMover = 1;
  reagrupacionLimites: Record<string, number> = {};
  reagrupacionMovidos: Record<string, number> = {};
  panelActivo = 'jugadores';
  musicaMuteada = false;
  tiempoPartida = '00:00:00';
  private audio!: HTMLAudioElement;
  private sfxPool = new Map<string, HTMLAudioElement>();
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // ── Chat ──────────────────────────────────────────────
  chatMensajes: ChatMensaje[] = [];

  // ── Notificaciones de eventos ─────────────────────────
  notifItems: NotifItem[] = [];

  private partidaId = '';
  private channelPartida: RealtimeChannel | null = null;
  private channelPJ: RealtimeChannel | null = null;
  private channelTerritorio: RealtimeChannel | null = null;
  private channelChat: RealtimeChannel | null = null;
  private channelEventos: RealtimeChannel | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: SupabaseService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.audio = new Audio('assets/KuboTeg/sonidos/musica-fondo.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.4;
    this.partidaId = this.route.snapshot.paramMap.get('id') ?? '';
    const user = this.service.getCurrentUser();
    if (user) {
      this.userId = user.id;
      this.loadGameState();
      this.subscribeRealtime();
    }
  }

  ngOnDestroy() {
    this.audio.pause();
    this.audio.src = '';
    this.sfxPool.clear();
    if (this.channelPartida)    this.service.client.removeChannel(this.channelPartida);
    if (this.channelPJ)         this.service.client.removeChannel(this.channelPJ);
    if (this.channelTerritorio) this.service.client.removeChannel(this.channelTerritorio);
    if (this.channelChat)       this.service.client.removeChannel(this.channelChat);
    if (this.channelEventos)    this.service.client.removeChannel(this.channelEventos);
    if (this.reconnectTimer)    clearTimeout(this.reconnectTimer);
    if (this.timerInterval)     clearInterval(this.timerInterval);
  }

  private iniciarTimer() {
    if (this.timerInterval) return;
    const inicio = new Date(this.partida!.created_at).getTime();
    const tick = () => {
      const diff = Math.floor((Date.now() - inicio) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      this.tiempoPartida = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      this.cdr.markForCheck();
    };
    tick();
    this.timerInterval = setInterval(tick, 1000);
  }

  setPanelActivo(panel: string) {
    this.panelActivo = panel;
    this.cdr.markForCheck();
  }

  toggleMusica() {
    this.musicaMuteada = !this.musicaMuteada;
    this.audio.muted = this.musicaMuteada;
    if (!this.musicaMuteada && this.audio.paused) {
      this.audio.play().catch(() => {});
    }
    this.cdr.markForCheck();
  }

  private iniciarMusica() {
    if (!this.audio.paused) return;
    this.audio.play().catch(() => {});
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

  get territoriosOwnerMap(): Record<string, string> { return this._territoriosOwnerMap; }
  get tropasMap(): Record<string, number>           { return this._tropasMap; }
  get jugadorNombres(): Record<string, string>      { return this._jugadorNombres; }

  get tropasPorColocarBase(): number {
    return this.jugadores.find(j => j.usuario_id === this.userId)?.tropas_por_colocar ?? 0;
  }

  get continenteActualColocacion() {
    return this.continentesColocacion[this.continenteColocacionIdx] ?? null;
  }

  get misTropasParaColocar(): number {
    if (this.subFaseColocacion === 'continentes') {
      const cont = this.continenteActualColocacion;
      return cont ? cont.bonus - cont.colocadas : 0;
    }
    const totalBonus = this.continentesColocacion.reduce((s, c) => s + c.bonus, 0);
    const tropasBase = Math.max(0, this.tropasPorColocarBase - totalBonus);
    const colocadas = Object.values(this.tropasColocadasBase).reduce((a, b) => a + b, 0);
    return tropasBase - colocadas;
  }

  get territorioSeleccionado(): string | null {
    return this.territorioAtacanteId ?? this.territorioOrigenId;
  }

  get territoriosDestacados(): string[] {
    if (this.fase === 'colocacion' && this.esMiTurno && this.subFaseColocacion === 'continentes') {
      return this.continenteActualColocacion?.territoriosPermitidos ?? [];
    }
    if (this.fase === 'ataque' && this.esMiTurno && this.territorioAtacanteId) {
      const terr = TERRITORIES.find(t => t.id === this.territorioAtacanteId);
      return (terr?.neighbors ?? []).filter(nid => {
        const e = this.territorios[nid];
        return e && e.usuario_id !== this.userId;
      });
    }
    if (this.fase === 'reagrupacion' && this.esMiTurno && this.territorioOrigenId && !this.reagrupacionDestinoId) {
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

  get liderActualImgPath(): string {
    const liderNombre = this.jugadorLideres[this.jugadorActualId];
    if (!liderNombre) return '';
    const lider = this.lideres.find(l => l.nombre === liderNombre);
    return lider ? this.getLiderImgPath(lider) : '';
  }

  get jugadoresEnOrden(): PartidaJugador[] {
    const orden = this.partida?.orden_jugadores ?? [];
    if (!orden.length) return this.jugadores;
    const currentIdx = this.partida?.jugador_actual_index ?? 0;
    const ordenRotado = [...orden.slice(currentIdx), ...orden.slice(0, currentIdx)];
    return [...this.jugadores].sort((a, b) =>
      ordenRotado.indexOf(a.usuario_id) - ordenRotado.indexOf(b.usuario_id)
    );
  }

  get maxTropasMovibles(): number {
    if (!this.conquistaPendiente) return 1;
    return Math.min(3, this.conquistaPendiente.tropasOrigenFinal - 1);
  }

  get maxTropasReagrupacion(): number {
    if (!this.territorioOrigenId) return 1;
    const limite  = this.reagrupacionLimites[this.territorioOrigenId] ?? 0;
    const movidos = this.reagrupacionMovidos[this.territorioOrigenId] ?? 0;
    return Math.max(0, limite - movidos);
  }

  get lideresOcupados(): Set<string> {
    const set = new Set<string>();
    for (const j of this.jugadores) {
      if (j.usuario_id !== this.userId && j.lider) set.add(j.lider);
    }
    return set;
  }

  get territoriosDistribuidos(): boolean {
    return Object.keys(this.territorios).length > 0;
  }

  get mostrarConfigHost(): boolean {
    return this.esHost && this.todosAdentro &&
      this.partida?.estado === 'En juego' && !this.partida?.fase_actual &&
      this.territoriosDistribuidos;
  }

  get esperandoConfig(): boolean {
    return !this.esHost && this.todosAdentro &&
      this.partida?.estado === 'En juego' && !this.partida?.fase_actual &&
      this.territoriosDistribuidos;
  }

  get puedeReataque(): boolean {
    if (!this.esMiTurno || this.fase !== 'ataque') return false;
    if (this.conquistaPendiente || this.procesandoCombate) return false;
    if (!this.popupCombate || this.popupCombate.conquista) return false;
    if (!this._ultimoOrigenId || !this._ultimoDestinoId) return false;
    const origen  = this.territorios[this._ultimoOrigenId];
    const destino = this.territorios[this._ultimoDestinoId];
    return !!origen && origen.tropas > 1 && !!destino && destino.usuario_id !== this.userId;
  }

  onContinuarAtacando() {
    if (!this._ultimoOrigenId || !this._ultimoDestinoId) return;
    this.ejecutarAtaque(this._ultimoOrigenId, this._ultimoDestinoId);
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

      this.partida   = partida;
      this.jugadores = jugadores ?? [];
      this.lideres   = lideres ?? [];

      const terrArray = territorios ?? [];
      this.territorios = {};
      terrArray.forEach(t => { this.territorios[t.territorio_id] = t; });

      this.buildJugadorColores();
      this.buildJugadorLideres();
      this.rebuildOwnerMap();
      this.rebuildTropasMap();
      this.rebuildJugadorNombres();
      this.loading = false;
      if (this.partida?.estado === 'En juego') { this.iniciarMusica(); this.iniciarTimer(); }
      if (this.partida?.fase_actual === 'colocacion' && this.esMiTurno) {
        this.iniciarSubFaseColocacion();
      }
      this.cdr.markForCheck();

      await this.checkAutoDistribuir();

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
          // Si ya tenía color reservado en BD, retomar desde el paso de líder
          if (color) {
            this.colorPreseleccionado = color;
            this.pasoModal = 'lider';
          }
          this.mostrarSelectorModal = true;
        }
      }
    } catch {
      this.loading = false;
      this.loadError = true;
      this.cdr.markForCheck();
    }
  }

  togglePanel() { this.panelAbierto = !this.panelAbierto; }

  // ── Realtime ──────────────────────────────────────────
  subscribeRealtime() {
    // Limpiar canales viejos antes de re-suscribirse
    if (this.channelPartida)    { this.service.client.removeChannel(this.channelPartida);    this.channelPartida = null; }
    if (this.channelPJ)         { this.service.client.removeChannel(this.channelPJ);         this.channelPJ = null; }
    if (this.channelTerritorio) { this.service.client.removeChannel(this.channelTerritorio); this.channelTerritorio = null; }
    if (this.channelChat)       { this.service.client.removeChannel(this.channelChat);       this.channelChat = null; }
    if (this.channelEventos)    { this.service.client.removeChannel(this.channelEventos);    this.channelEventos = null; }

    this.channelChat = this.service.client
      .channel(`kuboteg-chat-${this.partidaId}`)
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        const msg = payload as ChatMensaje;
        if (msg.userId !== this.userId) {
          this.chatMensajes = [...this.chatMensajes, msg];
          this.cdr.markForCheck();
        }
      })
      .subscribe();

    this.channelEventos = this.service.client
      .channel(`kuboteg-eventos-${this.partidaId}`)
      .on('broadcast', { event: 'combate' }, ({ payload }) => {
        const uc = { liderAtacanteImg: '', liderDefensorImg: '', ...payload } as UltimoCombate;
        if (uc.ts > this._lastCombateTs) {
          this._lastCombateTs = uc.ts;
          this.mostrarPopupCombate(uc);
          this.pushNotifCombate(uc);
          this.cdr.markForCheck();
        }
      })
      .on('broadcast', { event: 'conquista' }, ({ payload }) => {
        const uq = payload as UltimaConquista;
        if (uq.ts > this._lastConquistaTs) {
          this._lastConquistaTs = uq.ts;
          this.mostrarNotifConquista(uq);
          this.pushNotifConquista(uq);
          this.cdr.markForCheck();
        }
      })
      .subscribe();

    this.channelPartida = this.service.client
      .channel(`kuboteg-partida-${this.partidaId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partida' }, (payload) => {
        if (payload.new['id'] === this.partidaId) {
          const newPartida = payload.new as Partida;
          if (newPartida.estado === 'En juego' && this.partida?.estado !== 'En juego') {
            this.iniciarMusica();
            this.iniciarTimer();
          }
          const prevFase = this.fase;
          const prevJugadorIdx = this.partida?.jugador_actual_index;
          this.partida = newPartida;
          if (this.fase === 'colocacion' && this.esMiTurno &&
              (prevFase !== 'colocacion' || prevJugadorIdx !== newPartida.jugador_actual_index)) {
            this.iniciarSubFaseColocacion();
          }
          if (this.fase === 'reagrupacion' && prevFase !== 'reagrupacion' && this.esMiTurno) {
            this.iniciarFaseReagrupacion();
          }
          this.cdr.markForCheck();
        }
      })
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') this.scheduleReconnect();
        if (err) console.error('[Realtime partida]', err);
      });

    this.channelPJ = this.service.client
      .channel(`kuboteg-pj-${this.partidaId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partida_jugador' }, (payload) => {
        const updated = payload.new as PartidaJugador;
        const idx = this.jugadores.findIndex(j => j.usuario_id === updated.usuario_id);
        if (idx !== -1) {
          const prev = this.jugadores[idx];
          this.jugadores = [
            ...this.jugadores.slice(0, idx),
            { ...prev, ...updated, usuario: prev.usuario },
            ...this.jugadores.slice(idx + 1),
          ];
          this.buildJugadorColores();
          this.buildJugadorLideres();
          this.rebuildJugadorNombres();
          this.cdr.markForCheck();
          this.checkAutoDistribuir();
        }
      })
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') this.scheduleReconnect();
        if (err) console.error('[Realtime partida_jugador]', err);
      });

    this.channelTerritorio = this.service.client
      .channel(`kuboteg-terr-${this.partidaId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'territorio_estado' }, (payload) => {
        const t = payload.new as TerritorioEstado;
        if (t.partida_id === this.partidaId) {
          const prevOwner = this.territorios[t.territorio_id]?.usuario_id;
          const newOwner  = t.usuario_id;
          this.territorios = { ...this.territorios, [t.territorio_id]: t };
          this.rebuildOwnerMap();
          this.rebuildTropasMap();
          if (newOwner && newOwner !== prevOwner) {
            this.verificarConquistaContinente(newOwner, t.territorio_id);
          }
          this.cdr.markForCheck();
        }
      })
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') this.scheduleReconnect();
        if (err) console.error('[Realtime territorio_estado]', err);
      });
  }

  private scheduleReconnect() {
    // Los 3 canales fallan al mismo tiempo; el timer evita duplicados
    if (this.reconnectTimer) return;
    this.toast.show('Conexión perdida. Reconectando...', 'error');
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      this.subscribeRealtime();
      // Refrescar estado que pudo haber cambiado durante la desconexión
      const [{ data: partida }, { data: jugadores }, { data: territorios }] = await Promise.all([
        this.service.getPartidaById(this.partidaId),
        this.service.getPartidaJugadores(this.partidaId),
        this.service.getTerritoriosEstado(this.partidaId),
      ]);
      if (partida) this.partida = partida;
      if (jugadores) {
        this.jugadores = jugadores;
        this.buildJugadorColores();
        this.buildJugadorLideres();
        this.rebuildJugadorNombres();
      }
      if (territorios) {
        this.territorios = {};
        territorios.forEach(t => { this.territorios[t.territorio_id] = t; });
      }
      this.rebuildOwnerMap();
      this.rebuildTropasMap();
      this.toast.show('Conexión restaurada', 'success');
      this.cdr.markForCheck();
    }, 3000);
  }

  // ── Auto-distribución ────────────────────────────────
  private async checkAutoDistribuir() {
    if (this.esHost && this.todosAdentro && !this.territoriosDistribuidos && !this.distribuyendoTerritorios) {
      await this.distribuirTerritorios();
    }
  }

  // ── Host: distribuir territorios ─────────────────────
  async distribuirTerritorios() {
    if (this.distribuyendoTerritorios || !this.partida) return;
    this.distribuyendoTerritorios = true;

    const ids = this.jugadores.map(j => j.usuario_id);
    this.ordenGenerado = this.randomShuffle(ids);

    const terrIds = TERRITORIES.map(t => t.id);
    const shuffled = this.seededShuffle(terrIds, this.partidaId);
    const territoriosData = shuffled.map((tid, i) => ({
      partida_id:    this.partidaId,
      territorio_id: tid,
      usuario_id:    this.ordenGenerado[i % this.ordenGenerado.length],
      tropas:        1,
    }));

    const { error } = await this.service.initTerritorios(territoriosData);
    if (error) {
      this.toast.show('Error al distribuir territorios.', 'error');
      this.distribuyendoTerritorios = false;
      this.cdr.markForCheck();
      return;
    }

    this.distribuyendoTerritorios = false;
    this.cdr.markForCheck();
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

    const orden = this.ordenGenerado.length > 0
      ? this.ordenGenerado
      : this.randomShuffle(this.jugadores.map(j => j.usuario_id));

    for (const j of this.jugadores) {
      await this.service.setTropasPorColocar(this.partidaId, j.usuario_id, this.tropasIniciales);
    }

    const { error: errFase } = await this.service.iniciarFaseColocacion(this.partidaId, orden, 1, 0);
    if (errFase) {
      this.toast.show('Error al iniciar la fase de colocación.', 'error');
      this.iniciandoJuego = false;
      this.cdr.markForCheck();
      return;
    }

    this.iniciandoJuego = false;
    this.cdr.markForCheck();
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
    this.territorioAtacanteId  = null;
    this.territorioOrigenId    = null;
    this.reagrupacionDestinoId = null;
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

    if (this.subFaseColocacion === 'continentes') {
      const cont = this.continentesColocacion[this.continenteColocacionIdx];
      if (!cont || !cont.territoriosPermitidos.includes(territorioId)) return;
      if (cont.colocadas >= cont.bonus) return;

      this.tropasColocadasContinentes = {
        ...this.tropasColocadasContinentes,
        [territorioId]: (this.tropasColocadasContinentes[territorioId] ?? 0) + 1,
      };
      cont.colocadas++;
      this.rebuildTropasMap();
      this.playSfx('assets/KuboTeg/sonidos/colocar-ficha.mp3');

      if (cont.colocadas >= cont.bonus) {
        this.continenteColocacionIdx++;
        if (this.continenteColocacionIdx >= this.continentesColocacion.length) {
          this.subFaseColocacion = 'base';
        }
      }
      this.cdr.markForCheck();
    } else {
      if (this.misTropasParaColocar <= 0) return;
      this.tropasColocadasBase = {
        ...this.tropasColocadasBase,
        [territorioId]: (this.tropasColocadasBase[territorioId] ?? 0) + 1,
      };
      this.rebuildTropasMap();
      this.playSfx('assets/KuboTeg/sonidos/colocar-ficha.mp3');
      this.cdr.markForCheck();
    }
  }

  quitarTropa(territorioId: string) {
    if (this.subFaseColocacion === 'continentes') {
      const cont = this.continentesColocacion[this.continenteColocacionIdx];
      if (!cont || !cont.territoriosPermitidos.includes(territorioId)) return;
      const added = this.tropasColocadasContinentes[territorioId] ?? 0;
      if (added <= 0 || cont.colocadas <= 0) return;
      this.tropasColocadasContinentes = { ...this.tropasColocadasContinentes, [territorioId]: added - 1 };
      cont.colocadas--;
      this.rebuildTropasMap();
      this.playSfx('assets/KuboTeg/sonidos/quitar-ficha.mp3');
      this.cdr.markForCheck();
    } else {
      const added = this.tropasColocadasBase[territorioId] ?? 0;
      if (added <= 0) return;
      this.tropasColocadasBase = { ...this.tropasColocadasBase, [territorioId]: added - 1 };
      this.rebuildTropasMap();
      this.playSfx('assets/KuboTeg/sonidos/quitar-ficha.mp3');
      this.cdr.markForCheck();
    }
  }

  async confirmarColocacion() {
    if (this.subFaseColocacion !== 'base' || this.misTropasParaColocar !== 0 || !this.partida) return;

    const allPlaced: Record<string, number> = {};
    for (const [tid, n] of Object.entries(this.tropasColocadasContinentes)) {
      if (n > 0) allPlaced[tid] = (allPlaced[tid] ?? 0) + n;
    }
    for (const [tid, n] of Object.entries(this.tropasColocadasBase)) {
      if (n > 0) allPlaced[tid] = (allPlaced[tid] ?? 0) + n;
    }
    for (const [tid, added] of Object.entries(allPlaced)) {
      const estado = this.territorios[tid];
      if (estado) await this.updateTerritorio(tid, { tropas: estado.tropas + added });
    }

    await this.service.setTropasPorColocar(this.partidaId, this.userId, 0);
    this.tropasColocadasContinentes = {};
    this.tropasColocadasBase = {};
    this.continentesColocacion = [];
    this.subFaseColocacion = 'base';
    this.rebuildTropasMap();

    const orden      = this.partida.orden_jugadores!;
    const n          = orden.length;
    const ronda      = this.partida.ronda_actual!;
    const startIdx   = (ronda - 1) % n;
    const currentIdx = this.partida.jugador_actual_index!;
    // Cuántos jugadores ya colocaron en esta fase (circular desde startIdx)
    const numPlaced  = ((currentIdx - startIdx + n) % n) + 1;
    const nextIdx    = (currentIdx + 1) % n;

    if (numPlaced >= n) {
      // Todos colocaron → ataque arranca desde quien inició la colocación
      await this.service.setFase(this.partidaId, 'ataque', startIdx);
    } else {
      await this.service.avanzarJugador(this.partidaId, nextIdx);
    }
  }

  // ── Ataque ────────────────────────────────────────────
  async handleAtaqueClick(territorioId: string) {
    if (this.conquistaPendiente) return;
    const estado = this.territorios[territorioId];
    if (!estado) return;

    if (!this.territorioAtacanteId) {
      if (estado.usuario_id === this.userId && estado.tropas > 1) {
        this.territorioAtacanteId = territorioId;
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
      await this.ejecutarAtaque(this.territorioAtacanteId, territorioId);
    } else if (estado.usuario_id === this.userId && estado.tropas > 1) {
      this.territorioAtacanteId = territorioId;
    }
  }

  async ejecutarAtaque(origenId: string, destinoId: string) {
    this._ultimoOrigenId  = origenId;
    this._ultimoDestinoId = destinoId;
    this.procesandoCombate = true;
    const defensorId = this.territorios[destinoId]?.usuario_id ?? '';
    const defensorJ  = this.jugadores.find(j => j.usuario_id === defensorId);
    try {
      const { data: rpcData, error } = await this.service.resolverCombate(this.partidaId, origenId, destinoId);
      if (error) {
        this.toast.show('Error en el servidor al resolver el combate.', 'error');
        return;
      }

      const res = rpcData as CombateRpc;
      if (res.error) {
        this.toast.show(res.error, 'error');
        return;
      }

      const conquista = res.conquista ?? false;
      const liderAtacante = this.jugadorLideres[this.userId];
      const liderDefensor = defensorId ? this.jugadorLideres[defensorId] : '';
      const popupData: UltimoCombate = {
        dadosAtaque:   res.dados_ataque   ?? [],
        dadosDefensa:  res.dados_defensa  ?? [],
        bajasAtacante: res.bajas_atacante ?? 0,
        bajasDefensor: res.bajas_defensor ?? 0,
        conquista,
        atacanteNombre:   this.jugadorActualNombre,
        defensorNombre:   defensorJ ? this.nombreJugador(defensorJ) : '?',
        origenNombre:     this.nombreTerritorio(origenId),
        destinoNombre:    this.nombreTerritorio(destinoId),
        colorAtacante:    this.jugadorColores[this.userId] ?? '#fff',
        colorDefensor:    this.jugadorColores[defensorId]  ?? '#fff',
        liderAtacanteImg: this.getLiderImgPath(this.lideres.find(l => l.nombre === liderAtacante) ?? {} as Lider) ?? '',
        liderDefensorImg: this.getLiderImgPath(this.lideres.find(l => l.nombre === liderDefensor) ?? {} as Lider) ?? '',
        ts:               Date.now(),
      };
      this._lastCombateTs = popupData.ts;
      this.mostrarPopupCombate(popupData);
      this.pushNotifCombate(popupData);
      this.channelEventos?.send({ type: 'broadcast', event: 'combate', payload: popupData });

      if (conquista) {
        this.conquistaTropasAMover = 1;
        this.conquistaPendiente = {
          origenId,
          destinoId,
          tropasOrigenFinal: res.tropas_origen_final ?? 1,
          defensorNombre: defensorJ ? this.nombreJugador(defensorJ) : '?',
          defensorColor:  this.jugadorColores[defensorId] ?? '#fff',
        };
        this.territorioAtacanteId = null;
        if (this.maxTropasMovibles === 1) {
          await this.confirmarMovimientoConquista();
        }
      }
    } finally {
      this.procesandoCombate = false;
      this.cdr.markForCheck();
    }
  }

  async confirmarMovimientoConquista() {
    if (!this.conquistaPendiente) return;
    const { origenId, destinoId, defensorNombre, defensorColor } = this.conquistaPendiente;
    const aMover = Math.max(1, Math.min(this.conquistaTropasAMover, this.maxTropasMovibles));

    const { data: rpcData, error } = await this.service.moverTropasConquista(
      this.partidaId, origenId, destinoId, aMover
    );
    if (error || (rpcData as RpcError)?.error) {
      this.toast.show((rpcData as RpcError)?.error ?? 'Error al mover tropas.', 'error');
      return;
    }

    const conquistaData: UltimaConquista = {
      territorioNombre: this.nombreTerritorio(destinoId),
      atacanteNombre:   this.jugadorActualNombre,
      defensorNombre,
      colorAtacante:    this.jugadorColores[this.userId] ?? '#fff',
      ts:               Date.now(),
    };
    this._lastConquistaTs = conquistaData.ts;
    this.mostrarNotifConquista(conquistaData);
    this.pushNotifConquista(conquistaData);
    this.channelEventos?.send({ type: 'broadcast', event: 'conquista', payload: conquistaData });

    this.conquistaPendiente = null;
    this.cdr.markForCheck();
  }

  async terminarAtaque() {
    if (!this.partida || this.conquistaPendiente || this.procesandoTurno) return;
    this.procesandoTurno = true;
    this.territorioAtacanteId = null;
    this.iniciarFaseReagrupacion();
    await this.service.setFase(this.partidaId, 'reagrupacion', this.partida.jugador_actual_index!);
    this.procesandoTurno = false;
    this.cdr.markForCheck();
  }

  // ── Inicio de sub-fase de colocación ─────────────────
  iniciarSubFaseColocacion() {
    this.tropasColocadasContinentes = {};
    this.tropasColocadasBase = {};
    this.continenteColocacionIdx = 0;

    // Ronda 1: solo tropas iniciales, sin bonus de continente
    if ((this.partida?.ronda_actual ?? 1) <= 1) {
      this.subFaseColocacion = 'base';
      this.continentesColocacion = [];
      this.cdr.markForCheck();
      return;
    }

    const CONT = KuboTegJuegoComponent.CONTINENT_TERRITORIES;
    const conquistados = KuboTegJuegoComponent.CONTINENT_BONUSES.filter(cb =>
      CONT[cb.id].every(tid => this.territorios[tid]?.usuario_id === this.userId)
    );

    if (conquistados.length === 0) {
      this.subFaseColocacion = 'base';
      this.continentesColocacion = [];
      this.cdr.markForCheck();
      return;
    }

    this.continentesColocacion = conquistados.map(cb => ({
      id:                   cb.id,
      nombre:               this.getNombreContinente(cb.id),
      bonus:                cb.bonus,
      colocadas:            0,
      territoriosPermitidos: [...CONT[cb.id]],
    }));
    this.subFaseColocacion = 'continentes';
    this.cdr.markForCheck();
  }

  // ── Reagrupación ──────────────────────────────────────
  iniciarFaseReagrupacion() {
    this.reagrupacionLimites = {};
    this.reagrupacionMovidos = {};
    for (const [id, estado] of Object.entries(this.territorios)) {
      if (estado.usuario_id === this.userId) {
        this.reagrupacionLimites[id] = Math.max(0, estado.tropas - 1);
        this.reagrupacionMovidos[id] = 0;
      }
    }
  }

  async handleReagrupacionClick(territorioId: string) {
    if (this.reagrupacionDestinoId) return;
    const estado = this.territorios[territorioId];
    if (!estado) return;

    const limiteDisponible = (id: string) =>
      (this.reagrupacionLimites[id] ?? 0) - (this.reagrupacionMovidos[id] ?? 0);

    if (!this.territorioOrigenId) {
      if (estado.usuario_id === this.userId && limiteDisponible(territorioId) > 0) {
        this.territorioOrigenId = territorioId;
        this.reagrupacionTropasAMover = 1;
      }
      return;
    }

    if (territorioId === this.territorioOrigenId) {
      this.territorioOrigenId = null;
      return;
    }

    const origenTerr  = TERRITORIES.find(t => t.id === this.territorioOrigenId);
    const esAdyacente = origenTerr?.neighbors.includes(territorioId) ?? false;
    const esPropio    = estado.usuario_id === this.userId;

    if (esAdyacente && esPropio) {
      this.reagrupacionDestinoId    = territorioId;
      this.reagrupacionTropasAMover = 1;
      this.cdr.markForCheck();
    } else if (esPropio && limiteDisponible(territorioId) > 0) {
      this.territorioOrigenId       = territorioId;
      this.reagrupacionTropasAMover = 1;
      this.cdr.markForCheck();
    }
  }

  async confirmarReagrupacion() {
    if (!this.territorioOrigenId || !this.reagrupacionDestinoId) return;
    const aMover = Math.max(1, Math.min(this.reagrupacionTropasAMover, this.maxTropasReagrupacion));
    await this.ejecutarReagrupacion(this.territorioOrigenId, this.reagrupacionDestinoId, aMover);
  }

  cancelarReagrupacion() {
    this.reagrupacionDestinoId    = null;
    this.reagrupacionTropasAMover = 1;
    this.cdr.markForCheck();
  }

  async ejecutarReagrupacion(origenId: string, destinoId: string, aMover: number) {
    const origen  = this.territorios[origenId];
    const destino = this.territorios[destinoId];
    if (!origen || !destino) return;

    await this.updateTerritorio(origenId,  { tropas: origen.tropas - aMover });
    await this.updateTerritorio(destinoId, { tropas: destino.tropas + aMover });

    this.reagrupacionMovidos[origenId] = (this.reagrupacionMovidos[origenId] ?? 0) + aMover;

    this.territorioOrigenId    = null;
    this.reagrupacionDestinoId = null;
    this.reagrupacionTropasAMover = 1;
    this.cdr.markForCheck();
  }

  async saltarReagrupacion() {
    if (this.procesandoTurno) return;
    this.territorioOrigenId    = null;
    this.reagrupacionDestinoId = null;
    this.reagrupacionLimites   = {};
    this.reagrupacionMovidos   = {};
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
      this.cdr.markForCheck();
    }
  }

  async iniciarNuevaRonda() {
    if (!this.partida) return;
    const orden    = this.partida.orden_jugadores!;
    const newRonda = this.partida.ronda_actual! + 1;
    const newStart = (newRonda - 1) % orden.length;

    for (const j of this.jugadores) {
      const misTerritorios = Object.values(this.territorios).filter(t => t.usuario_id === j.usuario_id);
      const divisor    = newRonda >= 2 ? 2 : 3;
      const tropasBase = Math.max(3, Math.floor(misTerritorios.length / divisor));
      const bonus      = this.calcularBonusContinente(j.usuario_id);
      await this.service.setTropasPorColocar(this.partidaId, j.usuario_id, tropasBase + bonus);
    }

    await this.service.iniciarFaseColocacion(this.partidaId, orden, newRonda, newStart);
  }

  private calcularBonusContinente(userId: string): number {
    let bonus = 0;
    const CONT = KuboTegJuegoComponent.CONTINENT_TERRITORIES;
    for (const cb of KuboTegJuegoComponent.CONTINENT_BONUSES) {
      const terrs = CONT[cb.id];
      if (terrs.every(tid => this.territorios[tid]?.usuario_id === userId)) {
        bonus += cb.bonus;
      }
    }
    return bonus;
  }

  async declararseGanador() {
    if (this.declarando) return;
    this.declarando = true;
    const { data: rpcData, error } = await this.service.declararGanador(this.partidaId);
    if (error || (rpcData as RpcError)?.error) {
      this.toast.show((rpcData as RpcError)?.error ?? 'No se pudo declarar ganador.', 'error');
    }
    this.declarando = false;
    this.cdr.markForCheck();
  }

  // ── Helpers ───────────────────────────────────────────
  nombreJugador(j: PartidaJugador | null): string {
    if (!j) return '—';
    const u = j.usuario;
    if (u) return [u.nombre, u.apellido].filter(Boolean).join(' ') || u.email;
    return j.usuario_id.slice(0, 8) + '...';
  }

  nombreTerritorio(id: string): string {
    return TERRITORIES.find(t => t.id === id)?.name ?? id;
  }

  getLiderImgByUserId(userId: string): string {
    const nombre = this.jugadorLideres[userId];
    if (!nombre) return '';
    const lider = this.lideres.find(l => l.nombre === nombre);
    return lider ? this.getLiderImgPath(lider) : '';
  }

  getLiderImgPath(l: Lider): string {
    const p = l.img_neutra ?? '';
    if (!p.startsWith('/assets/') && !p.startsWith('assets/')) return '';
    return encodeURI(p);
  }

  getLiderImgActiva(l: Lider): string {
    const usarAmigable = this.liderHovered === l.nombre || this.liderPreseleccionado === l.nombre;
    const p = usarAmigable ? (l.img_amigable ?? l.img_neutra ?? '') : (l.img_neutra ?? '');
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
    return this.coloresOcupados.has(hex);
  }

  private playSfx(path: string) {
    let sfx = this.sfxPool.get(path);
    if (!sfx) {
      sfx = new Audio(path);
      this.sfxPool.set(path, sfx);
    }
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }

  reproducirSeleccion() { this.playSfx('assets/KuboTeg/sonidos/seleccion.mp3'); }

  preseleccionarColor(hex: string) {
    this.colorPreseleccionado = hex;
    this.playSfx('assets/KuboTeg/sonidos/confirma-seleccion.mp3');
  }
  preseleccionarLider(id: string) {
    this.liderPreseleccionado = id;
    this.playSfx('assets/KuboTeg/sonidos/confirma-seleccion.mp3');
  }
  async avanzarALider() {
    if (!this.colorPreseleccionado || this.avanzandoALider) return;
    this.avanzandoALider = true;
    this.cdr.markForCheck();

    // Verifica en BD que el color no fue tomado simultáneamente
    const { data: frescos } = await this.service.getPartidaJugadores(this.partidaId);
    const otros = (frescos ?? []).filter(j => j.usuario_id !== this.userId);
    const colorTomado = otros.some(j => j.color === this.colorPreseleccionado);

    if (colorTomado) {
      this.jugadores = frescos ?? [];
      this.buildJugadorColores();
      this.buildJugadorLideres();
      this.colorPreseleccionado = null;
      this.avanzandoALider = false;
      this.toast.show('Ese color fue tomado. Elegí otro.', 'error');
      this.cdr.markForCheck();
      return;
    }

    // Reserva el color en BD para que otros jugadores lo vean ocupado de inmediato
    await this.service.reservarColor(this.partidaId, this.userId, this.colorPreseleccionado);
    this.avanzandoALider = false;
    this.pasoModal = 'lider';
    this.cdr.markForCheck();
  }

  async volverAColor() {
    // Libera la reserva de color en BD para que otros puedan elegirlo
    await this.service.reservarColor(this.partidaId, this.userId, null);
    this.pasoModal = 'color';
    this.liderPreseleccionado = null;
    this.cdr.markForCheck();
  }

  async confirmarSeleccion() {
    if (!this.colorPreseleccionado || !this.liderPreseleccionado) return;

    // Re-consulta la BD justo antes de confirmar para detectar selecciones simultáneas
    const { data: frescos } = await this.service.getPartidaJugadores(this.partidaId);
    const otros = (frescos ?? []).filter(j => j.usuario_id !== this.userId);

    const colorTomado = otros.some(j => j.color === this.colorPreseleccionado);
    const liderTomado = otros.some(j => j.lider === this.liderPreseleccionado);

    if (colorTomado) {
      this.jugadores = frescos ?? [];
      this.buildJugadorColores();
      this.buildJugadorLideres();
      this.colorPreseleccionado = null;
      this.liderPreseleccionado = null;
      this.pasoModal = 'color';
      this.toast.show('Ese color fue tomado por otro jugador. Elegí otro.', 'error');
      this.cdr.markForCheck();
      return;
    }

    if (liderTomado) {
      this.jugadores = frescos ?? [];
      this.buildJugadorColores();
      this.buildJugadorLideres();
      this.liderPreseleccionado = null;
      this.pasoModal = 'lider';
      this.toast.show('Ese líder fue elegido por otro jugador. Elegí otro.', 'error');
      this.cdr.markForCheck();
      return;
    }

    this.jugadorColores[this.userId] = this.colorPreseleccionado;
    this.jugadorLideres[this.userId] = this.liderPreseleccionado;
    localStorage.setItem(`mat-color-${this.partidaId}-${this.userId}`, this.colorPreseleccionado);
    localStorage.setItem(`mat-lider-${this.partidaId}-${this.userId}`, this.liderPreseleccionado);
    this.mostrarSelectorModal = false;
    await this.service.marcarEstaDentroConColor(this.partidaId, this.userId, this.colorPreseleccionado, this.liderPreseleccionado);
  }

  private rebuildOwnerMap() {
    const map: Record<string, string> = {};
    Object.values(this.territorios).forEach(t => { map[t.territorio_id] = t.usuario_id; });
    this._territoriosOwnerMap = map;
  }

  private rebuildTropasMap() {
    const map: Record<string, number> = {};
    Object.values(this.territorios).forEach(t => {
      const cont = this.tropasColocadasContinentes[t.territorio_id] ?? 0;
      const base = this.tropasColocadasBase[t.territorio_id] ?? 0;
      map[t.territorio_id] = t.tropas + cont + base;
    });
    this._tropasMap = map;
  }

  private rebuildJugadorNombres() {
    const map: Record<string, string> = {};
    for (const j of this.jugadores) {
      const u = j.usuario;
      map[j.usuario_id] = u
        ? ([u.nombre, u.apellido].filter(Boolean).join(' ') || u.email)
        : j.usuario_id.slice(0, 8);
    }
    this._jugadorNombres = map;
  }

  private buildJugadorColores() {
    const ocupados = new Set<string>();
    for (const j of this.jugadores) {
      if (j.color) {
        this.jugadorColores[j.usuario_id] = j.color;
        if (j.usuario_id !== this.userId) ocupados.add(j.color);
      }
    }
    if (!this.jugadorColores[this.userId]) {
      const local = localStorage.getItem(`mat-color-${this.partidaId}-${this.userId}`);
      if (local) this.jugadorColores[this.userId] = local;
    }
    this.coloresOcupados = ocupados;
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
      this.rebuildOwnerMap();
      this.rebuildTropasMap();
    }
  }

  volver() { this.router.navigate(['/kubojuegos']); }

  // ── Chat ──────────────────────────────────────────────
  get miNombre(): string {
    return this.jugadorNombres[this.userId] || 'Yo';
  }

  async onChatSend(texto: string) {
    if (!this.channelChat) return;
    const msg: ChatMensaje = {
      userId: this.userId,
      nombre: this.miNombre,
      texto,
      color: this.jugadorColores[this.userId] ?? '#ffffff',
      ts: Date.now(),
    };
    this.chatMensajes = [...this.chatMensajes, msg];
    await this.channelChat.send({ type: 'broadcast', event: 'chat', payload: msg });
  }

  private pushNotifCombate(data: UltimoCombate) {
    const bajas = `${data.bajasAtacante} bajas propias · ${data.bajasDefensor} enemigas`;
    const item: NotifItem = {
      tipo: 'combate',
      icono: '⚔️',
      linea1: `${data.atacanteNombre} atacó ${data.destinoNombre}`,
      linea2: data.conquista ? `¡Conquistado! ${bajas}` : bajas,
      color: data.colorAtacante,
      ts: data.ts,
    };
    this.notifItems = [item, ...this.notifItems].slice(0, 3);
  }

  private pushNotifConquista(data: UltimaConquista) {
    const item: NotifItem = {
      tipo: 'conquista',
      icono: '🏴',
      linea1: `${data.atacanteNombre} conquistó`,
      linea2: `${data.territorioNombre} (de ${data.defensorNombre})`,
      color: data.colorAtacante,
      ts: data.ts,
    };
    this.notifItems = [item, ...this.notifItems].slice(0, 3);
  }

  private verificarConquistaContinente(userId: string, territorioId: string) {
    const CONT = KuboTegJuegoComponent.CONTINENT_TERRITORIES;
    for (const cont of KuboTegJuegoComponent.CONTINENT_BONUSES) {
      const terrs = CONT[cont.id];
      if (!terrs.includes(territorioId)) continue;
      const otros = terrs.filter(tid => tid !== territorioId);
      if (otros.every(tid => this.territorios[tid]?.usuario_id === userId)) {
        const nombre  = this.getNombreContinente(cont.id);
        const jugador = this._jugadorNombres[userId] ?? '?';
        const color   = this.jugadorColores[userId] ?? '#fff';
        this.playSfx('assets/KuboTeg/sonidos/conquista-continente.mp3');
        this.pushNotifContinente(jugador, nombre, color);
      }
    }
  }

  get resumenTropas() {
    const misTerritorios = Object.values(this.territorios).filter(t => t.usuario_id === this.userId);
    const cantTerritorios = misTerritorios.length;
    const divisor = (this.partida?.ronda_actual ?? 1) >= 2 ? 2 : 3;
    const tropasBase = cantTerritorios > 0 ? Math.max(3, Math.floor(cantTerritorios / divisor)) : 0;

    const CONT = KuboTegJuegoComponent.CONTINENT_TERRITORIES;
    const continentes = KuboTegJuegoComponent.CONTINENT_BONUSES.map(cb => {
      const terrsTotal = CONT[cb.id];
      const misTerr = terrsTotal.filter(tid => this.territorios[tid]?.usuario_id === this.userId).length;
      return {
        nombre:     this.getNombreContinente(cb.id),
        bonus:      cb.bonus,
        controlado: misTerr === terrsTotal.length,
        misTerr,
        totalTerr:  terrsTotal.length,
      };
    });

    const bonusContinentes = continentes
      .filter(c => c.controlado)
      .reduce((sum, c) => sum + c.bonus, 0);

    return { cantTerritorios, tropasBase, continentes, bonusContinentes, total: tropasBase + bonusContinentes };
  }

  getNombreContinente(id: string): string {
    const nombres: Record<string, string> = {
      north_america: 'Norteamérica',
      south_america: 'Sudamérica',
      europe:        'Europa',
      africa:        'África',
      asia:          'Asia',
      oceania:       'Oceanía',
    };
    return nombres[id] ?? id;
  }

  private pushNotifContinente(jugador: string, continente: string, color: string) {
    const item: NotifItem = {
      tipo: 'conquista',
      icono: '★',
      linea1: `${jugador} domina`,
      linea2: continente,
      color,
      ts: Date.now(),
    };
    this.notifItems = [item, ...this.notifItems].slice(0, 3);
    this.cdr.markForCheck();
  }

  private mostrarNotifConquista(data: UltimaConquista) {
    if (this.notifConquistaTimer) clearTimeout(this.notifConquistaTimer);
    this.notifConquista = data;
    this.playSfx('assets/KuboTeg/sonidos/conquista-territorio.mp3');
    this.cdr.markForCheck();
    this.notifConquistaTimer = setTimeout(() => {
      this.notifConquista = null;
      this.cdr.markForCheck();
    }, 5000);
  }

  private mostrarPopupCombate(data: UltimoCombate) {
    this.popupCombate = data;
    this.reproducirSonidoCombate();
    this.cdr.markForCheck();
  }

  private reproducirSonidoCombate() {
    const n = Math.floor(Math.random() * 7) + 1;
    this.playSfx(`assets/KuboTeg/sonidos/combate${n}.mp3`);
  }

}
