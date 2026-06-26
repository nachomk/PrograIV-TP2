export interface Comentario {
    id: string;
    texto: string;
    autorId: string;
    publicacionId: string;
    modificado: boolean;
    fechaCreacion: string | null;
    autorNombreUsuario: string;
}

export interface ListarComentariosRespuesta {
    datos: Comentario[];
    total: number;
    offset: number;
    limit: number;
}