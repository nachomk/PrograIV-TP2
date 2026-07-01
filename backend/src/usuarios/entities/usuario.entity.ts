import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Usuario {
  @Prop({ required: true, default: 'Sin nombre' })
  nombre: string;

  @Prop({ required: true, default: 'Sin apellido' })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true })
  correo: string;

  @Prop({ required: true, unique: true })
  nombreUsuario: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ required: true, maxlength: 200 })
  descripcion: string;

  @Prop({ required: true, select: false })
  clave: string;

  @Prop({ default: '' })
  imagenPerfilUrl: string;

  @Prop({ required: true, enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil: 'usuario' | 'administrador';

  @Prop({ default: true })
  activa: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);