import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { RangoFechasDto } from '../estadisticas/rango-fechas.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('estadisticas')
@UseGuards(AuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() dto: RangoFechasDto) {
    return this.estadisticasService.publicacionesPorUsuario(dto);
  }

  @Get('comentarios-realizados')
  comentariosRealizados(@Query() dto: RangoFechasDto) {
    return this.estadisticasService.comentariosRealizados(dto);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() dto: RangoFechasDto) {
    return this.estadisticasService.comentariosPorPublicacion(dto);
  }
}