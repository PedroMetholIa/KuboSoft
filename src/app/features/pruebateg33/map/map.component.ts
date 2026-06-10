import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
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
  territories: Territory[] = [];
  selectedTerritory: Territory | null = null;
  showLabels = true;

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
    this.territories.forEach(t => {
      t.isSelected = false;
      t.isHighlighted = false;
    });

    if (this.selectedTerritory?.id === territory.id) {
      this.selectedTerritory = null;
      return;
    }

    territory.isSelected = true;
    territory.neighbors.forEach(nid => {
      const neighbor = this.territories.find(t => t.id === nid);
      if (neighbor) neighbor.isHighlighted = true;
    });

    this.selectedTerritory = territory;
  }

  onTerritoryHover(territory: Territory, event: MouseEvent): void {
    this.tooltip = territory;
    this.updateTooltipPosition(event);
  }

  onTerritoryLeave(): void {
    this.tooltip = null;
  }

  getTerritoryFill(t: Territory): string {
    if (t.isSelected) return '#ffffff';
    if (t.isHighlighted) return this.lightenColor('#6B7280', 40);
    return '#6B7280';
  }

  getTerritoryStroke(t: Territory): string {
    if (t.isSelected) return '#ffffff';
    if (t.isHighlighted) return '#ffffff';
    return '#1F2937';
  }

  getTerritoryStrokeWidth(t: Territory): number {
    if (t.isSelected) return 2.5;
    if (t.isHighlighted) return 2;
    return 1.5;
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

  private lightenColor(hex: string, amount: number): string {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
    const b = Math.min(255, (num & 0x0000ff) + amount);
    return `rgb(${r},${g},${b})`;
  }
}
