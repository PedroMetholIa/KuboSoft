import { ErrorHandler, inject, Injectable } from '@angular/core';
import { ToastService } from '../services/toast.service';

const IGNORED_PATTERNS = [
  'ChunkLoadError',
  'Loading chunk',
  'ResizeObserver loop',
  'Non-Error promise rejection',
];

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private toast = inject(ToastService);

  handleError(error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[AppErrorHandler]', err);

    if (IGNORED_PATTERNS.some(p => err.message.includes(p))) return;

    const message = this.userMessage(err.message);
    this.toast.show(message, 'error');
  }

  private userMessage(raw: string): string {
    if (raw.includes('Failed to fetch') || raw.includes('NetworkError')) {
      return 'Sin conexión. Verificá tu red e intentá de nuevo.';
    }
    if (raw.includes('JWT') || raw.includes('token')) {
      return 'Tu sesión expiró. Volvé a iniciar sesión.';
    }
    if (raw.length > 120) return 'Ocurrió un error inesperado.';
    return raw;
  }
}
