import { Component, OnInit, AfterViewInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Territory, Continent } from './territory.model';
import { TERRITORIES } from './territories.data';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  @Input() territoriosOwner: Record<string, string> = {};
  @Input() jugadorColores: Record<string, string> = {};
  @Input() currentUserId: string = '';
  @Input() tropas: Record<string, number> = {};
  @Input() territorioSeleccionado: string | null = null;
  @Input() territoriosDestacados: string[] = [];
  @Input() jugadorNombres: Record<string, string> = {};

  @Output() territorioClick = new EventEmitter<string>();
  @Output() territorioRightClick = new EventEmitter<string>();
  @Output() deseleccionar = new EventEmitter<void>();

  territories: Territory[] = [];

  tooltip: Territory | null = null;
  tooltipX = 0;
  tooltipY = 0;

  readonly continentLegend = [
    { id: 'north_america', label: 'América del Norte', color: '#D9B34D' },
    { id: 'south_america', label: 'América del Sur',   color: '#D94059' },
    { id: 'europe',        label: 'Europa',             color: '#4073D9' },
    { id: 'africa',        label: 'África',             color: '#D97326' },
    { id: 'asia',          label: 'Asia',               color: '#40B84D' },
    { id: 'oceania',       label: 'Oceanía',            color: '#8C40D1' },
  ];

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.territories = TERRITORIES.map(t => ({ ...t }));
  }

  ngAfterViewInit(): void {
    this.centerGroup('#territories');
  }

  private centerGroup(selector: string): void {
    const g = this.el.nativeElement.querySelector(selector) as SVGGElement;
    if (!g) return;
    const b = g.getBBox();
    const dx = 550 - (b.x + b.width / 2);
    const dy = 325 - (b.y + b.height / 2);
    g.setAttribute('transform', `translate(${dx.toFixed(1)},${dy.toFixed(1)})`);
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
    this.updateTooltipPosition(event);
  }

  onTerritoryLeave(): void {
    this.tooltip = null;
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
    return this.territoriosDestacados.includes(t.id);
  }

  getTerritoryFill(t: Territory): string {
    if (this.isSelected(t)) {
      const color = this.getOwnerColor(t);
      return color ? this.lightenColor(color, 45) : '#ffffff';
    }
    if (this.isHighlighted(t)) {
      const ownerId = this.territoriosOwner[t.id];
      if (ownerId && this.jugadorColores[ownerId]) {
        return this.hexToRgba(this.jugadorColores[ownerId], this.fillAlpha(this.jugadorColores[ownerId], 0.82));
      }
      return this.lightenColor('#6B7280', 40);
    }
    const color = this.getOwnerColor(t);
    if (color) return this.hexToRgba(this.lightenColor(color, 14), this.fillAlpha(color, 0.96));
    return '#6B7280';
  }

  getWhiteOverlay(t: Territory): string {
    const color = this.getOwnerColor(t);
    if (!color) return 'transparent';
    const [r, g, b] = this.parseRgb(color);
    return (r > 170 && g > 170 && b > 170) ? 'rgba(255,255,255,0.18)' : 'transparent';
  }

  private fillAlpha(color: string, defaultAlpha: number): number {
    const [r, g, b] = this.parseRgb(color);
    if (r > 170 && g > 170 && b > 170) return 0.88;
    if (r < 60  && g < 60  && b < 60)  return 0.72;
    return defaultAlpha;
  }

  getTerritoryStroke(t: Territory): string {
    if (this.isSelected(t))    return 'rgba(255,255,255,0.92)';
    if (this.isHighlighted(t)) return 'rgba(255,255,255,0.68)';
    const color = this.getOwnerColor(t);
    if (color) return this.darkenDesaturate(color, 0.22, 0.12);
    return 'rgba(8,6,20,0.88)';
  }

  getTerritoryStrokeWidth(t: Territory): number {
    if (this.isSelected(t))    return 2.5;
    if (this.isHighlighted(t)) return 2.0;
    if (this.territoriosOwner[t.id]) return 1.6;
    return 1.3;
  }

  getTerritoryFilter(t: Territory): string {
    const color = this.getOwnerColor(t);
    if (this.isSelected(t) && color) {
      const s = this.hexToRgba(color, 0.80);
      const d = this.hexToRgba(color, 0.55);
      const e = this.hexToRgba(color, 0.20);
      return `drop-shadow(0 0 9px ${s}) drop-shadow(0 0 26px ${d}) drop-shadow(0 0 48px ${e})`;
    }
    if (color) {
      const s = this.hexToRgba(color, 0.72);
      const d = this.hexToRgba(color, 0.40);
      const e = this.hexToRgba(color, 0.14);
      return `drop-shadow(0 0 8px ${s}) drop-shadow(0 0 22px ${d}) drop-shadow(0 0 42px ${e})`;
    }
    return 'drop-shadow(0 0 2px rgba(103,232,249,0.15))';
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

  getBadgeHighlight(id: string): string {
    const ownerId = this.territoriosOwner[id];
    if (!ownerId || !this.jugadorColores[ownerId]) return 'rgba(255,255,255,0.09)';
    const [r, g, b] = this.parseRgb(this.jugadorColores[ownerId]);
    return `rgba(${Math.min(255, r + 85)},${Math.min(255, g + 85)},${Math.min(255, b + 85)},0.20)`;
  }

  getHaloColor(t: Territory): string {
    return this.getOwnerColor(t) ?? 'transparent';
  }

  getHaloOpacity(t: Territory): number {
    return this.getOwnerColor(t) ? 0.68 : 0;
  }

  private getOwnerColor(t: Territory): string | null {
    const ownerId = this.territoriosOwner[t.id];
    return (ownerId && this.jugadorColores[ownerId]) ? this.jugadorColores[ownerId] : null;
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

  private updateTooltipPosition(event: MouseEvent): void {
    const el = (event.target as Element).closest('.map-wrapper');
    if (el) {
      const rect = el.getBoundingClientRect();
      this.tooltipX = event.clientX - rect.left + 12;
      this.tooltipY = event.clientY - rect.top - 10;
    }
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
