import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partida-info',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pi-root">

      <!-- Bloque izquierdo: nombre + estado + ronda + tiempo -->
      <div class="pi-meta">
        <span class="pi-label">Nombre de la partida:</span>
        <span class="pi-nombre">{{ nombre }}</span>
        <span class="pi-sep">·</span>
        <span class="pi-estado" [ngClass]="estado === 'En juego' ? 'live' : 'done'">
          {{ estado }}
        </span>
        <ng-container *ngIf="rondaActual">
          <span class="pi-sep">·</span>
          <span class="pi-ronda">Ronda <strong>{{ rondaActual }}</strong></span>
        </ng-container>
        <span class="pi-sep">·</span>
        <span class="pi-timer">⏱ {{ tiempoPartida }}</span>
      </div>

      <!-- Divisor vertical -->
      <div class="pi-divider" *ngIf="fase && jugadorNombre"></div>

      <!-- Bloque derecho: jugador en turno + fase -->
      <div class="pi-turno" *ngIf="fase && jugadorNombre">
        <span class="pi-turno-jugador" [style.color]="jugadorColor">
          {{ esMiTurno ? 'Tu turno' : jugadorNombre }}
        </span>
      </div>

    </div>
  `,
  styleUrl: './partida-info.component.scss'
})
export class PartidaInfoComponent {
  @Input() nombre = '';
  @Input() estado = '';
  @Input() rondaActual: number | null = null;
  @Input() tiempoPartida = '00:00:00';
  @Input() jugadorNombre = '';
  @Input() jugadorColor = '';
  @Input() esMiTurno = false;
  @Input() fase: string | null = null;

}
