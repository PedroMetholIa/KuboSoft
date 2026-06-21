import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ChatMensaje {
  userId: string;
  nombre: string;
  texto: string;
  color: string;
  ts: number;
  grupoId?: string;
}

@Component({
  selector: 'app-kuboteg-chat',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chat-header">
      <span class="chat-title">Chat</span>
      @if (messages.length > 0) {
        <span class="chat-count">{{ messages.length }}</span>
      }
    </div>
    <div class="chat-messages" #chatRef>
      @if (messages.length === 0) {
        <div class="chat-empty">Sin mensajes aún</div>
      }
      @for (m of messages; track m.ts) {
        <div class="chat-msg" [class.chat-msg-mine]="m.userId === userId">
          <span class="chat-msg-from" [style.color]="m.color">{{ m.nombre }}</span>
          <span
            class="chat-msg-texto"
            [style.background-color]="bubbleBg(m.color)"
            [style.border-color]="m.color">{{ m.texto }}</span>
        </div>
      }
    </div>
    <div class="chat-input-row">
      <input
        class="chat-input"
        [(ngModel)]="chatInput"
        placeholder="Mensaje..."
        maxlength="200"
        autocomplete="off"
        (keydown.enter)="send()"
      />
      <button class="chat-send-btn" type="button" (click)="send()">→</button>
    </div>
  `,
  styleUrl: './chat.component.scss',
})
export class KubotegChatComponent implements OnChanges {
  @Input() messages: ChatMensaje[] = [];
  @Input() userId = '';
  @Output() sendMessage = new EventEmitter<string>();

  @ViewChild('chatRef') private chatRef!: ElementRef<HTMLDivElement>;

  chatInput = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messages']) {
      setTimeout(() => {
        const el = this.chatRef?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      }, 0);
    }
  }

  send() {
    const texto = this.chatInput.trim();
    if (!texto) return;
    this.sendMessage.emit(texto);
    this.chatInput = '';
  }

  bubbleBg(color: string): string {
    return color.startsWith('rgb(')
      ? color.replace('rgb(', 'rgba(').replace(')', ', 0.3)')
      : color;
  }
}
