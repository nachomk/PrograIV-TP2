import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { MeGustaDto } from './dto/me-gusta.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('imagenPublicacion', {
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const permitidos = ['image/jpeg', 'image/png', 'image/webp'];
        if (!permitidos.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Solo se permiten JPG, PNG o WEBP.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  crear(
    @Body() dto: CreatePublicacionDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(dto, imagen);
  }
  
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  darMeGusta (@Param('id') id: string, @Body() dto: MeGustaDto) {
    return this.publicacionesService.darMeGusta(id, dto.usuarioId)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  eliminar(@Param('id') id: string, @Body() dto: MeGustaDto) {
    return this.publicacionesService.eliminar(id, dto.usuarioId);
  }

  @Delete(':id/like')
  quitarMeGusta(@Param('id') id: string, @Body() dto: MeGustaDto) {
    return this.publicacionesService.quitarMeGusta(id, dto.usuarioId)
  }

  @Get()
  findAll(@Query() dto: ListarPublicacionesDto) {
    return this.publicacionesService.findAll(dto);
  }
}