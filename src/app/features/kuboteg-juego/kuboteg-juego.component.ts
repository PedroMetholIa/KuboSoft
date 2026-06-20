import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, ViewChild, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KeyValuePipe, UpperCasePipe } from '@angular/common';
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

type ObjetivoSecreto =
  | { tipo: 'continentes'; ids: [string, string] }
  | { tipo: 'destruir'; color: string };

interface ConquistaPendiente {
  origenId: string;
  destinoId: string;
  tropasOrigenFinal: number;
  defensorNombre: string;
  defensorColor: string;
  defensorId: string;
}

interface RpcError {
  error?: string;
}

interface Pacto {
  id: string;
  tipo: 'alianza' | 'no_agresion';
  jugador1Id: string;
  jugador2Id: string;
  territorioId1?: string;
  territorioId2?: string;
  territoriosId2?: string[];
  rondaInicio: number;
  rondaExpira: number;
  estado?: 'activo' | 'en_transicion';
}

interface PropuestaPacto {
  id: string;
  tipo: 'alianza' | 'no_agresion' | 'renovacion';
  proponenteId: string;
  receptorId: string;
  territorioId1?: string;
  territorioId2?: string;
  territoriosId2?: string[];
  pactoId?: string;
  ts: number;
}

interface GrupoChat {
  id: string;
  nombre: string;
  bandera: string;
  jugadoresIds: string[];
  creadoPor: string;
}

interface InvitacionGrupo {
  id: string;
  grupoId: string;
  grupoNombre: string;
  grupoBandera: string;
  invitadorId: string;
  invitadoId: string;
  totalEsperados: number;
  ts: number;
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
  imports: [FormsModule, KeyValuePipe, UpperCasePipe, MapComponent, NotificacionesComponent, CombatePanelComponent, KubotegChatComponent, PartidaInfoComponent, MenuJugadorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kuboteg-juego.component.html',
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

  private static readonly CONTINENT_NAMES: Record<string, string> = {
    north_america: 'Norteamérica',
    south_america: 'Sudamérica',
    europe:        'Europa',
    africa:        'África',
    asia:          'Asia',
    oceania:       'Oceanía',
  };

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
  continentesColocacion: Array<{
    id: string; nombre: string; bonus: number; colocadas: number; territoriosPermitidos: string[];
  }> = [];
  continenteColocacionIdx = 0;
  territorioAtacanteId: string | null = null;
  procesandoCombate = false;
  procesandoConquista = false;
  popupCombate: UltimoCombate | null = null;
  private _lastCombateTs = 0;
  private lastAttack: { origenId: string; destinoId: string } | null = null;
  notifConquista: UltimaConquista | null = null;
  private notifConquistaTimer: ReturnType<typeof setTimeout> | null = null;
  private _lastConquistaTs = 0;
  territorioOrigenId: string | null = null;
  conquistaPendiente: ConquistaPendiente | null = null;
  conquistaTropasAMover = 1;
  miObjetivo: ObjetivoSecreto | null = null;
  mostrarObjetivoPopup = false;
  gameNotif: { msg: string; tipo: 'ok' | 'info' | 'warn' | 'error' } | null = null;
  private gameNotifTimer: ReturnType<typeof setTimeout> | null = null;
  modalPostura: { jugadorId: string; postura: 'amigable' | 'neutral' | 'hostil' } | null = null;
  posturas: Record<string, 'amigable' | 'neutral' | 'hostil'> = {};
  reagrupacionDestinoId: string | null = null;
  reagrupacionTropasAMover = 1;
  reagrupacionLimites: Record<string, number> = {};
  reagrupacionMovidos: Record<string, number> = {};
  panelActivo = 'jugadores';
  modoAudio: 'sin_sonido' | 'sin_musica' | 'musica_uniforme' | 'musica_lideres' = 'musica_lideres';
  private ultimoModoActivo: 'musica_uniforme' | 'musica_lideres' = 'musica_lideres';
  get musicaMuteada(): boolean {
    return this.modoAudio === 'sin_sonido' || this.modoAudio === 'sin_musica';
  }
  tiempoPartida = '00:00:00';
  private audio!: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceConnected = false;
  private readonly BASE_VOLUME = 0.4;
  private sfxPool = new Map<string, HTMLAudioElement>();
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // ── Sistema de pactos ─────────────────────────────────
  pactos: Pacto[] = [];
  propuestaEntrante: PropuestaPacto | null = null;
  propuestaSaliente: PropuestaPacto | null = null;
  modalPacto: { receptorId: string; tipo: 'alianza' | 'no_agresion' | 'renovacion'; territorioId1: string; territorioId2: string; modalidad: 1 | 2; pactoId?: string } | null = null;
  territoriosLimitrofesSeleccionados: string[] = [];
  modalRomperPacto = false;
  modalConfirmHostil: { jugadorId: string; jugadorNombre: string; pactosAfectados: number; gruposAfectados: number } | null = null;

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
  modalGrupos: { nombre: string; bandera: string; jugadoresIds: string[] } | null = null;
  invitacionGrupoEntrante: InvitacionGrupo | null = null;
  private dmGroups: Record<string, string> = {};
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
    return this.grupos.filter(g => g.jugadoresIds.includes(this.userId));
  }

  grupoMiembrosTooltip(g: GrupoChat): string {
    return g.jugadoresIds.map(id => this._jugadorNombres[id] ?? id).join('\n');
  }

  // ── Notificaciones de eventos ─────────────────────────
  notifItems: NotifItem[] = [];

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
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.onerror = () => {
      const fallback = '/assets/KuboTeg/sonidos/musica-fondo.mp3';
      if (!this.audio.src.endsWith(fallback)) {
        this.audio.pause();
        this.audio.src = fallback;
        if (!this.musicaMuteada) this.audio.play().catch(() => {});
      }
    };
    this.partidaId = this.route.snapshot.paramMap.get('id') ?? '';
    const user = this.service.getCurrentUser();
    if (user) {
      this.userId = user.id;
      this.loadGameState();
      this.subscribeRealtime();
    }
  }

  ngOnDestroy() {
    this.audio.onerror = null;
    this.audio.pause();
    this.audio.src = '';
    this.sfxPool.forEach(a => { a.pause(); a.src = ''; });
    this.sfxPool.clear();
    this.removeAllChannels();
    if (this.reconnectTimer)       clearTimeout(this.reconnectTimer);
    if (this.timerInterval)        clearInterval(this.timerInterval);
    if (this.notifConquistaTimer)  clearTimeout(this.notifConquistaTimer);
    if (this.cartaPopupTimer)      clearTimeout(this.cartaPopupTimer);
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
    this.panelActivo = panel;
    this.cdr.markForCheck();
  }

  toggleMusica() {
    this.setModoAudio(this.musicaMuteada ? this.ultimoModoActivo : 'sin_musica');
  }

  setModoAudio(modo: 'sin_sonido' | 'sin_musica' | 'musica_uniforme' | 'musica_lideres') {
    this.modoAudio = modo;
    if (modo === 'musica_uniforme' || modo === 'musica_lideres') {
      this.ultimoModoActivo = modo;
    }
    if (modo === 'sin_sonido' || modo === 'sin_musica') {
      this.audio.pause();
      if (this.gainNode) this.gainNode.gain.value = 0;
    } else {
      this.cambiarMusicaLider();
    }
    this.cdr.markForCheck();
  }

  private iniciarMusica() {
    this.cambiarMusicaLider();
  }

  private setupAudioContext() {
    if (this.audioCtx) return;
    this.audioCtx = new AudioContext();

    const compressor = this.audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value      = 20;
    compressor.ratio.value     = 8;
    compressor.attack.value    = 0.005;
    compressor.release.value   = 0.3;

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = this.musicaMuteada ? 0 : this.BASE_VOLUME;

    compressor.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);

    const source = this.audioCtx.createMediaElementSource(this.audio);
    source.connect(compressor);
    this.sourceConnected = true;
  }

  private cambiarMusicaLider() {
    if (this.modoAudio === 'sin_sonido' || this.modoAudio === 'sin_musica') {
      this.audio.pause();
      return;
    }

    const liderNombre = this.jugadorLideres[this.jugadorActualId];
    const lider = this.lideres.find(l => l.nombre === liderNombre);
    const rawSrc = this.modoAudio === 'musica_uniforme'
      ? 'assets/KuboTeg/sonidos/musica-fondo.mp3'
      : (lider?.sonido ?? 'assets/KuboTeg/sonidos/musica-fondo.mp3');
    const src = rawSrc.startsWith('/') || rawSrc.startsWith('http') ? rawSrc : `/${rawSrc}`;
    const volumen = (lider?.volumen ?? 1.0) * this.BASE_VOLUME;

    if (this.audio.src.endsWith(src)) {
      if (this.gainNode) this.gainNode.gain.value = volumen;
      if (this.audio.paused) this.audio.play().catch(() => {});
      return;
    }

    this.audio.pause();
    this.audio.src = src;
    this.audio.loop = true;
    this.setupAudioContext();
    if (this.audioCtx?.state === 'suspended') this.audioCtx.resume();
    if (this.gainNode) this.gainNode.gain.value = volumen;
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
      if (this.tieneAlianza(this.userId, e.usuario_id)) {
        result[nid] = 'No podés atacar: alianza vigente';
      } else if (this.tieneNoAgresion(origenId, nid)) {
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

  get liderActualImgPath(): string {
    const liderNombre = this.jugadorLideres[this.jugadorActualId];
    if (!liderNombre) return '';
    const lider = this.lideres.find(l => l.nombre === liderNombre);
    if (!lider) return '';
    if (this.jugadorActualId === this.userId) {
      return this.getLiderImgPath(lider);
    }
    const jugadorActual = this.jugadores.find(j => j.usuario_id === this.jugadorActualId);
    const posturaHaciaMe = jugadorActual?.posturas?.[this.userId] ?? 'neutral';
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

      const terrArray = territorios ?? [];
      this.territorios = {};
      terrArray.forEach(t => { this.territorios[t.territorio_id] = t; });

      this.rebuildJugadores();
      this.rebuildMaps();
      this.loading = false;
      if (this.partida?.estado === 'En juego') { this.iniciarMusica(); this.iniciarTimer(); }
      if (this.partida?.fase_actual === 'colocacion' && this.esMiTurno) {
        this.iniciarSubFaseColocacion();
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
            this.showGameNotif('¡Pacto renovado!', 'ok');
          } else if (r.accepted && r.pacto) {
            this.pactos = [...this.pactos, r.pacto];
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
        const e = payload as { jugador1Nombre: string; jugador2Nombre: string; tipo: 'alianza' | 'no_agresion'; color: string; ts: number; esRenovacion: boolean };
        this.pushNotifPacto(e.jugador1Nombre, e.jugador2Nombre, e.tipo, e.color, e.esRenovacion, e.ts);
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
      .subscribe();

    this.channelPartida = this.service.client
      .channel(`kuboteg-partida-${this.partidaId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partida' }, (payload) => {
        if (payload.new['id'] === this.partidaId) {
          const newPartida = payload.new as Partida;
          if (newPartida.estado === 'En pausa' && this.partida?.estado !== 'En pausa') {
            clearInterval(this.timerInterval!);
            this.timerInterval = null;
            if (this.gainNode) this.gainNode.gain.value = 0;
          }
          if (newPartida.estado === 'En juego' && this.partida?.estado !== 'En juego') {
            this.iniciarMusica();
            this.iniciarTimer();
          }
          if (newPartida.estado === 'Finalizada' && this.partida?.estado !== 'Finalizada') {
            this.audio.pause();
            if (newPartida.ganador_id === this.userId) {
              this.playSfx('assets/KuboTeg/sonidos/ganador.mp3');
            } else {
              this.playSfx('assets/KuboTeg/sonidos/perdedor.mp3');
            }
          }
          if (Array.isArray(newPartida.pactos)) this.pactos = newPartida.pactos as Pacto[];
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
          // Sincronizar territorios al cambio de turno/fase para compensar
          // eventos de postgres_changes que el observador pudo haber perdido.
          const turnoCambio = prevFase !== this.fase || prevJugadorIdx !== newPartida.jugador_actual_index;
          if (turnoCambio) {
            this.syncTerritorios();
            if (this.partida?.estado === 'En juego') this.cambiarMusicaLider();
            if (this.esMiTurno && prevJugadorIdx !== newPartida.jugador_actual_index) {
              this.playSfx('assets/KuboTeg/sonidos/confirma-seleccion.mp3');
            }
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
          if (updated.usuario_id === this.userId) {
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
          this.rebuildJugadores();
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
          this.rebuildJugadores();
        }
        if (territorios) {
          this.territorios = {};
          territorios.forEach(t => { this.territorios[t.territorio_id] = t; });
        }
        this.rebuildMaps();
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

    // Capturar valores de turno antes de cualquier await para evitar que
    // eventos de Realtime actualicen this.partida durante la ejecución.
    const orden      = this.partida.orden_jugadores!;
    const n          = orden.length;
    const ronda      = this.partida.ronda_actual!;
    const startIdx   = (ronda - 1) % n;
    const currentIdx = this.partida.jugador_actual_index!;
    const numPlaced  = ((currentIdx - startIdx + n) % n) + 1;
    const nextIdx    = (currentIdx + 1) % n;

    const allPlaced: Record<string, number> = {};
    for (const [tid, n] of Object.entries(this.tropasColocadasContinentes)) {
      if (n > 0) allPlaced[tid] = (allPlaced[tid] ?? 0) + n;
    }
    for (const [tid, n] of Object.entries(this.tropasColocadasBase)) {
      if (n > 0) allPlaced[tid] = (allPlaced[tid] ?? 0) + n;
    }
    for (const [tid, added] of Object.entries(allPlaced)) {
      const estado = this.territorios[tid];
      if (estado) {
        const ok = await this.updateTerritorio(tid, { tropas: estado.tropas + added });
        if (!ok) { this.cdr.markForCheck(); return; }
      }
    }

    await this.service.setTropasPorColocar(this.partidaId, this.userId, 0);
    this.tropasColocadasContinentes = {};
    this.tropasColocadasBase = {};
    this.continentesColocacion = [];
    this.subFaseColocacion = 'base';
    this.rebuildTropasMap();

    if (numPlaced >= n) {
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
      if (!this.puedoAtacar(this.territorioAtacanteId, territorioId)) return;
      await this.ejecutarAtaque(this.territorioAtacanteId, territorioId);
    } else if (estado.usuario_id === this.userId && estado.tropas > 1) {
      this.territorioAtacanteId = territorioId;
    }
  }

  async ejecutarAtaque(origenId: string, destinoId: string) {
    this.lastAttack = { origenId, destinoId };
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
        liderAtacanteImg: this.getLiderImgByNombre(liderAtacante),
        liderDefensorImg: this.getLiderImgByNombre(liderDefensor),
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
          defensorId,
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
    if (!this.conquistaPendiente || this.procesandoConquista) return;
    this.procesandoConquista = true;
    const { origenId, destinoId, defensorNombre, defensorId } = this.conquistaPendiente;
    const aMover = Math.max(1, Math.min(this.conquistaTropasAMover, this.maxTropasMovibles));

    try {
      const { data: rpcData, error } = await this.service.moverTropasConquista(
        this.partidaId, origenId, destinoId, aMover
      );
      if (this.showRpcError(error, rpcData, 'Error al mover tropas.')) return;

      // Actualizar localmente sin esperar Realtime: evita que iniciarFaseReagrupacion
      // lea tropas stale si el evento de territorio_estado llega tarde.
      const origenEstado  = this.territorios[origenId];
      const destinoEstado = this.territorios[destinoId];
      const localPatch: Record<string, TerritorioEstado> = {};
      if (origenEstado)  localPatch[origenId]  = { ...origenEstado,  tropas: origenEstado.tropas - aMover };
      if (destinoEstado) localPatch[destinoId] = { ...destinoEstado, tropas: destinoEstado.tropas + aMover, usuario_id: this.userId };
      if (Object.keys(localPatch).length) {
        this.territorios = { ...this.territorios, ...localPatch };
        this.rebuildMaps();
      }

      this.conquistoEnEsteTurno = true;
      this.ultimoTerritorioConquistadoId = destinoId;

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
      this.pushNotifConquista(conquistaData);
      this.channelEventos?.send({ type: 'broadcast', event: 'conquista', payload: conquistaData });

      this.conquistaPendiente = null;
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
    });
    this.showGameNotif('Postura declarada.', 'ok');
    this.cdr.markForCheck();
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
    const orden       = this.partida.orden_jugadores!;
    const rondaActual = this.partida.ronda_actual!;
    const limite      = this.partida.limite_rondas ?? null;
    const newRonda    = rondaActual + 1;
    const newStart    = (newRonda - 1) % orden.length;

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
    const ronda = this.partida?.ronda_actual ?? 0;
    return this.pactos.filter(p => p.rondaExpira >= ronda);
  }

  get misPactosActivos(): Pacto[] {
    return this.pactosActivos().filter(
      p => p.jugador1Id === this.userId || p.jugador2Id === this.userId
    );
  }

  get todasPosturasVacias(): boolean {
    return this.jugadores.every(j => !j.posturas || Object.keys(j.posturas).length === 0);
  }

  private posturaDeHaciaB(idA: string, idB: string): string {
    if (idA === this.userId) return this.posturas[idB] ?? 'neutral';
    return this.jugadores.find(j => j.usuario_id === idA)?.posturas?.[idB] ?? 'neutral';
  }

  private ambosAmigables(idA: string, idB: string): boolean {
    return this.posturaDeHaciaB(idA, idB) === 'amigable' &&
           this.posturaDeHaciaB(idB, idA) === 'amigable';
  }

  private hayHostilidadEntre(idA: string, idB: string): boolean {
    const aDeclaroHostilAb = idA === this.userId
      ? this.posturas[idB] === 'hostil'
      : (this.jugadores.find(j => j.usuario_id === idA)?.posturas?.[idB] === 'hostil');
    const bDeclaroHostilAa = idB === this.userId
      ? this.posturas[idA] === 'hostil'
      : (this.jugadores.find(j => j.usuario_id === idB)?.posturas?.[idA] === 'hostil');
    return aDeclaroHostilAb || bDeclaroHostilAa;
  }

  private countPactosJugador(userId: string): number {
    return this.pactosActivos().filter(
      p => p.jugador1Id === userId || p.jugador2Id === userId
    ).length;
  }

  pactosRompibles(): Pacto[] {
    const ronda = this.partida?.ronda_actual ?? 0;
    return this.pactosActivos().filter(p =>
      p.estado !== 'en_transicion' && p.rondaExpira !== ronda
    );
  }

  pactosRenovables(): Pacto[] {
    return this.pactosActivos().filter(p =>
      this.esPactoEnTransicion(p) &&
      (p.jugador1Id === this.userId || p.jugador2Id === this.userId)
    );
  }

  seleccionarPactoRenovacion(pactoId: string) {
    if (!this.modalPacto) return;
    const pacto = this.pactos.find(p => p.id === pactoId);
    if (!pacto) return;
    const receptorId = pacto.jugador1Id === this.userId ? pacto.jugador2Id : pacto.jugador1Id;
    this.modalPacto.pactoId = pactoId;
    this.modalPacto.receptorId = receptorId;
  }

  esPactoEnTransicion(p: Pacto): boolean {
    const ronda = this.partida?.ronda_actual ?? 0;
    return p.estado === 'en_transicion' || p.rondaExpira === ronda;
  }

  esAcuerdoRoto(p: Pacto): boolean {
    return p.estado === 'en_transicion';
  }

  esEnRevisionNatural(p: Pacto): boolean {
    const ronda = this.partida?.ronda_actual ?? 0;
    return p.estado !== 'en_transicion' && p.rondaExpira === ronda;
  }

  terrYaEnPacto(miTerrId: string, suTerrId: string): boolean {
    return this.tieneNoAgresion(miTerrId, suTerrId);
  }

  contraParteId(pacto: Pacto): string {
    return pacto.jugador1Id === this.userId ? pacto.jugador2Id : pacto.jugador1Id;
  }

  nombreJugadorById(uid: string): string {
    const j = this.jugadores.find(x => x.usuario_id === uid);
    return j ? this.nombreJugador(j) : uid.slice(0, 6) + '…';
  }

  private tieneAlianza(uid1: string, uid2: string): boolean {
    const ronda = this.partida?.ronda_actual ?? 0;
    return this.pactos.some(p =>
      p.tipo === 'alianza' && p.rondaExpira >= ronda &&
      ((p.jugador1Id === uid1 && p.jugador2Id === uid2) ||
       (p.jugador1Id === uid2 && p.jugador2Id === uid1))
    );
  }

  private tieneNoAgresion(tId1: string, tId2: string): boolean {
    const ronda = this.partida?.ronda_actual ?? 0;
    return this.pactos.some(p => {
      if (p.tipo !== 'no_agresion' || p.rondaExpira < ronda) return false;
      const terrsId2 = p.territoriosId2?.length ? p.territoriosId2 : (p.territorioId2 ? [p.territorioId2] : []);
      return (p.territorioId1 === tId1 && terrsId2.includes(tId2)) ||
             (p.territorioId1 === tId2 && terrsId2.includes(tId1));
    });
  }

  private puedoAtacar(origenId: string, destinoId: string): boolean {
    const defensorId = this.territorios[destinoId]?.usuario_id ?? '';
    if (!defensorId) return true;
    if (this.tieneAlianza(this.userId, defensorId)) return false;
    if (this.tieneNoAgresion(origenId, destinoId)) return false;
    return true;
  }

  private disolverPactosTerritorio(territorioId: string, jugadorEliminadoId?: string | null) {
    const filtrados = this.pactos.filter(p => {
      if (p.tipo === 'no_agresion') {
        const terrsId2 = p.territoriosId2?.length ? p.territoriosId2 : (p.territorioId2 ? [p.territorioId2] : []);
        if (p.territorioId1 === territorioId || terrsId2.includes(territorioId)) return false;
      }
      if (p.tipo === 'alianza' && jugadorEliminadoId) {
        if (p.jugador1Id === jugadorEliminadoId || p.jugador2Id === jugadorEliminadoId) return false;
      }
      return true;
    });
    if (filtrados.length < this.pactos.length) {
      this.pactos = filtrados;
      this.service.setPactos(this.partidaId, this.pactos);
    }
  }

  private expirarPactos(rondaActual: number) {
    const vigentes = this.pactos.filter(p => p.rondaExpira > rondaActual);
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
    this.pactos = this.pactos.map(p =>
      p.id === pactoId
        ? { ...p, estado: 'en_transicion' as const, rondaExpira: rondaActual + 1 }
        : p
    );
    await this.service.setPactos(this.partidaId, this.pactos);
    if (this.pactosRompibles().length === 0) this.modalRomperPacto = false;
    this.cdr.markForCheck();
  }

  abrirPropuestaCompleta() {
    const primerEnemigo = this.enemigos[0];
    if (!primerEnemigo) {
      this.showGameNotif('No hay jugadores disponibles para proponer un tratado.', 'info');
      return;
    }
    this.abrirModalPacto(primerEnemigo.usuario_id, 'no_agresion');
  }

  onReceptorChange(receptorId: string) {
    if (!this.modalPacto) return;
    const t1 = this.modalPacto.territorioId1;
    const limitrofes = this.territoriosLimitrofesDeReceptor(t1, receptorId);
    this.territoriosLimitrofesSeleccionados = limitrofes
      .filter(t => !this.tieneNoAgresion(t1, t.territorio_id))
      .map(t => t.territorio_id);
  }

  onMiTerritorioChange(territorioId: string) {
    if (!this.modalPacto) return;
    const limitrofes = this.territoriosLimitrofesDeReceptor(territorioId, this.modalPacto.receptorId);
    this.territoriosLimitrofesSeleccionados = limitrofes
      .filter(t => !this.tieneNoAgresion(territorioId, t.territorio_id))
      .map(t => t.territorio_id);
  }

  toggleTerritorioLimitrofe(id: string) {
    const idx = this.territoriosLimitrofesSeleccionados.indexOf(id);
    if (idx >= 0) this.territoriosLimitrofesSeleccionados.splice(idx, 1);
    else this.territoriosLimitrofesSeleccionados.push(id);
  }

  territoriosLimitrofesDeReceptor(miTerrId: string, receptorId: string): TerritorioEstado[] {
    const todos = this.territoriosDe(receptorId);
    if (!miTerrId) return todos;
    const vecinos = TERRITORIES.find(t => t.id === miTerrId)?.neighbors ?? [];
    const limitrofes = todos.filter(t => vecinos.includes(t.territorio_id));
    return limitrofes.sort((a, b) =>
      this.nombreTerritorio(a.territorio_id).localeCompare(this.nombreTerritorio(b.territorio_id))
    );
  }

  territoriosLimitrofesMios(suTerrId: string): TerritorioEstado[] {
    const vecinos = TERRITORIES.find(t => t.id === suTerrId)?.neighbors ?? [];
    return this.territoriosDe(this.userId)
      .filter(t => vecinos.includes(t.territorio_id))
      .sort((a, b) =>
        this.nombreTerritorio(a.territorio_id).localeCompare(this.nombreTerritorio(b.territorio_id))
      );
  }

  get hayPactosEnRevision(): boolean {
    return this.misPactosActivos.some(p => this.esPactoEnTransicion(p) || this.esAcuerdoRoto(p));
  }

  get pactoARenovar(): Pacto | null {
    if (!this.propuestaEntrante?.pactoId) return null;
    return this.pactos.find(p => p.id === this.propuestaEntrante!.pactoId) ?? null;
  }

  propuestaNoCubiertos(): string[] {
    const p = this.propuestaEntrante;
    if (!p || p.tipo !== 'no_agresion' || !p.territorioId1) return [];
    const terrsId2 = p.territoriosId2?.length ? p.territoriosId2 : (p.territorioId2 ? [p.territorioId2] : []);
    const vecinos = TERRITORIES.find(t => t.id === p.territorioId1)?.neighbors ?? [];
    const ownerId1 = this.territorios[p.territorioId1]?.usuario_id;
    const otroJugadorId = ownerId1 === p.proponenteId ? this.userId : p.proponenteId;
    const otroTerrIds = this.territoriosDe(otroJugadorId).map(t => t.territorio_id);
    return vecinos
      .filter(v => otroTerrIds.includes(v) && !terrsId2.includes(v))
      .map(id => this.nombreTerritorio(id));
  }

  onModalidadChange(m: 1 | 2) {
    if (!this.modalPacto) return;
    this.modalPacto.modalidad = m;
    if (m === 1) {
      const misT = this.territoriosDe(this.userId);
      const terrId1 = misT[0]?.territorio_id ?? '';
      this.modalPacto.territorioId1 = terrId1;
      const limitrofes = this.territoriosLimitrofesDeReceptor(terrId1, this.modalPacto.receptorId);
      this.territoriosLimitrofesSeleccionados = limitrofes
        .filter(t => !this.tieneNoAgresion(terrId1, t.territorio_id))
        .map(t => t.territorio_id);
    } else {
      const susT = this.territoriosDe(this.modalPacto.receptorId);
      const terrId1 = susT[0]?.territorio_id ?? '';
      this.modalPacto.territorioId1 = terrId1;
      const limitrofes = this.territoriosLimitrofesMios(terrId1);
      this.territoriosLimitrofesSeleccionados = limitrofes
        .filter(t => !this.tieneNoAgresion(terrId1, t.territorio_id))
        .map(t => t.territorio_id);
    }
    this.cdr.markForCheck();
  }

  onSuTerritorioChange(suTerrId: string) {
    if (!this.modalPacto) return;
    this.modalPacto.territorioId1 = suTerrId;
    const limitrofes = this.territoriosLimitrofesMios(suTerrId);
    this.territoriosLimitrofesSeleccionados = limitrofes
      .filter(t => !this.tieneNoAgresion(suTerrId, t.territorio_id))
      .map(t => t.territorio_id);
  }

  abrirModalPacto(receptorId: string, tipo: 'alianza' | 'no_agresion' | 'renovacion') {
    if (tipo === 'renovacion') {
      const renovables = this.pactosRenovables();
      const primer = renovables[0];
      const rid = primer ? (primer.jugador1Id === this.userId ? primer.jugador2Id : primer.jugador1Id) : receptorId;
      this.modalPacto = { receptorId: rid, tipo: 'renovacion', territorioId1: '', territorioId2: '', modalidad: 1, pactoId: primer?.id };
      this.cdr.markForCheck();
      return;
    }
    const misT  = Object.values(this.territorios).filter(t => t.usuario_id === this.userId);
    const terrId1 = this.territorioAtacanteId ?? (misT[0]?.territorio_id ?? '');
    const limitrofes = this.territoriosLimitrofesDeReceptor(terrId1, receptorId);
    this.territoriosLimitrofesSeleccionados = limitrofes
      .filter(t => !this.tieneNoAgresion(terrId1, t.territorio_id))
      .map(t => t.territorio_id);
    this.modalPacto = {
      receptorId,
      tipo,
      territorioId1: terrId1,
      territorioId2: limitrofes[0]?.territorio_id ?? '',
      modalidad: 1,
    };
    this.cdr.markForCheck();
  }

  proponerPacto() {
    if (!this.modalPacto || this.propuestaSaliente) return;
    const { tipo, receptorId, territorioId1 } = this.modalPacto;
    if (tipo !== 'renovacion') {
      if (this.countPactosJugador(this.userId) >= 2) {
        this.showGameNotif('Ya tenés 2 tratados activos, en revisión o en ruptura. No podés proponer otro.', 'error');
        return;
      }
      const nombreReceptor = this.nombreJugadorById(receptorId);
      if (this.countPactosJugador(receptorId) >= 2) {
        this.showGameNotif(`${nombreReceptor} ya tiene 2 tratados activos, en revisión o en ruptura. No puede recibir otro.`, 'error');
        return;
      }
      if (this.hayHostilidadEntre(this.userId, receptorId)) {
        this.showGameNotif(`No podés proponer un tratado a ${nombreReceptor}: existe una declaración de hostilidad entre ustedes.`, 'error');
        return;
      }
      if (tipo === 'alianza' && !this.ambosAmigables(this.userId, receptorId)) {
        this.showGameNotif(`Para una alianza ambas partes deben declararse amigables mutuamente.`, 'error');
        return;
      }
    }
    if (tipo === 'no_agresion' && (!territorioId1 || this.territoriosLimitrofesSeleccionados.length === 0)) {
      this.showGameNotif('Seleccioná al menos un territorio.', 'info');
      return;
    }
    if (tipo === 'renovacion' && !this.modalPacto.pactoId) {
      this.showGameNotif('Seleccioná un pacto para renovar.', 'info');
      return;
    }
    const propuesta: PropuestaPacto = {
      id: crypto.randomUUID(),
      tipo, proponenteId: this.userId, receptorId,
      territorioId1: tipo === 'no_agresion' ? territorioId1 : undefined,
      territorioId2: tipo === 'no_agresion' ? this.territoriosLimitrofesSeleccionados[0] : undefined,
      territoriosId2: tipo === 'no_agresion' ? [...this.territoriosLimitrofesSeleccionados] : undefined,
      pactoId: tipo === 'renovacion' ? this.modalPacto.pactoId : undefined,
      ts: Date.now(),
    };
    this.propuestaSaliente = propuesta;
    this.modalPacto = null;
    this.channelEventos?.send({ type: 'broadcast', event: 'pacto_propuesta', payload: propuesta });
    this.cdr.markForCheck();
  }

  async aceptarPropuesta() {
    if (!this.propuestaEntrante) return;
    const p = this.propuestaEntrante;
    const rondaActual = this.partida?.ronda_actual ?? 1;

    if (p.tipo !== 'renovacion') {
      const rechazarPorLimite = (msg: string) => {
        this.showGameNotif(msg, 'error');
        this.propuestaEntrante = null;
        this.channelEventos?.send({ type: 'broadcast', event: 'pacto_respuesta', payload: { id: p.id, accepted: false } });
        this.cdr.markForCheck();
      };
      if (this.countPactosJugador(this.userId) >= 2) {
        rechazarPorLimite('Ya tenés 2 tratados activos, en revisión o en ruptura. No podés aceptar otro.');
        return;
      }
      if (this.countPactosJugador(p.proponenteId) >= 2) {
        rechazarPorLimite(`${this.nombreJugadorById(p.proponenteId)} ya tiene 2 tratados activos, en revisión o en ruptura. El tratado no puede establecerse.`);
        return;
      }
      if (this.hayHostilidadEntre(this.userId, p.proponenteId)) {
        rechazarPorLimite(`No podés aceptar este tratado: existe una declaración de hostilidad entre vos y ${this.nombreJugadorById(p.proponenteId)}.`);
        return;
      }
      if (p.tipo === 'alianza' && !this.ambosAmigables(this.userId, p.proponenteId)) {
        rechazarPorLimite(`Para una alianza ambas partes deben declararse amigables mutuamente.`);
        return;
      }
    }

    if (p.tipo === 'renovacion' && p.pactoId) {
      this.pactos = this.pactos.map(pacto =>
        pacto.id === p.pactoId
          ? { ...pacto, estado: 'activo' as const, rondaInicio: rondaActual, rondaExpira: rondaActual + 3 }
          : pacto
      );
      this.propuestaEntrante = null;
      this.channelEventos?.send({
        type: 'broadcast', event: 'pacto_respuesta',
        payload: { id: p.id, accepted: true, pactoRenovadoId: p.pactoId, rondaExpira: rondaActual + 3 },
      });
      const tipoPacto = this.pactos.find(x => x.id === p.pactoId)?.tipo ?? 'alianza';
      const renovPayload = {
        jugador1Nombre: this.nombreJugadorById(p.proponenteId),
        jugador2Nombre: this.nombreJugadorById(p.receptorId),
        tipo: tipoPacto, color: this.jugadorColores[p.proponenteId] ?? '#94a3b8',
        ts: Date.now(), esRenovacion: true,
      };
      this.pushNotifPacto(renovPayload.jugador1Nombre, renovPayload.jugador2Nombre, tipoPacto, renovPayload.color, true, renovPayload.ts);
      this.channelEventos?.send({ type: 'broadcast', event: 'pacto_aceptado', payload: renovPayload });
      await this.service.setPactos(this.partidaId, this.pactos);
      this.showGameNotif('¡Pacto renovado!', 'ok');
      this.cdr.markForCheck();
      return;
    }

    const nuevoPacto: Pacto = {
      id: p.id, tipo: p.tipo as 'alianza' | 'no_agresion',
      jugador1Id: p.proponenteId, jugador2Id: p.receptorId,
      territorioId1: p.territorioId1,
      territorioId2: p.territorioId2,
      territoriosId2: p.territoriosId2,
      rondaInicio: rondaActual, rondaExpira: rondaActual + 3,
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
      tipo: nuevoPacto.tipo, color: this.jugadorColores[p.proponenteId] ?? '#94a3b8',
      ts: Date.now(), esRenovacion: false,
    };
    this.pushNotifPacto(nuevoPayload.jugador1Nombre, nuevoPayload.jugador2Nombre, nuevoPacto.tipo, nuevoPayload.color, false, nuevoPayload.ts);
    this.channelEventos?.send({ type: 'broadcast', event: 'pacto_aceptado', payload: nuevoPayload });
    await this.service.setPactos(this.partidaId, this.pactos);
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

  nombresTerritorio(ids: string[]): string {
    return ids.map(id => this.nombreTerritorio(id)).join(', ');
  }

  private pathViewBox(d: string, padding = 16): string {
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

  private playSfx(path: string) {
    if (this.modoAudio === 'sin_sonido') return;
    this.zone.runOutsideAngular(() => {
      let sfx = this.sfxPool.get(path);
      if (!sfx) {
        sfx = new Audio(path);
        this.sfxPool.set(path, sfx);
      }
      sfx.currentTime = 0;
      sfx.play().catch(() => {});
    });
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
      map[t.territorio_id] = t.tropas + cont + base;
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
    await this.channelChat.send({ type: 'broadcast', event: 'chat', payload: msg });
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

  async abrirChatPrivado(jugadorId: string) {
    if (this.hayHostilidadEntre(this.userId, jugadorId)) {
      this.showGameNotif(`No podés chatear con ${this.nombreJugadorById(jugadorId)}: existe una declaración de hostilidad entre ustedes.`, 'error');
      return;
    }
    // 1. DM que nosotros creamos (el otro puede no haber aceptado aún)
    const dmExistente = this.dmGroups[jugadorId];
    if (dmExistente && this.gruposMios.find(g => g.id === dmExistente)) {
      this.chatActivoId = dmExistente;
      this.setPanelActivo('chat');
      return;
    }
    // 2. DM que el otro jugador creó con nosotros (ya aceptamos)
    const grupoRecibido = this.gruposMios.find(g =>
      g.jugadoresIds.includes(jugadorId) && g.bandera === '💬'
    );
    if (grupoRecibido) {
      this.chatActivoId = grupoRecibido.id;
      this.setPanelActivo('chat');
      return;
    }
    // 3. Crear nuevo DM
    const nombre = this.nombreJugadorById(jugadorId);
    const id = crypto.randomUUID();
    const grupo: GrupoChat = {
      id, nombre: `💬 ${nombre}`, bandera: '💬',
      jugadoresIds: [this.userId], creadoPor: this.userId,
    };
    await this.service.crearGrupoChat({ id, partida_id: this.partidaId, nombre: grupo.nombre, bandera: grupo.bandera, creado_por: this.userId });
    await this.service.unirseGrupoChat(id, this.userId);
    this.grupos = [...this.grupos, grupo];
    this.dmGroups[jugadorId] = id;
    this.chatActivoId = id;
    const inv: InvitacionGrupo = {
      id: crypto.randomUUID(), grupoId: grupo.id,
      grupoNombre: grupo.nombre, grupoBandera: grupo.bandera,
      invitadorId: this.userId, invitadoId: jugadorId,
      totalEsperados: 2, ts: Date.now(),
    };
    await this.channelEventos?.send({ type: 'broadcast', event: 'invitacion_grupo', payload: inv });
    await this.channelEventos?.send({ type: 'broadcast', event: 'grupo_nuevo', payload: grupo });
    this.setPanelActivo('chat');
    this.cdr.markForCheck();
  }

  // ── Grupos ──────────────────────────────────────────────
  abrirModalGrupos() {
    this.modalGrupos = { nombre: '', bandera: this.BANDERAS[0], jugadoresIds: [] };
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
    await this.channelEventos?.send({ type: 'broadcast', event: 'grupo_nuevo', payload: grupo });
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
      await this.channelEventos?.send({ type: 'broadcast', event: 'invitacion_grupo', payload: inv });
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
    this.notifItems = [item, ...this.notifItems].slice(0, 3);
  }

  private pushNotifCombate(data: UltimoCombate) {
    const bajas = `${data.bajasAtacante} bajas propias · ${data.bajasDefensor} enemigas`;
    this.addNotif({
      tipo: 'combate', icono: '⚔️',
      linea1: `${data.atacanteNombre} atacó ${data.destinoNombre}`,
      linea2: data.conquista ? `¡Conquistado! ${bajas}` : bajas,
      color: data.colorAtacante, ts: data.ts,
    });
  }

  private pushNotifConquista(data: UltimaConquista) {
    this.addNotif({
      tipo: 'conquista', icono: '🏴',
      linea1: `${data.atacanteNombre} conquistó`,
      linea2: `${data.territorioNombre} (de ${data.defensorNombre})`,
      color: data.colorAtacante, ts: data.ts,
    });
  }

  private pushNotifPacto(j1: string, j2: string, tipo: 'alianza' | 'no_agresion', color: string, esRenovacion: boolean, ts: number) {
    const icono = tipo === 'alianza' ? '🤝' : '🛡️';
    const label = tipo === 'alianza' ? 'Alianza' : 'No agresión';
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
    return KuboTegJuegoComponent.CONTINENT_NAMES[id] ?? id;
  }

  private pushNotifContinente(jugador: string, continente: string, color: string) {
    this.addNotif({ tipo: 'conquista', icono: '★', linea1: `${jugador} domina`, linea2: continente, color, ts: Date.now() });
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

  // ── Objetivos secretos ────────────────────────────────

  private async generarYAsignarObjetivos() {
    const CONTS = ['north_america', 'south_america', 'europe', 'africa', 'asia', 'oceania'];
    const pool: ObjetivoSecreto[] = [];

    for (let i = 0; i < CONTS.length; i++) {
      for (let j = i + 1; j < CONTS.length; j++) {
        pool.push({ tipo: 'continentes', ids: [CONTS[i], CONTS[j]] as [string, string] });
      }
    }
    for (const j of this.jugadores) {
      if (j.color) pool.push({ tipo: 'destruir', color: j.color });
    }

    const shuffled = this.randomShuffle([...pool]);
    const assignments: Array<{ userId: string; obj: ObjetivoSecreto }> = [];

    for (const jugador of this.jugadores) {
      const idx = shuffled.findIndex(obj =>
        !(obj.tipo === 'destruir' && (obj as { tipo: 'destruir'; color: string }).color === jugador.color)
      );
      if (idx === -1) continue;
      const [obj] = shuffled.splice(idx, 1);
      if (jugador.usuario_id === this.userId) this.miObjetivo = obj;
      assignments.push({ userId: jugador.usuario_id, obj });
    }
    await Promise.all(
      assignments.map(a => this.service.setObjetivo(this.partidaId, a.userId, a.obj))
    );
  }

  private verificarVictoriaObjetivo(conquistadoId: string, eliminadoId: string | null): boolean {
    if (!this.miObjetivo) return false;

    const esMio = (tid: string) =>
      tid === conquistadoId || this.territorios[tid]?.usuario_id === this.userId;

    if (this.miObjetivo.tipo === 'continentes') {
      const CONT = KuboTegJuegoComponent.CONTINENT_TERRITORIES;
      return this.miObjetivo.ids.every(cid => CONT[cid].every(tid => esMio(tid)));
    }

    if (this.miObjetivo.tipo === 'destruir') {
      const color = this.miObjetivo.color;
      const targetJ = this.jugadores.find(j => j.color === color);
      if (!targetJ) {
        return Object.values(this.territorios).filter(t => esMio(t.territorio_id)).length >= 24;
      }
      const targetQuedan = Object.values(this.territorios).filter(
        t => t.usuario_id === targetJ.usuario_id && t.territorio_id !== conquistadoId
      ).length;
      if (targetQuedan === 0) {
        if (eliminadoId === targetJ.usuario_id) return true;
        return Object.values(this.territorios).filter(t => esMio(t.territorio_id)).length >= 24;
      }
    }

    return false;
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
    const CONT = KuboTegJuegoComponent.CONTINENT_TERRITORIES;
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
