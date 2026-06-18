import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (t of toasts(); track t.id) {
        <div [class]="'toast toast--' + t.type">
          <span class="toast-icon">{{ iconFor(t.type) }}</span>
          <span class="toast-msg">{{ t.message }}</span>
          <button class="toast-close" (click)="toast.dismiss(t.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      max-width: 360px;
      width: calc(100% - 2.5rem);
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.875rem;
      font-family: 'Outfit', sans-serif;
      font-weight: 500;
      line-height: 1.4;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      animation: toastIn 0.25s ease forwards;
      pointer-events: all;
    }

    @keyframes toastIn {
      from { transform: translateX(110%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }

    .toast--error {
      background: #1c0a0a;
      border: 1px solid rgba(239,68,68,0.4);
      color: #fca5a5;
    }

    .toast--success {
      background: #0a1c10;
      border: 1px solid rgba(52,211,153,0.4);
      color: #6ee7b7;
    }

    .toast--info {
      background: #0a0f1c;
      border: 1px solid rgba(139,92,246,0.4);
      color: #c4b5fd;
    }

    .toast-icon { font-size: 1rem; flex-shrink: 0; }

    .toast-msg { flex: 1; }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      opacity: 0.5;
      cursor: pointer;
      font-size: 1.1rem;
      line-height: 1;
      padding: 0;
      flex-shrink: 0;
      transition: opacity 0.15s;
      &:hover { opacity: 1; }
    }
  `]
})
export class ToastComponent {
  readonly toast = inject(ToastService);
  protected toasts = toSignal(this.toast.toasts$, { initialValue: [] as Toast[] });

  iconFor(type: Toast['type']): string {
    if (type === 'error')   return '✕';
    if (type === 'success') return '✓';
    return 'ℹ';
  }
}
