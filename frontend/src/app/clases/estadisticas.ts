export interface EstadisticaPorUsuario {
    usuarioId: string;
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    cantidad: number;
}

export interface EstadisticaPorPublicacion {
    publicacionId: string;
    titulo: string;
    cantidad: number;
}

export interface EstadisticasUsuarioRespuesta {
    fechaDesde: string;
    fechaHasta: string;
    datos: EstadisticaPorUsuario[];
}

export interface EstadisticasPublicacionRespuesta {
    fechaDesde: string;
    fechaHasta: string;
    datos: EstadisticaPorPublicacion[];
}

export interface RangoFechasParams {
    fechaDesde: string;
    fechaHasta: string;
}