import { Injectable, NgZone } from '@angular/core';
import { ModoAudio } from './game.types';

@Injectable({ providedIn: 'root' })
export class AudioService {
  modoAudio: ModoAudio = 'musica_lideres';
  private ultimoModoActivo: 'musica_uniforme' | 'musica_lideres' = 'musica_lideres';

  readonly BASE_VOLUME = 0.4;

  get musicaMuteada(): boolean {
    return this.modoAudio === 'sin_sonido' || this.modoAudio === 'sin_musica';
  }

  private audio!: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sfxPool = new Map<string, HTMLAudioElement>();
  private autoplayRetry: (() => void) | null = null;

  constructor(private zone: NgZone) {}

  init(): void {
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
  }

  destroy(): void {
    if (this.autoplayRetry) {
      document.removeEventListener('click', this.autoplayRetry);
      this.autoplayRetry = null;
    }
    this.audio.onerror = null;
    this.audio.pause();
    this.audio.src = '';
    this.sfxPool.forEach(a => { a.pause(); a.src = ''; });
    this.sfxPool.clear();
    this.modoAudio = 'musica_lideres';
    this.ultimoModoActivo = 'musica_lideres';
    this.audioCtx = null;
    this.gainNode = null;
  }

  toggleMusica(): void {
    this.setModoAudio(this.musicaMuteada ? this.ultimoModoActivo : 'sin_musica');
  }

  setModoAudio(modo: ModoAudio): void {
    this.modoAudio = modo;
    if (modo === 'musica_uniforme' || modo === 'musica_lideres') {
      this.ultimoModoActivo = modo;
    } else {
      this.audio.pause();
      if (this.gainNode) this.gainNode.gain.value = 0;
    }
  }

  silenceGain(): void {
    if (this.gainNode) this.gainNode.gain.value = 0;
  }

  pauseBgMusic(): void {
    this.audio.pause();
  }

  playBgMusic(rawSrc: string, volumen: number): void {
    if (this.musicaMuteada) {
      this.audio.pause();
      return;
    }
    const src = rawSrc.startsWith('/') || rawSrc.startsWith('http') ? rawSrc : `/${rawSrc}`;
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
    this.audio.play().catch(() => { this.scheduleAutoplayRetry(volumen); });
  }

  // Registers a one-shot click listener so the first user interaction after an
  // autoplay-policy rejection resumes the audio context and retries playback.
  private scheduleAutoplayRetry(volumen: number): void {
    if (this.autoplayRetry) return;
    this.autoplayRetry = () => {
      this.autoplayRetry = null;
      if (this.musicaMuteada) return;
      if (this.audioCtx?.state === 'suspended') this.audioCtx.resume();
      if (this.gainNode) this.gainNode.gain.value = volumen;
      this.audio.play().catch(() => {});
    };
    document.addEventListener('click', this.autoplayRetry, { once: true });
  }

  playSfx(path: string): void {
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

  reproducirSonidoCombate(): void {
    const n = Math.floor(Math.random() * 7) + 1;
    this.playSfx(`assets/KuboTeg/sonidos/combate${n}.mp3`);
  }

  private setupAudioContext(): void {
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
  }
}
