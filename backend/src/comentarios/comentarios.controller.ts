import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentario.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller()
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get('publicaciones/:publicacionId/comentarios')
  listar(
    @Param('publicacionId') publicacionId: string,
    @Query() dto: ListarComentariosDto,
  ) {
    return this.comentariosService.listar(publicacionId, dto);
  }

  @Post('publicaciones/:publicacionId/comentarios')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  crear(
    @Param('publicacionId') publicacionId: string,
    @Body() dto: CreateComentarioDto,
    @Req() req: Request,
  ) {
    return this.comentariosService.crear(
      publicacionId,
      req['user'].sub,
      dto,
    );
  }

  @Put('comentarios/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateComentarioDto,
    @Req() req: Request,
  ) {
    return this.comentariosService.actualizar(id, req['user'].sub, dto);
  }
}