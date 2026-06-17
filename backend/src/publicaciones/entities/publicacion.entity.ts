import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true, maxlength: 100 })
  titulo: string;

  @Prop({ required: true, maxlength: 1000 })
  descripcion: string;

  @Prop({ default: '' })
  imagenUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autor: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  meGusta: Types.ObjectId[];

  @Prop({ default: true })
  activa: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);