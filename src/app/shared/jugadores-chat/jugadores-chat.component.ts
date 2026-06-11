import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from '../../core/services/supabase.service';

interface Jugador {
  nombre: string | null;
  apellido: string | null;
  email: string;
  last_seen: string | null;
  mensaje: string | null;
  is_online: boolean | null;
}

interface ChatMessage {
  nombre: string;
  mensaje: string;
  esPropio: boolean;
  time: Date;
  color: string;
}

const CHAT_COLORS = [
  '#60a5fa', '#34d399', '#f472b6', '#fb923c',
  '#a78bfa', '#facc15', '#38bdf8', '#f87171',
  '#4ade80', '#e879f9',
];

@Component({
  selector: 'app-jugadores-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel jc-panel">
      <div class="jc-header">
        <span class="jc-icon">{{ icon }}</span>
        <h3 class="jc-title">{{ title }}</h3>
        <span class="jc-badge" *ngIf="!chatMode">{{ onlineCount }}</span>
      </div>

      <div class="jc-list" *ngIf="!chatMode">
        <div class="jc-item" *ngFor="let j of jugadores"
             [class.jc-me]="j.email === userEmail"
             [class.jc-offline]="!j.is_online">
          <div class="jc-data">
            <span class="jc-nombre">{{ nombreCompleto(j) }}</span>
            <span class="jc-email">{{ j.email }}</span>
            <span class="jc-last">{{ formatDate(j.last_seen) }}</span>
          </div>
        </div>
        <p class="jc-empty" *ngIf="loading">Cargando...</p>
        <p class="jc-empty" *ngIf="!loading && jugadores.length === 0">Sin jugadores suscritos</p>
      </div>

      <div class="jc-chat-list" *ngIf="chatMode" #chatList>
        <div class="jc-chat-row" *ngFor="let m of chatMessages">
          <span class="jc-chat-name" [style.color]="m.color">{{ m.nombre }}</span>
          <span class="jc-chat-msg">{{ m.mensaje }}</span>
        </div>
        <p class="jc-empty" *ngIf="!loading && chatMessages.length === 0">Sin mensajes aún</p>
      </div>

      <div class="jc-form" *ngIf="showForm">
        <div class="jc-input-row">
          <textarea
            [(ngModel)]="mensajeInput"
            placeholder="Escribí tu mensaje (máx. 300 caracteres)"
            maxlength="300"
            rows="1"
            (keydown.enter)="$event.preventDefault(); guardarMensaje()"
          ></textarea>
          <button (click)="guardarMensaje()" [disabled]="saving || !mensajeInput.trim()">
            {{ saving ? '...' : 'Enviar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './jugadores-chat.component.scss'
})
export class JugadoresChatComponent implements OnChanges, OnDestroy, AfterViewChecked {
  @Input() jugadores: Jugador[] = [];
  @Input() userEmail = '';
  @Input() userId = '';
  @Input() loading = false;
  @Input() title = 'Jugadores';
  @Input() icon = '👥';
  @Input() showForm = false;
  @Input() chatMode = false;
  @Input() channelName = 'chat-usuario-mensajes';

  @ViewChild('chatList') private chatListRef?: ElementRef<HTMLDivElement>;

  chatMessages: ChatMessage[] = [];
  mensajeInput = '';
  saving = false;
  private shouldScroll = false;

  get onlineCount(): number { return this.jugadores.filter(j => j.is_online).length; }

  private seeded = false;
  private channelChat: RealtimeChannel | null = null;
  private colorMap = new Map<string, string>();
  private colorIndex = 0;
  private knownMensajes = new Map<string, string | null>();

  constructor(private service: SupabaseService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.chatMode && changes['jugadores'] && !this.seeded && this.jugadores.length > 0) {
      this.seeded = true;
      this.subscribeChat();
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      const el = this.chatListRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }

  ngOnDestroy() {
    this.channelChat?.unsubscribe();
  }

  private subscribeChat() {
    for (const j of this.jugadores) {
      this.knownMensajes.set(j.email, j.mensaje);
    }

    this.channelChat = this.service.client
      .channel(this.channelName)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'usuario' }, (payload) => {
        const nuevoMensaje = payload.new['mensaje'] as string | null;
        if (!nuevoMensaje) return;
        if (payload.new['email'] === this.userEmail) return;
        const jugador = this.jugadores.find(j => j.email === payload.new['email']);
        if (!jugador) return;
        if (nuevoMensaje === this.knownMensajes.get(payload.new['email'])) return;
        this.knownMensajes.set(payload.new['email'], nuevoMensaje);
        this.pushMessage(
          payload.new['nombre'] as string | null,
          payload.new['apellido'] as string | null,
          payload.new['email'] as string,
          nuevoMensaje
        );
      })
      .subscribe();
  }

  private pushMessage(nombre: string | null, apellido: string | null, email: string, mensaje: string) {
    if (!this.colorMap.has(email)) {
      this.colorMap.set(email, CHAT_COLORS[this.colorIndex % CHAT_COLORS.length]);
      this.colorIndex++;
    }
    const n = [nombre, apellido].filter(Boolean).join(' ') || email;
    this.chatMessages.push({
      nombre: n,
      mensaje,
      esPropio: email === this.userEmail,
      time: new Date(),
      color: this.colorMap.get(email)!
    });
    this.shouldScroll = true;
  }

  async guardarMensaje() {
    if (!this.mensajeInput.trim() || !this.userId) return;
    const texto = this.mensajeInput.trim();
    this.saving = true;

    const me = this.jugadores.find(j => j.email === this.userEmail);
    this.pushMessage(me?.nombre ?? null, me?.apellido ?? null, this.userEmail, texto);

    await this.service.updateMensaje(this.userId, texto);
    this.mensajeInput = '';
    this.saving = false;
  }

  nombreCompleto(j: Jugador): string {
    const n = [j.nombre, j.apellido].filter(Boolean).join(' ');
    return n || j.email;
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  }
}
