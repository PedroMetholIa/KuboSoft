# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server
npm start              # ng serve on http://localhost:4200

# Build
npx ng build           # production build (dist/kubo-build22)
npx ng build --configuration development   # dev build, faster, no minification

# There are no automated tests in this project.
```

## Architecture

Angular 19 standalone SPA with Supabase as backend (Postgres + Auth + Realtime).

### Route structure
- `/inicio` — Landing page with product catalog + contact form (`InicioComponent`)
- `/kubojuegos` — Product listing for KuboJuegos category (`KuboJuegosComponent`)
- `/kuboteg` — Game lobby for KuboTeg (branded view) → `GameLobbyComponent`
- `/partida` — Game lobby (admin/unbranded view) → same `GameLobbyComponent`
- `/kuboteg-juego/:id` — Live game view (`KuboTegJuegoComponent`)

All routes except `/inicio` and `/kubojuegos` are guard-protected (`authGuard`).

### Service layer
- **`SupabaseService`** (`src/app/core/services/supabase.service.ts`) — Single service wrapping all Supabase calls. Exposes `currentUser$: BehaviorSubject<User | null | undefined>` where `undefined` = auth state loading. Also exposes `client` (raw Supabase client) for Realtime channel subscriptions done directly in components.
- **`AuthService`** (`src/app/core/services/auth.service.ts`) — Thin wrapper around Supabase auth. Exposes `currentUser$` (same BehaviorSubject from SupabaseService). Use `filter(u => u !== undefined), take(1)` to defer data loading until auth resolves.
- **`ToastService`** (`src/app/core/services/toast.service.ts`) — Global toast queue via `BehaviorSubject<Toast[]>`.

### Key patterns

**Auth-deferred loading** — Every component that fetches data waits for auth state before querying:
```typescript
this.auth.currentUser$.pipe(filter(u => u !== undefined), take(1))
  .subscribe(() => this.loadData());
```

**Realtime subscriptions** — Components subscribe via `supabaseService.client.channel(name).on(...)`. Always unsubscribe in `ngOnDestroy`.

**RPC for game logic** — Some game operations (troop distribution, attacks) call Supabase RPCs via direct `fetch()` rather than the JS client to avoid JWT race conditions on concurrent calls.

**LocalStorage** — Player color and leader selection in `kuboteg-juego` are persisted to `localStorage` under keys like `teg_color_<partidaId>_<userId>` to survive page reloads.

### Template conventions
All templates use Angular 17+ control flow: `@if`, `@for`, `@switch`. No `*ngIf`/`*ngFor`/`ngSwitch` or `CommonModule` anywhere in the codebase.

`@for` requires a `track` expression — use the entity's unique field (e.g., `track t.id`, `track j.email`) or `track $index` for primitive arrays.

`toSignal()` from `@angular/core/rxjs-interop` replaces `async` pipe. When using it as a class field initializer, inject the service with `inject()` rather than constructor injection (field initializers run before constructor body):
```typescript
readonly toast = inject(ToastService);
protected toasts = toSignal(this.toast.toasts$, { initialValue: [] });
```

### `GameLobbyComponent`
Reusable lobby shared between `/kuboteg` and `/partida` routes. Behavior controlled by `LobbyConfig` passed through route `data`. Manages Supabase Realtime for partidas, jugadores, and notifications. Uses `JugadoresChatComponent` twice (players panel + chat panel).

### `KuboTegJuegoComponent`
The live game. Large component (~1500 lines) managing:
- Color/leader selection modal
- Turn phases: `colocacion` → `ataque` → `reagrupacion`
- Territory ownership and troop counts via Supabase Realtime
- Diplomatic system (pactos/tratados) via broadcast channels
- Seeded shuffle (LCG) for deterministic territory distribution
- Sound via `<audio>` elements
