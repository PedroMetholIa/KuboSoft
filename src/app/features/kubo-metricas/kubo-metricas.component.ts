import { Component, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kubo-metricas',
  standalone: true,
  templateUrl: './kubo-metricas.component.html',
  styleUrl: './kubo-metricas.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class KuboMetricasComponent implements AfterViewInit, OnDestroy {
  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    (window as any).__metricasGoBack = () => this.router.navigate(['/inicio']);
    const w = window as any;
    if (typeof w.__metricasMount === 'function') {
      w.__metricasMount();
    } else {
      const s = document.createElement('script');
      s.id = 'metricas-js';
      s.src = 'assets/kubo-metricas.js';
      s.onload = () => {
        if (typeof (window as any).__metricasMount === 'function') {
          (window as any).__metricasMount();
        }
      };
      document.body.appendChild(s);
    }
  }

  ngOnDestroy(): void {
    delete (window as any).__metricasGoBack;
  }
}
