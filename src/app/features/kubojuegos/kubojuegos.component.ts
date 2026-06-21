import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { ToastService } from '../../core/services/toast.service';
import { NavComponent } from '../../shared/nav/nav.component';
import { filter, take } from 'rxjs/operators';

interface Juego {
  id: string;
  nombre: string;
  descripcion: string | null;
  requiere_suscripcion?: boolean;
  subscribed?: boolean;
}

type PopupType = 'not-published' | 'subscription' | null;

@Component({
  selector: 'app-kubojuegos',
  standalone: true,
  imports: [RouterLink, NavComponent],
  templateUrl: './kubojuegos.component.html',
  styleUrl: './kubojuegos.component.css'
})
export class KuboJuegosComponent implements OnInit {
  juegos: Juego[] = [];
  loading = true;
  submitted = signal(false);

  popupType: PopupType = null;
  selectedJuego: Juego | null = null;

  categoriaNombre: string | null = null;
  categoriaLogo: string | null = null;

  get emptySlots() {
    return Array.from({ length: Math.max(0, 6 - this.juegos.length) });
  }

  constructor(private supabase: SupabaseService, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    this.supabase.currentUser$.pipe(
      filter(u => u !== undefined),
      take(1)
    ).subscribe(() => this.loadJuegos());
  }

  async loadJuegos() {
    const user = this.supabase.getCurrentUser();
    const [productosRes, categoriaRes] = await Promise.all([
      this.supabase.getProductosByCategoriaNombre('KuboJuegos'),
      this.supabase.getCategoriaByNombre('KuboJuegos'),
    ]);
    if (productosRes.error) this.toast.show('Error al cargar los juegos.', 'error');
    const juegos = (productosRes.data as Juego[]) ?? [];
    if (user) {
      await Promise.all(
        juegos
          .filter(j => j.requiere_suscripcion)
          .map(async j => { j.subscribed = await this.supabase.isSubscribedToProduct(user.id, j.id); })
      );
    }
    this.juegos = juegos;
    if (categoriaRes.data) {
      const cat = categoriaRes.data as { nombre: string; logo: string };
      this.categoriaNombre = cat.nombre;
      this.categoriaLogo   = cat.logo;
    }
    this.loading = false;
  }

  async suscribirse(event: Event, juego: Juego) {
    event.stopPropagation();
    await this.doSuscribir(juego);
  }

  private readonly displayNames: Record<string, string> = {
    'KuboTeg': 'HEGEMONY',
  };

  getDisplayName(nombre: string): string {
    return this.displayNames[nombre] ?? nombre.slice(4).toUpperCase();
  }

  getImgPath(nombre: string): string {
    const slug = nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `assets/productos/favicon-${slug}.svg`;
  }

  async navigateTo(juego: Juego) {
    const slug = juego.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
    const routeExists = this.router.config.some(r => r.path === slug);

    if (!routeExists) {
      this.selectedJuego = juego;
      this.popupType = 'not-published';
      return;
    }

    if (juego.requiere_suscripcion) {
      const user = this.supabase.getCurrentUser();
      const subscribed = user
        ? await this.supabase.isSubscribedToProduct(user.id, juego.id)
        : false;

      if (!subscribed) {
        this.selectedJuego = juego;
        this.popupType = 'subscription';
        return;
      }
    }

    this.router.navigate([`/${slug}`]);
  }

  closePopup() {
    this.popupType = null;
    this.selectedJuego = null;
  }

  async goToSubscription() {
    if (!this.selectedJuego) return;
    const juego = this.selectedJuego;
    const ok = await this.doSuscribir(juego);
    if (ok) {
      this.closePopup();
      const slug = juego.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
      this.router.navigate([`/${slug}`]);
    }
  }

  private async doSuscribir(juego: Juego): Promise<boolean> {
    const user = this.supabase.getCurrentUser();
    if (!user) {
      this.toast.show('Necesitás iniciar sesión para suscribirte.', 'info');
      return false;
    }
    const { error } = await this.supabase.subscribeToProduct(user.id, juego.id);
    if (error) {
      this.toast.show('Error al suscribirse. Intentá de nuevo.', 'error');
      return false;
    }
    juego.subscribed = true;
    this.toast.show(`¡Te suscribiste a ${this.getDisplayName(juego.nombre)}!`, 'success');
    return true;
  }

  submitForm() { this.submitted.set(true); }
}
