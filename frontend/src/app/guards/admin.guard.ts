import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { Auth } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.sesion$.pipe(
    map((usuario) => {
      if (usuario?.perfil === 'administrador') return true;
      return router.createUrlTree(['/publicaciones']);
    }),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};