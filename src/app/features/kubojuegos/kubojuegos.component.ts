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
    const [productosRes, categoriaRes] = await Promise.all([
      this.supabase.getProductosByCategoriaNombre('KuboJuegos'),
      this.supabase.getCategoriaByNombre('KuboJuegos'),
    ]);
    if (productosRes.error) this.toast.show('Error al cargar los juegos.', 'error');
    this.juegos = (productosRes.data as Juego[]) ?? [];
    if (categoriaRes.data) {
      const cat = categoriaRes.data as { nombre: string; logo: string };
      this.categoriaNombre = cat.nombre;
      this.categoriaLogo   = cat.logo;
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
