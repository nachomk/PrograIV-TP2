import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Publicacion } from './entities/publicacion.entity';
import { Model, Types } from 'mongoose';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { ListarPublicacionesDto, OrdenPublicaciones } from './dto/listar-publicaciones.dto';
import { StorageService } from '../storage/storage.service';
import { Comentario } from 'src/comentarios/entities/comentario.entity';
@Injectable()
export class PublicacionesService {
  constructor (
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly storageService: StorageService,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
  ) {}

  async crear(dto: CreatePublicacionDto, usuarioId: string, imagen?: Express.Multer.File) {
    const autorExiste = await this.usuarioModel.exists({ _id: usuarioId });

    if(!autorExiste) {
      throw new NotFoundException('Usuario no encontrado')
    }

    let imagenUrl = ''
    if(imagen) {
      imagenUrl = await this.storageService.subirImagenPublicacion(imagen, usuarioId);
    }

    const publicacion = await this.publicacionModel.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      autor: usuarioId,
      imagenUrl,
      meGusta: [],
      activa: true
    })

    return this.formatearPublicacion(publicacion)
  }

  private formatearPublicacion(
    publicacion: Publicacion & { _id; createdAt?: Date },
    cantidadComentarios = 0,
  ) {
    return {
      id: publicacion._id.toString(),
      titulo: publicacion.titulo,
      descripcion: publicacion.descripcion,
      imagenUrl: publicacion.imagenUrl,
      autorId: publicacion.autor.toString(),
      cantidadMeGusta: publicacion.meGusta.length,
      cantidadComentarios,
      activa: publicacion.activa,
      fechaCreacion: publicacion.createdAt?.toISOString() ?? null,
    };
  }

  private async contarComentarios(publicacionId: string): Promise<number> {
    return this.comentarioModel.countDocuments({
      publicacion: publicacionId,
    });
  }

  async findAll(dto: ListarPublicacionesDto) {
    const offset = dto.offset ?? 0
    const limit = dto.limit ?? 10
    const orden = dto.orden ?? OrdenPublicaciones.FECHA

    const filtro: { activa: boolean; autor?: string } = { activa: true }

    if(dto.usuarioId) {
      filtro.autor = dto.usuarioId
    }

    const total = await this.publicacionModel.countDocuments(filtro)

    let publicaciones: (Publicacion & {_id; createdAt?: Date})[]

    if (orden === OrdenPublicaciones.LIKES) {
      publicaciones = await this.publicacionModel.aggregate([
        { $match: filtro },
        {
          $addFields: {
            cantidadMeGustaCalc: { $size: { $ifNull: ['$meGusta', []] } }
          }
        },
        { $sort: { cantidadMeGustaCalc: -1 , createdAt: -1} },
        { $skip: offset },
        { $limit: limit }
      ])
    } else {
      publicaciones = await this.publicacionModel
        .find(filtro)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
    }
    const datos = await Promise.all(
      publicaciones.map(async (p) => {
        const cantidadComentarios = await this.contarComentarios(p._id.toString());
        return this.formatearPublicacion(p, cantidadComentarios);
      }),
    );
    return {
      datos,
      total,
      offset,
      limit,
    };
  }

  async findOne(publicacionId: string) {
    this.validarObjectId(publicacionId, 'publicacion');
    const publicacion = await this.publicacionModel.findOne({
      _id: publicacionId,
      activa: true,
    });
    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    const cantidadComentarios = await this.contarComentarios(publicacionId);

    return this.formatearPublicacion(publicacion, cantidadComentarios);
  }

  async darMeGusta(publicacionId: string, usuarioId: string) {
    this.validarObjectId(publicacionId, 'publicacion')
    this.validarObjectId(usuarioId, 'usuario')

    const publicacion = await this.publicacionModel.findOne({
      _id: publicacionId,
      activa: true
    })

    if(!publicacion) {
      throw new NotFoundException('Publicacion no encontrada o inexistente.')
    }

    const usuarioExiste = await this.usuarioModel.exists({ _id: usuarioId })
    if(!usuarioExiste) {
      throw new NotFoundException('Usuario no encontrado.')
    }

    const yaDioLike = publicacion.meGusta.some(
      (id) => id.toString() === usuarioId
    )

    if(yaDioLike) {
      throw new ConflictException('Ya diste me gusta a esta publiación')
    }

    publicacion.meGusta.push(new Types.ObjectId(usuarioId))
    await publicacion.save()

    const cantidadComentarios = await this.contarComentarios(publicacionId);
    return this.formatearPublicacion(publicacion, cantidadComentarios);
  }

  async quitarMeGusta(publicacionId: string, usuarioId: string) {
    this.validarObjectId(publicacionId, 'publicacion')
    this.validarObjectId(usuarioId, 'usuario')

    const publicacion = await this.publicacionModel.findOne({
      _id: publicacionId,
      activa: true
    })

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    const indice = publicacion.meGusta.findIndex(
      (id) => id.toString() === usuarioId
    )

    if(indice === -1) {
      throw new BadRequestException('No diste me gusta a esta publicación')
    }

    publicacion.meGusta.splice(indice, 1)
    await publicacion.save()

    const cantidadComentarios = await this.contarComentarios(publicacionId);
    return this.formatearPublicacion(publicacion, cantidadComentarios);
  }
  
  async eliminar (publicacionId: string, usuarioId: string) {
    this.validarObjectId(publicacionId, 'publicacion')
    this.validarObjectId(usuarioId, 'usuario')

    const publicacion = await this.publicacionModel.findOne({
      _id: publicacionId,
      activa: true
    })

    if(!publicacion) {
      throw new NotFoundException('Publicacion no encontrada')
    }

    const usuario = await this.usuarioModel
      .findById(usuarioId)
      .select('perfil')
    
      if(!usuario) {
        throw new NotFoundException('Usuario no encontrado')
      }

      const esAutor = publicacion.autor.toString() === usuarioId
      const esAdmin = usuario.perfil === 'administrador'

      if(!esAutor && !esAdmin) {
        throw new ForbiddenException(
          'No tenes permiso para eliminar esta publicacion'
        )
      }

      publicacion.activa = false
      await publicacion.save()

      return this.formatearPublicacion(publicacion)
  }

  private validarObjectId(id: string, entidad: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Id de ${entidad} inválido.`);
    }
  }
}