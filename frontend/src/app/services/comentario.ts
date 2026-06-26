import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comentario, ListarComentariosRespuesta } from '../clases/comentario';

@Injectable({ providedIn: 'root' })
export class Comentarios {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    listar(
        publicacionId: string,
        offset = 0,
        limit = 5,
    ): Observable<ListarComentariosRespuesta> {
        const params = new HttpParams()
            .set('offset', offset)
            .set('limit', limit);

        return this.http.get<ListarComentariosRespuesta>(
            `${this.apiUrl}/publicaciones/${publicacionId}/comentarios`,
            { params },
        );
    }

    crear(publicacionId: string, texto: string): Observable<Comentario> {
        return this.http.post<Comentario>(
            `${this.apiUrl}/publicaciones/${publicacionId}/comentarios`,
            { texto },
        );
    }

    actualizar(comentarioId: string, texto: string): Observable<Comentario> {
        return this.http.put<Comentario>(
            `${this.apiUrl}/comentarios/${comentarioId}`,
            { texto },
        );
    }
}