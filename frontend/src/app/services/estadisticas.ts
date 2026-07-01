import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  EstadisticasPublicacionRespuesta,
  EstadisticasUsuarioRespuesta,
  RangoFechasParams,
} from '../clases/estadisticas';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/estadisticas`;

  private params(rango: RangoFechasParams): HttpParams {
    return new HttpParams()
      .set('fechaDesde', rango.fechaDesde)
      .set('fechaHasta', rango.fechaHasta);
  }

  publicacionesPorUsuario(rango: RangoFechasParams): Observable<EstadisticasUsuarioRespuesta> {
    return this.http.get<EstadisticasUsuarioRespuesta>(
      `${this.apiUrl}/publicaciones-por-usuario`,
      { params: this.params(rango) },
    );
  }

  comentariosRealizados(rango: RangoFechasParams): Observable<EstadisticasUsuarioRespuesta> {
    return this.http.get<EstadisticasUsuarioRespuesta>(
      `${this.apiUrl}/comentarios-realizados`,
      { params: this.params(rango) },
    );
  }

  comentariosPorPublicacion(rango: RangoFechasParams): Observable<EstadisticasPublicacionRespuesta> {
    return this.http.get<EstadisticasPublicacionRespuesta>(
      `${this.apiUrl}/comentarios-por-publicacion`,
      { params: this.params(rango) },
    );
  }
}