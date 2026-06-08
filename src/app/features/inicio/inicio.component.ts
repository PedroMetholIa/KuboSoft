import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthService } from '../../core/services/auth.service';
import { filter, take } from 'rxjs/operators';
import { NavComponent } from '../../shared/nav/nav.component';

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string | null;
  logo: string | null;
  productos?: { id: string; nombre: string }[];
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent],
  template: `
    <div class="landing">

      <!-- NAV -->
      <app-nav></app-nav>

      <!-- HERO -->
      <div class="hero-wrap">
        <div class="hero">
          <div class="container">
            <span class="tag">Desarrollo de software + IA</span>
            <h1>Software que <em>piensa por tu negocio</em></h1>
            <span class="hero-sub">
              Construimos aplicaciones a medida potenciadas con inteligencia artificial —
              diseñadas para resolver los problemas reales de tu empresa.
            </span>
            <div class="hero-actions">
              <button class="btn btn-fill" (click)="scrollTo('contacto')">Agendar consulta →</button>
              <button class="btn btn-ghost" (click)="scrollTo('productos')">Ver productos</button>
            </div>
          </div>
        </div>
      </div>

      <!-- PRODUCTOS -->
      <div class="sec-wrap" id="productos">
        <div class="section">
          <div class="container">
            <span class="section-tag">Categoría Productos</span>
            <h2>Soluciones listas para adaptar</h2>
            <span class="section-lead">
              Software construido sobre una base probada. Cada producto se adapta a tu rubro y necesidades.
            </span>

            <div class="grid-3" *ngIf="!loading">
              <div class="card prod-card"
                   [class.card--clickable]="hasRoute(cat.nombre)"
                   (click)="navigateTo(cat.nombre)"
                   *ngFor="let cat of categorias">
                <div class="card-header">
                  <div class="card-logo" *ngIf="cat.logo">
                    <img [src]="cat.logo" [alt]="cat.nombre" />
                  </div>
                  <h3 class="cat-title">Nexa<span [style.color]="getCategoryColor(cat.nombre)">{{ getCategorySuffix(cat.nombre) }}</span></h3>
                </div>
                <p class="prod-desc">{{ cat.descripcion }}</p>
              </div>
            </div>

            <div class="grid-3" *ngIf="loading">
              <div class="card skeleton" *ngFor="let n of [1,2,3,4,5,6]"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTACTO -->
      <div class="contact-box" id="contacto">
        <div class="contact-inner">
          <div class="container">
            <div class="contact-grid">
              <div class="contact-left">
                <span class="section-tag">Contacto</span>
                <h2>Hablemos</h2>
                <p class="contact-lead">Contanos qué necesitás.<br>Respondemos en menos de 48 horas.</p>
              </div>
              <div>
                <div class="form-row">
                  <div class="form-field">
                    <label>Nombre</label>
                    <input type="text" [(ngModel)]="form.nombre" placeholder="Tu nombre"/>
                  </div>
                  <div class="form-field">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="form.email" placeholder="tu@empresa.com"/>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-field">
                    <label>Empresa</label>
                    <input type="text" [(ngModel)]="form.empresa" placeholder="Nombre de la empresa"/>
                  </div>
                  <div class="form-field">
                    <label>Rubro</label>
                    <select [(ngModel)]="form.rubro">
                      <option value="" disabled>Seleccioná</option>
                      <option>Estudio jurídico o contable</option>
                      <option>Agencia o consultora</option>
                      <option>Construcción e inmobiliaria</option>
                      <option>Software y tecnología</option>
                      <option>Salud y bienestar</option>
                      <option>Retail y comercio</option>
                      <option>Otro</option>
                    </select>
                  </div>
                </div>
                <div class="form-field">
                  <label>Mensaje</label>
                  <textarea [(ngModel)]="form.mensaje" placeholder="Contanos brevemente qué necesitás..."></textarea>
                </div>
                <button class="btn-submit" [disabled]="formSubmitted" (click)="submitForm()">
                  {{ formSubmitted ? '✓ Enviado — te contactamos pronto' : 'Enviar consulta →' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <footer>
        <div class="footer-inner">
          <p>© 2025 NexaBuild · Todos los derechos reservados</p>
          <a class="footer-brand" href="#">
            <img class="footer-logo-img" src="assets/favicon-nexabuild.svg" alt="NexaBuild">
            <span class="footer-logo-text">Nexa<em>Build</em></span>
          </a>
        </div>
      </footer>

    </div>
  `,
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit {
  categorias: Categoria[] = [];
  loading = true;
  formSubmitted = false;

  form = { nombre: '', email: '', empresa: '', rubro: '', mensaje: '' };

  constructor(
    private router: Router,
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.supabase.currentUser$.pipe(
      filter(user => user !== undefined),
      take(1)
    ).subscribe(() => this.loadCategorias());
  }

  async loadCategorias() {
    const { data, error } = await this.supabase.getCategorias();
    if (error) {
      console.error('[inicio] Error al cargar categorias:', error);
    }
    this.categorias = (data as Categoria[]) ?? [];
    this.loading = false;
  }

  private readonly routeMap: Record<string, string> = {
    'NexaJuegos': '/nexajuegos',
  };

  hasRoute(nombre: string): boolean { return nombre in this.routeMap; }

  navigateTo(nombre: string) {
    const route = this.routeMap[nombre];
    if (route) this.router.navigate([route]);
  }

  private readonly colorMap: Record<string, string> = {
    'NexaGestión':    '#10C878',
    'NexaInventario': '#F5A623',
    'NexaJuegos':     '#FF4757',
    'NexaMétricas':   '#7C5CFC',
    'NexaReservas':   '#E91E8C',
    'NexaRRHH':       '#00BCD4',
  };

  getCategoryColor(nombre: string): string {
    return this.colorMap[nombre] ?? '#7C5CFC';
  }

  getCategorySuffix(nombre: string): string {
    return nombre.startsWith('Nexa') ? nombre.slice(4) : nombre;
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  submitForm() { this.formSubmitted = true; }
  irAPartida() { this.router.navigate(['/partida']); }
  logout()     { this.auth.signOut(); }
}
