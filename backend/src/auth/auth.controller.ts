import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('registro')
    @HttpCode(HttpStatus.CREATED)
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
    registro(
        @Body() dto: RegistroDto,
        @UploadedFile() imagen?: Express.Multer.File,
    ) {
        return this.authService.registro(dto, imagen);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}