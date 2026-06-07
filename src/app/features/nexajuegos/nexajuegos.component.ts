import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { NavComponent } from '../../shared/nav/nav.component';
import { filter, take } from 'rxjs/operators';

interface Juego {
  id: string;
  nombre: string;
  descripcion: string | null;
  requiere_suscripcion?: boolean;
}

type PopupType = 'not-published' | 'subscription' | null;

@Component({
  selector: 'app-nexajuegos',
  standalone: true,
  imports: [RouterLink, NavComponent],
  templateUrl: './nexajuegos.component.html',
  styleUrl: './nexajuegos.component.css'
})
export class NexaJuegosComponent implements OnInit {
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

  constructor(private supabase: SupabaseService, private router: Router) {}

  ngOnInit() {
    this.supabase.currentUser$.pipe(
      filter(u => u !== undefined),
      take(1)
    ).subscribe(() => this.loadJuegos());
  }

  async loadJuegos() {
    const [productosRes, categoriaRes] = await Promise.all([
      this.supabase.getProductosByCategoriaNombre('NexaJuegos'),
      this.supabase.getCategoriaByNombre('NexaJuegos'),
    ]);
    if (productosRes.error) console.error('[nexajuegos]', productosRes.error);
    this.juegos = (productosRes.data as Juego[]) ?? [];
    if (categoriaRes.data) {
      this.categoriaNombre = (categoriaRes.data as any).nombre;
      this.categoriaLogo   = (categoriaRes.data as any).logo;
    }
    this.loading = false;
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

  goToSubscription() {
    this.closePopup();
    this.router.navigate(['/inicio'], { fragment: 'contacto' });
  }

  submitForm() { this.submitted.set(true); }
}
