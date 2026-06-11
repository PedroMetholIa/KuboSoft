import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  return supabase.currentUser$.pipe(
    filter(user => user !== undefined),
    take(1),
    map(user => {
      if (user) return true;
      router.navigate(['/inicio']);
      return false;
    })
  );
};
