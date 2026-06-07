import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  get currentUser$() {
    return this.supabase.currentUser$;
  }

  async signUp(email: string, password: string, nombre: string, apellido: string) {
    const { data, error } = await this.supabase.signUp(email, password, { nombre, apellido });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.signIn(email, password);
    if (error) throw error;
    if (data.user) {
      await this.supabase.updateOnlineStatus(data.user.id, true);
    }
    return data;
  }

  async signOut() {
    const user = this.supabase.getCurrentUser();
    if (user) {
      await this.supabase.updateOnlineStatus(user.id, false);
    }
    await this.supabase.signOut();
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!this.supabase.getCurrentUser();
  }
}
