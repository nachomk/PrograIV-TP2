
import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
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
    @UploadedFile() imagen: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    return this.publicacionesService.crear(dto, req['user'].sub, imagen);
  }
  
  @Post(':id/like')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  darMeGusta(@Param('id') id: string, @Req() req: Request) {
    return this.publicacionesService.darMeGusta(id, req['user'].sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  eliminar(@Param('id') id: string, @Req() req: Request) {
    return this.publicacionesService.eliminar(id, req['user'].sub);
  }

  @Delete(':id/like')
  @UseGuards(AuthGuard)
  quitarMeGusta(@Param('id') id: string, @Req() req: Request) {
    return this.publicacionesService.quitarMeGusta(id, req['user'].sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicacionesService.findOne(id);
  }

  @Get()
  findAll(@Query() dto: ListarPublicacionesDto) {
    return this.publicacionesService.findAll(dto);
  }
}