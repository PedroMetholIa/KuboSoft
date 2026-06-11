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
    path: 'nexajuegos',
    loadComponent: () =>
      import('./features/nexajuegos/nexajuegos.component').then(m => m.NexaJuegosComponent),
  },
  {
    path: 'partida',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/game-lobby/game-lobby.component').then(m => m.GameLobbyComponent),
    data: {
      productNombre: 'NexaTeg', channelPrefix: 'partida',
      showBrand: false, showProductSelector: true,
      finalizadasLabel: 'Finalizadas', showNavBack: false
    } satisfies LobbyConfig,
  },
  {
    path: 'nexateg',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/game-lobby/game-lobby.component').then(m => m.GameLobbyComponent),
    data: {
      productNombre: 'NexaTeg', channelPrefix: 'nexateg',
      showBrand: true, showProductSelector: false,
      finalizadasLabel: 'Ganadores', showNavBack: true
    } satisfies LobbyConfig,
  },
  {
    path: 'nexateg-juego/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/nexateg-juego/nexateg-juego.component').then(m => m.NexaTegJuegoComponent),
  },
  { path: '**', redirectTo: 'inicio' },
];
