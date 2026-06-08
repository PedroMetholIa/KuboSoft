import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <nav class="platform-nav">
      <div class="nav-container">
        <a class="logo" [routerLink]="['/inicio']">
          <img class="nav-logo-img" src="assets/favicon-nexabuild.svg" alt="NexaBuild">
          <span class="logo-text">Nexa<em>Build</em></span>
        </a>
        <div class="nav-actions">
          <span class="nav-welcome" *ngIf="userName">¡Bienvenido {{ userName }}!</span>
          <button class="nav-btn nav-logout" (click)="logout()">Cerrar sesión</button>
        </div>
      </div>
    </nav>
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
      gap: 1.25rem;
    }

    .nav-welcome {
      font-size: 14px;
      font-weight: 500;
      font-family: 'Outfit', sans-serif;
      color: #555570;
    }

    .nav-btn {
      font-size: 13.5px;
      font-weight: 500;
      font-family: 'Outfit', sans-serif;
      border-radius: 7px;
      padding: 8px 20px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: all .15s;
      border: none;
    }

    .nav-logout {
      background: #6b7280;
      color: #fff;
      border: none;
    }

    .nav-logout:hover {
      background: #4b5563;
      color: #fff;
    }
  `]
})
export class NavComponent implements OnInit {
  userName = '';

  constructor(private auth: AuthService, private supabase: SupabaseService) {}

  ngOnInit() {
    this.auth.currentUser$.pipe(
      filter(u => !!u),
      take(1)
    ).subscribe(async user => {
      if (!user) return;
      const { data } = await this.supabase.getProfileById(user.id);
      if (data) {
        const d = data as any;
        this.userName = [d.nombre, d.apellido].filter(Boolean).join(' ');
      }
    });
  }

  logout() { this.auth.signOut(); }
}
