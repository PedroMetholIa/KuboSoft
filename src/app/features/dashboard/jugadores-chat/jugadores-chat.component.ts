import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from '../../../core/services/supabase.service';

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
}

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

      <!-- Modo jugadores: nombre + apellido + última conexión -->
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

      <!-- Modo chat: historial en memoria -->
      <div class="jc-chat-list" *ngIf="chatMode">
        <div class="jc-chat-row" *ngFor="let m of chatMessages" [class.jc-chat-me]="m.esPropio">
          <span class="jc-chat-name">{{ m.nombre }}</span>
          <span class="jc-chat-msg">{{ m.mensaje }}</span>
        </div>
        <p class="jc-empty" *ngIf="!loading && chatMessages.length === 0">Sin mensajes aún</p>
      </div>

      <!-- Formulario -->
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
export class JugadoresChatComponent implements OnChanges, OnDestroy {
  @Input() jugadores: Jugador[] = [];
  @Input() userEmail = '';
  @Input() userId = '';
  @Input() loading = false;
  @Input() title = 'Jugadores';
  @Input() icon = '👥';
  @Input() showForm = false;
  @Input() chatMode = false;

  chatMessages: ChatMessage[] = [];
  mensajeInput = '';
  saving = false;

  get onlineCount(): number { return this.jugadores.filter(j => j.is_online).length; }

  private seeded = false;
  private channelChat: RealtimeChannel | null = null;

  constructor(private service: SupabaseService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.chatMode && changes['jugadores'] && !this.seeded && this.jugadores.length > 0) {
      this.seeded = true;
      this.subscribeChat();
    }
  }

  ngOnDestroy() {
    this.channelChat?.unsubscribe();
  }

  private subscribeChat() {
    this.channelChat = this.service.client
      .channel('chat-usuario-mensajes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'usuario' }, (payload) => {
        const nuevoMensaje = payload.new['mensaje'] as string | null;
        if (!nuevoMensaje) return;
        // El mensaje propio ya fue agregado optimísticamente al enviar
        if (payload.new['email'] === this.userEmail) return;
        // Solo agregar si el jugador pertenece a la sala
        const jugador = this.jugadores.find(j => j.email === payload.new['email']);
        if (!jugador) return;
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
    const n = [nombre, apellido].filter(Boolean).join(' ') || email;
    this.chatMessages.push({
      nombre: n,
      mensaje,
      esPropio: email === this.userEmail,
      time: new Date()
    });
  }

  async guardarMensaje() {
    if (!this.mensajeInput.trim() || !this.userId) return;
    const texto = this.mensajeInput.trim();
    this.saving = true;

    // Agregar optimísticamente antes de esperar la DB
    const me = this.jugadores.find(j => j.email === this.userEmail);
    this.pushMessage(
      me?.nombre ?? null,
      me?.apellido ?? null,
      this.userEmail,
      texto
    );

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
