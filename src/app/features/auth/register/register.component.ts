import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <h1 class="brand">NexaBuild<span>22</span></h1>
        <h2>Crear cuenta</h2>

        <div class="success" *ngIf="successMessage">{{ successMessage }}</div>
        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="field-row">
          <div class="field">
            <label>Nombre</label>
            <input type="text" [(ngModel)]="nombre" placeholder="Juan" />
          </div>
          <div class="field">
            <label>Apellido</label>
            <input type="text" [(ngModel)]="apellido" placeholder="Pérez" />
          </div>
        </div>

        <div class="field">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="tu@email.com" />
        </div>

        <div class="field">
          <label>Contraseña</label>
          <input type="password" [(ngModel)]="password" placeholder="Mínimo 6 caracteres" />
        </div>

        <button class="btn-primary" (click)="register()" [disabled]="loading">
          {{ loading ? 'Creando cuenta...' : 'Registrarse' }}
        </button>

        <p class="link">¿Ya tenés cuenta? <a routerLink="/auth/login">Iniciá sesión</a></p>
      </div>
    </div>
  `,
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  nombre = '';
  apellido = '';
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await this.auth.signUp(this.email, this.password, this.nombre, this.apellido);
      this.successMessage = '¡Cuenta creada! Revisá tu email para confirmar.';
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al registrarse';
    } finally {
      this.loading = false;
    }
  }
}
