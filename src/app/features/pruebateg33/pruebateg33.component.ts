import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';

@Component({
  selector: 'app-pruebateg33',
  standalone: true,
  imports: [CommonModule, MapComponent],
  template: `
    <div class="page-wrapper">
      <div class="map-container">
        <app-map />
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper {
      min-height: 100vh;
      background: #0f1823;
      padding: 1.5rem 1rem 1rem;
      box-sizing: border-box;
      font-family: 'Outfit', sans-serif;
    }

    .page-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 800;
      color: #f1f5f9;
      margin: 0 0 0.4rem;
      letter-spacing: -0.5px;
    }

    .page-subtitle {
      font-size: 0.95rem;
      color: #64748b;
      margin: 0;
    }

    .map-container {
      width: 100%;
    }
  `],
})
export class PruebaTeg33Component {}
