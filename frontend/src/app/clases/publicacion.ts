export type OrdenPublicaciones = 'fecha' | 'likes';

export interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  autorId: string;
  cantidadMeGusta: number;
  activa: boolean;
  fechaCreacion: string | null;
}

export interface ListarPublicacionesParams {
  orden?: OrdenPublicaciones;
  usuarioId?: string;
  offset?: number;
  limit?: number;
}

export interface ListarPublicacionesRespuesta {
  datos: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}