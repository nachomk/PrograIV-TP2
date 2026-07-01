import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrearUsuarioAdmin, Usuario } from '../clases/usuario';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  actualizarMiPerfil(formData: FormData): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/mi-perfil`, formData);
  }

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }
  
  crear(dto: CrearUsuarioAdmin): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, dto);
  }
  
  deshabilitar(id: string): Observable<Usuario> {
    return this.http.delete<Usuario>(`${this.apiUrl}/${id}`);
  }
  
  rehabilitar(id: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/${id}/rehabilitar`, {});
  }
}