import { Component, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-kubo-rrhh',
  standalone: true,
  templateUrl: './kubo-rrhh.component.html',
  styleUrl: './kubo-rrhh.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class KuboRrhhComponent implements AfterViewInit, OnDestroy {
  ngAfterViewInit(): void {
    const w = window as any;
    if (typeof w.__rrhhMount === 'function') {
      w.__rrhhMount();
    } else {
      const s = document.createElement('script');
      s.id = 'rrhh-js';
      s.src = 'assets/kubo-rrhh.js';
      document.body.appendChild(s);
    }
  }
  ngOnDestroy(): void {}
}
