import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UltimoCombate } from '../../../core/services/supabase.service';

const DOT_PATTERNS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

interface DieState {
  value: number;
  finalValue: number;
}

@Component({
  selector: 'app-combate-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="combate-panel" *ngIf="combate">

      <!-- Atacante -->
      <div class="cp-player">
        <img *ngIf="combate.liderAtacanteImg" class="cp-lider-img" [src]="combate.liderAtacanteImg" [style.border-color]="combate.colorAtacante" alt="">
        <div class="cp-player-info">
          <span class="cp-terr">{{ combate.atacanteNombre }}</span>
          <span class="cp-nombre">{{ combate.origenNombre }}</span>
        </div>
      </div>

      <div class="cp-dados-grupo">
        <div class="cp-dado dado-ataque" *ngFor="let die of attackDice">
          <span *ngFor="let c of cells" class="pip" [class.visible]="isDotVisible(die.value, c)"></span>
        </div>
      </div>

      <span class="cp-vs">⚔️</span>

      <div class="cp-dados-grupo">
        <div class="cp-dado dado-defensa" *ngFor="let die of defenseDice">
          <span *ngFor="let c of cells" class="pip" [class.visible]="isDotVisible(die.value, c)"></span>
        </div>
      </div>

      <!-- Defensor -->
      <div class="cp-player">
        <div class="cp-player-info cp-player-info--right">
          <span class="cp-terr">{{ combate.defensorNombre }}</span>
          <span class="cp-nombre">{{ combate.destinoNombre }}</span>
        </div>
        <img *ngIf="combate.liderDefensorImg" class="cp-lider-img" [src]="combate.liderDefensorImg" [style.border-color]="combate.colorDefensor" alt="">
      </div>

      <!-- Continuar atacando -->
      <button *ngIf="mostrarContinuar" class="cp-btn-continuar" (click)="continuarAtacando.emit()">
        Continuar atacando →
      </button>
    </div>
  `,
  styleUrl: './combate-panel.component.scss'
})
export class CombatePanelComponent implements OnChanges, OnDestroy {
  @Input() combate: UltimoCombate | null = null;
  @Input() mostrarContinuar = false;
  @Output() continuarAtacando = new EventEmitter<void>();

  attackDice: DieState[] = [];
  defenseDice: DieState[] = [];
  readonly cells = CELLS;

  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    const prev = changes['combate']?.previousValue as UltimoCombate | null;
    const curr = changes['combate']?.currentValue as UltimoCombate | null;
    if (curr && curr.ts !== prev?.ts) {
      this.startRoll(curr);
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  isDotVisible(value: number, position: number): boolean {
    return (DOT_PATTERNS[value] ?? []).includes(position);
  }

  private startRoll(combate: UltimoCombate): void {
    this.clearTimers();
    this.attackDice  = combate.dadosAtaque.map(v  => ({ value: this.randomFace(), finalValue: v }));
    this.defenseDice = combate.dadosDefensa.map(v => ({ value: this.randomFace(), finalValue: v }));

    // Stagger: cada dado para en un momento distinto dentro de 200–500ms
    const allDice = [...this.attackDice, ...this.defenseDice];
    allDice.forEach((die) => {
      const stopAt = 200 + Math.random() * 300;
      this.animateDie(die, stopAt);
    });

    this.cdr.markForCheck();
  }

  private animateDie(die: DieState, stopAt: number): void {
    const startTime = Date.now();

    const cycle = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= stopAt) {
        die.value = die.finalValue;
        this.cdr.markForCheck();
        return;
      }

      die.value = this.randomFace();
      this.cdr.markForCheck();

      // Intervalo crece de 50ms → 120ms a medida que se acerca al final
      const progress  = elapsed / stopAt;
      const nextDelay = 50 + progress * 70;
      this.timers.push(setTimeout(cycle, nextDelay));
    };

    this.timers.push(setTimeout(cycle, 0));
  }

  private randomFace(): number {
    return Math.floor(Math.random() * 6) + 1;
  }

  private clearTimers(): void {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
  }
}
