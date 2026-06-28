import { Component, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-kubo-gestion',
  standalone: true,
  templateUrl: './kubo-gestion.component.html',
  styleUrl: './kubo-gestion.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class KuboGestionComponent implements AfterViewInit, OnDestroy {
  ngAfterViewInit(): void {
    const w = window as any;
    if (typeof w.__gestionMount === 'function') {
      w.__gestionMount();
    } else {
      const s = document.createElement('script');
      s.id = 'gestion-js';
      s.src = 'assets/kubo-gestion.js';
      document.body.appendChild(s);
    }
  }
  ngOnDestroy(): void {}
}
