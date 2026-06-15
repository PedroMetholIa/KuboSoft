import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NotifItem {
  tipo: 'combate' | 'conquista';
  icono: string;
  linea1: string;
  linea2: string;
  color: string;
  ts: number;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-panel">
      <div class="notif-header">
        <span class="notif-title">Eventos</span>
        <span class="notif-badge" *ngIf="items.length > 0">{{ items.length }}</span>
      </div>

      <div class="notif-list">
        <div class="notif-empty" *ngIf="items.length === 0">
          Sin eventos aún
        </div>

        <div class="notif-item" *ngFor="let item of items" [class.notif-conquista]="item.tipo === 'conquista'">
          <span class="notif-icono">{{ item.icono }}</span>
          <div class="notif-body">
            <span class="notif-linea1">{{ item.linea1 }}</span>
            <span class="notif-linea2">{{ item.linea2 }}</span>
          </div>
          <span class="notif-dot" [style.background-color]="item.color"></span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './notificaciones.component.scss'
})
export class NotificacionesComponent {
  @Input() items: NotifItem[] = [];
}
