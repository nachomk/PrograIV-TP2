import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.estaLogueado()) {
    return true;
  }

  return auth.autorizar().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.estaLogueado()) {
    return router.createUrlTree(['/publicaciones']);
  }

  return auth.autorizar().pipe(
    map(() => router.createUrlTree(['/publicaciones'])),
    catchError(() => of(true)),
  );
};