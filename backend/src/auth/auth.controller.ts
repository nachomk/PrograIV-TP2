import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import type { Request, Response } from 'express';
  import { AuthService } from './auth.service';
  import { RegistroDto } from './dto/registro.dto';
  import { LoginDto } from './dto/login.dto';
  import { AuthGuard } from './guards/auth.guard';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
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
    async registro(
      @Body() dto: RegistroDto,
      @UploadedFile() imagen: Express.Multer.File | undefined,
      @Res({ passthrough: true }) res: Response,
    ) {
      const { usuario, access_token } = await this.authService.registro(dto, imagen);
      this.setTokenCookie(res, access_token);
      return usuario;
    }
  
    @Post('login')
    async login(
      @Body() dto: LoginDto,
      @Res({ passthrough: true }) res: Response,
    ) {
      const { usuario, access_token } = await this.authService.login(dto);
      this.setTokenCookie(res, access_token);
      return usuario;
    }
  
    @Post('autorizar')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async autorizar(@Req() req: Request) {
      const usuario = await this.authService.autorizar(req['user'].sub);
      return {
        ...usuario,
        expiraEn: new Date(req['user'].exp * 1000).toISOString(),
      };
    }
  
    @Post('refrescar')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async refrescar(
      @Req() req: Request,
      @Res({ passthrough: true }) res: Response,
    ) {
      const access_token = await this.authService.refrescar(req['user'].sub);
      this.setTokenCookie(res, access_token);
      return { mensaje: 'Token renovado.' };
    }
  
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Res({ passthrough: true }) res: Response) {
      const esProd = process.env.NODE_ENV === 'production';
      res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: esProd ? 'none' : 'lax',
        secure: esProd,
      });
      return { mensaje: 'Sesión cerrada.' };
    }
  
    private setTokenCookie(res: Response, token: string) {
      const esProd = process.env.NODE_ENV === 'production';
      const maxAgeMs = 60 * 60 * 1000;
      res.cookie('access_token', token, {
        httpOnly: true,
        sameSite: esProd ? 'none' : 'lax',
        secure: esProd,
        maxAge: maxAgeMs,
      });
    }
  }