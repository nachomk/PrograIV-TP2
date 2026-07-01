import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'cargando', pathMatch: 'full' },
  {
    path: 'cargando',
    loadComponent: () =>
      import('./components/cargando/cargando').then((m) => m.Cargando),
  },
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
    path: 'publicaciones/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/publicacion-detalle/publicacion-detalle').then(
        (m) => m.PublicacionDetalle,
      ),
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
  },
  {
    path: 'usuarios',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/admin-usuarios/admin-usuarios').then(
        (m) => m.AdminUsuarios,
      ),
  },
  {
    path: 'estadisticas',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./components/dashboard-estadisticas/dashboard-estadisticas').then(
        (m) => m.DashboardEstadisticas,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/error/error').then((m) => m.Error),
  },
];