export type PerfilUsuario = 'usuario' | 'administrador';

export interface Usuario {
  id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfilUrl?: string;
  perfil: PerfilUsuario;
  activa: boolean;
  expiraEn?: string;
}

export interface CrearUsuarioAdmin {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  clave: string;
  perfil: PerfilUsuario;
}