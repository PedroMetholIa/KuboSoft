import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
  styleUrl: './nav.component.scss',
  template: `
    <nav class="platform-nav">
      <div class="nav-container">
        <a class="logo" [routerLink]="['/inicio']">
          <img class="nav-logo-img" [src]="logoSrc || 'assets/kubosoft.png'" [alt]="logoSrc ? 'Logo' : 'KuboSoft'">
          <span class="logo-text">Kubo<em>Soft</em></span>
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
        <div class="modal-logo">
          <img src="assets/kubosoft.png" alt="KuboSoft" />
          <span class="modal-logo-text">Kubo<em>Soft</em></span>
        </div>
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
        <div class="modal-logo">
          <img src="assets/kubosoft.png" alt="KuboSoft" />
          <span class="modal-logo-text">Kubo<em>Soft</em></span>
        </div>
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
})
export class NavComponent implements OnInit, OnDestroy {
  @Input() logoSrc: string | null = null;
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
          const p = data as { nombre: string | null; apellido: string | null };
          this.userName = [p.nombre, p.apellido].filter(Boolean).join(' ');
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
