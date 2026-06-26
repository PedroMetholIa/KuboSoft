import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService, Partida, PartidaJugador, TerritorioEstado, Lider, UltimoCombate, UltimaConquista, BOT_USER_ID } from '../../core/services/supabase.service';
import { ToastService } from '../../core/services/toast.service';
import { MapComponent } from './map/map.component';
import { NotificacionesComponent, NotifItem } from './notificaciones/notificaciones.component';
import { CombatePanelComponent } from './combate-panel/combate-panel.component';
import { KubotegChatComponent, ChatMensaje } from './chat/chat.component';
import { MenuJugadorComponent } from './menu-jugador/menu-jugador.component';
import { TERRITORIES } from './map/territories.data';
import { estaVivo as estaVivoUtil, primerVivoDesde as primerVivoDesdeUtil, siguienteVivoIdx as siguienteVivoIdxUtil, randomShuffle as randomShuffleUtil, seededShuffle as seededShuffleUtil } from './game.utils';
import { ObjetivoSecreto, ConquistaPendiente, RpcError, Pacto, PropuestaPacto, GrupoChat, InvitacionGrupo, CombateRpc, Dedicatoria, ModoAudio } from './game.types';
import { AudioService } from './audio.service';
import { pactosActivos, pactosRompibles, countPactosJugador, tieneNoAgresion as tieneNoAgresionUtil, hayHostilidadEntre as hayHostilidadEntreUtil, disolverPactosTerritorio as disolverPactosUtil, expirarPactos as expirarPactosUtil, esAdyacenteASeleccion, esSeleccionContigua, calcPactoDisponiblesPropio as calcPactoPropio, calcPactoDisponiblesAjenos as calcPactoAjenos, territoriosEnRango } from './pactos.utils';
import { CONTINENT_MAJORITY, CONTINENT_BONUSES, CONTINENT_TERRITORIES, CONTINENT_NAMES, CONTINENT_TABLA } from './continentes.data';
import { generarObjetivosPool, asignarObjetivos as asignarObjetivosUtil, verificarVictoriaObjetivo as verificarVictoriaUtil } from './objetivos.utils';
import { calcResumenTropas, countMayorias, calcBonusContinente } from './turno.utils';

@Component({
  selector: 'app-kuboteg-juego',
  standalone: true,
  imports: [FormsModule, KeyValuePipe, MapComponent, NotificacionesComponent, CombatePanelComponent, KubotegChatComponent, MenuJugadorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kuboteg-juego.component.html',
  styleUrl: './kuboteg-juego.component.scss'
})
export class KuboTegJuegoComponent implements OnInit, OnDestroy {

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
  readonly BOT_USER_ID = BOT_USER_ID;

  // ── Color / Lider modal ────────────────────────────────
  readonly coloresDisponibles = [
    { hex: 'rgb(159, 3, 3)',     nombre: 'Rojo' },
    { hex: 'rgb(60, 44, 186)',   nombre: 'Azul' },
    { hex: 'rgb(255, 182, 77)',  nombre: 'Amarillo' },
    { hex: 'rgb(32, 161, 80)',   nombre: 'Verde' },
    { hex: 'rgb(252, 101, 39)',  nombre: 'Naranja' },
    { hex: 'rgb(141, 33, 163)',  nombre: 'Violeta' },
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
  lideresOcupados = new Set<string>();
  failedLiderImgs = new Set<string>();

  private _territoriosOwnerMap: Record<string, string> = {};
  private _tropasMap: Record<string, number> = {};
  private _jugadorNombres: Record<string, string> = {};

  // ── Host config ───────────────────────────────────────
  iniciandoJuego = false;
  distribuyendoTerritorios = false;
  private ordenGenerado: string[] = [];

  // ── Phase state ───────────────────────────────────────
  tropasColocadasContinentes: Record<string, number> = {};
  tropasColocadasBase: Record<string, number> = {};
  subFaseColocacion: 'continentes' | 'base' = 'base';
  private confirmandoColocacion = false;
  private colocacionConfirmadaEstaRonda = false;
  private _colocacionSnapshot: Record<string, number> = {};
  private _colocacionTropasBase = 0;
  private deshaciendo = false;
  mostrarAprobacionCobro = false;
  aprobacionCobroEnviada = false;
  private _aprobacionesCobro = new Set<string>();
  mostrarPopupMiTurno = false;
  private _popupMiTurnoTimer: ReturnType<typeof setTimeout> | null = null;
  private _startIdxParaAtaque = 0;
  continentesColocacion: Array<{
    id: string; nombre: string; bonus: number; colocadas: number; territoriosPermitidos: string[]; tipo: 'mayoria' | 'totalidad';
  }> = [];
  continenteColocacionIdx = 0;
  territorioAtacanteId: string | null = null;
  procesandoCombate = false;
  procesandoConquista = false;
  popupCombate: UltimoCombate | null = null;
  private _lastCombateTs = 0;
  private lastAttack: { origenId: string; destinoId: string } | null = null;
  private _combateHighlightIds: string[] = [];
  private _combateHighlightTimer: ReturnType<typeof setTimeout> | null = null;
  private _popupCombateTimer: ReturnType<typeof setTimeout> | null = null;
  private _colocacionHighlightId: string | null = null;
  private _colocacionHighlightTimer: ReturnType<typeof setTimeout> | null = null;
  private _quitarHighlightId: string | null = null;
  private _quitarHighlightTimer: ReturnType<typeof setTimeout> | null = null;
  private _movilizacionHighlightId: string | null = null;
  private _movilizacionHighlightTimer: ReturnType<typeof setTimeout> | null = null;
  private _cartaAciertaId: string | null = null;
  private _cartaAciertaTimer: ReturnType<typeof setTimeout> | null = null;
  private _tropasPreviewMap: Record<string, number> = {};
  notifConquista: UltimaConquista | null = null;
  private notifConquistaTimer: ReturnType<typeof setTimeout> | null = null;
  private _lastConquistaTs = 0;
  territorioOrigenId: string | null = null;
  conquistaPendiente: ConquistaPendiente | null = null;
  conquistaTropasAMover = 1;
  miObjetivo: ObjetivoSecreto | null = null;
  mostrarObjetivoPopup = false;
  mostrarPopupEliminado = false;
  eliminadoPorNombre = '';
  mostrarModalRendicion = false;
  mostrarPopupRendicion = false;
  // ── Bomba Atómica ─────────────────────────────────
  // null = obtenida pero no colocada, string = colocada en ese territorio
  bombas: (string | null)[] = [];
  bombaColocandoIdx = 0;
  modoColocandoBomba = false;
  bombaUsandoIdx = 0;
  modoUsandoBomba = false;
  combateEnCurso = false;
  bombasMovidasEnRonda: (number | null)[] = [];

  get tieneBomba(): boolean  { return this.bombas.length > 0; }
  bombaEnEspera(i: number): boolean {
    const rondaMovida = this.bombasMovidasEnRonda[i] ?? null;
    return rondaMovida !== null && rondaMovida >= (this.partida?.ronda_actual ?? 0);
  }
  bombaTooltip(i: number): string {
    if (this.bombaEnEspera(i)) return 'En espera: moviste esta bomba esta ronda. Disponible a partir de la próxima ronda.';
    if (this.fase !== 'ataque') return 'Solo disponible en la fase de ataque.';
    return '';
  }
  get jugandoConBomba(): boolean { return this.partida?.con_bomba_atomica !== false; }
  get jugandoConMayorias(): boolean { return this.partida?.con_mayorias !== false; }
  get cartasParaBomba(): number { return this.partida?.cartas_para_bomba ?? 9; }
  territoriosDestruidos = new Set<string>();
  territorioMisilActivoId: string | null = null;
  gameNotif: { msg: string; tipo: 'ok' | 'info' | 'warn' | 'error' } | null = null;
  private gameNotifTimer: ReturnType<typeof setTimeout> | null = null;
  modalPostura: { jugadorId: string; postura: 'amigable' | 'neutral' | 'hostil' } | null = null;
  posturas: Record<string, 'amigable' | 'neutral' | 'hostil'> = {};
  reagrupacionDestinoId: string | null = null;
  reagrupacionTropasAMover = 1;
  reagrupacionLimites: Record<string, number> = {};
  reagrupacionMovidos: Record<string, number> = {};
  panelActivo = 'jugadores';
  verPactosEnMapa = false;
  mostrarModalDedicatoria = false;
  dedicatoriaTexto = '';
  dedicatoriaGuardada = false;
  guardandoDedicatoria = false;
  mostrarHistorial = false;
  historialDedicatorias: Dedicatoria[] = [];
  cargandoHistorial = false;
  get modoAudio(): ModoAudio { return this.audioSvc.modoAudio; }
  get musicaMuteada(): boolean { return this.audioSvc.musicaMuteada; }
  tiempoPartida = '00:00:00';
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // ── Sistema de pactos ─────────────────────────────────
  pactos: Pacto[] = [];
  propuestaEntrante: PropuestaPacto | null = null;
  propuestaSaliente: PropuestaPacto | null = null;
  modoPacto: null | 'propio' | 'ajeno' = null;
  pactoTerrsPropios: string[] = [];
  pactoTerrsAjenos: string[] = [];
  pactoReceptorId: string | null = null;
  modalRomperPacto = false;
  modalConfirmHostil: { jugadorId: string; jugadorNombre: string; pactosAfectados: number; gruposAfectados: number } | null = null;
  modalConfirmMoverBomba: number | null = null;

  // ── Sistema de cartas ─────────────────────────────────
  misCartas: string[] = [];
  cartasRobadasTotal = 0;
  conquistoEnEsteTurno = false;
  private ultimoTerritorioConquistadoId: string | null = null;
  canjeandoCartas = false;
  cartaPopup: { nombre: string; bonusNombre: string | null; tropasBonus: number; svgPath: string; baseFill: string; viewBox: string } | null = null;
  private cartaPopupTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Chat ──────────────────────────────────────────────
  chatMensajes: ChatMensaje[] = [];
  grupos: GrupoChat[] = [];
  chatActivoId: 'global' | string = 'global';
  chatNoLeidos: Record<string, number> = {};
  modalGrupos: { nombre: string; bandera: string; jugadoresIds: string[] } | null = null;
  invitacionGrupoEntrante: InvitacionGrupo | null = null;

  openDropdownId: string | null = null;

  @HostListener('document:click')
  closeDropdowns() {
    if (this.openDropdownId !== null) {
      this.openDropdownId = null;
      this.cdr.markForCheck();
    }
  }

  readonly BANDERAS = Array.from({ length: 12 }, (_, i) => `bandera${i + 1}.webp`);

  get banderasEnUso(): Set<string> {
    return new Set(this.grupos.map(g => g.bandera));
  }

  get grupoConMismosIntegrantes(): boolean {
    if (!this.modalGrupos) return false;
    const propuestos = [this.userId, ...this.modalGrupos.jugadoresIds].sort().join(',');
    return this.grupos.some(g => [...g.jugadoresIds].sort().join(',') === propuestos);
  }

  get grupoConTodosLosJugadores(): boolean {
    if (!this.modalGrupos) return false;
    return this.modalGrupos.jugadoresIds.length + 1 >= this.jugadores.length;
  }

  get errorCrearGrupo(): string | null {
    if (!this.modalGrupos) return null;
    if (this.modalGrupos.jugadoresIds.length < 2) return 'Seleccioná al menos 2 jugadores (mínimo 3 en total)';
    if (this.grupoConTodosLosJugadores) return 'No se puede crear un grupo con todos los jugadores de la partida';
    if (this.grupoConMismosIntegrantes) return 'Ya existe un grupo con exactamente estos integrantes';
    return null;
  }

  get chatMensajesFiltrados(): ChatMensaje[] {
    if (this.chatActivoId === 'global') {
      return this.chatMensajes.filter(m => !m.grupoId);
    }
    return this.chatMensajes.filter(m => m.grupoId === this.chatActivoId);
  }

  get gruposMios(): GrupoChat[] {
    return this.grupos.filter(g => g.jugadoresIds.includes(this.userId) && g.bandera !== '💬');
  }

  get otrosJugadoresChat(): PartidaJugador[] {
    return this.jugadores.filter(j => j.usuario_id !== this.userId && j.usuario_id !== BOT_USER_ID);
  }

  dmId(jugadorId: string): string {
    const [a, b] = [this.userId, jugadorId].sort();
    return `dm:${a}:${b}`;
  }

  grupoMiembrosTooltip(g: GrupoChat): string {
    return g.jugadoresIds.map(id => this._jugadorNombres[id] ?? id).join('\n');
  }

  // ── Notificaciones de eventos ─────────────────────────
  notifItems: NotifItem[] = [];
  notifNoVistas = 0;

  @ViewChild(MapComponent) private mapRef!: MapComponent;

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
    private cdr: ChangeDetectorRef,
    readonly audioSvc: AudioService
  ) {}

  ngOnInit() {
    this.audioSvc.init();
    this.partidaId = this.route.snapshot.paramMap.get('id') ?? '';
    const user = this.service.getCurrentUser();
    if (user) {
      this.userId = user.id;
      this.loadGameState();
      this.subscribeRealtime();
    }
  }

  ngOnDestroy() {
    this.audioSvc.destroy();
    this.removeAllChannels();
    if (this.reconnectTimer)       clearTimeout(this.reconnectTimer);
    if (this.timerInterval)        clearInterval(this.timerInterval);
    if (this.notifConquistaTimer)        clearTimeout(this.notifConquistaTimer);
    if (this._combateHighlightTimer)     clearTimeout(this._combateHighlightTimer);
    if (this._popupCombateTimer)         clearTimeout(this._popupCombateTimer);
    if (this._colocacionHighlightTimer)   clearTimeout(this._colocacionHighlightTimer);
    if (this._quitarHighlightTimer)        clearTimeout(this._quitarHighlightTimer);
    if (this._movilizacionHighlightTimer)  clearTimeout(this._movilizacionHighlightTimer);
    if (this._popupMiTurnoTimer)           clearTimeout(this._popupMiTurnoTimer);
    if (this._cartaAciertaTimer)           clearTimeout(this._cartaAciertaTimer);
    if (this.cartaPopupTimer)            clearTimeout(this.cartaPopupTimer);
    if (this.gameNotifTimer)             clearTimeout(this.gameNotifTimer);
  }

  private removeAllChannels() {
    for (const ch of [this.channelPartida, this.channelPJ, this.channelTerritorio, this.channelChat, this.channelEventos]) {
      if (ch) this.service.client.removeChannel(ch);
    }
    this.channelPartida = this.channelPJ = this.channelTerritorio = this.channelChat = this.channelEventos = null;
  }

  get enPausa(): boolean { return this.partida?.estado === 'En pausa'; }
  get esPausador(): boolean { return this.partida?.pausado_por === this.userId; }
  get jugadorPausadorNombre(): string {
    const id = this.partida?.pausado_por;
    return id ? (this._jugadorNombres[id] ?? '') : '';
  }

  async togglePausa() {
    if (!this.partida) return;
    if (this.enPausa) {
      if (!this.esPausador) return;
      await this.service.reanudarPartida(this.partidaId);
    } else {
      await this.service.pausarPartida(this.partidaId, this.userId);
    }
  }

  private iniciarTimer() {
    if (this.timerInterval) return;
      if (!this.partida?.created_at) return;
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
    if (panel === 'internacionales') {
      this.verPactosEnMapa = !this.verPactosEnMapa;
    } else {
      this.verPactosEnMapa = false;
    }
    this.panelActivo = panel;
    if (panel === 'noticias') this.notifNoVistas = 0;
    if (panel === 'chat') delete this.chatNoLeidos[this.chatActivoId];
    this.cdr.markForCheck();
  }

  selectChat(id: string) {
    this.chatActivoId = id;
    delete this.chatNoLeidos[id];
    this.cdr.markForCheck();
  }

  toggleMusica() {
    this.audioSvc.toggleMusica();
    if (!this.audioSvc.musicaMuteada) this.cambiarMusicaLider();
    this.cdr.markForCheck();
  }

  setModoAudio(modo: ModoAudio) {
    this.audioSvc.setModoAudio(modo);
    if (!this.audioSvc.musicaMuteada) this.cambiarMusicaLider();
    this.cdr.markForCheck();
  }

  private cambiarMusicaLider() {
    const liderNombre = this.jugadorLideres[this.liderDisplayId];
    const lider = this.lideres.find(l => l.nombre === liderNombre);
    const rawSrc = this.audioSvc.modoAudio === 'musica_uniforme'
      ? 'assets/KuboTeg/sonidos/musica-fondo.mp3'
      : (lider?.sonido ?? 'assets/KuboTeg/sonidos/musica-fondo.mp3');
    const volumen = (lider?.volumen ?? 1.0) * this.audioSvc.BASE_VOLUME;
    this.audioSvc.playBgMusic(rawSrc, volumen);
  }

  // ── Computed ──────────────────────────────────────────
  get fase() { return this.partida?.fase_actual ?? null; }

  get jugadorActualId(): string {
    const orden = this.partida?.orden_jugadores ?? [];
    const idx = this.partida?.jugador_actual_index ?? 0;
    return orden[idx] ?? '';
  }

  get esMiTurno(): boolean {
    if (this.colocacionSimultanea && this.fase === 'colocacion') {
      return this.estaVivo(this.userId);
    }
    return !!this.jugadorActualId && this.jugadorActualId === this.userId;
  }
  get esHost(): boolean { return this.partida?.host_id === this.userId; }

  get colocacionSimultanea(): boolean { return this.partida?.colocacion_simultanea === true; }
  private get enMiColocacionSimultanea(): boolean {
    return this.colocacionSimultanea && this.fase === 'colocacion' && this.estaVivo(this.userId);
  }

  get misColocacionConfirmada(): boolean {
    return this.colocacionSimultanea && this.fase === 'colocacion' && this.colocacionConfirmadaEstaRonda;
  }

  get jugadoresPendientesColocacion(): typeof this.jugadores {
    return this.jugadores.filter(j => this.estaVivo(j.usuario_id) && (j.tropas_por_colocar ?? 0) > 0);
  }
  get esTurnoBot(): boolean { return this.jugadorActualId === BOT_USER_ID; }

  get turnOrderDisplay(): { uid: string; pos: number; nombre: string; color: string; isActual: boolean; isAlive: boolean; isMe: boolean; liderNombre: string; liderImg: string }[] {
    if (!this.partida?.orden_jugadores) return [];
    const orden = this.partida.orden_jugadores;
    const n = orden.length;

    // Durante la fase de aprobación del cobro, rotar el array para que el primer
    // atacante de la ronda quede en pos=1 (slot más a la derecha, igual que durante el ataque).
    let displayOrden: string[];
    let efectivoActualUid: string;
    if (this.colocacionSimultanea && this.fase === 'colocacion' && this.partida.ronda_actual) {
      const attackStartIdx = this.primerVivoDesde((this.partida.ronda_actual - 1) % n, orden);
      efectivoActualUid = orden[attackStartIdx];
      displayOrden = [...orden.slice(attackStartIdx), ...orden.slice(0, attackStartIdx)];
    } else {
      efectivoActualUid = this.jugadorActualId;
      displayOrden = orden;
    }

    return [...displayOrden].reverse().map((uid, idx, arr) => {
      const j = this.jugadores.find(jj => jj.usuario_id === uid);
      const liderNombre = this.jugadorLideres[uid] ?? '';
      const lider = this.lideres.find(l => l.nombre === liderNombre);
      let liderImg = '';
      if (lider) {
        if (uid === this.userId) {
          liderImg = this.getLiderImgPath(lider);
        } else {
          const postura = j?.posturas?.[this.userId] ?? 'neutral';
          if (postura === 'hostil')        liderImg = this.validarImgPath(lider.img_hostil   ?? lider.img_neutra ?? '');
          else if (postura === 'amigable') liderImg = this.validarImgPath(lider.img_amigable ?? lider.img_neutra ?? '');
          else                             liderImg = this.getLiderImgPath(lider);
        }
      }
      return {
        uid,
        pos: arr.length - idx,
        nombre: j ? this.nombreJugador(j) : uid.slice(0, 6) + '…',
        color: this.jugadorColores[uid] || '#94a3b8',
        isActual: uid === efectivoActualUid,
        isAlive: this.estaVivo(uid),
        isMe: uid === this.userId,
        liderNombre,
        liderImg,
      };
    });
  }

  get todosAdentro(): boolean {
    return this.jugadores.length > 0 &&
      this.jugadores.every(j => j.usuario_id === BOT_USER_ID || j.esta_dentro);
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

  get meRendi(): boolean {
    return this.jugadores.find(j => j.usuario_id === this.userId)?.rendido === true;
  }

  get puedeVolverContinente(): boolean {
    if (!this.esMiTurno || this.fase !== 'colocacion') return false;
    if (this.subFaseColocacion === 'continentes') return this.continenteColocacionIdx > 0;
    if (this.subFaseColocacion === 'base') return this.continentesColocacion.length > 0;
    return false;
  }

  deshacerContinente(): void {
    let targetIdx: number;
    if (this.subFaseColocacion === 'base') {
      this.subFaseColocacion = 'continentes';
      targetIdx = this.continentesColocacion.length - 1;
      this.continenteColocacionIdx = targetIdx;
    } else {
      this.continenteColocacionIdx--;
      targetIdx = this.continenteColocacionIdx;
    }
    const cont = this.continentesColocacion[targetIdx];
    if (!cont) return;

    const afectados: string[] = [];
    for (const tid of cont.territoriosPermitidos) {
      if ((this.tropasColocadasContinentes[tid] ?? 0) > 0) {
        afectados.push(tid);
        this.tropasColocadasContinentes = { ...this.tropasColocadasContinentes, [tid]: 0 };
      }
    }
    cont.colocadas = 0;
    this.rebuildTropasMap();
    this.playSfx('assets/KuboTeg/sonidos/quitar-ficha.mp3');
    for (const tid of afectados) {
      this.channelEventos?.send({
        type: 'broadcast', event: 'colocacion_tropa',
        payload: { territorioId: tid, jugadorId: this.userId, accion: 'quitar', tropasTotales: this._tropasMap[tid] ?? 0 },
      });
    }
    this.cdr.markForCheck();
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

  get territoriosCombate(): string[] {
    return this._combateHighlightIds;
  }

  get territorioColocandose(): string | null {
    return this._colocacionHighlightId;
  }

  get territorioQuitandose(): string | null {
    return this._quitarHighlightId;
  }

  get territorioMovilizandose(): string | null {
    return this._movilizacionHighlightId;
  }

  get pactoTerrsActivosMap(): string[] {
    const base = [...this.pactoTerrsPropios, ...this.pactoTerrsAjenos];
    if (this.propuestaEntrante) {
      const t1 = this.propuestaEntrante.territoriosId1?.length
        ? this.propuestaEntrante.territoriosId1
        : (this.propuestaEntrante.territorioId1 ? [this.propuestaEntrante.territorioId1] : []);
      const t2 = this.propuestaEntrante.territoriosId2?.length
        ? this.propuestaEntrante.territoriosId2
        : (this.propuestaEntrante.territorioId2 ? [this.propuestaEntrante.territorioId2] : []);
      base.push(...t1, ...t2);
    }
    return base;
  }

  get territoriosDestacados(): string[] {
    if (this.modoUsandoBomba && (this.bombas[this.bombaUsandoIdx] ?? null)) return this.bombaAlcanceEnemigos;
    if (this.modoColocandoBomba) {
      return Object.entries(this.territorios)
        .filter(([, e]) => e.usuario_id === this.userId)
        .map(([id]) => id);
    }
    if (this.modoPacto === 'propio') return this.calcPactoDisponiblesPropio();
    if (this.modoPacto === 'ajeno')  return this.calcPactoDisponiblesAjenos();
    if (this.fase === 'colocacion' && this.esMiTurno && this.subFaseColocacion === 'continentes') {
      return this.continenteActualColocacion?.territoriosPermitidos ?? [];
    }
    if (this.fase === 'ataque' && this.esMiTurno && this.territorioAtacanteId) {
      const origenId = this.territorioAtacanteId;
      const terr = TERRITORIES.find(t => t.id === origenId);
      return (terr?.neighbors ?? []).filter(nid => {
        const e = this.territorios[nid];
        return e && e.usuario_id !== this.userId && this.puedoAtacar(origenId, nid);
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

  get territoriosBloqueadosMsgs(): Record<string, string> {
    if (this.fase !== 'ataque' || !this.esMiTurno || !this.territorioAtacanteId) return {};
    const origenId = this.territorioAtacanteId;
    const terr = TERRITORIES.find(t => t.id === origenId);
    const result: Record<string, string> = {};
    for (const nid of (terr?.neighbors ?? [])) {
      const e = this.territorios[nid];
      if (!e || e.usuario_id === this.userId) continue;
      if (this.tieneNoAgresion(origenId, nid)) {
        result[nid] = 'No podés atacar: pacto de no agresión';
      }
    }
    return result;
  }

  get jugadorActualNombre(): string {
    const j = this.jugadores.find(j => j.usuario_id === this.jugadorActualId);
    return j ? this.nombreJugador(j) : '...';
  }

  get posturaJugadorActual(): 'amigable' | 'neutral' | 'hostil' | null {
    if (this.jugadorActualId === this.userId) return null;
    const j = this.jugadores.find(j => j.usuario_id === this.jugadorActualId);
    return j?.posturas?.[this.userId] ?? null;
  }

  // En cobro simultáneo cada jugador ve/escucha su propio líder; en el resto ve al del turno.
  get liderDisplayId(): string {
    return this.enMiColocacionSimultanea ? this.userId : this.jugadorActualId;
  }

  get liderDisplayNombre(): string {
    if (this.enMiColocacionSimultanea) {
      const miJ = this.jugadores.find(j => j.usuario_id === this.userId);
      return miJ ? this.nombreJugador(miJ) : '';
    }
    return this.jugadorActualNombre;
  }

  get liderActualImgPath(): string {
    const displayId = this.liderDisplayId;
    const liderNombre = this.jugadorLideres[displayId];
    if (!liderNombre) return '';
    const lider = this.lideres.find(l => l.nombre === liderNombre);
    if (!lider) return '';
    if (displayId === this.userId) {
      return this.getLiderImgPath(lider);
    }
    const jugadorDisplay = this.jugadores.find(j => j.usuario_id === displayId);
    const posturaHaciaMe = jugadorDisplay?.posturas?.[this.userId] ?? 'neutral';
    if (posturaHaciaMe === 'hostil') {
      return this.validarImgPath(lider.img_hostil ?? lider.img_neutra ?? '');
    }
    if (posturaHaciaMe === 'amigable') {
      return this.validarImgPath(lider.img_amigable ?? lider.img_neutra ?? '');
    }
    return this.getLiderImgPath(lider);
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

  get territoriosDistribuidos(): boolean {
    return Object.keys(this.territorios).length > 0;
  }

  get puedeReataque(): boolean {
    if (!this.esMiTurno || this.fase !== 'ataque') return false;
    if (this.conquistaPendiente || this.procesandoCombate) return false;
    if (!this.popupCombate || this.popupCombate.conquista) return false;
    if (!this.lastAttack) return false;
    const origen  = this.territorios[this.lastAttack.origenId];
    const destino = this.territorios[this.lastAttack.destinoId];
    return !!origen && origen.tropas > 1 && !!destino && destino.usuario_id !== this.userId;
  }

  onContinuarAtacando() {
    if (!this.lastAttack) return;
    this.ejecutarAtaque(this.lastAttack.origenId, this.lastAttack.destinoId);
  }

  get ganador(): PartidaJugador | null {
    if (!this.partida?.ganador_id) return null;
    return this.jugadores.find(j => j.usuario_id === this.partida!.ganador_id) ?? null;
  }

  get esGanador(): boolean {
    return !!this.partida?.ganador_id && this.partida.ganador_id === this.userId;
  }

  // ── Load ──────────────────────────────────────────────
  async loadGameState() {
    this.loading = true;
    this.loadError = false;

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 12000)
    );

    try {
      const [{ data: partida }, { data: jugadores }, { data: lideres }, { data: territorios }, { data: gruposDb }] =
        await Promise.race([
          Promise.all([
            this.service.getPartidaById(this.partidaId),
            this.service.getPartidaJugadores(this.partidaId),
            this.service.getLideres(),
            this.service.getTerritoriosEstado(this.partidaId),
            this.service.getGruposChat(this.partidaId),
          ]),
          timeout,
        ]);

      this.partida   = partida;
      this.jugadores = jugadores ?? [];
      this.lideres   = lideres ?? [];
      if (Array.isArray(partida?.pactos)) this.pactos = partida.pactos as Pacto[];
      if (gruposDb) {
        this.grupos = gruposDb.map((g: any) => ({
          id: g.id,
          nombre: g.nombre,
          bandera: g.bandera,
          creadoPor: g.creado_por,
          jugadoresIds: (g.grupo_chat_miembro as { usuario_id: string }[]).map(m => m.usuario_id),
        }));
      }
      const miJ = this.jugadores.find(j => j.usuario_id === this.userId);
      if (miJ?.objetivo) this.miObjetivo = miJ.objetivo as ObjetivoSecreto;
      if (miJ?.cartas)   this.misCartas  = miJ.cartas;
      const storedTotal = localStorage.getItem(`teg_cartas_total_${this.partidaId}_${this.userId}`);
      if (storedTotal) this.cartasRobadasTotal = parseInt(storedTotal, 10) || 0;
      try {
        const bombaJson = localStorage.getItem(`teg_bomba_${this.partidaId}_${this.userId}`);
        if (bombaJson) {
          const b = JSON.parse(bombaJson);
          if (Array.isArray(b.bombas)) {
            this.bombas = b.bombas;
          } else if (b.tiene) {
            this.bombas = [b.colocadaEn ?? null]; // compatibilidad formato anterior
          }
          if (Array.isArray(b.movidasEnRonda)) {
            this.bombasMovidasEnRonda = b.movidasEnRonda;
          }
        }
      } catch { /* ignore */ }
      try {
        const destruidosJson = localStorage.getItem(`teg_destruidos_${this.partidaId}`);
        if (destruidosJson) {
          const arr: string[] = JSON.parse(destruidosJson);
          this.territoriosDestruidos = new Set(arr);
        }
      } catch { /* ignore */ }
      // Fallback desde DB si localStorage está vacío
      const miJDb = jugadores?.find((j: PartidaJugador) => j.usuario_id === this.userId);
      if (this.bombas.length === 0 && (miJDb?.bomba_territorio || miJDb?.bomba_territorio_2)) {
        const dbPlaced: (string | null)[] = [];
        if (miJDb.bomba_territorio)   dbPlaced.push(miJDb.bomba_territorio);
        if (miJDb.bomba_territorio_2) dbPlaced.push(miJDb.bomba_territorio_2);
        this.bombas = dbPlaced;
      }
      // Garantizar que jugadores refleja el estado local de bombas (fuente de verdad: localStorage)
      const [initT1, initT2] = this.bombasT1T2();
      this.syncBombasJugador(this.userId, initT1, initT2);

      const terrArray = territorios ?? [];
      this.territorios = {};
      terrArray.forEach(t => { this.territorios[t.territorio_id] = t; });

      this.rebuildJugadores();
      this.rebuildMaps();
      this.loading = false;
      if (this.partida?.estado === 'En juego') { this.cambiarMusicaLider(); this.iniciarTimer(); }
      if (this.partida?.fase_actual === 'colocacion' && this.esMiTurno) {
        const myJLoad   = this.jugadores.find(j => j.usuario_id === this.userId);
        const tropasLoad = myJLoad?.tropas_por_colocar ?? 0;
        if (!this.colocacionSimultanea || tropasLoad > 0) {
          this.iniciarSubFaseColocacion();
        } else {
          // Simultáneo y ya confirmé (tropas=0): restaurar estado de espera/aprobación
          // sin limpiar los mapas de colocación (que se necesitan para aprobarCobro).
          this.colocacionConfirmadaEstaRonda = true;
          try {
            const snapJson = localStorage.getItem(`teg_coloc_snap_${this.partidaId}_${this.userId}`);
            if (snapJson) {
              const snap: Record<string, number> = JSON.parse(snapJson);
              this._colocacionSnapshot    = snap;
              this._colocacionTropasBase  = Object.values(snap).reduce((s, n) => s + n, 0);
              this.tropasColocadasBase    = { ...snap };
              this.rebuildTropasMap();
            }
          } catch { /* ignorar datos malformados */ }
          const allPlacedLoad = this.jugadores.filter(j => this.estaVivo(j.usuario_id))
            .every(j => (j.tropas_por_colocar ?? -1) === 0);
          if (allPlacedLoad) this.mostrarAprobacionCobro = true;
        }
      }
      if (this.esMiTurno && (this.fase === 'colocacion' || this.fase === 'ataque')) {
        void this.verificarVictoriaPorRendicion();
      }
      this.cdr.markForCheck();

      await this.checkAutoDistribuir();

      const miJugador = this.jugadores.find(j => j.usuario_id === this.userId);
      if (miJugador) {
        if (miJugador.posturas) this.posturas = { ...miJugador.posturas };
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
    this.removeAllChannels();

    this.channelChat = this.service.client
      .channel(`kuboteg-chat-${this.partidaId}`)
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        const msg = payload as ChatMensaje;
        if (msg.userId !== this.userId) {
          if (msg.grupoId) {
            if (msg.grupoId.startsWith('dm:')) {
              // DM: el grupoId es 'dm:userId1:userId2' — el receptor debe estar en el id
              if (!msg.grupoId.includes(this.userId)) return;
            } else {
              // Grupo: verificar que el usuario pertenece al grupo
              const grupo = this.grupos.find(g => g.id === msg.grupoId);
              if (!grupo || !grupo.jugadoresIds.includes(this.userId)) return;
            }
          }
          this.chatMensajes = [...this.chatMensajes, msg];
          const canal = msg.grupoId ?? 'global';
          const visible = this.panelActivo === 'chat' && this.chatActivoId === canal;
          if (!visible) {
            this.chatNoLeidos[canal] = (this.chatNoLeidos[canal] ?? 0) + 1;
            this.playSfx('assets/KuboTeg/sonidos/chat.mp3');
          }
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
          this.cdr.markForCheck();
        }
      })
      .on('broadcast', { event: 'conquista' }, ({ payload }) => {
        const uq = payload as UltimaConquista;
        if (uq.ts > this._lastConquistaTs) {
          this._lastConquistaTs = uq.ts;
          this.mostrarNotifConquista(uq);
          this.cdr.markForCheck();
        }
      })
      .on('broadcast', { event: 'jugador_eliminado' }, ({ payload }) => {
        const e = payload as { jugadorId: string; jugadorNombre: string; eliminadoPorNombre: string; ts: number };
        this.addNotif({ tipo: 'conquista', icono: '☠', linea1: `${e.jugadorNombre} fue eliminado`, linea2: `por ${e.eliminadoPorNombre}`, color: '#f87171', ts: e.ts });
        if (e.jugadorId === this.userId) {
          this.eliminadoPorNombre = e.eliminadoPorNombre;
          this.mostrarPopupEliminado = true;
          this.playSfx('assets/KuboTeg/sonidos/perdedor.mp3');
        } else {
          this.playSfx('assets/KuboTeg/sonidos/muerte-jugador.mp3');
          // Si mi objetivo era destruir a este jugador y fue eliminado por otro → fallback a 24 territorios
          const obj = this.miObjetivo;
          if (obj?.tipo === 'destruir' && !obj.fallback) {
            const targetJ = this.jugadores.find(j => j.color === obj.color);
            if (targetJ?.usuario_id === e.jugadorId) {
              this.miObjetivo = { tipo: 'destruir', color: obj.color, fallback: true };
            }
          }
        }
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'pacto_propuesta' }, ({ payload }) => {
        const p = payload as PropuestaPacto;
        if (p.receptorId === this.userId) {
          this.propuestaEntrante = p;
          this.cdr.markForCheck();
        }
      })
      .on('broadcast', { event: 'pacto_respuesta' }, ({ payload }) => {
        const r = payload as { id: string; accepted: boolean; pacto?: Pacto; pactoRenovadoId?: string; rondaExpira?: number };
        if (this.propuestaSaliente?.id === r.id) {
          this.propuestaSaliente = null;
          if (r.accepted && r.pactoRenovadoId && r.rondaExpira) {
            this.pactos = this.pactos.map(p =>
              p.id === r.pactoRenovadoId
                ? { ...p, estado: 'activo' as const, rondaExpira: r.rondaExpira! }
                : p
            );
            this.playSfx('assets/KuboTeg/sonidos/pacto.mp3');
            this.showGameNotif('¡Pacto renovado!', 'ok');
          } else if (r.accepted && r.pacto) {
            this.pactos = [...this.pactos, r.pacto];
            void this.aplicarPostura(r.pacto.jugador2Id, 'amigable');
            this.playSfx('assets/KuboTeg/sonidos/pacto.mp3');
            this.showGameNotif('¡Pacto aceptado!', 'ok');
          } else if (!r.accepted) {
            this.showGameNotif('Tu propuesta fue rechazada.', 'warn');
          }
          this.cdr.markForCheck();
        }
      })
      .on('broadcast', { event: 'grupo_nuevo' }, ({ payload }) => {
        const g = payload as GrupoChat;
        if (g.creadoPor === this.userId && !this.grupos.find(x => x.id === g.id)) {
          this.grupos = [...this.grupos, g];
          this.cdr.markForCheck();
        }
      })
      .on('broadcast', { event: 'evento_grupo' }, ({ payload }) => {
        const e = payload as { accion: 'creado' | 'disuelto'; grupoNombre: string; autorNombre: string; autorId: string };
        if (e.accion !== 'disuelto') return;
        this.addNotif({
          tipo: 'grupo', icono: '💔',
          linea1: `El grupo "${e.grupoNombre}" fue disuelto`,
          linea2: `${e.autorNombre} rechazó la invitación`,
          color: this.jugadorColores[e.autorId] ?? '#94a3b8',
          ts: Date.now(),
        });
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'invitacion_grupo' }, ({ payload }) => {
        const inv = payload as InvitacionGrupo;
        if (inv.invitadoId === this.userId) {
          this.invitacionGrupoEntrante = inv;
          this.cdr.markForCheck();
        }
      })
      .on('broadcast', { event: 'grupo_unirse' }, ({ payload }) => {
        const { grupoId, jugadorId, totalEsperados } = payload as { grupoId: string; jugadorId: string; totalEsperados?: number };
        const idx = this.grupos.findIndex(g => g.id === grupoId);
        if (idx !== -1 && !this.grupos[idx].jugadoresIds.includes(jugadorId)) {
          const g = this.grupos[idx];
          const updated = { ...g, jugadoresIds: [...g.jugadoresIds, jugadorId] };
          this.grupos = [
            ...this.grupos.slice(0, idx),
            updated,
            ...this.grupos.slice(idx + 1),
          ];
          const nombre = this.jugadorNombres[jugadorId] ?? jugadorId;
          this.showGameNotif(`${nombre} se unió al grupo`, 'ok');
          if (totalEsperados && updated.jugadoresIds.length >= totalEsperados) {
            this.addNotif({
              tipo: 'grupo', icono: '👥',
              linea1: `${this.nombreJugadorById(updated.creadoPor)} creó "${updated.nombre}"`,
              linea2: 'Nuevo grupo de chat',
              color: this.jugadorColores[updated.creadoPor] ?? '#94a3b8',
              ts: Date.now(),
            });
          }
          this.cdr.markForCheck();
        }
      })
      .on('broadcast', { event: 'grupo_rechazar' }, ({ payload }) => {
        const { grupoId, grupoNombre, jugadorId } = payload as { grupoId: string; grupoNombre: string; jugadorId: string };
        const nombre = this.jugadorNombres[jugadorId] ?? jugadorId;
        const grupo = this.grupos.find(g => g.id === grupoId);
        this.grupos = this.grupos.filter(g => g.id !== grupoId);
        if (this.chatActivoId === grupoId) this.chatActivoId = 'global';
        if (grupo?.creadoPor === this.userId) {
          this.service.eliminarGrupoChat(grupoId);
        }
        this.showGameNotif(`${nombre} rechazó unirse a "${grupoNombre}". El grupo fue eliminado.`, 'warn');
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'postura_declarada' }, ({ payload }) => {
        const p = payload as { declaranteId: string; receptorId: string; postura: 'amigable' | 'neutral' | 'hostil'; declaranteNombre: string };
        if (p.receptorId === this.userId) {
          // Actualizar posturas del declarante en el array local para reflejar la imagen inmediatamente
          const idx = this.jugadores.findIndex(j => j.usuario_id === p.declaranteId);
          if (idx !== -1) {
            const prev = this.jugadores[idx];
            const updatedPosturas = { ...(prev.posturas ?? {}), [this.userId]: p.postura };
            this.jugadores = [
              ...this.jugadores.slice(0, idx),
              { ...prev, posturas: updatedPosturas },
              ...this.jugadores.slice(idx + 1),
            ];
          }
          this.showGameNotif(`${p.declaranteNombre} te declaró ${p.postura}`, p.postura === 'amigable' ? 'ok' : p.postura === 'hostil' ? 'warn' : 'info');
        }
        const receptorNombre = this.nombreJugadorById(p.receptorId);
        this.pushNotifPostura(p.declaranteNombre, receptorNombre, p.postura, this.jugadorColores[p.declaranteId] ?? '#94a3b8');
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'hostilidad_declarada' }, ({ payload }) => {
        const h = payload as { declaranteId: string; declaranteNombre: string; receptorId: string; receptorNombre: string; gruposDisueltos: { id: string; nombre: string }[] };
        for (const g of h.gruposDisueltos) {
          this.grupos = this.grupos.filter(gr => gr.id !== g.id);
          if (this.chatActivoId === g.id) this.chatActivoId = 'global';
        }
        this.addNotif({
          tipo: 'combate', icono: '⚔️',
          linea1: `${h.declaranteNombre} → ${h.receptorNombre}`,
          linea2: 'Declaración de hostilidad',
          color: this.jugadorColores[h.declaranteId] ?? '#ef4444',
          ts: Date.now(),
        });
        if (h.receptorId === this.userId) {
          this.showGameNotif(`${h.declaranteNombre} te declaró hostil`, 'error');
        }
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'pacto_aceptado' }, ({ payload }) => {
        const e = payload as { jugador1Nombre: string; jugador2Nombre: string; tipo: 'no_agresion'; color: string; ts: number; esRenovacion: boolean };
        this.pushNotifPacto(e.jugador1Nombre, e.jugador2Nombre, e.tipo, e.color, e.esRenovacion, e.ts);
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'pacto_roto' }, ({ payload }) => {
        const e = payload as { rompedorId: string; rompedorNombre: string; afectadoId: string; afectadoNombre: string; tipo: 'no_agresion'; ts: number };
        const label = 'No agresión';
        this.addNotif({ tipo: 'pacto', icono: '💔', linea1: `Ruptura: ${e.rompedorNombre} & ${e.afectadoNombre}`, linea2: `${label} rota`, color: '#ef4444', ts: e.ts });
        if (e.afectadoId === this.userId) {
          this.showGameNotif(`${e.rompedorNombre} rompió el pacto contigo.`, 'warn');
        }
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'carta_robada' }, ({ payload }) => {
        const e = payload as { jugadorId: string; jugadorNombre: string; cartaNombre: string; bonusNombre: string | null; ts: number };
        if (e.jugadorId !== this.userId) {
          this.addNotif({
            tipo: 'carta', icono: '🃏',
            linea1: e.cartaNombre, linea2: e.bonusNombre ?? '',
            color: this.jugadorColores[e.jugadorId] ?? '#818cf8',
            ts: e.ts, bonusNombre: e.bonusNombre, jugador: e.jugadorNombre,
          });
          this.cdr.markForCheck();
        }
      })
      .on('broadcast', { event: 'colocacion_tropa' }, ({ payload }) => {
        const e = payload as { territorioId: string; jugadorId: string; accion: 'colocar' | 'quitar'; tropasTotales: number };
        if (e.jugadorId === this.userId) return;
        const sfx = e.accion === 'colocar'
          ? 'assets/KuboTeg/sonidos/colocar-ficha.mp3'
          : 'assets/KuboTeg/sonidos/quitar-ficha.mp3';
        this.playSfx(sfx);
        this._tropasPreviewMap[e.territorioId] = e.tropasTotales;
        this.rebuildTropasMap();
        if (e.accion === 'colocar') this.activarHighlightColocacion(e.territorioId);
        else this.activarHighlightQuitar(e.territorioId);
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'movilizacion_tropa' }, ({ payload }) => {
        const e = payload as { origenId: string; destinoId: string; jugadorId: string };
        if (e.jugadorId === this.userId) return;
        this.playSfx('assets/KuboTeg/sonidos/movimiento.mp3');
        this.activarHighlightMovilizacion(e.destinoId);
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'carta_acierta' }, ({ payload }) => {
        const e = payload as { cartaId: string; jugadorId: string };
        if (e.jugadorId === this.userId) return;
        this.playSfx('assets/KuboTeg/sonidos/acierta-carta.mp3');
        this.activarHighlightCartaAcierta(e.cartaId);
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'bomba_posicion' }, ({ payload }) => {
        const e = payload as { jugadorId: string; bomba1: string | null; bomba2: string | null };
        if (e.jugadorId === this.userId) return;
        this.syncBombasJugador(e.jugadorId, e.bomba1 ?? null, e.bomba2 ?? null);
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'bomba_capturada' }, ({ payload }) => {
        // Evento específico para cuando un atacante captura la bomba del defensor.
        // A diferencia de bomba_posicion, el DEFENSOR (dueño original) también lo procesa.
        const e = payload as { jugadorId: string; bomba1: string | null; bomba2: string | null };
        this.syncBombasJugador(e.jugadorId, e.bomba1 ?? null, e.bomba2 ?? null);
        if (e.jugadorId === this.userId) {
          // Actualizar estado local: quitar la bomba capturada
          const nuevasBombas = ([e.bomba1, e.bomba2] as (string | null)[]).filter(b => b !== null) as string[];
          this.bombas = nuevasBombas;
          this.bombasMovidasEnRonda = [];
          this.saveBombaState();
          this.modoUsandoBomba = false;
          this.showGameNotif('¡Tu bomba fue capturada por el atacante!', 'warn');
        }
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'bomba_atomica' }, ({ payload }) => {
        const e = payload as { territorioId: string; jugadorId: string; victimaId?: string; bomba1: string | null; bomba2: string | null };
        if (e.jugadorId === this.userId) return;
        if (e.victimaId === this.userId) void this.aplicarPostura(e.jugadorId, 'hostil');
        this.syncBombasJugador(e.jugadorId, e.bomba1 ?? null, e.bomba2 ?? null);
        this.territorioMisilActivoId = e.territorioId;
        this.cdr.markForCheck();
        setTimeout(() => { this.territorioMisilActivoId = null; this.cdr.markForCheck(); }, 1500);
        setTimeout(() => { this.marcarDestruido(e.territorioId); this.cdr.markForCheck(); }, 750);
        const atacanteNombre = this.jugadorNombres[e.jugadorId] ?? '?';
        const terrNombre     = this.nombreTerritorio(e.territorioId);
        this.playSfx('assets/KuboTeg/sonidos/bomba-nuclear.mp3');
        this.addNotif({ tipo: 'conquista', icono: '☢', linea1: `${atacanteNombre} lanzó la Bomba Atómica`, linea2: `${terrNombre} reducido a 1 tropa`, color: '#fbbf24', ts: Date.now() });
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'combate_inicio' }, () => {
        this.combateEnCurso = true;
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'combate_fin' }, () => {
        this.combateEnCurso = false;
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'colocacion_lista' }, () => {
        this.mostrarAprobacionCobro = true;
        this.aprobacionCobroEnviada = false;
        this._aprobacionesCobro.clear();
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'aprobacion_cobro' }, ({ payload }) => {
        const uid = (payload as { userId: string }).userId;
        this._aprobacionesCobro.add(uid);
        if (this.esHost) void this.checkTodosAprobaron();
        this.cdr.markForCheck();
      })
      .on('broadcast', { event: 'undo_colocacion' }, () => {
        this.mostrarAprobacionCobro = false;
        this.aprobacionCobroEnviada = false;
        this._aprobacionesCobro.clear();
        this.cdr.markForCheck();
      })
      .subscribe();

    this.channelPartida = this.service.client
      .channel(`kuboteg-partida-${this.partidaId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partida' }, (payload) => {
        if (payload.new['id'] === this.partidaId) {
          const newPartida = payload.new as Partida;
          if (newPartida.estado === 'En pausa' && this.partida?.estado !== 'En pausa') {
            clearInterval(this.timerInterval!);
            this.timerInterval = null;
            this.audioSvc.silenceGain();
          }
          if (newPartida.estado === 'En juego' && this.partida?.estado !== 'En juego') {
            this.cambiarMusicaLider();
            this.iniciarTimer();
          }
          if (newPartida.estado === 'Finalizada' && this.partida?.estado !== 'Finalizada') {
            this.audioSvc.pauseBgMusic();
            if (newPartida.ganador_id === this.userId) {
              this.playSfx('assets/KuboTeg/sonidos/ganador.mp3');
            } else {
              this.playSfx('assets/KuboTeg/sonidos/perdedor.mp3');
            }
          }
          if (Array.isArray(newPartida.pactos)) {
            const newPactos = newPartida.pactos as Pacto[];
            const rupturaRecibida = newPactos.find(np =>
              np.estado === 'en_transicion' &&
              (np.jugador1Id === this.userId || np.jugador2Id === this.userId) &&
              this.pactos.find(op => op.id === np.id)?.estado !== 'en_transicion'
            );
            if (rupturaRecibida) this.playSfx('assets/KuboTeg/sonidos/ruptura-pacto.mp3');
            this.pactos = newPactos;
          }
          const uc = (newPartida as any).ultimo_combate as UltimoCombate | null;
          if (uc?.ts && uc.ts !== this._lastCombateTs) {
            this._lastCombateTs = uc.ts;
            this.mostrarPopupCombate(uc);
          }
          const prevFase = this.fase;
          const prevJugadorIdx = this.partida?.jugador_actual_index;
          this.partida = newPartida;
          if (this.fase === 'reagrupacion' && prevFase !== 'reagrupacion' && this.esMiTurno) {
            this.iniciarFaseReagrupacion();
          }
          // Sincronizar territorios al cambio de turno/fase para compensar
          // eventos de postgres_changes que el observador pudo haber perdido.
          // iniciarSubFaseColocacion se llama DENTRO del .then() para garantizar que
          // usa datos de territorio frescos al calcular continentesColocacion.
          const turnoCambio = prevFase !== this.fase || prevJugadorIdx !== newPartida.jugador_actual_index;
          const needsColocInit = this.fase === 'colocacion' && this.esMiTurno &&
            (prevFase !== 'colocacion' || prevJugadorIdx !== newPartida.jugador_actual_index);
          if (turnoCambio) {
            this.syncTerritorios().then(() => {
              if (needsColocInit) this.iniciarSubFaseColocacion();
            });
            if (this.partida?.estado === 'En juego') this.cambiarMusicaLider();
            if (this.esMiTurno && prevJugadorIdx !== newPartida.jugador_actual_index) {
              this.playSfx('assets/KuboTeg/sonidos/confirma-seleccion.mp3');
              this.abrirPopupMiTurno();
            }
            if (this.esMiTurno && (this.fase === 'colocacion' || this.fase === 'ataque')) {
              void this.verificarVictoriaPorRendicion();
            }
            // Bot turns handled by Edge Function (Option B)
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
            {
              ...prev,
              ...updated,
              usuario: prev.usuario,
              bomba_territorio:   updated.bomba_territorio   !== undefined ? updated.bomba_territorio   : prev.bomba_territorio,
              bomba_territorio_2: updated.bomba_territorio_2 !== undefined ? updated.bomba_territorio_2 : prev.bomba_territorio_2,
            },
            ...this.jugadores.slice(idx + 1),
          ];
          if (updated.usuario_id === this.userId) {
            // Sanear bombas cuyos territorios ya no son propios (conquista mientras
            // setBombaTerritorios no había llegado a DB). El broadcast bomba_capturada
            // es el canal primario; este chequeo actúa como red de seguridad secundaria.
            const bombasSaneadas = this.bombas.map(pos => {
              if (!pos) return null;
              const terr = this.territorios[pos];
              return (!terr || terr.usuario_id !== this.userId) ? null : pos;
            });
            const bombasChanged = bombasSaneadas.some((b, i) => b !== this.bombas[i]);
            if (bombasChanged) {
              this.bombas = bombasSaneadas.filter(b => b !== null) as string[];
              this.saveBombaState();
            }
            const [pjT1, pjT2] = this.bombasT1T2();
            this.syncBombasJugador(this.userId, pjT1, pjT2);

            if (updated.objetivo) {
              this.miObjetivo = updated.objetivo as ObjetivoSecreto;
              const seenKey = `obj_visto_${this.partidaId}_${this.userId}`;
              if (!localStorage.getItem(seenKey)) {
                this.mostrarObjetivoPopup = true;
              }
            }
            if (updated.posturas) this.posturas = { ...updated.posturas };
            if (updated.cartas != null) this.misCartas = updated.cartas;
          }
          if (updated.rendido && !prev.rendido) {
            if (updated.usuario_id !== this.userId) {
              const nombre = this.nombreJugador(this.jugadores.find(j => j.usuario_id === updated.usuario_id) ?? null);
              this.addNotif({ tipo: 'conquista', icono: '🏳', linea1: `${nombre} se rindió`, linea2: 'abandonó la partida', color: '#94a3b8', ts: Date.now() });
            }
            void this.verificarVictoriaPorRendicion();
          }
          if (updated.bomba_territorio !== prev.bomba_territorio && updated.usuario_id !== this.userId) {
            this.cdr.markForCheck();
          }
          this.rebuildJugadores();
          this.cdr.markForCheck();
          this.checkAutoDistribuir();
          // Modo colocación simultánea: el host detecta cuando todos confirmaron
          if (this.esHost && this.colocacionSimultanea && this.fase === 'colocacion') {
            const prevTropas = prev.tropas_por_colocar ?? -1;
            const newTropas  = updated.tropas_por_colocar ?? -1;
            if (prevTropas > 0 && newTropas === 0) {
              void this.checkTodosConfirmaronColocacion();
            }
          }
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
          delete this._tropasPreviewMap[t.territorio_id];
          this.territorios = { ...this.territorios, [t.territorio_id]: t };
          this.rebuildMaps();
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

  private async syncTerritorios() {
    const { data } = await this.service.getTerritoriosEstado(this.partidaId);
    if (!data?.length) return;
    const map: Record<string, TerritorioEstado> = {};
    for (const t of data) map[t.territorio_id] = t;
    this.territorios = { ...this.territorios, ...map };
    this._tropasPreviewMap = {};
    this.rebuildMaps();
    this.cdr.markForCheck();
  }

  private scheduleReconnect() {
    // Los 3 canales fallan al mismo tiempo; el timer evita duplicados
    if (this.reconnectTimer) return;
    this.toast.show('Conexión perdida. Reconectando...', 'error');
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      this.subscribeRealtime();
      try {
        const [{ data: partida }, { data: jugadores }, { data: territorios }] = await Promise.all([
          this.service.getPartidaById(this.partidaId),
          this.service.getPartidaJugadores(this.partidaId),
          this.service.getTerritoriosEstado(this.partidaId),
        ]);
        if (partida) this.partida = partida;
        if (jugadores) {
          this.jugadores = jugadores;
          // Re-aplicar posición de bomba propia (el broadcast es efímero; puede haberse perdido)
          const [rcT1, rcT2] = this.bombasT1T2();
          this.syncBombasJugador(this.userId, rcT1, rcT2);
          this.rebuildJugadores();
        }
        if (territorios) {
          this.territorios = {};
          territorios.forEach(t => { this.territorios[t.territorio_id] = t; });
        }
        // Limpiar previews: al reconectar, el DB es la fuente de verdad.
        // Sin esto, broadcasts de colocación previos a la caída sobreescriben los valores frescos.
        this._tropasPreviewMap = {};
        this.rebuildMaps();
        // Re-inicializar subFase de colocación con datos frescos de territorio.
        // Solo si el jugador aún tiene tropas por colocar (tropas_por_colocar > 0).
        // Si ya estaban en 0, la confirmación fue exitosa y no hay que volver a iniciar.
        const miJRecon = this.jugadores.find(j => j.usuario_id === this.userId);
        if (this.partida?.fase_actual === 'colocacion' && this.esMiTurno) {
          const misT = miJRecon?.tropas_por_colocar ?? 0;
          if (misT > 0) {
            this.iniciarSubFaseColocacion();
          } else if (this.colocacionSimultanea && misT === 0) {
            // Ya confirmé antes de la caída; restaurar estado de espera/aprobación.
            // Los mapas de colocación persisten en memoria si no hubo recarga de página.
            this.colocacionConfirmadaEstaRonda = true;
            // Reconstruir snapshot desde los mapas locales (no se borraron al confirmar).
            if (Object.keys(this._colocacionSnapshot).length === 0) {
              const rebuilt: Record<string, number> = {};
              for (const [tid, n] of Object.entries(this.tropasColocadasContinentes)) {
                if (n > 0) rebuilt[tid] = (rebuilt[tid] ?? 0) + n;
              }
              for (const [tid, n] of Object.entries(this.tropasColocadasBase)) {
                if (n > 0) rebuilt[tid] = (rebuilt[tid] ?? 0) + n;
              }
              this._colocacionSnapshot = rebuilt;
            }
            const allPlaced = this.jugadores.filter(j => this.estaVivo(j.usuario_id))
              .every(j => (j.tropas_por_colocar ?? -1) === 0);
            if (allPlaced) this.mostrarAprobacionCobro = true;
          }
        }
        this.toast.show('Conexión restaurada', 'success');
      } catch {
        this.toast.show('No se pudo reconectar. Recargá la página.', 'error');
      }
      this.cdr.markForCheck();
    }, 3000);
  }

  // ── Auto-distribución ────────────────────────────────
  private async checkAutoDistribuir() {
    if (this.esHost && this.todosAdentro && !this.territoriosDistribuidos && !this.distribuyendoTerritorios) {
      await this.distribuirTerritorios();
    }
  }

  private async asignarColorLiderBot() {
    const botIdx = this.jugadores.findIndex(j => j.usuario_id === BOT_USER_ID);
    if (botIdx === -1) return;
    const bot = this.jugadores[botIdx];
    if (bot.color && bot.lider) return;

    const humanos = this.jugadores.filter(j => j.usuario_id !== BOT_USER_ID);
    const coloresUsados = new Set(humanos.map(j => j.color));
    const color = this.coloresDisponibles.find(c => !coloresUsados.has(c.hex))?.hex
      ?? this.coloresDisponibles[0].hex;

    const lideresUsados = new Set(humanos.map(j => j.lider));
    const lider = this.lideres.find(l => !lideresUsados.has(l.nombre))?.nombre
      ?? this.lideres[0]?.nombre ?? 'Mujica';

    await this.service.marcarEstaDentroConColor(this.partidaId, BOT_USER_ID, color, lider);
    // Actualizar local para que generarYAsignarObjetivos vea el color del bot
    this.jugadores = this.jugadores.map((j, i) =>
      i === botIdx ? { ...j, color, lider, esta_dentro: true } : j
    );
  }

  // ── Host: distribuir territorios ─────────────────────
  async distribuirTerritorios() {
    if (this.distribuyendoTerritorios || !this.partida) return;
    this.distribuyendoTerritorios = true;

    // Auto-asignar color y líder al bot si no los tiene
    await this.asignarColorLiderBot();

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

    await this.confirmarConfiguracion();
  }

  // ── Host: iniciar juego ───────────────────────────────
  async confirmarConfiguracion() {
    if (this.iniciandoJuego || !this.partida) return;
    this.iniciandoJuego = true;

    const tropas = this.partida.tropas_iniciales ?? 5;

    const orden = this.ordenGenerado.length > 0
      ? this.ordenGenerado
      : this.randomShuffle(this.jugadores.map(j => j.usuario_id));

    await Promise.all(
      this.jugadores.map(j => this.service.setTropasPorColocar(this.partidaId, j.usuario_id, tropas))
    );

    await this.generarYAsignarObjetivos();

    const { count: terrCount } = await this.service.client
      .from('territorio_estado')
      .select('*', { count: 'exact', head: true })
      .eq('partida_id', this.partidaId);

    if ((terrCount ?? 0) < TERRITORIES.length) {
      this.toast.show('Error: los territorios no están listos. Intentá de nuevo.', 'error');
      this.iniciandoJuego = false;
      this.distribuyendoTerritorios = false;
      this.cdr.markForCheck();
      return;
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

  // ── Map events ────────────────────────────────────────
  onMapTerritoryClick(territorioId: string) {
    if (this.verPactosEnMapa) { this.verPactosEnMapa = false; this.cdr.markForCheck(); return; }
    if (this.modoPacto === 'propio')   { this.handlePactoClickPropio(territorioId);   return; }
    if (this.modoPacto === 'ajeno')    { this.handlePactoClickAjeno(territorioId);    return; }
    // Bomba activa durante fase de ataque: permitir click aunque no sea el turno propio,
    // siempre que no haya un combate en curso del atacante.
    if (this.modoUsandoBomba && this.fase === 'ataque' && !this.esMiTurno) {
      if (!this.combateEnCurso) void this.ejecutarBomba(territorioId);
      return;
    }
    if (!this.esMiTurno) return;
    if (this.modoColocandoBomba) { this.colocarBomba(territorioId); return; }
    switch (this.fase) {
      case 'colocacion':   this.colocarTropa(territorioId); break;
      case 'ataque':       void this.handleAtaqueClick(territorioId); break;
      case 'reagrupacion': this.handleReagrupacionClick(territorioId); break;
    }
  }

  onMapDeseleccionar() {
    if (this.verPactosEnMapa) { this.verPactosEnMapa = false; this.cdr.markForCheck(); return; }
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
      this.activarHighlightColocacion(territorioId);
      this.channelEventos?.send({ type: 'broadcast', event: 'colocacion_tropa', payload: { territorioId, jugadorId: this.userId, accion: 'colocar', tropasTotales: this._tropasMap[territorioId] ?? 0 } });

      if (cont.colocadas >= cont.bonus) {
        this.continenteColocacionIdx++;
        if (this.continenteColocacionIdx >= this.continentesColocacion.length) {
          this.subFaseColocacion = 'base';
        }
      }
      this.cdr.markForCheck();
    } else {
      // Guardia defensiva: detecta estado incoherente (base pero con continentes pendientes)
      // y lo corrige antes de permitir colocar. Cubre edge cases de reconexión o undo fallido.
      if (this.continentesColocacion.length > 0) {
        this.iniciarSubFaseColocacion();
        return;
      }
      if (this.misTropasParaColocar <= 0) return;
      this.tropasColocadasBase = {
        ...this.tropasColocadasBase,
        [territorioId]: (this.tropasColocadasBase[territorioId] ?? 0) + 1,
      };
      this.rebuildTropasMap();
      this.playSfx('assets/KuboTeg/sonidos/colocar-ficha.mp3');
      this.activarHighlightColocacion(territorioId);
      this.channelEventos?.send({ type: 'broadcast', event: 'colocacion_tropa', payload: { territorioId, jugadorId: this.userId, accion: 'colocar', tropasTotales: this._tropasMap[territorioId] ?? 0 } });
      this.cdr.markForCheck();
    }
  }

  quitarTropa(territorioId: string) {
    if (this.misColocacionConfirmada) return;
    if (this.subFaseColocacion === 'continentes') {
      const cont = this.continentesColocacion[this.continenteColocacionIdx];
      if (!cont || !cont.territoriosPermitidos.includes(territorioId)) return;
      const added = this.tropasColocadasContinentes[territorioId] ?? 0;
      if (added <= 0 || cont.colocadas <= 0) return;
      this.tropasColocadasContinentes = { ...this.tropasColocadasContinentes, [territorioId]: added - 1 };
      cont.colocadas--;
      this.rebuildTropasMap();
      this.playSfx('assets/KuboTeg/sonidos/quitar-ficha.mp3');
      this.activarHighlightQuitar(territorioId);
      this.channelEventos?.send({ type: 'broadcast', event: 'colocacion_tropa', payload: { territorioId, jugadorId: this.userId, accion: 'quitar', tropasTotales: this._tropasMap[territorioId] ?? 0 } });
      this.cdr.markForCheck();
    } else {
      const added = this.tropasColocadasBase[territorioId] ?? 0;
      if (added <= 0) return;
      this.tropasColocadasBase = { ...this.tropasColocadasBase, [territorioId]: added - 1 };
      this.rebuildTropasMap();
      this.playSfx('assets/KuboTeg/sonidos/quitar-ficha.mp3');
      this.activarHighlightQuitar(territorioId);
      this.channelEventos?.send({ type: 'broadcast', event: 'colocacion_tropa', payload: { territorioId, jugadorId: this.userId, accion: 'quitar', tropasTotales: this._tropasMap[territorioId] ?? 0 } });
      this.cdr.markForCheck();
    }
  }

  async confirmarColocacion() {
    if (this.confirmandoColocacion) return;
    if (this.subFaseColocacion !== 'base' || this.misTropasParaColocar !== 0 || !this.partida) return;
    if (this.bombas.some(b => b === null)) {
      this.showGameNotif('Debés colocar todas las Bombas Atómicas antes de continuar', 'warn');
      return;
    }

    this.confirmandoColocacion = true;
    try {
    // Capturar valores de turno antes de cualquier await para evitar que
    // eventos de Realtime actualicen this.partida durante la ejecución.
    const orden      = this.partida.orden_jugadores!;
    const n          = orden.length;
    const ronda      = this.partida.ronda_actual!;
    const startIdx   = this.primerVivoDesde((ronda - 1) % n, orden);
    const currentIdx = this.partida.jugador_actual_index!;
    const nextIdx    = this.siguienteVivoIdx(currentIdx, orden);

    const allPlaced: Record<string, number> = {};
    for (const [tid, n] of Object.entries(this.tropasColocadasContinentes)) {
      if (n > 0) allPlaced[tid] = (allPlaced[tid] ?? 0) + n;
    }
    for (const [tid, n] of Object.entries(this.tropasColocadasBase)) {
      if (n > 0) allPlaced[tid] = (allPlaced[tid] ?? 0) + n;
    }
    if (this.colocacionSimultanea) {
      // Modo simultáneo: guardar placements en snapshot y señalizar "listo" (tropas=0).
      // Los territorios NO se escriben en DB hasta que el jugador apruebe el cobro.
      // Esto garantiza que cualquier jugador pueda deshacer sin reversión de DB.
      const totalPlaced = Object.values(allPlaced).reduce((s, n) => s + n, 0);
      this._colocacionSnapshot = { ...allPlaced };
      // Persistir en localStorage para sobrevivir un reload de página (DB solo guarda tropas=0).
      localStorage.setItem(`teg_coloc_snap_${this.partidaId}_${this.userId}`, JSON.stringify(this._colocacionSnapshot));
      // Usar el mayor entre el valor real y totalPlaced para cubrir datos desactualizados.
      this._colocacionTropasBase = Math.max(
        this.jugadores.find(j => j.usuario_id === this.userId)?.tropas_por_colocar ?? 0,
        totalPlaced
      );

      // Señalizar "ya coloqué" — tropas_por_colocar = 0 actúa como flag para el host.
      await this.service.setTropasPorColocar(this.partidaId, this.userId, 0);
      this.continentesColocacion = [];
      this.subFaseColocacion = 'base';
      // No limpiar tropasColocadasContinentes/Base — se necesitan para aplicar en aprobarCobro.

      this.colocacionConfirmadaEstaRonda = true;
      const myPJIdx = this.jugadores.findIndex(j => j.usuario_id === this.userId);
      if (myPJIdx !== -1) {
        this.jugadores = [
          ...this.jugadores.slice(0, myPJIdx),
          { ...this.jugadores[myPJIdx], tropas_por_colocar: 0 },
          ...this.jugadores.slice(myPJIdx + 1),
        ];
      }
      this.rebuildTropasMap();
      this.cdr.markForCheck();
      if (this.esHost) this.checkTodosConfirmaronColocacion(startIdx);
    } else {
      // Modo secuencial: escribir territorios inmediatamente (comportamiento original).
      for (const [tid, added] of Object.entries(allPlaced)) {
        const estado = this.territorios[tid];
        if (estado) {
          const ok = await this.updateTerritorio(tid, { tropas: estado.tropas + added });
          if (!ok) { this.cdr.markForCheck(); return; }
          delete this.tropasColocadasContinentes[tid];
          delete this.tropasColocadasBase[tid];
        }
      }

      // Garantizar que la posición de bomba esté persistida antes de avanzar de fase.
      const [cbT1, cbT2] = this.bombasT1T2();
      if (cbT1 || cbT2) {
        await this.service.setBombaTerritorios(this.partidaId, this.userId, cbT1, cbT2);
      }

      await this.service.setTropasPorColocar(this.partidaId, this.userId, 0);
      // Actualizar estado local inmediatamente para cerrar la ventana de Realtime:
      // sin esto, tropasPorColocarBase seguía devolviendo N hasta que llegara el evento
      // de partida_jugador, permitiendo confirmar una segunda vez con tropas fantasma.
      const seqMyIdx = this.jugadores.findIndex(j => j.usuario_id === this.userId);
      if (seqMyIdx !== -1) {
        this.jugadores = [
          ...this.jugadores.slice(0, seqMyIdx),
          { ...this.jugadores[seqMyIdx], tropas_por_colocar: 0 },
          ...this.jugadores.slice(seqMyIdx + 1),
        ];
      }
      this.tropasColocadasContinentes = {};
      this.tropasColocadasBase = {};
      this.continentesColocacion = [];
      this.subFaseColocacion = 'base';
      this.rebuildTropasMap();

      if (nextIdx === startIdx) {
        await this.service.setFase(this.partidaId, 'ataque', startIdx);
      } else {
        await this.service.avanzarJugador(this.partidaId, nextIdx);
      }
    }
    } finally {
      this.confirmandoColocacion = false;
    }
  }

  private checkTodosConfirmaronColocacion(startIdx?: number) {
    if (!this.esHost || !this.partida || this.fase !== 'colocacion' || !this.colocacionSimultanea) return;
    if (this.mostrarAprobacionCobro) return; // ya en fase de aprobación
    const allDone = this.jugadores
      .filter(j => this.estaVivo(j.usuario_id))
      .every(j => (j.tropas_por_colocar ?? -1) === 0);
    if (!allDone) return;
    const orden = this.partida.orden_jugadores!;
    const ronda = this.partida.ronda_actual!;
    const n = orden.length;
    this._startIdxParaAtaque = startIdx ?? this.primerVivoDesde((ronda - 1) % n, orden);
    this._aprobacionesCobro.clear();
    // Notificar a todos que empiecen la fase de aprobación
    this.channelEventos?.send({ type: 'broadcast', event: 'colocacion_lista', payload: {} });
    this.mostrarAprobacionCobro = true;
    this.aprobacionCobroEnviada = false;
    this.cdr.markForCheck();
  }

  async aprobarCobro() {
    if (this.aprobacionCobroEnviada) return;
    this.aprobacionCobroEnviada = true;
    this.cdr.markForCheck();

    // Ahora sí escribir los territorios en DB (diferido desde confirmarColocacion).
    for (const [tid, added] of Object.entries(this._colocacionSnapshot)) {
      if (added <= 0) continue;
      const estado = this.territorios[tid];
      if (estado) {
        const ok = await this.updateTerritorio(tid, { tropas: estado.tropas + added });
        if (!ok) {
          // Dejar aprobacionCobroEnviada=false para permitir reintentar.
          this.aprobacionCobroEnviada = false;
          this.cdr.markForCheck();
          return;
        }
      }
    }
    this._colocacionSnapshot = {};
    localStorage.removeItem(`teg_coloc_snap_${this.partidaId}_${this.userId}`);
    this.tropasColocadasContinentes = {};
    this.tropasColocadasBase = {};
    this.rebuildTropasMap();

    // Garantizar posición de bomba persistida.
    const [cbT1, cbT2] = this.bombasT1T2();
    if (cbT1 || cbT2) {
      await this.service.setBombaTerritorios(this.partidaId, this.userId, cbT1, cbT2);
    }

    this._aprobacionesCobro.add(this.userId);
    this.channelEventos?.send({ type: 'broadcast', event: 'aprobacion_cobro', payload: { userId: this.userId } });
    if (this.esHost) await this.checkTodosAprobaron();
    this.cdr.markForCheck();
  }

  private async checkTodosAprobaron() {
    if (!this.esHost || !this.partida || this.fase !== 'colocacion') return;
    const living = this.jugadores.filter(j => this.estaVivo(j.usuario_id)).map(j => j.usuario_id);
    if (!living.every(uid => this._aprobacionesCobro.has(uid))) return;
    await this.service.setFase(this.partidaId, 'ataque', this._startIdxParaAtaque);
  }

  async deshacerColocacionSimultanea() {
    if (this.deshaciendo || !this.colocacionConfirmadaEstaRonda) return;
    this.deshaciendo = true;
    try {
      // Los territorios NO están escritos en DB (se difieren hasta aprobarCobro),
      // así que el undo es solo restaurar el estado local sin tocar la DB de territorios.
      await this.service.setTropasPorColocar(this.partidaId, this.userId, this._colocacionTropasBase);
      const myIdx = this.jugadores.findIndex(j => j.usuario_id === this.userId);
      if (myIdx !== -1) {
        this.jugadores = [
          ...this.jugadores.slice(0, myIdx),
          { ...this.jugadores[myIdx], tropas_por_colocar: this._colocacionTropasBase },
          ...this.jugadores.slice(myIdx + 1),
        ];
      }
        localStorage.removeItem(`teg_coloc_snap_${this.partidaId}_${this.userId}`);
      this._aprobacionesCobro.clear();
      this.channelEventos?.send({ type: 'broadcast', event: 'undo_colocacion', payload: {} });
      // Reinicializa completamente la subfase: limpia mapas, recalcula continentes
      // y establece subFaseColocacion con la restricción correcta.
      // Hacerlo manual (sólo 'base') dejaba continentesColocacion no vacío,
      // permitiendo eludir las restricciones de continente.
      this.iniciarSubFaseColocacion();
      this.rebuildTropasMap();
    } finally {
      this.deshaciendo = false;
    }
  }

  // ── Ataque ────────────────────────────────────────────
  async handleAtaqueClick(territorioId: string) {
    if (this.modoUsandoBomba) { await this.ejecutarBomba(territorioId); return; }
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
      if (!this.puedoAtacar(this.territorioAtacanteId, territorioId)) return;
      await this.ejecutarAtaque(this.territorioAtacanteId, territorioId);
    } else if (estado.usuario_id === this.userId && estado.tropas > 1) {
      this.territorioAtacanteId = territorioId;
    }
  }

  async ejecutarAtaque(origenId: string, destinoId: string) {
    this.lastAttack = { origenId, destinoId };
    this.procesandoCombate = true;
    this.channelEventos?.send({ type: 'broadcast', event: 'combate_inicio', payload: {} });
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
        liderAtacanteImg: this.getLiderImgByNombre(liderAtacante),
        liderDefensorImg: this.getLiderImgByNombre(liderDefensor),
        ts:               Date.now(),
        origenId,
        destinoId,
      };
      this._lastCombateTs = popupData.ts;
      this.mostrarPopupCombate(popupData);
      this.channelEventos?.send({ type: 'broadcast', event: 'combate', payload: popupData });

      if (conquista) {
        this.conquistaTropasAMover = 1;
        this.conquistaPendiente = {
          origenId,
          destinoId,
          tropasOrigenFinal: res.tropas_origen_final ?? 1,
          defensorNombre: defensorJ ? this.nombreJugador(defensorJ) : '?',
          defensorColor:  this.jugadorColores[defensorId] ?? '#fff',
          defensorId,
        };
        this.territorioAtacanteId = null;
        if (this.maxTropasMovibles === 1) {
          await this.confirmarMovimientoConquista();
        }
      }
    } finally {
      this.procesandoCombate = false;
      // Si no hubo conquista, el combate terminó acá. Si hubo, el lock se libera
      // en confirmarMovimientoConquista cuando conquistaPendiente se limpia.
      if (!this.conquistaPendiente) {
        this.channelEventos?.send({ type: 'broadcast', event: 'combate_fin', payload: {} });
      }
      this.cdr.markForCheck();
    }
  }

  async confirmarMovimientoConquista() {
    if (!this.conquistaPendiente || this.procesandoConquista) return;
    this.procesandoConquista = true;
    const { origenId, destinoId, defensorNombre, defensorId, tropasOrigenFinal } = this.conquistaPendiente;
    const aMover = Math.max(1, Math.min(this.conquistaTropasAMover, this.maxTropasMovibles));

    try {
      const { data: rpcData, error } = await this.service.moverTropasConquista(
        this.partidaId, origenId, destinoId, aMover
      );
      if (this.showRpcError(error, rpcData, 'Error al mover tropas.')) return;

      // Actualizar localmente sin esperar Realtime. Usa tropasOrigenFinal del RPC (no this.territorios)
      // porque el Realtime de resolver_combate puede no haber llegado aún al momento de este patch.
      const origenEstado  = this.territorios[origenId];
      const destinoEstado = this.territorios[destinoId];
      const localPatch: Record<string, TerritorioEstado> = {};
      if (origenEstado)  localPatch[origenId]  = { ...origenEstado,  tropas: tropasOrigenFinal - aMover };
      if (destinoEstado) localPatch[destinoId] = { ...destinoEstado, tropas: aMover, usuario_id: this.userId };
      if (Object.keys(localPatch).length) {
        this.territorios = { ...this.territorios, ...localPatch };
        this.rebuildMaps();
      }

      this.conquistoEnEsteTurno = true;
      this.ultimoTerritorioConquistadoId = destinoId;

      // Transferir bomba si el territorio conquistado la tenía
      const jugadorConBomba = this.jugadores.find(
        j => j.usuario_id !== this.userId &&
             (j.bomba_territorio === destinoId || j.bomba_territorio_2 === destinoId)
      );
      if (jugadorConBomba) {
        // El defensor pierde esa bomba específica
        const nuevaT1 = jugadorConBomba.bomba_territorio === destinoId ? null : (jugadorConBomba.bomba_territorio ?? null);
        const nuevaT2 = jugadorConBomba.bomba_territorio_2 === destinoId ? null : (jugadorConBomba.bomba_territorio_2 ?? null);
        this.syncBombasJugador(jugadorConBomba.usuario_id, nuevaT1, nuevaT2);
        // Broadcast primero: el defensor y los demás eliminan el ícono inmediatamente
        this.channelEventos?.send({ type: 'broadcast', event: 'bomba_capturada',
          payload: { jugadorId: jugadorConBomba.usuario_id, bomba1: nuevaT1, bomba2: nuevaT2 } });
        // Await garantiza que el DB write se ejecuta
        await this.service.setBombaTerritorios(this.partidaId, jugadorConBomba.usuario_id, nuevaT1, nuevaT2);

        if (this.bombas.length < 2) {
          // El atacante captura la bomba (queda colocada en el territorio conquistado)
          this.bombas = [...this.bombas, destinoId];
          this.saveBombaState();
          this.syncBombasJugador(this.userId, this.bombas[0] ?? null, this.bombas[1] ?? null);
          await this.service.setBombaTerritorios(this.partidaId, this.userId, this.bombas[0] ?? null, this.bombas[1] ?? null);
          this.channelEventos?.send({ type: 'broadcast', event: 'bomba_posicion',
            payload: { jugadorId: this.userId, bomba1: this.bombas[0] ?? null, bomba2: this.bombas[1] ?? null } });
          this.playSfx('assets/KuboTeg/sonidos/alerta-bomba.mp3');
          this.addNotif({ tipo: 'conquista', icono: '☢', linea1: '¡Bomba Atómica capturada!',
            linea2: `La bomba de ${defensorNombre} es tuya`, color: '#fbbf24', ts: Date.now() });
        } else {
          // Ya tiene 2 bombas → la capturada se destruye
          this.addNotif({ tipo: 'conquista', icono: '☢', linea1: 'Bomba enemiga destruida',
            linea2: 'Ya tenés 2 bombas activas', color: '#94a3b8', ts: Date.now() });
        }
      }

      const defensorQuedan = defensorId
        ? Object.values(this.territorios).filter(
            t => t.usuario_id === defensorId && t.territorio_id !== destinoId
          ).length
        : 1;
      const eliminadoId = defensorQuedan === 0 ? defensorId : null;
      this.disolverPactosTerritorio(destinoId, eliminadoId);

      const conquistaData: UltimaConquista = {
        territorioNombre: this.nombreTerritorio(destinoId),
        atacanteNombre:   this.jugadorActualNombre,
        defensorNombre,
        colorAtacante:    this.jugadorColores[this.userId] ?? '#fff',
        ts:               Date.now(),
      };
      this._lastConquistaTs = conquistaData.ts;
      this.mostrarNotifConquista(conquistaData);
      this.channelEventos?.send({ type: 'broadcast', event: 'conquista', payload: conquistaData });

      if (eliminadoId) {
        const eliminadoNombre = this.nombreJugadorById(eliminadoId);
        const tsElim = Date.now();
        this.addNotif({ tipo: 'conquista', icono: '☠', linea1: `${eliminadoNombre} fue eliminado`, linea2: `por ${this.jugadorActualNombre}`, color: '#f87171', ts: tsElim });
        this.playSfx('assets/KuboTeg/sonidos/muerte-jugador.mp3');
        this.channelEventos?.send({
          type: 'broadcast', event: 'jugador_eliminado',
          payload: { jugadorId: eliminadoId, jugadorNombre: eliminadoNombre, eliminadoPorNombre: this.jugadorActualNombre, ts: tsElim },
        });
      }

      this.conquistaPendiente = null;
      this.channelEventos?.send({ type: 'broadcast', event: 'combate_fin', payload: {} });
      this.cdr.markForCheck();

      if (this.verificarVictoriaObjetivo(destinoId, eliminadoId)) {
        await this.declararGanadorPorObjetivo();
      }
    } finally {
      this.procesandoConquista = false;
    }
  }

  async terminarAtaque() {
    if (!this.partida || this.conquistaPendiente || this.procesandoTurno) return;
    this.procesandoTurno = true;
    try {
      this.territorioAtacanteId = null;
      this.iniciarFaseReagrupacion();
      await this.service.setFase(this.partidaId, 'reagrupacion', this.partida.jugador_actual_index!);
    } finally {
      this.procesandoTurno = false;
      this.cdr.markForCheck();
    }
  }

  // ── Inicio de sub-fase de colocación ─────────────────
  iniciarSubFaseColocacion() {
    this.tropasColocadasContinentes = {};
    this.tropasColocadasBase = {};
    this.colocacionConfirmadaEstaRonda = false;
    this._colocacionSnapshot = {};
    this.mostrarAprobacionCobro = false;
    this.aprobacionCobroEnviada = false;
    this._aprobacionesCobro.clear();
    this.continenteColocacionIdx = 0;
    this.modoColocandoBomba = false;
    this.modoUsandoBomba = false;

    // Ronda 1: solo tropas iniciales, sin bonus de continente
    if ((this.partida?.ronda_actual ?? 1) <= 1) {
      this.subFaseColocacion = 'base';
      this.continentesColocacion = [];
      this.cdr.markForCheck();
      return;
    }

    const CONT = CONTINENT_TERRITORIES;
    const entries: typeof this.continentesColocacion = [];

    for (const cb of CONTINENT_BONUSES) {
      const terrs    = CONT[cb.id];
      const ownedIds = terrs.filter(tid => this.territorios[tid]?.usuario_id === this.userId);
      const threshold = Math.floor(terrs.length / 2) + 1;

      if (ownedIds.length === terrs.length) {
        entries.push({
          id: cb.id,
          nombre: this.getNombreContinente(cb.id),
          bonus: cb.bonus,
          colocadas: 0,
          territoriosPermitidos: [...terrs],
          tipo: 'totalidad',
        });
      } else if (ownedIds.length >= threshold && this.jugandoConMayorias) {
        const maj = CONTINENT_MAJORITY.find(m => m.id === cb.id)!;
        entries.push({
          id: cb.id,
          nombre: this.getNombreContinente(cb.id),
          bonus: maj.bonus,
          colocadas: 0,
          territoriosPermitidos: ownedIds,
          tipo: 'mayoria',
        });
      }
    }

    if (entries.length === 0) {
      this.subFaseColocacion = 'base';
      this.continentesColocacion = [];
      this.cdr.markForCheck();
      return;
    }

    this.continentesColocacion = entries;
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

    // Protección contra race condition: Realtime puede haber actualizado origen.tropas
    // entre que el jugador vio el valor y que esta función lo lee.
    const safeMover = Math.min(aMover, origen.tropas - 1);
    if (safeMover <= 0) return;

    const ok1 = await this.updateTerritorio(origenId, { tropas: origen.tropas - safeMover });
    if (!ok1) return;
    const ok2 = await this.updateTerritorio(destinoId, { tropas: destino.tropas + safeMover });
    if (!ok2) {
      await this.updateTerritorio(origenId, { tropas: origen.tropas });
      return;
    }

    this.reagrupacionMovidos[origenId] = (this.reagrupacionMovidos[origenId] ?? 0) + safeMover;
    this.territorioOrigenId    = null;
    this.reagrupacionDestinoId = null;
    this.reagrupacionTropasAMover = 1;
    this.playSfx('assets/KuboTeg/sonidos/movimiento.mp3');
    this.activarHighlightMovilizacion(destinoId);
    this.channelEventos?.send({ type: 'broadcast', event: 'movilizacion_tropa', payload: { origenId, destinoId, jugadorId: this.userId } });
    this.cdr.markForCheck();
  }

  async saltarReagrupacion() {
    if (this.procesandoTurno) return;
    this.territorioOrigenId    = null;
    this.reagrupacionDestinoId = null;
    this.reagrupacionLimites   = {};
    this.reagrupacionMovidos   = {};
    if (this.conquistoEnEsteTurno) {
      await this.robarCarta();
      this.conquistoEnEsteTurno = false;
      this.ultimoTerritorioConquistadoId = null;
    }
    await this.avanzarTurno();
  }

  // ── Cartas ────────────────────────────────────────────
  private async robarCarta() {
    const disponibles = TERRITORIES.map(t => t.id).filter(id => !this.misCartas.includes(id));
    if (!disponibles.length) return;

    const cartaId      = disponibles[Math.floor(Math.random() * disponibles.length)];
    const matchBonus   = cartaId === this.ultimoTerritorioConquistadoId;
    const nuevasCartas = [...this.misCartas, cartaId];
    let bonusCarta: string | null = null;

    if (matchBonus) {
      const restantes = disponibles.filter(id => id !== cartaId);
      if (restantes.length) {
        bonusCarta = restantes[Math.floor(Math.random() * restantes.length)];
        nuevasCartas.push(bonusCarta);
      }
    }

    // +2 tropas inmediatas si el territorio de la carta le pertenece al jugador
    const terrEstado  = this.territorios[cartaId];
    const esMio       = terrEstado?.usuario_id === this.userId;
    const tropasBonus = esMio ? 2 : 0;

    this.misCartas = nuevasCartas;
    this.cartasRobadasTotal++;
    localStorage.setItem(`teg_cartas_total_${this.partidaId}_${this.userId}`, String(this.cartasRobadasTotal));
    if (this.cartasRobadasTotal === this.cartasParaBomba && this.bombas.length < 2 && this.jugandoConBomba) {
      this.bombas = [...this.bombas, null];
      this.saveBombaState();
      this.cartasRobadasTotal = 0;
      localStorage.setItem(`teg_cartas_total_${this.partidaId}_${this.userId}`, '0');
      const numBomba = this.bombas.length;
      this.addNotif({ tipo: 'conquista', icono: '☢', linea1: `¡Bomba Atómica ${numBomba > 1 ? numBomba + ' ' : ''}obtenida!`, linea2: 'Colocala en tu próxima fase de colocación', color: '#fbbf24', ts: Date.now() });
    }
    this.playSfx(esMio
      ? 'assets/KuboTeg/sonidos/acierta-carta.mp3'
      : 'assets/KuboTeg/sonidos/noacierta-carta.mp3');
    if (esMio) {
      this.activarHighlightCartaAcierta(cartaId);
      this.channelEventos?.send({
        type: 'broadcast', event: 'carta_acierta',
        payload: { cartaId, jugadorId: this.userId },
      });
    }
    this.mostrarNotifCarta(cartaId, bonusCarta, tropasBonus);

    await this.service.setCartas(this.partidaId, this.userId, nuevasCartas);

    if (tropasBonus > 0 && terrEstado) {
      const nuevasTropas = terrEstado.tropas + tropasBonus;
      this.territorios = {
        ...this.territorios,
        [cartaId]: { ...terrEstado, tropas: nuevasTropas },
      };
      this.rebuildTropasMap();
      await this.service.updateTerritorioEstado(this.partidaId, cartaId, { tropas: nuevasTropas });
    }

    this.cdr.markForCheck();
  }

  async canjearCartas() {
    if (this.misCartas.length < 3 || this.canjeandoCartas) return;
    this.canjeandoCartas = true;
    const nuevasCartas = this.misCartas.slice(3);
    const miJ = this.jugadores.find(j => j.usuario_id === this.userId);
    const tropasActuales = miJ?.tropas_por_colocar ?? 0;
    await Promise.all([
      this.service.setCartas(this.partidaId, this.userId, nuevasCartas),
      this.service.setTropasPorColocar(this.partidaId, this.userId, tropasActuales + 3),
    ]);
    this.misCartas = nuevasCartas;
    this.canjeandoCartas = false;
    this.cdr.markForCheck();
  }

  private mostrarNotifCarta(cartaId: string, bonusCartaId: string | null, tropasBonus = 0) {
    const nombre      = this.nombreTerritorio(cartaId);
    const bonusNombre = bonusCartaId ? this.nombreTerritorio(bonusCartaId) : null;
    const ts          = Date.now();

    this.addNotif({
      tipo: 'carta', icono: '🃏',
      linea1: nombre, linea2: bonusNombre ?? '',
      color: '#818cf8', ts, bonusNombre, jugador: this.miNombre,
    });
    this.channelEventos?.send({
      type: 'broadcast', event: 'carta_robada',
      payload: { jugadorId: this.userId, jugadorNombre: this.miNombre, cartaNombre: nombre, bonusNombre, ts },
    });

    const terr    = TERRITORIES.find(t => t.id === cartaId);
    const viewBox = terr ? this.pathViewBox(terr.svgPath, 18) : '0 50 1100 550';

    if (this.cartaPopupTimer) clearTimeout(this.cartaPopupTimer);
    this.cartaPopup = {
      nombre,
      bonusNombre,
      tropasBonus,
      svgPath:  terr?.svgPath  ?? '',
      baseFill: terr?.baseFill ?? '#4a90d9',
      viewBox,
    };
    this.cdr.markForCheck();
    this.cartaPopupTimer = setTimeout(() => {
      this.cartaPopup = null;
      this.cdr.markForCheck();
    }, 4000);
  }

  cerrarCartaPopup() {
    if (this.cartaPopupTimer) clearTimeout(this.cartaPopupTimer);
    this.cartaPopup = null;
    this.cdr.markForCheck();
  }

  cerrarObjetivoPopup() {
    this.mostrarObjetivoPopup = false;
    localStorage.setItem(`obj_visto_${this.partidaId}_${this.userId}`, '1');
    this.cdr.markForCheck();
  }

  abrirPopupMiTurno() {
    if (this._popupMiTurnoTimer) clearTimeout(this._popupMiTurnoTimer);
    this.mostrarPopupMiTurno = true;
    this.cdr.markForCheck();
    this._popupMiTurnoTimer = setTimeout(() => {
      this.mostrarPopupMiTurno = false;
      this.cdr.markForCheck();
    }, 3500);
  }

  cerrarPopupMiTurno() {
    if (this._popupMiTurnoTimer) clearTimeout(this._popupMiTurnoTimer);
    this.mostrarPopupMiTurno = false;
    this.cdr.markForCheck();
  }

  abrirModalPostura() {
    const primerJugador = this.enemigos[0];
    if (!primerJugador) return;
    this.modalPostura = {
      jugadorId: primerJugador.usuario_id,
      postura: this.posturas[primerJugador.usuario_id] ?? 'neutral',
    };
    this.cdr.markForCheck();
  }

  async confirmarPostura() {
    if (!this.modalPostura) return;
    const { jugadorId, postura } = this.modalPostura;

    if (postura === 'hostil') {
      const jugadorNombre = this.nombreJugadorById(jugadorId);
      const pactosAfectados = this.pactos.filter(p =>
        (p.jugador1Id === this.userId && p.jugador2Id === jugadorId) ||
        (p.jugador1Id === jugadorId && p.jugador2Id === this.userId)
      ).length;
      const gruposAfectados = this.grupos.filter(g =>
        g.jugadoresIds.includes(this.userId) && g.jugadoresIds.includes(jugadorId)
      ).length;
      this.modalConfirmHostil = { jugadorId, jugadorNombre, pactosAfectados, gruposAfectados };
      this.cdr.markForCheck();
      return;
    }

    const nuevas = { ...this.posturas, [jugadorId]: postura };
    this.modalPostura = null;
    const { error } = await this.service.setPosturas(this.partidaId, this.userId, nuevas);
    if (error) {
      this.toast.show('Error al guardar postura.', 'error');
      return;
    }
    this.posturas = nuevas;
    const miNombre = this.nombreJugadorById(this.userId);
    this.channelEventos?.send({
      type: 'broadcast',
      event: 'postura_declarada',
      payload: { declaranteId: this.userId, receptorId: jugadorId, postura, declaranteNombre: miNombre },
    }).catch(() => {
      this.toast.show('Error al notificar la postura', 'error');
    });
    this.showGameNotif('Postura declarada.', 'ok');
    this.cdr.markForCheck();
  }

  private async aplicarPostura(jugadorId: string, postura: 'amigable' | 'neutral' | 'hostil'): Promise<void> {
    const nuevas = { ...this.posturas, [jugadorId]: postura };
    const { error } = await this.service.setPosturas(this.partidaId, this.userId, nuevas);
    if (error) return;
    this.posturas = nuevas;
    this.channelEventos?.send({
      type: 'broadcast', event: 'postura_declarada',
      payload: { declaranteId: this.userId, receptorId: jugadorId, postura, declaranteNombre: this.nombreJugadorById(this.userId) },
    });
  }

  async confirmarHostilidad() {
    if (!this.modalConfirmHostil || !this.modalPostura) return;
    const { jugadorId } = this.modalPostura;
    const jugadorNombre = this.nombreJugadorById(jugadorId);
    const miNombre = this.nombreJugadorById(this.userId);

    // 1. Guardar postura
    const nuevas = { ...this.posturas, [jugadorId]: 'hostil' as const };
    const { error } = await this.service.setPosturas(this.partidaId, this.userId, nuevas);
    if (error) { this.toast.show('Error al guardar postura.', 'error'); return; }
    this.posturas = nuevas;

    // 2. Romper todos los pactos con ese jugador
    const rondaActual = this.partida?.ronda_actual ?? 0;
    const pactosAfectados = this.pactos.filter(p =>
      (p.jugador1Id === this.userId && p.jugador2Id === jugadorId) ||
      (p.jugador1Id === jugadorId && p.jugador2Id === this.userId)
    );
    if (pactosAfectados.length > 0) {
      this.pactos = this.pactos.map(p =>
        pactosAfectados.some(a => a.id === p.id)
          ? { ...p, estado: 'en_transicion' as const, rondaExpira: rondaActual + 1 }
          : p
      );
      await this.service.setPactos(this.partidaId, this.pactos);
    }

    // 3. Disolver grupos compartidos
    const gruposCompartidos = this.grupos.filter(g =>
      g.jugadoresIds.includes(this.userId) && g.jugadoresIds.includes(jugadorId)
    );
    const gruposDisueltos: { id: string; nombre: string }[] = [];
    for (const g of gruposCompartidos) {
      this.grupos = this.grupos.filter(gr => gr.id !== g.id);
      if (this.chatActivoId === g.id) this.chatActivoId = 'global';
      await this.service.eliminarGrupoChat(g.id);
      gruposDisueltos.push({ id: g.id, nombre: g.nombre });
    }

    // 4. Broadcast hostilidad
    this.channelEventos?.send({
      type: 'broadcast',
      event: 'hostilidad_declarada',
      payload: { declaranteId: this.userId, declaranteNombre: miNombre, receptorId: jugadorId, receptorNombre: jugadorNombre, gruposDisueltos },
    }).catch(() => {
      this.toast.show('Error al notificar la hostilidad', 'error');
    });

    // 5. Notif local en Noticias
    this.addNotif({
      tipo: 'combate', icono: '⚔️',
      linea1: `${miNombre} → ${jugadorNombre}`,
      linea2: 'Declaración de hostilidad',
      color: this.jugadorColores[this.userId] ?? '#ef4444',
      ts: Date.now(),
    });

    this.modalConfirmHostil = null;
    this.modalPostura = null;
    this.showGameNotif(`Declaraste hostilidad hacia ${jugadorNombre}`, 'warn');
    this.cdr.markForCheck();
  }

  onPosturaJugadorChange(jugadorId: string) {
    if (!this.modalPostura) return;
    this.modalPostura.jugadorId = jugadorId;
    this.modalPostura.postura = this.posturas[jugadorId] ?? 'neutral';
  }

  private showGameNotif(msg: string, tipo: 'ok' | 'info' | 'warn' | 'error' = 'info') {
    if (this.gameNotifTimer) clearTimeout(this.gameNotifTimer);
    this.gameNotif = { msg, tipo };
    this.cdr.markForCheck();
    this.gameNotifTimer = setTimeout(() => {
      this.gameNotif = null;
      this.cdr.markForCheck();
    }, 3500);
  }

  // ── Jugadores muertos ─────────────────────────────────
  estaVivo(jugadorId: string): boolean {
    return estaVivoUtil(jugadorId, this.jugadores, this.territorios);
  }

  private siguienteVivoIdx(fromIdx: number, orden: string[]): number {
    return siguienteVivoIdxUtil(fromIdx, orden, this.jugadores, this.territorios);
  }

  private primerVivoDesde(fromIdx: number, orden: string[]): number {
    return primerVivoDesdeUtil(fromIdx, orden, this.jugadores, this.territorios);
  }

  // ── Rotación de turnos ────────────────────────────────
  async avanzarTurno() {
    if (!this.partida || this.procesandoTurno) return;
    this.procesandoTurno = true;
    try {
      const orden    = this.partida.orden_jugadores!;
      const ronda    = this.partida.ronda_actual!;
      const startIdx = this.primerVivoDesde((ronda - 1) % orden.length, orden);
      const nextIdx  = this.siguienteVivoIdx(this.partida.jugador_actual_index!, orden);

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
    // Refrescar territorios antes de calcular bonuses para evitar que datos desactualizados
    // del host produzcan un tropas_por_colocar incorrecto para cada jugador.
    await this.syncTerritorios();
    const orden       = this.partida.orden_jugadores!;
    const rondaActual = this.partida.ronda_actual!;
    const limite      = this.partida.limite_rondas ?? null;
    const newRonda    = rondaActual + 1;
    const newStart    = this.primerVivoDesde((newRonda - 1) % orden.length, orden);

    this.expirarPactos(newRonda);

    if (limite && rondaActual >= limite - 2) {
      await this.acumularTerritoriosRonda();
    }

    if (limite && rondaActual >= limite) {
      await this.resolverFinPorAcumulacion();
      return;
    }

    const divisor = newRonda >= 2 ? 2 : 3;
    await Promise.all(this.jugadores.map(j => {
      if (!this.estaVivo(j.usuario_id)) {
        return this.service.setTropasPorColocar(this.partidaId, j.usuario_id, 0);
      }
      const misTerritorios = Object.values(this.territorios).filter(t => t.usuario_id === j.usuario_id);
      const tropasBase = Math.max(3, Math.floor(misTerritorios.length / divisor));
      const bonus      = this.calcularBonusContinente(j.usuario_id);
      return this.service.setTropasPorColocar(this.partidaId, j.usuario_id, tropasBase + bonus);
    }));

    await this.service.iniciarFaseColocacion(this.partidaId, orden, newRonda, newStart);
  }

  private async acumularTerritoriosRonda() {
    const acumulado: Record<string, number> = { ...(this.partida!.acumulado_territorios ?? {}) };
    for (const j of this.jugadores) {
      const count = Object.values(this.territorios).filter(t => t.usuario_id === j.usuario_id).length;
      acumulado[j.usuario_id] = (acumulado[j.usuario_id] ?? 0) + count;
    }
    await this.service.updateAcumuladoTerritorios(this.partidaId, acumulado);
  }

  private async resolverFinPorAcumulacion() {
    const acumulado = this.partida!.acumulado_territorios ?? {};
    const jugadoresActivos = this.jugadores.filter(j => j.esta_dentro);

    const ganador = [...jugadoresActivos].sort((a, b) => {
      const diffAcum = (acumulado[b.usuario_id] ?? 0) - (acumulado[a.usuario_id] ?? 0);
      if (diffAcum !== 0) return diffAcum;
      const tropas = (uid: string) => Object.values(this.territorios)
        .filter(t => t.usuario_id === uid).reduce((s, t) => s + t.tropas, 0);
      return tropas(b.usuario_id) - tropas(a.usuario_id);
    })[0];

    if (ganador) {
      await this.service.declararGanadorAcumulacion(this.partidaId, ganador.usuario_id);
    }
  }

  get esFaseAcumulacion(): boolean {
    const limite = this.partida?.limite_rondas;
    const ronda  = this.partida?.ronda_actual ?? 0;
    return !!limite && ronda >= limite - 2;
  }

  get rankingAcumulacion(): { jugador: PartidaJugador; total: number }[] {
    const acum = this.partida?.acumulado_territorios;
    if (!acum || !Object.keys(acum).length) return [];
    return [...this.jugadores]
      .map(j => ({ jugador: j, total: acum[j.usuario_id] ?? 0 }))
      .sort((a, b) => b.total - a.total);
  }

  private calcularBonusContinente(userId: string): number {
    return calcBonusContinente(this.territorios, userId, this.jugandoConMayorias);
  }

  async declararseGanador() {
    if (this.declarando) return;
    this.declarando = true;
    const { data: rpcData, error } = await this.service.declararGanador(this.partidaId);
    this.showRpcError(error, rpcData, 'No se pudo declarar ganador.');
    this.declarando = false;
    this.cdr.markForCheck();
  }

  // ── Helpers ───────────────────────────────────────────

  // ── Pactos ────────────────────────────────────────────

  get enemigos(): PartidaJugador[] {
    return this.jugadores.filter(j => j.usuario_id !== this.userId && j.esta_dentro);
  }

  territoriosDe(userId: string): TerritorioEstado[] {
    return Object.values(this.territorios)
      .filter(t => t.usuario_id === userId)
      .sort((a, b) => this.nombreTerritorio(a.territorio_id).localeCompare(this.nombreTerritorio(b.territorio_id)));
  }

  pactosActivos(): Pacto[] {
    return pactosActivos(this.pactos, this.partida?.ronda_actual ?? 0);
  }

  get todosLosTerrsEnPacto(): string[] {
    const ids = new Set<string>();
    for (const p of this.pactosActivos().filter(p => p.estado !== 'en_transicion')) {
      (p.territoriosId1 ?? (p.territorioId1 ? [p.territorioId1] : [])).forEach(id => ids.add(id));
      (p.territoriosId2 ?? (p.territorioId2 ? [p.territorioId2] : [])).forEach(id => ids.add(id));
    }
    return [...ids];
  }

  get todosLosTerrsEnPactoRoto(): string[] {
    const ids = new Set<string>();
    for (const p of this.pactosActivos().filter(p => p.estado === 'en_transicion')) {
      (p.territoriosId1 ?? (p.territorioId1 ? [p.territorioId1] : [])).forEach(id => ids.add(id));
      (p.territoriosId2 ?? (p.territorioId2 ? [p.territorioId2] : [])).forEach(id => ids.add(id));
    }
    return [...ids];
  }

  get misPactosActivos(): Pacto[] {
    return this.pactosActivos().filter(p => p.jugador1Id === this.userId || p.jugador2Id === this.userId);
  }

  get todasPosturasVacias(): boolean {
    return this.jugadores.every(j => !j.posturas || Object.keys(j.posturas).length === 0);
  }

  private hayHostilidadEntre(idA: string, idB: string): boolean {
    return hayHostilidadEntreUtil(idA, idB, this.userId, this.posturas, this.jugadores);
  }

  private countPactosJugador(userId: string): number {
    return countPactosJugador(userId, pactosActivos(this.pactos, this.partida?.ronda_actual ?? 0));
  }

  pactosRompibles(): Pacto[] {
    return pactosRompibles(this.pactos, this.partida?.ronda_actual ?? 0);
  }

  esPactoEnTransicion(p: Pacto): boolean {
    const ronda = this.partida?.ronda_actual ?? 0;
    return p.estado === 'en_transicion' || p.rondaExpira === ronda;
  }

  esAcuerdoRoto(p: Pacto): boolean { return p.estado === 'en_transicion'; }

  esEnRevisionNatural(p: Pacto): boolean {
    const ronda = this.partida?.ronda_actual ?? 0;
    return p.estado !== 'en_transicion' && p.rondaExpira === ronda;
  }

  contraParteId(pacto: Pacto): string {
    return pacto.jugador1Id === this.userId ? pacto.jugador2Id : pacto.jugador1Id;
  }

  nombreJugadorById(uid: string): string {
    const j = this.jugadores.find(x => x.usuario_id === uid);
    return j ? this.nombreJugador(j) : uid.slice(0, 6) + '…';
  }

  private tieneNoAgresion(tId1: string, tId2: string): boolean {
    return tieneNoAgresionUtil(this.pactos, this.partida?.ronda_actual ?? 0, tId1, tId2);
  }

  private puedoAtacar(origenId: string, destinoId: string): boolean {
    const defensorId = this.territorios[destinoId]?.usuario_id ?? '';
    if (!defensorId) return true;
    if (this.tieneNoAgresion(origenId, destinoId)) return false;
    return true;
  }

  private disolverPactosTerritorio(territorioId: string, jugadorEliminadoId?: string | null) {
    const filtrados = disolverPactosUtil(this.pactos, territorioId, jugadorEliminadoId);
    if (filtrados.length < this.pactos.length) {
      this.pactos = filtrados;
      this.service.setPactos(this.partidaId, this.pactos);
    }
  }

  private expirarPactos(rondaActual: number) {
    const vigentes = expirarPactosUtil(this.pactos, rondaActual);
    if (vigentes.length < this.pactos.length) {
      this.pactos = vigentes;
      this.service.setPactos(this.partidaId, this.pactos);
    }
  }

  abrirRomperPacto() {
    if (this.pactosRompibles().length === 0) {
      this.showGameNotif('No tenés pactos activos para romper.', 'info');
      return;
    }
    this.modalRomperPacto = true;
    this.cdr.markForCheck();
  }

  async romperPacto(pactoId: string) {
    const rondaActual = this.partida?.ronda_actual ?? 0;
    const pacto = this.pactos.find(p => p.id === pactoId);
    this.pactos = this.pactos.map(p =>
      p.id === pactoId
        ? { ...p, estado: 'en_transicion' as const, rondaExpira: rondaActual + 1 }
        : p
    );
    await this.service.setPactos(this.partidaId, this.pactos);

    if (pacto) {
      const otroId = pacto.jugador1Id === this.userId ? pacto.jugador2Id : pacto.jugador1Id;
      const otroNombre = this.nombreJugadorById(otroId);
      const label = 'No agresión';
      const ts = Date.now();
      this.addNotif({ tipo: 'pacto', icono: '💔', linea1: `Ruptura: ${this.jugadorActualNombre} & ${otroNombre}`, linea2: `${label} rota`, color: '#ef4444', ts });
      this.channelEventos?.send({
        type: 'broadcast', event: 'pacto_roto',
        payload: { rompedorId: this.userId, rompedorNombre: this.jugadorActualNombre, afectadoId: otroId, afectadoNombre: otroNombre, tipo: pacto.tipo, ts },
      });
    }

    this.playSfx('assets/KuboTeg/sonidos/ruptura-pacto.mp3');
    if (this.pactosRompibles().length === 0) this.modalRomperPacto = false;
    this.cdr.markForCheck();
  }

  abrirPropuestaCompleta() {
    if (this.propuestaSaliente) {
      this.showGameNotif('Ya tenés una propuesta pendiente de respuesta.', 'info');
      return;
    }
    this.pactoTerrsPropios = [];
    this.pactoTerrsAjenos = [];
    this.pactoReceptorId = null;
    this.modoPacto = 'propio';
    this.cdr.markForCheck();
  }

  cancelarModoPacto() {
    this.modoPacto = null;
    this.pactoTerrsPropios = [];
    this.pactoTerrsAjenos = [];
    this.pactoReceptorId = null;
    this.cdr.markForCheck();
  }


  avanzarFasePacto() {
    if (this.modoPacto !== 'propio' || this.pactoTerrsPropios.length === 0) return;
    this.modoPacto = 'ajeno';
    this.cdr.markForCheck();
  }

  confirmarPactoMapa() {
    if (this.propuestaSaliente) return;
    const receptorId = this.pactoReceptorId;
    if (!receptorId) { this.showGameNotif('Seleccioná un jugador.', 'info'); return; }
    if (this.pactoTerrsPropios.length === 0 || this.pactoTerrsAjenos.length === 0) {
      this.showGameNotif('Seleccioná territorios de ambos lados.', 'info'); return;
    }
    if (this.countPactosJugador(this.userId) >= 4) {
      this.showGameNotif('Ya tenés 4 tratados activos. No podés proponer otro.', 'error'); return;
    }
    const nombreReceptor = this.nombreJugadorById(receptorId);
    if (this.countPactosJugador(receptorId) >= 4) {
      this.showGameNotif(`${nombreReceptor} ya tiene 4 tratados. No puede recibir otro.`, 'error'); return;
    }
    if (this.hayHostilidadEntre(this.userId, receptorId)) {
      this.showGameNotif(`No podés proponer un tratado a ${nombreReceptor}: hay una declaración de hostilidad.`, 'error'); return;
    }

    const propuesta: PropuestaPacto = {
      id: crypto.randomUUID(),
      tipo: 'no_agresion', proponenteId: this.userId, receptorId,
      territoriosId1: [...this.pactoTerrsPropios],
      territorioId1:  this.pactoTerrsPropios[0],
      territorioId2:  this.pactoTerrsAjenos[0],
      territoriosId2: [...this.pactoTerrsAjenos],
      ts: Date.now(),
    };
    this.propuestaSaliente = propuesta;
    this.cancelarModoPacto();
    this.channelEventos?.send({ type: 'broadcast', event: 'pacto_propuesta', payload: propuesta }).catch(() => {
      this.toast.show('Error al enviar la propuesta', 'error');
    });
    this.cdr.markForCheck();
    if (propuesta.receptorId === BOT_USER_ID) {
      void this.botResponderPacto(propuesta);
    }
  }

  handlePactoClickPropio(id: string) {
    if (this.territorios[id]?.usuario_id !== this.userId) return;
    const idx = this.pactoTerrsPropios.indexOf(id);
    if (idx >= 0) {
      const sinEste = this.pactoTerrsPropios.filter((_, i) => i !== idx);
      if (sinEste.length > 0 && !this.esSeleccionContigua(sinEste)) return;
      this.pactoTerrsPropios = sinEste;
    } else {
      if (this.pactoTerrsPropios.length === 0 || this.esAdyacenteASeleccion(id, this.pactoTerrsPropios)) {
        this.pactoTerrsPropios = [...this.pactoTerrsPropios, id];
      }
    }
    this.cdr.markForCheck();
  }

  handlePactoClickAjeno(id: string) {
    const owner = this.territorios[id]?.usuario_id;
    if (!owner || owner === this.userId) return;
    if (!this.calcPactoDisponiblesAjenos().includes(id)) return;
    if (this.pactoReceptorId && owner !== this.pactoReceptorId) {
      this.showGameNotif('Los territorios deben pertenecer al mismo jugador.', 'info'); return;
    }
    const idx = this.pactoTerrsAjenos.indexOf(id);
    if (idx >= 0) {
      this.pactoTerrsAjenos = this.pactoTerrsAjenos.filter((_, i) => i !== idx);
      if (this.pactoTerrsAjenos.length === 0) this.pactoReceptorId = null;
    } else {
      this.pactoTerrsAjenos = [...this.pactoTerrsAjenos, id];
      this.pactoReceptorId = owner;
    }
    this.cdr.markForCheck();
  }

  private esAdyacenteASeleccion(id: string, seleccion: string[]): boolean {
    return esAdyacenteASeleccion(id, seleccion);
  }

  private esSeleccionContigua(seleccion: string[]): boolean {
    return esSeleccionContigua(seleccion);
  }

  private calcPactoDisponiblesPropio(): string[] {
    const misTerrs = new Set(this.territoriosDe(this.userId).map(t => t.territorio_id));
    return calcPactoPropio(this.pactoTerrsPropios, misTerrs);
  }

  private calcPactoDisponiblesAjenos(): string[] {
    return calcPactoAjenos(this.pactoTerrsPropios, this.pactoTerrsAjenos, this.pactoReceptorId, this.territorios, this.userId);
  }

  get hayPactosEnRevision(): boolean {
    return this.misPactosActivos.some(p => this.esPactoEnTransicion(p) || this.esAcuerdoRoto(p));
  }

  propuestaNoCubiertos(): string[] {
    const p = this.propuestaEntrante;
    if (!p || p.tipo !== 'no_agresion') return [];
    const terrsId1 = p.territoriosId1?.length ? p.territoriosId1 : (p.territorioId1 ? [p.territorioId1] : []);
    const terrsId2 = p.territoriosId2?.length ? p.territoriosId2 : (p.territorioId2 ? [p.territorioId2] : []);
    if (!terrsId1.length) return [];
    const otroJugadorId = this.territorios[terrsId1[0]]?.usuario_id === p.proponenteId ? this.userId : p.proponenteId;
    const otroTerrIds = this.territoriosDe(otroJugadorId).map(t => t.territorio_id);
    const vecinosDePropios = new Set(terrsId1.flatMap(t1 => TERRITORIES.find(t => t.id === t1)?.neighbors ?? []));
    return [...vecinosDePropios]
      .filter(v => otroTerrIds.includes(v) && !terrsId2.includes(v))
      .map(id => this.nombreTerritorio(id));
  }

  async aceptarPropuesta() {
    if (!this.propuestaEntrante) return;
    const p = this.propuestaEntrante;
    const rondaActual = this.partida?.ronda_actual ?? 1;

    const rechazarPorLimite = (msg: string) => {
      this.showGameNotif(msg, 'error');
      this.propuestaEntrante = null;
      this.channelEventos?.send({ type: 'broadcast', event: 'pacto_respuesta', payload: { id: p.id, accepted: false } });
      this.cdr.markForCheck();
    };
    if (this.countPactosJugador(this.userId) >= 2) {
      rechazarPorLimite('Ya tenés 2 tratados activos o en ruptura. No podés aceptar otro.');
      return;
    }
    if (this.countPactosJugador(p.proponenteId) >= 2) {
      rechazarPorLimite(`${this.nombreJugadorById(p.proponenteId)} ya tiene 2 tratados. El tratado no puede establecerse.`);
      return;
    }
    if (this.hayHostilidadEntre(this.userId, p.proponenteId)) {
      rechazarPorLimite(`No podés aceptar este tratado: existe una declaración de hostilidad con ${this.nombreJugadorById(p.proponenteId)}.`);
      return;
    }

    const nuevoPacto: Pacto = {
      id: p.id, tipo: 'no_agresion',
      jugador1Id: p.proponenteId, jugador2Id: p.receptorId,
      territoriosId1: p.territoriosId1,
      territorioId1: p.territorioId1,
      territorioId2: p.territorioId2,
      territoriosId2: p.territoriosId2,
      rondaInicio: rondaActual, rondaExpira: 999999,
    };
    this.pactos = [...this.pactos, nuevoPacto];
    this.propuestaEntrante = null;
    this.channelEventos?.send({
      type: 'broadcast', event: 'pacto_respuesta',
      payload: { id: p.id, accepted: true, pacto: nuevoPacto },
    });
    const nuevoPayload = {
      jugador1Nombre: this.nombreJugadorById(p.proponenteId),
      jugador2Nombre: this.nombreJugadorById(p.receptorId),
      tipo: 'no_agresion' as const, color: this.jugadorColores[p.proponenteId] ?? '#94a3b8',
      ts: Date.now(), esRenovacion: false,
    };
    this.pushNotifPacto(nuevoPayload.jugador1Nombre, nuevoPayload.jugador2Nombre, 'no_agresion', nuevoPayload.color, false, nuevoPayload.ts);
    this.channelEventos?.send({ type: 'broadcast', event: 'pacto_aceptado', payload: nuevoPayload });
    await this.service.setPactos(this.partidaId, this.pactos);
    void this.aplicarPostura(p.proponenteId, 'amigable');
    this.playSfx('assets/KuboTeg/sonidos/pacto.mp3');
    this.cdr.markForCheck();
  }

  rechazarPropuesta() {
    if (!this.propuestaEntrante) return;
    const id = this.propuestaEntrante.id;
    this.propuestaEntrante = null;
    this.channelEventos?.send({
      type: 'broadcast', event: 'pacto_respuesta',
      payload: { id, accepted: false },
    });
    this.cdr.markForCheck();
  }

  private async botResponderPacto(p: PropuestaPacto): Promise<void> {
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));

    const botTerrs           = Object.values(this.territorios).filter(t => t.usuario_id === BOT_USER_ID).length;
    const humTerrs           = Object.values(this.territorios).filter(t => t.usuario_id === p.proponenteId).length;
    const limiteBotAlcanzado = this.countPactosJugador(BOT_USER_ID) >= 2;
    const accepted           = !limiteBotAlcanzado && botTerrs < humTerrs;

    if (!accepted) {
      this.channelEventos?.send({ type: 'broadcast', event: 'pacto_respuesta', payload: { id: p.id, accepted: false } });
      this.cdr.markForCheck();
      return;
    }

    const rondaActual = this.partida?.ronda_actual ?? 1;
    const nuevoPacto: Pacto = {
      id: p.id, tipo: 'no_agresion',
      jugador1Id: p.proponenteId, jugador2Id: BOT_USER_ID,
      territoriosId1: p.territoriosId1,
      territorioId1: p.territorioId1, territorioId2: p.territorioId2, territoriosId2: p.territoriosId2,
      rondaInicio: rondaActual, rondaExpira: 999999,
    };
    this.pactos = [...this.pactos, nuevoPacto];
    this.channelEventos?.send({
      type: 'broadcast', event: 'pacto_respuesta',
      payload: { id: p.id, accepted: true, pacto: nuevoPacto },
    });
    const nuevoPayload = {
      jugador1Nombre: this.nombreJugadorById(p.proponenteId), jugador2Nombre: 'IA Bot',
      tipo: 'no_agresion' as const, color: this.jugadorColores[p.proponenteId] ?? '#94a3b8',
      ts: Date.now(), esRenovacion: false,
    };
    this.pushNotifPacto(nuevoPayload.jugador1Nombre, nuevoPayload.jugador2Nombre, 'no_agresion', nuevoPayload.color, false, nuevoPayload.ts);
    this.channelEventos?.send({ type: 'broadcast', event: 'pacto_aceptado', payload: nuevoPayload });
    await this.service.setPactos(this.partidaId, this.pactos);
    this.playSfx('assets/KuboTeg/sonidos/pacto.mp3');
    this.cdr.markForCheck();
  }

  private showRpcError(supaError: unknown, data: unknown, fallback: string): boolean {
    const msg = supaError ? fallback : ((data as RpcError)?.error ?? null);
    if (msg) { this.toast.show(msg, 'error'); return true; }
    return false;
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

  cartaTerritory(id: string): { path: string; fill: string; viewBox: string } | null {
    const t = TERRITORIES.find(t => t.id === id);
    if (!t) return null;
    return { path: t.svgPath, fill: t.baseFill, viewBox: this.pathViewBox(t.svgPath, 10) };
  }

  colorRgba(hex: string, alpha: number): string {
    if (!hex) return `rgba(148,163,184,${alpha})`;
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  nombresTerritorio(ids: string[]): string {
    return ids.map(id => this.nombreTerritorio(id)).join(', ');
  }

  pathViewBox(d: string, padding = 16): string {
    const xs: number[] = [];
    const ys: number[] = [];
    let cx = 0, cy = 0;

    const segRe = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;
    let m: RegExpExecArray | null;

    while ((m = segRe.exec(d)) !== null) {
      const cmd  = m[1];
      const nums = (m[2].match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) ?? []).map(Number);

      const pushXY = (i: number) => { xs.push(nums[i]); ys.push(nums[i + 1]); };

      switch (cmd) {
        case 'M': case 'L':
          for (let i = 0; i + 1 < nums.length; i += 2) { pushXY(i); cx = nums[i]; cy = nums[i + 1]; }
          break;
        case 'C':
          for (let i = 0; i + 5 < nums.length; i += 6) {
            pushXY(i); pushXY(i + 2); pushXY(i + 4);
            cx = nums[i + 4]; cy = nums[i + 5];
          }
          break;
        case 'S':
          for (let i = 0; i + 3 < nums.length; i += 4) {
            pushXY(i); pushXY(i + 2);
            cx = nums[i + 2]; cy = nums[i + 3];
          }
          break;
        case 'Q':
          for (let i = 0; i + 3 < nums.length; i += 4) {
            pushXY(i); pushXY(i + 2);
            cx = nums[i + 2]; cy = nums[i + 3];
          }
          break;
        case 'T':
          for (let i = 0; i + 1 < nums.length; i += 2) { pushXY(i); cx = nums[i]; cy = nums[i + 1]; }
          break;
        case 'H':
          nums.forEach(x => { xs.push(x); ys.push(cy); cx = x; });
          break;
        case 'V':
          nums.forEach(y => { xs.push(cx); ys.push(y); cy = y; });
          break;
      }
    }

    if (!xs.length) return '0 50 1100 550';

    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding;
    const w    = Math.max(...xs) - Math.min(...xs) + padding * 2;
    const h    = Math.max(...ys) - Math.min(...ys) + padding * 2;

    return `${minX} ${minY} ${w} ${h}`;
  }

  getLiderImgByUserId(userId: string): string {
    const nombre = this.jugadorLideres[userId];
    if (!nombre) return '';
    const lider = this.lideres.find(l => l.nombre === nombre);
    return lider ? this.getLiderImgPath(lider) : '';
  }

  private validarImgPath(p: string): string {
    if (!p.startsWith('/assets/') && !p.startsWith('assets/')) return '';
    // Rutas de líderes vienen de la BD con .png — servir siempre el .webp convertido
    const webp = p.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    return encodeURI(webp);
  }

  getLiderImgPath(l: Lider): string {
    return this.validarImgPath(l.img_neutra ?? '');
  }

  private getLiderImgByNombre(nombre: string): string {
    const lider = this.lideres.find(l => l.nombre === nombre);
    return lider ? this.getLiderImgPath(lider) : '';
  }

  getLiderImgActiva(l: Lider): string {
    const usarAmigable = this.liderHovered === l.nombre || this.liderPreseleccionado === l.nombre;
    return this.validarImgPath(usarAmigable ? (l.img_amigable ?? l.img_neutra ?? '') : (l.img_neutra ?? ''));
  }

  onImgError(nombre: string) {
    this.failedLiderImgs.add(nombre);
    this.cdr.markForCheck();
  }

  estaColorOcupado(hex: string): boolean {
    return this.coloresOcupados.has(hex);
  }

  private playSfx(path: string) { this.audioSvc.playSfx(path); }

  reproducirSeleccion() { this.playSfx('assets/KuboTeg/sonidos/seleccion.mp3'); }

  preseleccionarColor(hex: string) {
    this.colorPreseleccionado = hex;
    this.playSfx('assets/KuboTeg/sonidos/confirma-seleccion.mp3');
  }
  preseleccionarLider(id: string) {
    this.liderPreseleccionado = id;
    this.playSfx('assets/KuboTeg/sonidos/confirma-seleccion.mp3');
  }

  seleccionarLiderAleatorio() {
    const disponibles = this.lideres.filter(l => !this.lideresOcupados.has(l.nombre));
    if (!disponibles.length) return;
    const l = disponibles[Math.floor(Math.random() * disponibles.length)];
    this.preseleccionarLider(l.nombre);
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
      this.rebuildJugadores();
      this.colorPreseleccionado = null;
      this.avanzandoALider = false;
      this.showGameNotif('Ese color fue tomado. Elegí otro.', 'warn');
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
      this.rebuildJugadores();
      this.colorPreseleccionado = null;
      this.liderPreseleccionado = null;
      this.pasoModal = 'color';
      this.showGameNotif('Ese color fue tomado por otro jugador. Elegí otro.', 'warn');
      this.cdr.markForCheck();
      return;
    }

    if (liderTomado) {
      this.jugadores = frescos ?? [];
      this.rebuildJugadores();
      this.liderPreseleccionado = null;
      this.pasoModal = 'lider';
      this.showGameNotif('Ese líder fue elegido por otro jugador. Elegí otro.', 'warn');
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

  private rebuildMaps() {
    this.rebuildOwnerMap();
    this.rebuildTropasMap();
  }

  private rebuildJugadores() {
    this.buildJugadorColores();
    this.buildJugadorLideres();
    this.rebuildJugadorNombres();
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
      const localPending = cont + base;
      map[t.territorio_id] = localPending > 0
        ? t.tropas + localPending
        : (this._tropasPreviewMap[t.territorio_id] ?? t.tropas);
    });
    this._tropasMap = map;
  }

  private rebuildJugadorNombres() {
    const map: Record<string, string> = {};
    for (const j of this.jugadores) map[j.usuario_id] = this.nombreJugador(j);
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
    const ocupados = new Set<string>();
    for (const j of this.jugadores) {
      if (j.lider) {
        this.jugadorLideres[j.usuario_id] = j.lider;
        if (j.usuario_id !== this.userId) ocupados.add(j.lider);
      }
    }
    this.lideresOcupados = ocupados;
    if (!this.jugadorLideres[this.userId]) {
      const local = localStorage.getItem(`mat-lider-${this.partidaId}-${this.userId}`);
      if (local) this.jugadorLideres[this.userId] = local;
    }
  }

  private randomShuffle<T>(arr: T[]): T[] {
    return randomShuffleUtil(arr);
  }

  private seededShuffle<T>(arr: T[], seed: string): T[] {
    return seededShuffleUtil(arr, seed);
  }

  private async updateTerritorio(
    territorioId: string,
    data: Partial<Pick<TerritorioEstado, 'usuario_id' | 'tropas'>>
  ): Promise<boolean> {
    const { error } = await this.service.updateTerritorioEstado(this.partidaId, territorioId, data);
    if (error) { this.toast.show('Error al actualizar territorio.', 'error'); return false; }
    const existing = this.territorios[territorioId];
    if (existing) {
      this.territorios = { ...this.territorios, [territorioId]: { ...existing, ...data } };
      this.rebuildMaps();
    }
    return true;
  }

  async abrirHistorial(): Promise<void> {
    this.mostrarHistorial = true;
    this.cargandoHistorial = true;
    this.cdr.markForCheck();
    const currentIds = new Set(this.jugadores.map(j => j.usuario_id));
    const { data, error } = await this.service.getDedicatorias();
    if (error || !data) { this.cargandoHistorial = false; this.cdr.markForCheck(); return; }
    this.historialDedicatorias = (data as Dedicatoria[]).filter(d => {
      const ids: string[] = d.jugadores.map(j => j.usuario_id).filter(Boolean);
      if (ids.length !== currentIds.size) return false;
      return ids.every(id => currentIds.has(id));
    });
    this.cargandoHistorial = false;
    this.cdr.markForCheck();
  }

  get historialRanking(): { nombre: string; victorias: number }[] {
    const conteo: Record<string, number> = {};
    for (const j of this.jugadores) conteo[this.nombreJugador(j)] = 0;
    for (const d of this.historialDedicatorias) {
      const n = d.ganador_nombre;
      conteo[n] = (conteo[n] ?? 0) + 1;
    }
    return Object.entries(conteo)
      .map(([nombre, victorias]) => ({ nombre, victorias }))
      .sort((a, b) => b.victorias - a.victorias);
  }

  formatearFecha(iso: string): string {
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }

  get fechaPartidaFormateada(): string {
    const s = this.partida?.created_at;
    if (!s) return '';
    const [y, m, d] = s.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }

  abrirDedicatoria() {
    // Si ya había texto guardado lo deja para que pueda modificarse
    if (!this.dedicatoriaGuardada) this.dedicatoriaTexto = '';
    this.mostrarModalDedicatoria = true;
  }

  private detectarTipoVictoria(): 'objetivo' | 'limite_rondas' | 'rendicion' {
    if (this.jugadores.some(j => j.rendido && j.usuario_id !== this.userId)) return 'rendicion';
    const ronda  = this.partida?.ronda_actual ?? 0;
    const limite = this.partida?.limite_rondas ?? null;
    if (limite && ronda >= limite) return 'limite_rondas';
    return 'objetivo';
  }

  async guardarDedicatoria(): Promise<void> {
    const texto = this.dedicatoriaTexto.trim();
    if (!texto || !this.partida || !this.userId || this.guardandoDedicatoria) return;
    this.guardandoDedicatoria = true;
    const ganadorJ = this.jugadores.find(j => j.usuario_id === this.userId) ?? null;
    const jugadoresData = this.jugadores.map(j => ({
      usuario_id: j.usuario_id,
      nombre: this.nombreJugador(j),
      color:  this.jugadorColores[j.usuario_id] ?? '',
      lider:  this.jugadorLideres[j.usuario_id] ?? null,
    }));
    const inicioMs    = new Date(this.partida.created_at).getTime();
    const duracionMin = Math.round((Date.now() - inicioMs) / 60000);
    const { error } = await this.service.insertDedicatoria({
      partida_id:       this.partida.id,
      nombre_partida:   this.partida.nombre,
      fecha_partida:    this.partida.created_at,
      jugadores:        jugadoresData,
      ganador_id:       this.userId,
      ganador_nombre:   this.nombreJugador(ganadorJ),
      ganador_lider:    this.jugadorLideres[this.userId] ?? null,
      dedicatoria:      texto,
      rondas_jugadas:   this.partida.ronda_actual ?? null,
      rondas_limite:    this.partida.limite_rondas ?? null,
      duracion_minutos: duracionMin,
      tipo_victoria:    this.detectarTipoVictoria(),
    });
    this.guardandoDedicatoria = false;
    if (error) { this.showGameNotif('Error al guardar la dedicatoria', 'error'); return; }
    this.dedicatoriaGuardada = true;
    this.mostrarModalDedicatoria = false;
    this.cdr.markForCheck();
    // Publicar la dedicatoria como mensaje en el chat global
    await this.onChatSendFin(`✍ ${texto}`);
  }

  abrirModalRendicion(): void {
    this.mostrarModalRendicion = true;
  }

  cancelarRendicion(): void {
    this.mostrarModalRendicion = false;
  }

  async ejecutarRendicion(): Promise<void> {
    this.mostrarModalRendicion = false;
    const { error } = await this.service.rendirJugador(this.partidaId, this.userId);
    if (error) { this.showGameNotif('Error al rendirse', 'error'); return; }
    // Actualización optimista local (Realtime lo confirma luego)
    const idx = this.jugadores.findIndex(j => j.usuario_id === this.userId);
    if (idx !== -1) {
      this.jugadores = [
        ...this.jugadores.slice(0, idx),
        { ...this.jugadores[idx], rendido: true },
        ...this.jugadores.slice(idx + 1),
      ];
    }
    this.mostrarPopupRendicion = true;
    this.addNotif({ tipo: 'conquista', icono: '🏳', linea1: `${this.miNombre} se rindió`, linea2: 'abandonó la partida', color: '#94a3b8', ts: Date.now() });
    await this.verificarVictoriaPorRendicion();
    if (this.esMiTurno) await this.avanzarTurno();
    this.cdr.markForCheck();
  }

  private async verificarVictoriaPorRendicion(): Promise<void> {
    if (this.partida?.ganador_id) return;
    const { data: jugadoresDb } = await this.service.getPartidaJugadores(this.partidaId);
    if (!jugadoresDb) return;
    const territoriosMap = Object.values(this.territorios);
    const humanosConTerritorios = jugadoresDb.filter(j =>
      j.usuario_id !== BOT_USER_ID &&
      territoriosMap.some(t => t.usuario_id === j.usuario_id)
    );
    const noRendidos = humanosConTerritorios.filter(j => !j.rendido);
    if (noRendidos.length === 1) {
      await this.service.declararGanadorAcumulacion(this.partidaId, noRendidos[0].usuario_id);
    }
  }

  volver() { this.router.navigate(['/kuboteg']); }

  async repararMapa() {
    await this.syncTerritorios();
    this.mapRef?.refresh();
    this.toast.show('Mapa actualizado', 'success');
  }

  // ── Chat ──────────────────────────────────────────────
  get miNombre(): string {
    return this.jugadorNombres[this.userId] || 'Yo';
  }

  get chatMensajesGlobales(): ChatMensaje[] {
    return this.chatMensajes.filter(m => !m.grupoId);
  }

  get objetivosRevelados() {
    return this.jugadores
      .filter(j => j.objetivo && j.usuario_id !== BOT_USER_ID)
      .map(j => ({
        nombre:      this.nombreJugador(j),
        color:       this.jugadorColores[j.usuario_id] ?? '#94a3b8',
        descripcion: this.describirObjetivo(j.objetivo as ObjetivoSecreto),
        esGanador:   j.usuario_id === this.partida?.ganador_id,
        esMio:       j.usuario_id === this.userId,
      }));
  }

  private describirObjetivo(obj: ObjetivoSecreto): string {
    if (obj.tipo === 'continentes') {
      return `Totalidad de ${obj.ids.map(id => this.getNombreContinente(id)).join(' y ')}`;
    }
    if (obj.tipo === 'destruir') {
      const targetJ = this.jugadores.find(j => j.color === obj.color);
      const targetName = targetJ ? this.nombreJugador(targetJ) : obj.color;
      if (obj.fallback) {
        return `Conquistar 24 territorios (orig.: destruir a ${targetName})`;
      }
      return `Destruir a ${targetName}`;
    }
    if (obj.tipo === 'tres_mayorias') {
      return `Mayoría en ${obj.ids.map(id => this.getNombreContinente(id)).join(', ')}`;
    }
    if (obj.tipo === 'cuatro_mayorias') {
      return 'Conquistar 4 mayorías cualesquiera';
    }
    return '—';
  }

  async onChatSendFin(texto: string) {
    if (!this.channelChat) return;
    const msg: ChatMensaje = {
      userId: this.userId,
      nombre: this.miNombre,
      texto,
      color: this.jugadorColores[this.userId] ?? '#ffffff',
      ts: Date.now(),
    };
    this.chatMensajes = [...this.chatMensajes, msg];
    try {
      await this.channelChat.send({ type: 'broadcast', event: 'chat', payload: msg });
    } catch {
      this.toast.show('Error al enviar el mensaje', 'error');
    }
  }

  async onChatSend(texto: string) {
    if (!this.channelChat) return;
    const msg: ChatMensaje = {
      userId: this.userId,
      nombre: this.miNombre,
      texto,
      color: this.jugadorColores[this.userId] ?? '#ffffff',
      ts: Date.now(),
      ...(this.chatActivoId !== 'global' ? { grupoId: this.chatActivoId } : {}),
    };
    this.chatMensajes = [...this.chatMensajes, msg];
    try {
      await this.channelChat.send({ type: 'broadcast', event: 'chat', payload: msg });
    } catch {
      this.toast.show('Error al enviar el mensaje', 'error');
    }
  }

  posturaIcono(jugadorId: string): string {
    const p = this.posturas[jugadorId];
    if (!p) return '';
    return p === 'amigable' ? '😊' : p === 'hostil' ? '😠' : '😐';
  }

  posturaLabel(jugadorId: string): string {
    const p = this.posturas[jugadorId];
    if (!p) return '';
    return p.charAt(0).toUpperCase() + p.slice(1);
  }

  abrirChatPrivado(jugadorId: string) {
    this.chatActivoId = this.dmId(jugadorId);
    this.setPanelActivo('chat');
    this.cdr.markForCheck();
  }

  // ── Grupos ──────────────────────────────────────────────
  abrirModalGrupos() {
    this.modalGrupos = { nombre: '', bandera: '', jugadoresIds: [] };
    this.cdr.markForCheck();
  }

  toggleJugadorGrupo(uid: string) {
    if (!this.modalGrupos) return;
    const idx = this.modalGrupos.jugadoresIds.indexOf(uid);
    if (idx >= 0) {
      this.modalGrupos.jugadoresIds = this.modalGrupos.jugadoresIds.filter(id => id !== uid);
    } else {
      if (this.hayHostilidadEntre(this.userId, uid)) {
        this.showGameNotif(`No podés agregar a ${this.nombreJugadorById(uid)}: existe una declaración de hostilidad entre ustedes.`, 'error');
        return;
      }
      this.modalGrupos.jugadoresIds = [...this.modalGrupos.jugadoresIds, uid];
    }
  }

  async crearGrupo() {
    if (!this.modalGrupos || !this.modalGrupos.nombre.trim()) return;
    if (!this.modalGrupos.bandera) return;
    if (this.errorCrearGrupo) return;
    const id = crypto.randomUUID();
    const grupo: GrupoChat = {
      id,
      nombre: this.modalGrupos.nombre.trim(),
      bandera: this.modalGrupos.bandera,
      jugadoresIds: [this.userId],
      creadoPor: this.userId,
    };
    await this.service.crearGrupoChat({ id, partida_id: this.partidaId, nombre: grupo.nombre, bandera: grupo.bandera, creado_por: this.userId });
    await this.service.unirseGrupoChat(id, this.userId);
    this.grupos = [...this.grupos, grupo];
    this.chatActivoId = grupo.id;
    this.channelEventos?.send({ type: 'broadcast', event: 'grupo_nuevo', payload: grupo }).catch(() => {});
    const totalEsperados = 1 + this.modalGrupos.jugadoresIds.length;
    for (const invitadoId of this.modalGrupos.jugadoresIds) {
      const inv: InvitacionGrupo = {
        id: crypto.randomUUID(),
        grupoId: grupo.id,
        grupoNombre: grupo.nombre,
        grupoBandera: grupo.bandera,
        invitadorId: this.userId,
        invitadoId,
        totalEsperados,
        ts: Date.now(),
      };
      this.channelEventos?.send({ type: 'broadcast', event: 'invitacion_grupo', payload: inv }).catch(() => {});
    }
    this.modalGrupos = null;
    this.cdr.markForCheck();
  }

  async aceptarInvitacionGrupo() {
    const inv = this.invitacionGrupoEntrante;
    if (!inv) return;
    await this.service.unirseGrupoChat(inv.grupoId, this.userId);
    if (!this.grupos.find(g => g.id === inv.grupoId)) {
      const grupo: GrupoChat = {
        id: inv.grupoId, nombre: inv.grupoNombre, bandera: inv.grupoBandera,
        jugadoresIds: [inv.invitadorId, this.userId], creadoPor: inv.invitadorId,
      };
      this.grupos = [...this.grupos, grupo];
    }
    const totalEsperados = inv.totalEsperados ?? 2;
    const grupoActual = this.grupos.find(g => g.id === inv.grupoId)!;
    this.invitacionGrupoEntrante = null;
    await this.channelEventos?.send({
      type: 'broadcast', event: 'grupo_unirse',
      payload: { grupoId: inv.grupoId, jugadorId: this.userId, totalEsperados },
    });
    // el emisor no recibe su propio broadcast → disparar notif localmente si completó el grupo
    if (grupoActual.jugadoresIds.length >= totalEsperados) {
      this.addNotif({
        tipo: 'grupo', icono: '👥',
        linea1: `${this.nombreJugadorById(inv.invitadorId)} creó "${inv.grupoNombre}"`,
        linea2: 'Nuevo grupo de chat',
        color: this.jugadorColores[inv.invitadorId] ?? '#94a3b8',
        ts: Date.now(),
      });
    }
    this.chatActivoId = inv.grupoId;
    this.cdr.markForCheck();
  }

  async rechazarInvitacionGrupo() {
    const inv = this.invitacionGrupoEntrante;
    if (!inv) return;
    this.invitacionGrupoEntrante = null;
    await this.channelEventos?.send({
      type: 'broadcast', event: 'grupo_rechazar',
      payload: { grupoId: inv.grupoId, grupoNombre: inv.grupoNombre, jugadorId: this.userId },
    });
    await this.channelEventos?.send({
      type: 'broadcast', event: 'evento_grupo',
      payload: { accion: 'disuelto', grupoNombre: inv.grupoNombre, autorNombre: this.miNombre, autorId: this.userId },
    });
    this.addNotif({
      tipo: 'grupo', icono: '💔',
      linea1: `El grupo "${inv.grupoNombre}" fue disuelto`,
      linea2: 'Rechazaste la invitación',
      color: this.jugadorColores[this.userId] ?? '#94a3b8',
      ts: Date.now(),
    });
    this.cdr.markForCheck();
  }

  private addNotif(item: NotifItem) {
    this.notifItems = [item, ...this.notifItems].slice(0, 60);
    if (this.panelActivo !== 'noticias') this.notifNoVistas++;
  }

  private pushNotifPacto(j1: string, j2: string, _tipo: 'no_agresion', color: string, esRenovacion: boolean, ts: number) {
    const icono = '🛡️';
    const label = 'No agresión';
    this.addNotif({
      tipo: 'pacto', icono,
      linea1: `${label}: ${j1} & ${j2}`,
      linea2: esRenovacion ? 'Pacto renovado' : 'Pacto establecido',
      color, ts,
    });
  }

  private pushNotifPostura(declaranteNombre: string, receptorNombre: string, postura: 'amigable' | 'neutral' | 'hostil', color: string) {
    const iconos = { amigable: '😊', neutral: '😐', hostil: '😠' };
    const labels = { amigable: 'Amigable', neutral: 'Neutral', hostil: 'Hostil' };
    this.addNotif({
      tipo: 'combate',
      icono: iconos[postura],
      linea1: `${declaranteNombre} → ${receptorNombre}`,
      linea2: labels[postura],
      color,
      ts: Date.now(),
    });
  }

  private verificarConquistaContinente(userId: string, territorioId: string) {
    const CONT = CONTINENT_TERRITORIES;
    for (const cont of CONTINENT_BONUSES) {
      const terrs = CONT[cont.id];
      if (!terrs.includes(territorioId)) continue;
      const totalTerrs = terrs.length;
      const threshold  = Math.floor(totalTerrs / 2) + 1;
      const ownedNow    = terrs.filter(tid => this.territorios[tid]?.usuario_id === userId).length;
      const ownedBefore = ownedNow - 1;
      const nombre      = this.getNombreContinente(cont.id);
      const jugador     = this._jugadorNombres[userId] ?? '?';
      const color       = this.jugadorColores[userId] ?? '#fff';
      if (ownedNow === totalTerrs) {
        this.playSfx('assets/KuboTeg/sonidos/conquista-continente.mp3');
        this.pushNotifContinente(jugador, nombre, color, 'totalidad');
      } else if (ownedBefore < threshold && ownedNow >= threshold) {
        this.playSfx('assets/KuboTeg/sonidos/conquista-mayoria.mp3');
        this.pushNotifContinente(jugador, nombre, color, 'mayoria');
      }
    }
  }

  get resumenTropas() {
    return calcResumenTropas(this.territorios, this.userId, this.partida?.ronda_actual ?? 1, this.jugandoConMayorias);
  }

  getNombreContinente(id: string): string {
    return CONTINENT_NAMES[id] ?? id;
  }

  get tablaBonusContinentes() { return CONTINENT_TABLA; }

  private pushNotifContinente(jugador: string, continente: string, color: string, tipo: 'totalidad' | 'mayoria' = 'totalidad') {
    const icono  = tipo === 'totalidad' ? '🌍' : '⭐';
    const linea2 = tipo === 'totalidad' ? 'Dominio total del continente' : 'Mayoría en el continente';
    this.addNotif({ tipo: 'conquista', icono, linea1: `${jugador} · ${continente}`, linea2, color, ts: Date.now() });
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
    if (this._popupCombateTimer) clearTimeout(this._popupCombateTimer);
    this.popupCombate = data;
    if (data.origenId && data.destinoId) {
      this.activarHighlightCombate(data.origenId, data.destinoId);
    }
    this.reproducirSonidoCombate();
    this._popupCombateTimer = setTimeout(() => {
      this.popupCombate = null;
      this.cdr.markForCheck();
    }, 5000);
    this.cdr.markForCheck();
  }

  private activarHighlightCombate(origenId: string, destinoId: string) {
    if (this._combateHighlightTimer) clearTimeout(this._combateHighlightTimer);
    this._combateHighlightIds = [origenId, destinoId];
    this._combateHighlightTimer = setTimeout(() => {
      this._combateHighlightIds = [];
      this.cdr.markForCheck();
    }, 3000);
  }

  private activarHighlightColocacion(territorioId: string) {
    if (this._colocacionHighlightTimer) clearTimeout(this._colocacionHighlightTimer);
    this._colocacionHighlightId = territorioId;
    this._colocacionHighlightTimer = setTimeout(() => {
      this._colocacionHighlightId = null;
      this.cdr.markForCheck();
    }, 1800);
  }

  private activarHighlightQuitar(territorioId: string) {
    if (this._quitarHighlightTimer) clearTimeout(this._quitarHighlightTimer);
    this._quitarHighlightId = territorioId;
    this._quitarHighlightTimer = setTimeout(() => {
      this._quitarHighlightId = null;
      this.cdr.markForCheck();
    }, 1800);
  }

  private activarHighlightMovilizacion(territorioId: string) {
    if (this._movilizacionHighlightTimer) clearTimeout(this._movilizacionHighlightTimer);
    this._movilizacionHighlightId = territorioId;
    this._movilizacionHighlightTimer = setTimeout(() => {
      this._movilizacionHighlightId = null;
      this.cdr.markForCheck();
    }, 1800);
  }

  get territorioCartaAcierta(): string | null { return this._cartaAciertaId; }

  private activarHighlightCartaAcierta(territorioId: string) {
    if (this._cartaAciertaTimer) clearTimeout(this._cartaAciertaTimer);
    this._cartaAciertaId = territorioId;
    this.cdr.markForCheck();
    this._cartaAciertaTimer = setTimeout(() => {
      this._cartaAciertaId = null;
      this.cdr.markForCheck();
    }, 2200);
  }

  private reproducirSonidoCombate() { this.audioSvc.reproducirSonidoCombate(); }

  // ── Bomba Atómica ─────────────────────────────────────

  private syncBombasJugador(userId: string, t1: string | null, t2: string | null) {
    const idx = this.jugadores.findIndex(j => j.usuario_id === userId);
    if (idx === -1) return;
    this.jugadores = [
      ...this.jugadores.slice(0, idx),
      { ...this.jugadores[idx], bomba_territorio: t1, bomba_territorio_2: t2 },
      ...this.jugadores.slice(idx + 1),
    ];
  }

  private bombasT1T2(): [string | null, string | null] {
    return [this.bombas[0] ?? null, this.bombas[1] ?? null];
  }

  saveBombaState() {
    localStorage.setItem(
      `teg_bomba_${this.partidaId}_${this.userId}`,
      JSON.stringify({ bombas: this.bombas, movidasEnRonda: this.bombasMovidasEnRonda })
    );
  }

  private territoriosEnRango(origen: string, maxHops: number): Set<string> {
    return territoriosEnRango(origen, maxHops);
  }

  get bombaPct(): number {
    return this.tieneBomba ? 100 : Math.min(Math.round(this.cartasRobadasTotal / this.cartasParaBomba * 100), 100);
  }

  get territoriosDestruidosArray(): string[] {
    return [...this.territoriosDestruidos];
  }

  private marcarDestruido(territorioId: string) {
    this.territoriosDestruidos = new Set([...this.territoriosDestruidos, territorioId]);
    localStorage.setItem(`teg_destruidos_${this.partidaId}`, JSON.stringify([...this.territoriosDestruidos]));
  }

  get bombasEnMapa(): string[] {
    return this.jugadores.flatMap(j =>
      [j.bomba_territorio, j.bomba_territorio_2].filter(Boolean) as string[]
    );
  }

  get bombaAlcanceEnemigos(): string[] {
    const origen = this.bombas[this.bombaUsandoIdx] ?? null;
    if (!origen) return [];
    const rango = this.territoriosEnRango(origen, 3);
    return [...rango].filter(id => {
      const e = this.territorios[id];
      return e && e.usuario_id !== this.userId && e.usuario_id !== BOT_USER_ID;
    });
  }

  toggleModoColocandoBomba(idx = 0) {
    if (this.modoColocandoBomba && this.bombaColocandoIdx === idx) {
      this.modoColocandoBomba = false;
    } else {
      this.bombaColocandoIdx = idx;
      this.modoColocandoBomba = true;
    }
    this.cdr.markForCheck();
  }

  moverBomba(idx: number) {
    this.modalConfirmMoverBomba = idx;
    this.cdr.markForCheck();
  }

  confirmarMoverBomba() {
    const idx = this.modalConfirmMoverBomba;
    if (idx === null) return;
    this.modalConfirmMoverBomba = null;

    const rondaActual = this.partida?.ronda_actual ?? 0;
    const nuevasRondas = [...this.bombasMovidasEnRonda];
    while (nuevasRondas.length <= idx) nuevasRondas.push(null);
    nuevasRondas[idx] = rondaActual;
    this.bombasMovidasEnRonda = nuevasRondas;

    const nuevas = [...this.bombas];
    nuevas[idx] = null;
    this.bombas = nuevas;
    this.bombaColocandoIdx = idx;
    this.modoColocandoBomba = true;
    this.saveBombaState();
    const [t1, t2] = this.bombasT1T2();
    this.syncBombasJugador(this.userId, t1, t2);
    void this.service.setBombaTerritorios(this.partidaId, this.userId, t1, t2);
    this.channelEventos?.send({ type: 'broadcast', event: 'bomba_posicion', payload: { jugadorId: this.userId, bomba1: t1, bomba2: t2 } });
    this.cdr.markForCheck();
  }

  toggleModoUsandoBomba(idx = 0) {
    if (this.modoUsandoBomba && this.bombaUsandoIdx === idx) {
      this.modoUsandoBomba = false;
    } else {
      const bombaTerr = this.bombas[idx] ?? null;
      if (bombaTerr && this.territorios[bombaTerr]?.usuario_id !== this.userId) {
        // El territorio fue conquistado: sincronizar y cancelar
        this.bombas = this.bombas.filter((_, i) => i !== idx);
        this.bombasMovidasEnRonda = this.bombasMovidasEnRonda.filter((_, i) => i !== idx);
        this.saveBombaState();
        const [t1, t2] = this.bombasT1T2();
        this.syncBombasJugador(this.userId, t1, t2);
        this.service.setBombaTerritorios(this.partidaId, this.userId, t1, t2).then();
        this.showGameNotif('El territorio con tu bomba fue conquistado. La bomba fue capturada.', 'warn');
        this.cdr.markForCheck();
        return;
      }
      const rondaActual = this.partida?.ronda_actual ?? 0;
      const rondaMovida = this.bombasMovidasEnRonda[idx] ?? null;
      if (rondaMovida !== null && rondaMovida >= rondaActual) {
        this.showGameNotif('Moviste esta bomba en la fase de colocación. Podés lanzarla a partir de la próxima ronda.', 'warn');
        return;
      }
      this.bombaUsandoIdx = idx;
      this.modoUsandoBomba = true;
    }
    this.territorioAtacanteId = null;
    this.cdr.markForCheck();
  }

  colocarBomba(territorioId: string) {
    const estado = this.territorios[territorioId];
    if (!estado || estado.usuario_id !== this.userId) {
      this.showGameNotif('Elegí uno de tus propios territorios', 'warn');
      return;
    }
    const rondaActual = this.partida?.ronda_actual ?? 0;
    const nuevasRondas = [...this.bombasMovidasEnRonda];
    while (nuevasRondas.length <= this.bombaColocandoIdx) nuevasRondas.push(null);
    nuevasRondas[this.bombaColocandoIdx] = rondaActual;
    this.bombasMovidasEnRonda = nuevasRondas;

    const nuevas = [...this.bombas];
    nuevas[this.bombaColocandoIdx] = territorioId;
    this.bombas = nuevas;
    this.modoColocandoBomba = false;
    this.saveBombaState();
    const [t1, t2] = this.bombasT1T2();
    this.syncBombasJugador(this.userId, t1, t2);
    void this.service.setBombaTerritorios(this.partidaId, this.userId, t1, t2);
    this.channelEventos?.send({ type: 'broadcast', event: 'bomba_posicion', payload: { jugadorId: this.userId, bomba1: t1, bomba2: t2 } });
    this.playSfx('assets/KuboTeg/sonidos/alerta-bomba.mp3');
    this.showGameNotif(`Bomba ${this.bombaColocandoIdx + 1} colocada en ${this.nombreTerritorio(territorioId)}`, 'ok');
    this.cdr.markForCheck();
  }

  async ejecutarBomba(territorioId: string): Promise<void> {
    const origenBomba = this.bombas[this.bombaUsandoIdx] ?? null;
    if (!origenBomba) return;
    // Solo bloquear a jugadores ajenos al turno: el propio atacante recibe su broadcast
    // de vuelta (Supabase self-loop) y no debe quedar bloqueado por su propio combate.
    if (this.combateEnCurso && !this.esMiTurno) {
      this.showGameNotif('Esperá a que termine el combate en curso', 'warn');
      return;
    }
    // Verificar que el territorio origen sigue siendo propio
    if (this.territorios[origenBomba]?.usuario_id !== this.userId) {
      this.modoUsandoBomba = false;
      this.bombas = this.bombas.filter((_, i) => i !== this.bombaUsandoIdx);
      this.bombasMovidasEnRonda = this.bombasMovidasEnRonda.filter((_, i) => i !== this.bombaUsandoIdx);
      this.saveBombaState();
      const [t1, t2] = this.bombasT1T2();
      this.syncBombasJugador(this.userId, t1, t2);
      // .then() dispara el fetch (void no lo haría en Supabase PromiseLike)
      this.service.setBombaTerritorios(this.partidaId, this.userId, t1, t2).then();
      this.showGameNotif('El territorio con tu bomba fue conquistado. La bomba fue capturada.', 'warn');
      this.cdr.markForCheck();
      return;
    }
    const estado = this.territorios[territorioId];
    if (!estado || estado.usuario_id === this.userId) return;
    const victimaId = estado.usuario_id;
    if (!this.bombaAlcanceEnemigos.includes(territorioId)) {
      this.showGameNotif('Ese territorio está fuera del alcance de la bomba', 'warn');
      return;
    }
    this.modoUsandoBomba = false;
    const terrNombre = this.nombreTerritorio(territorioId);
    this.territorioMisilActivoId = territorioId;
    this.cdr.markForCheck();
    setTimeout(() => { this.territorioMisilActivoId = null; this.cdr.markForCheck(); }, 1500);
    await new Promise<void>(r => setTimeout(r, 750));
    const ok = await this.updateTerritorio(territorioId, { tropas: 1 });
    if (!ok) return;
    this.bombas = this.bombas.filter((_, i) => i !== this.bombaUsandoIdx);
    this.bombaUsandoIdx = 0;
    this.saveBombaState();
    const [t1, t2] = this.bombasT1T2();
    this.syncBombasJugador(this.userId, t1, t2);
    // Broadcast primero: actualización inmediata del ícono para todos los jugadores
    this.channelEventos?.send({
      type: 'broadcast', event: 'bomba_atomica',
      payload: { territorioId, jugadorId: this.userId, victimaId, bomba1: t1, bomba2: t2 },
    });
    // Await garantiza que el DB write se ejecuta (void no dispara el fetch en Supabase PromiseLike)
    await this.service.setBombaTerritorios(this.partidaId, this.userId, t1, t2);
    this.marcarDestruido(territorioId);
    void this.aplicarPostura(victimaId, 'hostil');
    this.playSfx('assets/KuboTeg/sonidos/bomba-nuclear.mp3');
    this.addNotif({ tipo: 'conquista', icono: '☢', linea1: `${this.miNombre} lanzó la Bomba Atómica`, linea2: `${terrNombre} reducido a 1 tropa`, color: '#fbbf24', ts: Date.now() });
    this.cdr.markForCheck();
  }

  // ── Objetivos secretos ────────────────────────────────

  private async generarYAsignarObjetivos() {
    const pool = generarObjetivosPool(this.jugadores);
    const shuffled = this.randomShuffle([...pool]);
    const { assignments, miObjetivo } = asignarObjetivosUtil(shuffled, this.jugadores, this.userId);
    this.miObjetivo = miObjetivo;
    await Promise.all(
      assignments.map(a => this.service.setObjetivo(this.partidaId, a.userId, a.obj))
    );
  }

  private verificarVictoriaObjetivo(conquistadoId: string, eliminadoId: string | null): boolean {
    if (!this.miObjetivo) return false;
    return verificarVictoriaUtil(this.miObjetivo, conquistadoId, eliminadoId, this.territorios, this.userId, this.jugadores);
  }

  private async declararGanadorPorObjetivo() {
    const { data, error } = await this.service.declararGanadorObjetivo(this.partidaId);
    if (error || (data as RpcError)?.error) {
      this.toast.show((data as RpcError)?.error ?? 'Error al declarar ganador.', 'error');
    }
  }

  get objetivoContinentes(): [string, string] | null {
    return this.miObjetivo?.tipo === 'continentes' ? this.miObjetivo.ids : null;
  }

  get objetivoColor(): string | null {
    return this.miObjetivo?.tipo === 'destruir' ? this.miObjetivo.color : null;
  }

  get objetivoFallbackActivo(): boolean {
    return this.miObjetivo?.tipo === 'destruir' && !!this.miObjetivo.fallback;
  }

  get objetivoTresMayorias(): [string, string, string] | null {
    return this.miObjetivo?.tipo === 'tres_mayorias' ? this.miObjetivo.ids : null;
  }

  mayoriaEnContinente(contId: string): boolean {
    const terrs = CONTINENT_TERRITORIES[contId] ?? [];
    const threshold = Math.floor(terrs.length / 2) + 1;
    return terrs.filter(tid => this.territorios[tid]?.usuario_id === this.userId).length >= threshold;
  }

  get objetivoCuatroMayorias(): boolean {
    return this.miObjetivo?.tipo === 'cuatro_mayorias';
  }

  get mayoriasActuales(): number { return countMayorias(this.territorios, this.userId); }

  get cuatroMayoriasActuales(): number { return this.mayoriasActuales; }

  get objetivoTargetJugador(): PartidaJugador | null {
    const color = this.objetivoColor;
    return color ? (this.jugadores.find(j => j.color === color) ?? null) : null;
  }

  get objetivoTargetNombre(): string {
    const j = this.objetivoTargetJugador;
    return j ? this.nombreJugador(j) : '?';
  }

  get objetivoDestruyeActivo(): boolean {
    const j = this.objetivoTargetJugador;
    return !!j && Object.values(this.territorios).some(t => t.usuario_id === j.usuario_id);
  }

  private continenteCompletado(contId: string): boolean {
    const CONT = CONTINENT_TERRITORIES;
    return CONT[contId]?.every(tid => this.territorios[tid]?.usuario_id === this.userId) ?? false;
  }

  get objetivoContinenteA(): boolean {
    const ids = this.objetivoContinentes;
    return ids ? this.continenteCompletado(ids[0]) : false;
  }

  get objetivoContinenteB(): boolean {
    const ids = this.objetivoContinentes;
    return ids ? this.continenteCompletado(ids[1]) : false;
  }

  get objetivoTerritoriosActuales(): number {
    return Object.values(this.territorios).filter(t => t.usuario_id === this.userId).length;
  }

}

