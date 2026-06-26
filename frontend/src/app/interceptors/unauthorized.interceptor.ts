import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const url = req.url;
        const esAuthEsperado =
          url.includes('/auth/login') ||
          url.includes('/auth/registro') ||
          url.includes('/auth/autorizar');

        if (!esAuthEsperado) {
          auth.limpiarSesionLocal();
          const rutaActual = router.url.split('?')[0];
          if (
            rutaActual !== '/login' &&
            rutaActual !== '/registro' &&
            rutaActual !== '/cargando'
          ) {
            router.navigate(['/login']);
          }
        }
      }

      return throwError(() => error);
    }),
  );
};