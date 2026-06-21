import { Component, OnInit, AfterViewInit, ElementRef, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Territory, Continent } from './territory.model';
import { TERRITORIES } from './territories.data';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, AfterViewInit {
  @Input() territoriosOwner: Record<string, string> = {};
  @Input() jugadorColores: Record<string, string> = {};
  @Input() tropas: Record<string, number> = {};
  @Input() territorioSeleccionado: string | null = null;
  @Input() jugadorNombres: Record<string, string> = {};

  @Input() set territoriosDestacados(val: string[]) {
    this._destacadosSet = new Set(val);
  }

  @Input() set territoriosCombate(val: string[]) {
    this._combateSet = new Set(val);
  }

  @Input() territorioColocandose:   string | null = null;
  @Input() territorioQuitandose:    string | null = null;
  @Input() territorioMovilizandose: string | null = null;
  @Input() territorioCartaAcierta:  string | null = null;

  @Input() territoriosBloqueadosMsgs: Record<string, string> = {};

  @Output() territorioClick = new EventEmitter<string>();
  @Output() territorioRightClick = new EventEmitter<string>();
  @Output() deseleccionar = new EventEmitter<void>();

  territories: Territory[] = [];

  tooltip: Territory | null = null;
  tooltipX = 0;
  tooltipY = 0;
  activePactoMsg: string | null = null;

  private _destacadosSet = new Set<string>();
  private _combateSet    = new Set<string>();

  readonly continentLegend = [
    { id: 'north_america', label: 'América del Norte', color: '#D9B34D' },
    { id: 'south_america', label: 'América del Sur',   color: '#D94059' },
    { id: 'europe',        label: 'Europa',             color: '#4073D9' },
    { id: 'africa',        label: 'África',             color: '#D97326' },
    { id: 'asia',          label: 'Asia',               color: '#40B84D' },
    { id: 'oceania',       label: 'Oceanía',            color: '#8C40D1' },
  ];

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.territories = TERRITORIES.map(t => ({ ...t }));
  }

  ngAfterViewInit(): void {
    const base = this.el.nativeElement.querySelector('#territories') as SVGGElement;
    if (!base) return;
    const b = base.getBBox();
    const dx = +(550 - (b.x + b.width / 2)).toFixed(1);
    const dy = +(325 - (b.y + b.height / 2)).toFixed(1);
    const transform = `translate(${dx},${dy})`;
    ['#territories', '#coastal-glow-layer'].forEach(sel => {
      const g = this.el.nativeElement.querySelector(sel) as SVGGElement;
      if (g) g.setAttribute('transform', transform);
    });
  }

  refresh(): void {
    this.cdr.markForCheck();
  }

  onTerritoryClick(territory: Territory): void {
    this.territorioClick.emit(territory.id);
  }

  onTerritoryRightClick(territory: Territory, event: MouseEvent): void {
    event.preventDefault();
    this.territorioRightClick.emit(territory.id);
  }

  onTerritoryHover(territory: Territory, event: MouseEvent): void {
    this.tooltip = territory;
    this.activePactoMsg = this.territoriosBloqueadosMsgs[territory.id] ?? null;
    this.updateTooltipPosition(event);
    this.cdr.markForCheck();
  }

  onTerritoryLeave(): void {
    this.tooltip = null;
    this.activePactoMsg = null;
    this.cdr.markForCheck();
  }

  getTropas(id: string): number {
    return this.tropas[id] ?? 0;
  }

  getOwnerName(id: string): string | null {
    const ownerId = this.territoriosOwner[id];
    if (!ownerId) return null;
    return this.jugadorNombres[ownerId] ?? null;
  }

  isSelected(t: Territory): boolean {
    return t.id === this.territorioSeleccionado;
  }

  isHighlighted(t: Territory): boolean {
    return this._destacadosSet.has(t.id);
  }

  isCombate(t: Territory): boolean {
    return this._combateSet.has(t.id);
  }

  isColocandose(t: Territory): boolean {
    return t.id === this.territorioColocandose;
  }

  isQuitandose(t: Territory): boolean {
    return t.id === this.territorioQuitandose;
  }

  isMovilizandose(t: Territory): boolean {
    return t.id === this.territorioMovilizandose;
  }

  isCartaAcierta(t: Territory): boolean {
    return t.id === this.territorioCartaAcierta;
  }

  getTerritoryFill(t: Territory): string {
    if (this.isCombate(t)) {
      const color = this.getOwnerColor(t);
      return color ? this.hexToRgba(this.lightenColor(color, 22), 0.98) : '#9a6020';
    }
    if (this.isColocandose(t)) {
      const color = this.getOwnerColor(t);
      return color ? this.hexToRgba(this.lightenColor(color, 30), 1.0) : '#1a6080';
    }
    if (this.isQuitandose(t)) {
      const color = this.getOwnerColor(t);
      return color ? this.hexToRgba(this.lightenColor(color, 10), 0.80) : '#601a30';
    }
    if (this.isSelected(t)) {
      const color = this.getOwnerColor(t);
      return color ? this.lightenColor(color, 45) : '#ffffff';
    }
    if (this.isHighlighted(t)) {
      const ownerId = this.territoriosOwner[t.id];
      if (ownerId && this.jugadorColores[ownerId]) {
        return this.hexToRgba(this.jugadorColores[ownerId], 0.82);
      }
      return this.lightenColor('#6B7280', 40);
    }
    const color = this.getOwnerColor(t);
    if (color) return this.hexToRgba(this.lightenColor(color, 14), 0.96);
    return '#6B7280';
  }

  getTerritoryStroke(t: Territory): string {
    if (this.isCombate(t))      return 'rgba(255, 100, 0, 0.97)';
    if (this.isColocandose(t))  return 'rgba(80, 220, 255, 0.97)';
    if (this.isQuitandose(t))   return 'rgba(255, 60, 100, 0.97)';
    if (this.isSelected(t))     return 'rgba(255,255,255,0.92)';
    if (this.isHighlighted(t)) return 'rgba(255,255,255,0.68)';
    const color = this.getOwnerColor(t);
    if (color) return this.darkenDesaturate(color, 0.22, 0.12);
    return 'rgba(8,6,20,0.88)';
  }

  getTerritoryStrokeWidth(t: Territory): number {
    if (this.isCombate(t))      return 3.0;
    if (this.isColocandose(t))  return 2.8;
    if (this.isQuitandose(t))   return 2.8;
    if (this.isSelected(t))     return 2.5;
    if (this.isHighlighted(t)) return 2.0;
    if (this.territoriosOwner[t.id]) return 1.6;
    return 1.3;
  }

  getBadgeFill(id: string): string {
    const ownerId = this.territoriosOwner[id];
    if (!ownerId || !this.jugadorColores[ownerId]) return '#09152a';
    return this.darkenDesaturate(this.jugadorColores[ownerId], 0.82, 0.04);
  }

  getBadgeStroke(id: string): string {
    const ownerId = this.territoriosOwner[id];
    if (!ownerId || !this.jugadorColores[ownerId]) return 'rgba(165,205,255,0.80)';
    const [r, g, b] = this.parseRgb(this.jugadorColores[ownerId]);
    return `rgba(${Math.min(255, r + 95)},${Math.min(255, g + 95)},${Math.min(255, b + 95)},0.82)`;
  }

  continentLabel(continent: Continent): string {
    const map: Record<Continent, string> = {
      north_america: 'América del Norte',
      south_america: 'América del Sur',
      europe: 'Europa',
      africa: 'África',
      asia: 'Asia',
      oceania: 'Oceanía',
    };
    return map[continent];
  }

  private getOwnerColor(t: Territory): string | null {
    const ownerId = this.territoriosOwner[t.id];
    return (ownerId && this.jugadorColores[ownerId]) ? this.jugadorColores[ownerId] : null;
  }

  private updateTooltipPosition(event: MouseEvent): void {
    const el = (event.target as Element).closest('.map-wrapper');
    if (el) {
      const rect = el.getBoundingClientRect();
      this.tooltipX = event.clientX - rect.left + 12;
      this.tooltipY = event.clientY - rect.top - 10;
    }
  }

  private parseRgb(color: string): [number, number, number] {
    const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (m) return [+m[1], +m[2], +m[3]];
    const n = parseInt(color.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  private hexToRgba(color: string, alpha: number): string {
    const [r, g, b] = this.parseRgb(color);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  private darkenDesaturate(color: string, darkenFactor: number, desaturateAmount: number): string {
    let [r, g, b] = this.parseRgb(color);
    r = Math.round(r * darkenFactor);
    g = Math.round(g * darkenFactor);
    b = Math.round(b * darkenFactor);
    const gray = Math.round((r + g + b) / 3);
    r = Math.round(r + (gray - r) * desaturateAmount);
    g = Math.round(g + (gray - g) * desaturateAmount);
    b = Math.round(b + (gray - b) * desaturateAmount);
    return `rgb(${r},${g},${b})`;
  }

  private lightenColor(color: string, amount: number): string {
    const [r, g, b] = this.parseRgb(color);
    return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`;
  }
}
