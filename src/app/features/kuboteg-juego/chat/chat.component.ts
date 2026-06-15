import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ChatMensaje {
  userId: string;
  nombre: string;
  texto: string;
  color: string;
  ts: number;
}

@Component({
  selector: 'app-kuboteg-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chat-header">
      <span class="chat-title">Chat</span>
      <span class="chat-count" *ngIf="messages.length > 0">{{ messages.length }}</span>
    </div>
    <div class="chat-messages" #chatRef>
      <div class="chat-empty" *ngIf="messages.length === 0">Sin mensajes aún</div>
      <div
        class="chat-msg"
        *ngFor="let m of messages"
        [class.chat-msg-mine]="m.userId === userId">
        <span
          class="chat-msg-texto"
          [style.background-color]="bubbleBg(m.color)"
          [style.border-color]="m.color">{{ m.texto }}</span>
      </div>
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
  @Input() playerColors: Record<string, string> = {};
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
