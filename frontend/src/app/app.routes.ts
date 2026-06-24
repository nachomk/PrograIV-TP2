import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./components/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'publicaciones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/publicaciones/publicaciones').then((m) => m.Publicaciones),
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/error/error').then((m) => m.Error),
  },
];