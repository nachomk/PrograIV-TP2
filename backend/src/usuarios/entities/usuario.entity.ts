import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Usuario {
    @Prop({ required: true, default: 'Sin nombre'})
    nombre: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario)