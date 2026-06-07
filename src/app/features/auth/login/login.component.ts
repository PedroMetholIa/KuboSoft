import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <h1 class="brand">NexaBuild<span>22</span></h1>
        <h2>Iniciar sesión</h2>

        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="field">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="tu@email.com" />
        </div>

        <div class="field">
          <label>Contraseña</label>
          <input type="password" [(ngModel)]="password" placeholder="••••••••" />
        </div>

        <button class="btn-primary" (click)="login()" [disabled]="loading">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>

        <p class="link">¿No tenés cuenta? <a routerLink="/auth/register">Registrate</a></p>
      </div>
    </div>
  `,
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    this.loading = true;
    this.errorMessage = '';
    try {
      await this.auth.signIn(this.email, this.password);
      this.router.navigate(['/inicio']);
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }
}
