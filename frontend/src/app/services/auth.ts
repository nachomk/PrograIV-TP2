import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Usuario } from '../clases/usuario';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly sesionSubject = new BehaviorSubject<Usuario | null>(null);
  readonly sesion$ = this.sesionSubject.asObservable();

  login(identificador: string, clave: string): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.apiUrl}/login`, { identificador, clave })
      .pipe(tap((usuario) => this.sesionSubject.next(usuario)));
  }

  registrar(formData: FormData): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, formData);
  }

  cerrarSesion(): void {
    this.sesionSubject.next(null);
  }
}