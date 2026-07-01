import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioAdminDto } from './dto/create-usuario-admin.dto';
import { UpdateMiPerfilDto } from './dto/update-mi-perfil.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) { }

    // ── Cualquier usuario logueado ──
    @Put('mi-perfil')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('imagenPerfil', {
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
    actualizarMiPerfil(
        @Req() req: Request,
        @Body() dto: UpdateMiPerfilDto,
        @UploadedFile() imagen?: Express.Multer.File,
    ) {
        return this.usuariosService.actualizarMiPerfil(
            req['user'].sub,
            dto,
            imagen,
        );
    }

    // ── Solo administrador ──
    @Get()
    @UseGuards(AuthGuard, AdminGuard)
    listar() {
        return this.usuariosService.listar();
    }

    @Post()
    @UseGuards(AuthGuard, AdminGuard)
    @HttpCode(HttpStatus.CREATED)
    crear(@Body() dto: CreateUsuarioAdminDto) {
        return this.usuariosService.crear(dto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    deshabilitar(@Param('id') id: string) {
        return this.usuariosService.deshabilitar(id);
    }

    @Post(':id/rehabilitar')
    @UseGuards(AuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    rehabilitar(@Param('id') id: string) {
        return this.usuariosService.rehabilitar(id);
    }
}