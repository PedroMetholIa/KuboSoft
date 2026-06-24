import { Component, Input } from '@angular/core';

export interface NotifItem {
  tipo: 'combate' | 'conquista' | 'carta' | 'grupo' | 'pacto';
  icono: string;
  linea1: string;
  linea2: string;
  color: string;
  ts: number;
  bonusNombre?: string | null;
  jugador?: string | null;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  template: `
    <div class="notif-panel">
      <div class="notif-list">
        @if (items.length === 0) {
          <div class="notif-empty">Sin eventos aún</div>
        }

        @for (item of items; track item.ts) {
          <div class="notif-item">
            <span class="notif-dot" [style.background-color]="item.color"></span>
            <span class="notif-icono">{{ item.icono }}</span>
            <div class="notif-body">
              <span class="notif-linea1">{{ item.jugador ? item.jugador + ' · ' + item.linea1 : item.linea1 }}</span>
              <span class="notif-linea2">{{ item.linea2 }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './notificaciones.component.scss'
})
export class NotificacionesComponent {
  @Input() items: NotifItem[] = [];
}
