import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario } from './entities/comentario.entity';
import { Publicacion } from '../publicaciones/entities/publicacion.entity';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentario.dto';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
  ) {}

  async listar(publicacionId: string, dto: ListarComentariosDto) {
    await this.validarPublicacionActiva(publicacionId);

    const offset = dto.offset ?? 0;
    const limit = dto.limit ?? 10;

    const filtro = { publicacion: publicacionId };
    const total = await this.comentarioModel.countDocuments(filtro);

    const comentarios = await this.comentarioModel
      .find(filtro)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('autor', 'nombreUsuario')
      .lean();

    return {
      datos: comentarios.map((c) => this.formatearComentario(c)),
      total,
      offset,
      limit,
    };
  }

  async crear(
    publicacionId: string,
    usuarioId: string,
    dto: CreateComentarioDto,
  ) {
    await this.validarPublicacionActiva(publicacionId);
    this.validarObjectId(usuarioId, 'usuario');

    const comentario = await this.comentarioModel.create({
      texto: dto.texto,
      autor: usuarioId,
      publicacion: publicacionId,
      modificado: false,
    });

    const creado = await this.comentarioModel
      .findById(comentario._id)
      .populate('autor', 'nombreUsuario')
      .lean();

    return this.formatearComentario(creado!);
  }

  async actualizar(
    comentarioId: string,
    usuarioId: string,
    dto: UpdateComentarioDto,
  ) {
    this.validarObjectId(comentarioId, 'comentario');

    const comentario = await this.comentarioModel.findById(comentarioId);

    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado.');
    }

    if (comentario.autor.toString() !== usuarioId) {
      throw new ForbiddenException(
        'No tenés permiso para editar este comentario.',
      );
    }

    comentario.texto = dto.texto;
    comentario.modificado = true;
    await comentario.save();

    const actualizado = await this.comentarioModel
      .findById(comentario._id)
      .populate('autor', 'nombreUsuario')
      .lean();

    return this.formatearComentario(actualizado!);
  }

  private async validarPublicacionActiva(publicacionId: string) {
    this.validarObjectId(publicacionId, 'publicacion');

    const publicacion = await this.publicacionModel.findOne({
      _id: publicacionId,
      activa: true,
    });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada.');
    }
  }

  private formatearComentario(comentario: Comentario & { _id; createdAt?: Date }) {
    const autor = comentario.autor as Types.ObjectId | { _id: Types.ObjectId; nombreUsuario: string };

    const autorId =
      typeof autor === 'object' && autor !== null && '_id' in autor
        ? autor._id.toString()
        : comentario.autor.toString();

    const autorNombreUsuario =
      typeof autor === 'object' && autor !== null && 'nombreUsuario' in autor
        ? autor.nombreUsuario
        : '';

    return {
      id: comentario._id.toString(),
      texto: comentario.texto,
      autorId,
      autorNombreUsuario,
      publicacionId: comentario.publicacion.toString(),
      modificado: comentario.modificado,
      fechaCreacion: comentario.createdAt?.toISOString() ?? null,
    };
  }

  private validarObjectId(id: string, entidad: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Id de ${entidad} inválido.`);
    }
  }
}