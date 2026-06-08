import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Territorio {
  id: string;
  nombre: string;
  continente: 'norte' | 'sur' | 'europa' | 'africa' | 'asia' | 'oceania';
  puntos: string;
}

const TERRITORIOS: Territorio[] = [
  // ── Norte América ──────────────────────────────────────
  // Calibration: x≈(lon+180)*2.1+22, y≈85-(lat*0.68) — adjusted to match map image
  { id: 'alaska', nombre: 'Alaska', continente: 'norte',
    puntos: '4,126 18,98 38,78 58,72 82,78 102,106 104,134 88,144 58,148 22,142 4,130' },
  { id: 'nw-canada', nombre: 'Territorio Noroeste', continente: 'norte',
    puntos: '102,104 82,76 104,50 148,38 195,34 228,46 232,76 218,108 192,128 155,132 104,132' },
  { id: 'groenlandia', nombre: 'Groenlandia', continente: 'norte',
    puntos: '278,14 322,4 362,14 378,44 360,72 326,82 290,74 268,48' },
  { id: 'canada-centro', nombre: 'Canadá Central', continente: 'norte',
    puntos: '155,130 192,128 218,108 232,76 258,78 265,106 258,138 238,155 198,158 155,155' },
  { id: 'canada-este', nombre: 'Canadá Este', continente: 'norte',
    puntos: '258,76 278,46 305,42 328,56 338,88 325,128 298,148 265,155 238,153 258,136 265,108' },
  { id: 'usa-oeste', nombre: 'USA Oeste', continente: 'norte',
    puntos: '104,134 155,132 198,158 200,196 192,234 162,248 128,245 102,222 98,180' },
  { id: 'usa-centro', nombre: 'USA Centro', continente: 'norte',
    puntos: '198,156 238,153 265,153 272,184 268,228 248,248 208,252 192,235 200,196' },
  { id: 'usa-este', nombre: 'USA Este', continente: 'norte',
    puntos: '265,153 298,146 328,160 332,196 322,238 292,252 248,248 268,228 272,184' },
  { id: 'mexico', nombre: 'México', continente: 'norte',
    puntos: '102,222 128,245 162,248 208,252 225,272 218,308 188,328 158,322 122,302 98,275' },

  // ── Sur América ────────────────────────────────────────
  { id: 'colombia', nombre: 'Colombia / Venezuela', continente: 'sur',
    puntos: '162,330 215,318 242,330 255,362 238,385 198,390 168,375' },
  { id: 'brasil', nombre: 'Brasil', continente: 'sur',
    puntos: '198,355 255,340 298,360 318,410 298,458 248,472 198,452 172,412 178,375' },
  { id: 'peru', nombre: 'Perú / Bolivia', continente: 'sur',
    puntos: '155,382 198,372 218,400 212,448 178,462 148,445 138,412' },
  { id: 'argentina', nombre: 'Argentina', continente: 'sur',
    puntos: '172,458 218,450 238,478 235,528 208,548 175,542 158,510 162,478' },
  { id: 'chile', nombre: 'Chile', continente: 'sur',
    puntos: '142,418 172,408 175,455 158,510 138,525 122,498 128,462 138,435' },

  // ── Europa ─────────────────────────────────────────────
  { id: 'escandinavia', nombre: 'Escandinavia', continente: 'europa',
    puntos: '418,18 462,12 482,38 472,72 448,88 422,80 408,55' },
  { id: 'gran-bretania', nombre: 'Gran Bretaña', continente: 'europa',
    puntos: '375,65 405,58 412,88 398,108 375,98' },
  { id: 'europa-oeste', nombre: 'Europa Occidental', continente: 'europa',
    puntos: '385,108 422,98 448,108 455,145 435,168 405,165 385,140' },
  { id: 'europa-centro', nombre: 'Europa Central', continente: 'europa',
    puntos: '448,72 492,62 512,88 508,132 482,152 452,148 448,112' },
  { id: 'europa-este', nombre: 'Europa del Este', continente: 'europa',
    puntos: '492,38 545,30 562,62 555,108 522,128 508,115 508,68' },
  { id: 'europa-sur', nombre: 'Europa del Sur', continente: 'europa',
    puntos: '412,162 482,148 512,162 518,195 492,215 448,218 418,200' },

  // ── África ─────────────────────────────────────────────
  { id: 'africa-norte', nombre: 'África del Norte', continente: 'africa',
    puntos: '388,182 492,172 528,195 535,242 502,262 428,268 395,238' },
  { id: 'africa-oeste', nombre: 'África Occidental', continente: 'africa',
    puntos: '375,268 428,262 445,295 445,338 415,358 372,342 358,305' },
  { id: 'africa-centro', nombre: 'África Central', continente: 'africa',
    puntos: '428,268 502,262 525,295 528,345 502,372 455,375 445,335 445,298' },
  { id: 'africa-este', nombre: 'África Oriental', continente: 'africa',
    puntos: '502,258 558,248 575,282 572,338 545,372 505,375 525,342 525,295' },
  { id: 'africa-sur', nombre: 'África del Sur', continente: 'africa',
    puntos: '415,358 502,372 525,372 538,415 505,458 462,468 425,445 402,408' },
  { id: 'madagascar', nombre: 'Madagascar', continente: 'africa',
    puntos: '545,358 568,352 578,395 562,428 542,420 535,385' },

  // ── Asia ───────────────────────────────────────────────
  { id: 'oriente-medio', nombre: 'Oriente Medio', continente: 'asia',
    puntos: '505,178 558,168 578,195 572,238 542,258 508,248 502,215' },
  { id: 'india', nombre: 'India', continente: 'asia',
    puntos: '578,168 635,158 658,185 662,248 638,292 598,298 568,265 572,205' },
  { id: 'asia-central', nombre: 'Asia Central', continente: 'asia',
    puntos: '558,95 645,82 672,108 665,158 638,172 578,165 558,135' },
  { id: 'siberia', nombre: 'Siberia', continente: 'asia',
    puntos: '545,28 702,18 738,45 728,82 688,95 648,88 558,92 548,62' },
  { id: 'china', nombre: 'China', continente: 'asia',
    puntos: '658,88 748,78 775,108 778,168 748,218 708,232 665,225 662,172 668,128' },
  { id: 'japon', nombre: 'Japón', continente: 'asia',
    puntos: '775,95 808,85 818,115 802,148 778,142 768,115' },
  { id: 'sureste-asiatico', nombre: 'Sureste Asiático', continente: 'asia',
    puntos: '708,232 775,218 798,248 792,295 758,318 718,318 698,285' },

  // ── Oceanía ────────────────────────────────────────────
  { id: 'indonesia', nombre: 'Indonesia', continente: 'oceania',
    puntos: '718,322 798,305 818,335 812,362 768,368 722,358' },
  { id: 'australia-oeste', nombre: 'Australia Oeste', continente: 'oceania',
    puntos: '745,375 808,368 818,428 795,465 755,472 728,445 725,408' },
  { id: 'australia-este', nombre: 'Australia Este', continente: 'oceania',
    puntos: '808,365 862,358 875,418 855,462 818,472 795,462 815,428' },
  { id: 'nueva-zelanda', nombre: 'Nueva Zelanda', continente: 'oceania',
    puntos: '882,432 912,418 925,448 912,475 882,478' },
];

const COLORS: Record<string, { fill: string; fillHover: string; stroke: string }> = {
  norte:   { fill: 'rgba(255,71,87,0.12)',    fillHover: 'rgba(255,71,87,0.62)',    stroke: 'rgba(255,100,112,0.9)' },
  sur:     { fill: 'rgba(251,146,60,0.12)',   fillHover: 'rgba(251,146,60,0.62)',   stroke: 'rgba(251,160,80,0.9)' },
  europa:  { fill: 'rgba(59,130,246,0.12)',   fillHover: 'rgba(59,130,246,0.62)',   stroke: 'rgba(80,150,255,0.9)' },
  africa:  { fill: 'rgba(34,197,94,0.12)',    fillHover: 'rgba(34,197,94,0.62)',    stroke: 'rgba(60,210,110,0.9)' },
  asia:    { fill: 'rgba(168,85,247,0.12)',   fillHover: 'rgba(168,85,247,0.62)',   stroke: 'rgba(185,110,255,0.9)' },
  oceania: { fill: 'rgba(20,184,166,0.12)',   fillHover: 'rgba(20,184,166,0.62)',   stroke: 'rgba(40,200,180,0.9)' },
};

@Component({
  selector: 'app-pruebateg',
  standalone: true,
  imports: [],
  template: `
    <div class="map-wrap" (mousemove)="onMove($event)" (mouseleave)="hovered = null">

      <svg class="map-svg" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice">
        @for (t of territorios; track t.id) {
          <polygon
            [attr.points]="t.puntos"
            [attr.fill]="hovered?.id === t.id ? colors[t.continente].fillHover : colors[t.continente].fill"
            [attr.stroke]="colors[t.continente].stroke"
            [attr.stroke-width]="hovered?.id === t.id ? 2 : 1"
            class="territorio"
            (mouseenter)="hovered = t"
            (mouseleave)="hovered = null"
          />
        }
      </svg>

      @if (hovered) {
        <div class="tooltip" [style.left.px]="mx + 16" [style.top.px]="my - 12">
          <span class="tt-cont">{{ contLabel(hovered.continente) }}</span>
          <span class="tt-nombre">{{ hovered.nombre }}</span>
        </div>
      }

      <!-- Leyenda -->
      <div class="legend">
        @for (entry of legendEntries; track entry.id) {
          <div class="legend-item">
            <span class="legend-dot" [style.background]="entry.color"></span>
            <span class="legend-label">{{ entry.label }}</span>
          </div>
        }
      </div>

      <button class="btn-volver" (click)="volver()">← Volver</button>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .map-wrap {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: url('/assets/NexaTeg/MundoFondoNegro.png') center / cover no-repeat;
    }

    .map-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .territorio {
      cursor: pointer;
      transition: fill 0.15s, stroke-width 0.15s;
    }

    .tooltip {
      position: fixed;
      background: rgba(6,4,16,0.92);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 10px;
      padding: 0.5rem 0.95rem;
      pointer-events: none;
      z-index: 200;
      backdrop-filter: blur(12px);
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .tt-cont {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: #888;
      font-family: 'Outfit', sans-serif;
    }

    .tt-nombre {
      font-size: 0.92rem;
      font-weight: 700;
      color: #fff;
      font-family: 'Outfit', sans-serif;
      white-space: nowrap;
    }

    .legend {
      position: fixed;
      bottom: 1.5rem;
      left: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      background: rgba(6,4,16,0.78);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 0.85rem 1.1rem;
      backdrop-filter: blur(12px);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.55rem;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .legend-label {
      font-size: 0.78rem;
      font-weight: 500;
      color: #ccc;
      font-family: 'Outfit', sans-serif;
    }

    .btn-volver {
      position: fixed;
      top: 1.25rem;
      left: 1.25rem;
      background: rgba(6,4,16,0.85);
      color: #a8adc0;
      border: 1px solid rgba(210,215,225,0.22);
      border-radius: 10px;
      padding: 0.6rem 1.2rem;
      font-size: 0.88rem;
      font-weight: 600;
      font-family: 'Outfit', sans-serif;
      cursor: pointer;
      backdrop-filter: blur(12px);
      transition: all .2s;
      z-index: 50;
    }

    .btn-volver:hover {
      color: #c4c9dc;
      border-color: rgba(210,215,225,0.4);
    }
  `]
})
export class PruebaTegComponent {
  territorios = TERRITORIOS;
  colors = COLORS;
  hovered: Territorio | null = null;
  mx = 0;
  my = 0;

  legendEntries = [
    { id: 'norte',   label: 'Norte América', color: 'rgba(255,71,87,0.85)' },
    { id: 'sur',     label: 'Sur América',   color: 'rgba(251,146,60,0.85)' },
    { id: 'europa',  label: 'Europa',         color: 'rgba(59,130,246,0.85)' },
    { id: 'africa',  label: 'África',         color: 'rgba(34,197,94,0.85)' },
    { id: 'asia',    label: 'Asia',           color: 'rgba(168,85,247,0.85)' },
    { id: 'oceania', label: 'Oceanía',        color: 'rgba(20,184,166,0.85)' },
  ];

  contLabels: Record<string, string> = {
    norte: 'Norte América', sur: 'Sur América', europa: 'Europa',
    africa: 'África', asia: 'Asia', oceania: 'Oceanía',
  };

  constructor(private router: Router) {}

  onMove(e: MouseEvent) { this.mx = e.clientX; this.my = e.clientY; }
  contLabel(c: string) { return this.contLabels[c] ?? ''; }
  volver() { this.router.navigate(['/nexateg']); }
}
