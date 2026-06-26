import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { ListarPublicacionesParams, ListarPublicacionesRespuesta, Publicacion } from "../clases/publicacion";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class Publicaciones {
    private readonly http = inject(HttpClient)
    private readonly apiUrl = `${environment.apiUrl}/publicaciones`

    listar(params: ListarPublicacionesParams = {}): Observable<ListarPublicacionesRespuesta> {
        let httpParams = new HttpParams();
        
        if (params.orden) httpParams = httpParams.set('orden', params.orden);
        if (params.usuarioId) httpParams = httpParams.set('usuarioId', params.usuarioId);
        if (params.offset !== undefined) httpParams = httpParams.set('offset', params.offset);
        if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit);

        return this.http.get<ListarPublicacionesRespuesta>(this.apiUrl, {
            params: httpParams
        })
    }

    crear(formData: FormData): Observable<Publicacion> {
        return this.http.post<Publicacion>(this.apiUrl, formData)
    }

    darMeGusta(publicacionId: string): Observable<Publicacion> {
        return this.http.post<Publicacion>(`${this.apiUrl}/${publicacionId}/like`, {});
    }
    quitarMeGusta(publicacionId: string): Observable<Publicacion> {
        return this.http.delete<Publicacion>(`${this.apiUrl}/${publicacionId}/like`);
    }
    eliminar(publicacionId: string): Observable<Publicacion> {
        return this.http.delete<Publicacion>(`${this.apiUrl}/${publicacionId}`);
    }
    obtenerPorId(id: string): Observable<Publicacion> {
        return this.http.get<Publicacion>(`${this.apiUrl}/${id}`);
    }
}