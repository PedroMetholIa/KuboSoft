import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-partida-info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pi-root">

      <div class="pi-meta">
        <span class="pi-label">Nombre de la partida:</span>
        <span class="pi-nombre">{{ nombre }}</span>
        <span class="pi-sep">·</span>
        <span class="pi-estado" [class.live]="estado === 'En juego'" [class.done]="estado !== 'En juego'">
          {{ estado }}
        </span>
        @if (rondaActual) {
          <span class="pi-sep">·</span>
          <span class="pi-ronda">
            Ronda <strong>{{ rondaActual }}</strong>
            @if (limiteRondas) { de {{ limiteRondas }} }
          </span>
        }
        <span class="pi-sep">·</span>
        <span class="pi-timer">⏱ {{ tiempoPartida }}</span>
      </div>

      @if (fase && jugadorNombre) {
        <div class="pi-divider"></div>
        <div class="pi-turno">
          <span class="pi-turno-jugador" [style.color]="jugadorColor">
            {{ esMiTurno ? 'Tu turno' : jugadorNombre }}
          </span>
        </div>
      }

    </div>
  `,
  styleUrl: './partida-info.component.scss'
})
export class PartidaInfoComponent {
  @Input() nombre = '';
  @Input() estado = '';
  @Input() rondaActual: number | null = null;
  @Input() limiteRondas: number | null = null;
  @Input() tiempoPartida = '00:00:00';
  @Input() jugadorNombre = '';
  @Input() jugadorColor = '';
  @Input() esMiTurno = false;
  @Input() fase: string | null = null;
}
