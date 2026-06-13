import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LobbyConfig } from './shared/game-lobby/game-lobby.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./features/inicio/inicio.component').then(m => m.InicioComponent),
  },
  {
    path: 'kubojuegos',
    loadComponent: () =>
      import('./features/kubojuegos/kubojuegos.component').then(m => m.KuboJuegosComponent),
  },
  {
    path: 'partida',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/game-lobby/game-lobby.component').then(m => m.GameLobbyComponent),
    data: {
      productNombre: 'KuboTeg', channelPrefix: 'partida',
      showBrand: false, showProductSelector: true,
      finalizadasLabel: 'Finalizadas', showNavBack: false
    } satisfies LobbyConfig,
  },
  {
    path: 'kuboteg',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/game-lobby/game-lobby.component').then(m => m.GameLobbyComponent),
    data: {
      productNombre: 'KuboTeg', channelPrefix: 'kuboteg',
      showBrand: true, showProductSelector: false,
      finalizadasLabel: 'Ganadores', showNavBack: true
    } satisfies LobbyConfig,
  },
  {
    path: 'kuboteg-juego/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/kuboteg-juego/kuboteg-juego.component').then(m => m.KuboTegJuegoComponent),
  },
  { path: '**', redirectTo: 'inicio' },
];
