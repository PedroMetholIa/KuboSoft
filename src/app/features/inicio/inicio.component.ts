import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { ToastService } from '../../core/services/toast.service';
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
  imports: [FormsModule, NavComponent],
  template: `
    <div class="landing">

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
            <h2>Soluciones listas para adaptar a tu rubro.</h2>
            <span class="section-lead">
              Software construido sobre una base probada que puede adaptarse a tus gustos y necesidades.
            </span>

            @if (!loading) {
              <div class="grid-3">
                @for (cat of categoriasEmpresa; track cat.id) {
                  <div class="card prod-card"
                       [class.card--clickable]="hasRoute(cat.nombre)"
                       (click)="navigateTo(cat.nombre)">
                    <div class="card-header">
                      @if (cat.logo) {
                        <div class="card-logo">
                          <img loading="lazy" [src]="cat.logo" [alt]="cat.nombre" />
                        </div>
                      }
                      <h3 class="cat-title"><span [style.color]="getCategoryColor(cat.nombre)">{{ getCategorySuffix(cat.nombre) }}</span></h3>
                    </div>
                    <p class="prod-desc">{{ getCategoryDescription(cat) }}</p>
                  </div>
                }
              </div>
            } @else {
              <div class="grid-3">
                @for (_ of [1,2,3,4,5]; track $index) {
                  <div class="card skeleton"></div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- OTROS PRODUCTOS -->
      <div class="sec-wrap sec-wrap--alt">
        <div class="section">
          <div class="container">
            <span class="section-tag">Otros productos</span>
            <h2>Soluciones especializadas para industrias específicas.</h2>
            <span class="section-lead">También desarrollamos para otros rubros</span>
            <div class="grid-3">
              @if (!loading && categoriaJuegos) {
                <div class="card prod-card otros-card"
                     [class.card--clickable]="hasRoute(categoriaJuegos.nombre)"
                     (click)="navigateTo(categoriaJuegos.nombre)">
                  <div class="card-header">
                    @if (categoriaJuegos.logo) {
                      <div class="card-logo">
                        <img loading="lazy" [src]="categoriaJuegos.logo" [alt]="categoriaJuegos.nombre" />
                      </div>
                    }
                    <h3 class="cat-title">
                      <span [style.color]="getCategoryColor(categoriaJuegos.nombre)">{{ getCategorySuffix(categoriaJuegos.nombre) }}</span>
                    </h3>
                  </div>
                  <p class="prod-desc">{{ getCategoryDescription(categoriaJuegos) }}</p>
                </div>
              }
              @for (cat of otrosProductos; track cat.id) {
                <div class="card prod-card otros-card"
                     [class.card--clickable]="hasRoute(cat.nombre)"
                     (click)="navigateTo(cat.nombre)">
                  <div class="card-header">
                    @if (cat.logo) {
                      <div class="card-logo">
                        <img loading="lazy" [src]="cat.logo" [alt]="cat.nombre" />
                      </div>
                    }
                    <h3 class="cat-title">
                      <span [style.color]="getCategoryColor(cat.nombre)">{{ getCategorySuffix(cat.nombre) }}</span>
                    </h3>
                  </div>
                  <p class="prod-desc">{{ getCategoryDescription(cat) }}</p>
                </div>
              }
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
                @if (formError) {
                  <p class="form-error">{{ formError }}</p>
                }
                <button class="btn-submit" [disabled]="formSubmitted || formLoading" (click)="submitForm()">
                  {{ formSubmitted ? '✓ Enviado — te contactamos pronto' : formLoading ? 'Enviando...' : 'Enviar consulta →' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <footer>
        <div class="footer-inner">
          <p>© 2025 KuboSoft · Todos los derechos reservados</p>
          <a class="footer-brand" href="#">
            <img fetchpriority="high" loading="eager" class="footer-logo-img" src="assets/kubosoft.webp" alt="KuboSoft">
            <span class="footer-logo-text">Kubo<em>Soft</em></span>
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
  formLoading = false;
  formError = '';

  form = { nombre: '', email: '', empresa: '', rubro: '', mensaje: '' };

  constructor(private supabase: SupabaseService, private toast: ToastService, private router: Router) {}

  ngOnInit() {
    this.supabase.currentUser$.pipe(
      filter(user => user !== undefined),
      take(1)
    ).subscribe(() => this.loadCategorias());
  }

  get categoriasEmpresa(): Categoria[] {
    return this.categorias.filter(c => c.nombre !== 'KuboJuegos');
  }

  get categoriaJuegos(): Categoria | undefined {
    return this.categorias.find(c => c.nombre === 'KuboJuegos');
  }

  readonly otrosProductos: Categoria[] = [
    {
      id: 'static-sorteos',
      nombre: 'KuboSorteos',
      descripcion: 'Plataforma para lanzar sorteos y promociones para tu negocio.',
      logo: 'assets/categorias/favicon-kubosorteosypromo.svg',
    },
    {
      id: 'static-autogestion',
      nombre: 'KuboAutogestión',
      descripcion: 'Herramienta de autogestión para profesionales independientes.',
      logo: 'assets/categorias/favicon-autogestion.svg',
    },
  ];

  private readonly categoryOrder: Record<string, number> = {
    'KuboGestión':  0,
    'KuboRRHH':     1,
    'KuboMétricas': 2,
    'KuboTareas':   3,
    'KuboStock':    4,
    'KuboReservas': 5,
    'KuboJuegos':   6,
  };

  async loadCategorias() {
    const { data, error } = await this.supabase.getCategorias();
    if (error) this.toast.show('Error al cargar los productos.', 'error');
    let cats = (data as Categoria[]) ?? [];
    if (!cats.find(c => c.nombre === 'KuboTareas')) {
      cats = [...cats, {
        id: 'static-tareas',
        nombre: 'KuboTareas',
        descripcion: 'Gestión de tareas y proyectos colaborativos para tu equipo.',
        logo: 'assets/categorias/favicon-kubotareas.svg',
      }];
    }
    this.categorias = cats.sort((a, b) =>
      (this.categoryOrder[a.nombre] ?? 99) - (this.categoryOrder[b.nombre] ?? 99)
    );
    this.loading = false;
  }

  private readonly routeMap: Record<string, string> = {
    'KuboJuegos':   '/kubojuegos',
    'KuboRRHH':     '/kubo-rrhh',
    'KuboMétricas': '/kubo-metricas',
    'KuboGestión':  '/kubo-gestion',
  };

  hasRoute(nombre: string): boolean { return nombre in this.routeMap; }

  navigateTo(nombre: string) {
    const route = this.routeMap[nombre];
    if (route) this.router.navigate([route]);
  }

  private readonly colorMap: Record<string, string> = {
    'KuboGestión':    '#10C878',
    'KuboInventario': '#F5A623',
    'KuboJuegos':     '#FF4757',
    'KuboMétricas':   '#1428b8',
    'KuboReservas':   '#E91E8C',
    'KuboRRHH':       '#00BCD4',
    'KuboStock':        'rgb(237, 172, 39)',
    'KuboTareas':       '#F97316',
    'KuboSorteos':      '#84539D',
    'KuboAutogestión':  '#C37C1C',
  };

  getCategoryColor(nombre: string): string {
    return this.colorMap[nombre] ?? '#7C5CFC';
  }

  private readonly displayNameMap: Record<string, string> = {
    'KuboJuegos':      'Entretenimiento',
    'KuboSorteos':     'Sorteos y Promociones',
    'KuboAutogestión': 'Autogestión',
  };

  private readonly descriptionMap: Record<string, string> = {
    'KuboJuegos':   'Plataforma de entretenimiento con jugadores en tiempo real.',
    'KuboGestión':  'Organizá clientes, proyectos y facturas en un solo lugar.',
    'KuboRRHH':     'Guías inteligentes para que empleados y clientes arranquen rápido.',
    'KuboMétricas': 'Mirá cómo va tu negocio con gráficos simples y avisos automáticos.',
    'KuboTareas':   'Organizá el trabajo de tu equipo: quién hace qué y cuándo.',
    'KuboStock':    'Controlá lo que tenés y vendé más fácil, sin quedarte sin nada.',
    'KuboReservas': 'Tus clientes reservan solos, con recordatorios automáticos.',
  };

  getCategorySuffix(nombre: string): string {
    return this.displayNameMap[nombre] ?? (nombre.startsWith('Kubo') ? nombre.slice(4) : nombre);
  }

  getCategoryDescription(cat: Categoria): string {
    return this.descriptionMap[cat.nombre] ?? cat.descripcion ?? '';
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  async submitForm() {
    const { nombre, email, mensaje } = this.form;
    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      this.formError = 'Nombre, email y mensaje son obligatorios.';
      return;
    }
    this.formError = '';
    this.formLoading = true;
    const { error } = await this.supabase.insertContacto(this.form);
    this.formLoading = false;
    if (error) {
      this.formError = 'Hubo un error al enviar. Intentá de nuevo.';
      return;
    }
    this.formSubmitted = true;
  }
}
