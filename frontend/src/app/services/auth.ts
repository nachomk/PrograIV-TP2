import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Usuario } from '../clases/usuario';
import { environment } from '../../environments/environment';

const CLAVE_SESION = 'entreNos_sesion';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly sesionSubject = new BehaviorSubject<Usuario | null>(
    this.recuperarSesion(),
  );
  readonly sesion$ = this.sesionSubject.asObservable();

  login(identificador: string, clave: string): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.apiUrl}/auth/login`, { identificador, clave })
      .pipe(
        tap((usuario) => {
          this.sesionSubject.next(usuario);
          this.persistirSesion(usuario);
        }),
      );
  }

  registrar(formData: FormData): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/auth/registro`, formData);
  }

  cerrarSesion(): void {
    this.sesionSubject.next(null);
    this.persistirSesion(null);
  }

  private recuperarSesion(): Usuario | null {
    try {
      const raw = sessionStorage.getItem(CLAVE_SESION);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }

  private persistirSesion(usuario: Usuario | null): void {
    if (usuario) {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
    } else {
      sessionStorage.removeItem(CLAVE_SESION);
    }
  }
}