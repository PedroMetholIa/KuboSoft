import { Component, Input } from '@angular/core';

export interface NotifItem {
  tipo: 'combate' | 'conquista' | 'carta';
  icono: string;
  linea1: string;
  linea2: string;
  color: string;
  ts: number;
  bonusNombre?: string | null;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  template: `
    <div class="notif-panel">
      <div class="notif-header">
        <span class="notif-title">Eventos</span>
        @if (items.length > 0) {
          <span class="notif-badge">{{ items.length }}</span>
        }
      </div>

      <div class="notif-list">
        @if (items.length === 0) {
          <div class="notif-empty">Sin eventos aún</div>
        }

        @for (item of items; track item.ts) {
          @if (item.tipo === 'carta') {
            <div class="notif-item notif-carta-item">
              <div class="carta-grande-icon">🃏</div>
              <div class="carta-grande-body">
                <div class="carta-grande-label">Carta robada</div>
                <div class="carta-grande-nombre">{{ item.linea1 }}</div>
                @if (item.bonusNombre) {
                  <div class="carta-grande-bonus">✦ Bonus: {{ item.bonusNombre }}</div>
                }
              </div>
            </div>
          } @else {
            <div class="notif-item" [class.notif-conquista]="item.tipo === 'conquista'">
              <span class="notif-icono">{{ item.icono }}</span>
              <div class="notif-body">
                <span class="notif-linea1">{{ item.linea1 }}</span>
                <span class="notif-linea2">{{ item.linea2 }}</span>
              </div>
              <span class="notif-dot" [style.background-color]="item.color"></span>
            </div>
          }
        }
      </div>
    </div>
  `,
  styleUrl: './notificaciones.component.scss'
})
export class NotificacionesComponent {
  @Input() items: NotifItem[] = [];
}
