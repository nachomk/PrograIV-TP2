import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from '../publicaciones/entities/publicacion.entity';
import { Comentario } from '../comentarios/entities/comentario.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { RangoFechasDto } from '../estadisticas/rango-fechas.dto';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<Usuario>,
  ) {}

  async publicacionesPorUsuario(dto: RangoFechasDto) {
    const { desde, hasta } = this.obtenerRango(dto);

    const agrupado = await this.publicacionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: desde, $lte: hasta },
          activa: true,
        },
      },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } },
    ]);

    const datos = await this.enriquecerUsuarios(agrupado);
    return { fechaDesde: dto.fechaDesde, fechaHasta: dto.fechaHasta, datos };
  }

  async comentariosRealizados(dto: RangoFechasDto) {
    const { desde, hasta } = this.obtenerRango(dto);

    const agrupado = await this.comentarioModel.aggregate([
      {
        $match: {
          createdAt: { $gte: desde, $lte: hasta },
        },
      },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } },
    ]);

    const datos = await this.enriquecerUsuarios(agrupado);
    return { fechaDesde: dto.fechaDesde, fechaHasta: dto.fechaHasta, datos };
  }

  async comentariosPorPublicacion(dto: RangoFechasDto) {
    const { desde, hasta } = this.obtenerRango(dto);

    const agrupado = await this.comentarioModel.aggregate([
      {
        $match: {
          createdAt: { $gte: desde, $lte: hasta },
        },
      },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } },
    ]);

    const ids = agrupado.map((item) => item._id);
    const publicaciones = await this.publicacionModel
      .find({ _id: { $in: ids } })
      .select('titulo')
      .lean();

    const titulos = new Map(
      publicaciones.map((p) => [p._id.toString(), p.titulo]),
    );

    const datos = agrupado.map((item) => ({
      publicacionId: item._id.toString(),
      titulo: titulos.get(item._id.toString()) ?? 'Publicación eliminada',
      cantidad: item.cantidad,
    }));

    return { fechaDesde: dto.fechaDesde, fechaHasta: dto.fechaHasta, datos };
  }

  private obtenerRango(dto: RangoFechasDto) {
    const desde = new Date(dto.fechaDesde);
    const hasta = new Date(dto.fechaHasta);

    if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) {
      throw new BadRequestException('Fechas inválidas.');
    }

    if (desde > hasta) {
      throw new BadRequestException('fechaDesde no puede ser mayor que fechaHasta.');
    }

    hasta.setHours(23, 59, 59, 999);
    return { desde, hasta };
  }

  private async enriquecerUsuarios(
    agrupado: { _id: Types.ObjectId; cantidad: number }[],
  ) {
    const ids = agrupado.map((item) => item._id);
    const usuarios = await this.usuarioModel
      .find({ _id: { $in: ids } })
      .select('nombre apellido nombreUsuario')
      .lean();

    const mapa = new Map(
      usuarios.map((u) => [u._id.toString(), u]),
    );

    return agrupado.map((item) => {
      const u = mapa.get(item._id.toString());
      return {
        usuarioId: item._id.toString(),
        nombre: u?.nombre ?? 'Usuario',
        apellido: u?.apellido ?? 'eliminado',
        nombreUsuario: u?.nombreUsuario ?? '-',
        cantidad: item.cantidad,
      };
    });
  }
}