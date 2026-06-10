import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <nav class="platform-nav">
      <div class="nav-container">
        <a class="logo" [routerLink]="['/inicio']">
          <img class="nav-logo-img" src="assets/favicon-nexabuild.svg" alt="NexaBuild">
          <span class="logo-text">Nexa<em>Build</em></span>
        </a>

        <div class="nav-actions" *ngIf="authChecked && isLoggedIn">
          <span class="nav-welcome" *ngIf="userName">¡Bienvenido {{ userName }}!</span>
          <button class="nav-btn nav-logout" (click)="logout()">Cerrar sesión</button>
        </div>

        <div class="nav-actions" *ngIf="authChecked && !isLoggedIn">
          <button class="nav-btn nav-signin" (click)="openModal('login')">Iniciar sesión</button>
          <button class="nav-btn nav-register" (click)="openModal('register')">Crear cuenta</button>
        </div>
      </div>
    </nav>

    <!-- Login Modal -->
    <div class="modal-overlay" *ngIf="activeModal === 'login'" (click)="closeModal()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="closeModal()">×</button>
        <h2 class="modal-title">Iniciar sesión</h2>

        <div class="alert alert-error" *ngIf="loginError">{{ loginError }}</div>

        <div class="field">
          <label>Email</label>
          <input type="email" [(ngModel)]="loginEmail" placeholder="tu@email.com" />
        </div>
        <div class="field">
          <label>Contraseña</label>
          <input type="password" [(ngModel)]="loginPassword" placeholder="••••••••" (keyup.enter)="login()" />
        </div>

        <button class="btn-primary" (click)="login()" [disabled]="loginLoading">
          {{ loginLoading ? 'Ingresando...' : 'Entrar' }}
        </button>

        <p class="modal-switch">¿No tenés cuenta? <a (click)="openModal('register')">Registrate</a></p>
      </div>
    </div>

    <!-- Register Modal -->
    <div class="modal-overlay" *ngIf="activeModal === 'register'" (click)="closeModal()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="closeModal()">×</button>
        <h2 class="modal-title">Crear cuenta</h2>

        <div class="alert alert-success" *ngIf="regSuccess">{{ regSuccess }}</div>
        <div class="alert alert-error" *ngIf="regError">{{ regError }}</div>

        <div class="field-row">
          <div class="field">
            <label>Nombre</label>
            <input type="text" [(ngModel)]="regNombre" placeholder="Juan" />
          </div>
          <div class="field">
            <label>Apellido</label>
            <input type="text" [(ngModel)]="regApellido" placeholder="Pérez" />
          </div>
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" [(ngModel)]="regEmail" placeholder="tu@email.com" />
        </div>
        <div class="field">
          <label>Contraseña</label>
          <input type="password" [(ngModel)]="regPassword" placeholder="••••••••" />
        </div>
        <div class="field">
          <label>Repetir contraseña</label>
          <input type="password" [(ngModel)]="regRepeatPassword" placeholder="••••••••" (keyup.enter)="register()" />
        </div>

        <button class="btn-primary" (click)="register()" [disabled]="regLoading">
          {{ regLoading ? 'Creando cuenta...' : 'Registrarse' }}
        </button>

        <p class="modal-switch">¿Ya tenés cuenta? <a (click)="openModal('login')">Iniciá sesión</a></p>
      </div>
    </div>
  `,
  styles: [`
    .platform-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(240,242,245,.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0,0,0,0.08);
      padding: .75rem 0;
    }

    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 2.5rem;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      cursor: pointer;
    }

    .nav-logo-img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .logo-text {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -.5px;
      color: #1A1A2E;
      line-height: 1.4;
      font-family: 'Outfit', sans-serif;
    }

    .logo-text em {
      font-style: normal;
      color: #7C5CFC;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav-welcome {
      font-size: 14px;
      font-weight: 500;
      font-family: 'Outfit', sans-serif;
      color: #1A1A2E;
    }

    .nav-btn {
      font-size: 13.5px;
      font-weight: 500;
      font-family: 'Outfit', sans-serif;
      border-radius: 7px;
      padding: 8px 20px;
      cursor: pointer;
      display: inline-block;
      transition: all .15s;
      border: none;
    }

    .nav-signin {
      background: none;
      color: #1A1A2E;
      padding: 8px 12px;
    }

    .nav-signin:hover {
      color: #7C5CFC;
    }

    .nav-register {
      background: #6B5AE0;
      color: #fff;
    }

    .nav-register:hover {
      background: #5A4ACF;
    }

    .nav-logout {
      background: transparent;
      color: #6B7280;
      border: 1.5px solid #D1D5DB;
    }

    .nav-logout:hover {
      background: transparent;
      color: #374151;
      border-color: #9CA3AF;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-card {
      background: #fff;
      border-radius: 16px;
      padding: 2.25rem 2rem;
      width: 100%;
      max-width: 400px;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    }

    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1.25rem;
      background: none;
      border: none;
      font-size: 1.4rem;
      color: #9CA3AF;
      cursor: pointer;
      line-height: 1;
      padding: 0;
    }

    .modal-close:hover {
      color: #6B7280;
    }

    .modal-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: #1A1A2E;
      margin: 0 0 1.5rem;
      text-align: center;
      font-family: 'Outfit', sans-serif;
    }

    .field {
      margin-bottom: 1rem;
    }

    .field label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 5px;
      font-family: 'Outfit', sans-serif;
    }

    .field input {
      width: 100%;
      border: 1.5px solid #E5E7EB;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      font-family: 'Outfit', sans-serif;
      color: #1A1A2E;
      outline: none;
      transition: border-color .15s;
      box-sizing: border-box;
      background: #fff;
    }

    .field input:focus {
      border-color: #7C5CFC;
    }

    .field input::placeholder {
      color: #C4C4CF;
    }

    .field-row {
      display: flex;
      gap: .75rem;
    }

    .field-row .field {
      flex: 1;
    }

    .btn-primary {
      width: 100%;
      background: #6B5AE0;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 12px;
      font-size: 15px;
      font-weight: 600;
      font-family: 'Outfit', sans-serif;
      cursor: pointer;
      margin-top: .25rem;
      transition: background .15s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5A4ACF;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .modal-switch {
      text-align: center;
      font-size: 13px;
      color: #6B7280;
      margin: 1rem 0 0;
      font-family: 'Outfit', sans-serif;
    }

    .modal-switch a {
      color: #7C5CFC;
      cursor: pointer;
      font-weight: 500;
    }

    .modal-switch a:hover {
      text-decoration: underline;
    }

    .alert {
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 1rem;
      font-family: 'Outfit', sans-serif;
    }

    .alert-error {
      background: #FEF2F2;
      color: #DC2626;
      border: 1px solid #FECACA;
    }

    .alert-success {
      background: #F0FDF4;
      color: #16A34A;
      border: 1px solid #BBF7D0;
    }
  `]
})
export class NavComponent implements OnInit, OnDestroy {
  userName = '';
  isLoggedIn = false;
  authChecked = false;
  activeModal: 'login' | 'register' | null = null;

  loginEmail = '';
  loginPassword = '';
  loginLoading = false;
  loginError = '';

  regNombre = '';
  regApellido = '';
  regEmail = '';
  regPassword = '';
  regRepeatPassword = '';
  regLoading = false;
  regError = '';
  regSuccess = '';

  private sub: Subscription | undefined;

  constructor(private auth: AuthService, private supabase: SupabaseService) {}

  ngOnInit() {
    this.sub = this.auth.currentUser$.pipe(
      filter(u => u !== undefined)
    ).subscribe(async user => {
      this.authChecked = true;
      this.isLoggedIn = !!user;
      if (user) {
        const { data } = await this.supabase.getProfileById(user.id);
        if (data) {
          const d = data as any;
          this.userName = [d.nombre, d.apellido].filter(Boolean).join(' ');
        }
        this.activeModal = null;
      } else {
        this.userName = '';
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  openModal(modal: 'login' | 'register') {
    this.activeModal = modal;
    this.resetForms();
  }

  closeModal() {
    this.activeModal = null;
    this.resetForms();
  }

  private resetForms() {
    this.loginEmail = '';
    this.loginPassword = '';
    this.loginLoading = false;
    this.loginError = '';
    this.regNombre = '';
    this.regApellido = '';
    this.regEmail = '';
    this.regPassword = '';
    this.regRepeatPassword = '';
    this.regLoading = false;
    this.regError = '';
    this.regSuccess = '';
  }

  async login() {
    this.loginLoading = true;
    this.loginError = '';
    try {
      await this.auth.signIn(this.loginEmail, this.loginPassword);
    } catch (err: any) {
      this.loginError = err.message || 'Error al iniciar sesión';
    } finally {
      this.loginLoading = false;
    }
  }

  async register() {
    if (this.regPassword !== this.regRepeatPassword) {
      this.regError = 'Las contraseñas no coinciden';
      return;
    }
    this.regLoading = true;
    this.regError = '';
    this.regSuccess = '';
    try {
      await this.auth.signUp(this.regEmail, this.regPassword, this.regNombre, this.regApellido);
      this.regSuccess = '¡Cuenta creada! Revisá tu email para confirmar.';
    } catch (err: any) {
      this.regError = err.message || 'Error al registrarse';
    } finally {
      this.regLoading = false;
    }
  }

  logout() { this.auth.signOut(); }
}
