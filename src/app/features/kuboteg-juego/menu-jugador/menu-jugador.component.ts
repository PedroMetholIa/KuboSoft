import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

const PANEL_LABELS: Record<string, string> = {
  jugadores:      'Jugadores',
  inicio:         'Inicio',
  notificaciones: 'Notificaciones',
  noticias:       'Noticias',
  informacion:    'Información',
  tratado:        'Tratado',
  chat:           'Chat',
  diploma:        'Diploma',
  musica:         'Música',
  configuracion:  'Configuración',
};

@Component({
  selector: 'app-menu-jugador',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mj-panel">
      <div class="mj-header">
        <span class="mj-title">{{ panelLabel }}</span>
      </div>
      <div class="mj-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrl: './menu-jugador.component.scss'
})
export class MenuJugadorComponent {
  @Input() panelActivo = 'jugadores';

  get panelLabel(): string {
    return PANEL_LABELS[this.panelActivo] ?? this.panelActivo;
  }
}
