import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./features/inicio/inicio.component').then(m => m.InicioComponent),
  },
  {
    path: 'nexajuegos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/nexajuegos/nexajuegos.component').then(m => m.NexaJuegosComponent),
  },
  {
    path: 'partida',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/partida/partida.component').then(m => m.PartidaComponent),
  },
  {
    path: 'nexateg',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/nexateg/nexateg.component').then(m => m.NexaTegComponent),
  },
  {
    path: 'mat-juego/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/mat-juego/mat-juego.component').then(m => m.MatJuegoComponent),
  },
  {
    path: 'pruebateg33',
    loadComponent: () =>
      import('./features/pruebateg33/pruebateg33.component').then(m => m.PruebaTeg33Component),
  },
  { path: '**', redirectTo: 'inicio' },
];
