import {
    ConflictException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import * as bcrypt from 'bcrypt';
  import { Usuario } from '../usuarios/entities/usuario.entity';
  import { RegistroDto } from './dto/registro.dto';
  import { LoginDto } from './dto/login.dto';
  import { StorageService } from '../storage/storage.service';
  
  @Injectable()
  export class AuthService {
    constructor(
      @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
      private readonly storageService: StorageService
    ) {}
  
    async registro(dto: RegistroDto, imagen?: Express.Multer.File) {
        const correo = dto.correo.toLowerCase();
      
        if (await this.usuarioModel.exists({ correo })) {
          throw new ConflictException('Ya existe una cuenta con ese correo.');
        }
      
        if (await this.usuarioModel.exists({ nombreUsuario: dto.nombreUsuario })) {
          throw new ConflictException('Ese nombre de usuario ya está en uso.');
        }
      
        let imagenPerfilUrl = '';
        if (imagen) {
          imagenPerfilUrl = await this.storageService.subirImagenPerfil(
            imagen,
            dto.nombreUsuario,
          );
        }
      
        const claveEncriptada = await bcrypt.hash(dto.clave, 10);
      
        const usuarioCreado = await this.usuarioModel.create({
          nombre: dto.nombre,
          apellido: dto.apellido,
          correo,
          nombreUsuario: dto.nombreUsuario,
          fechaNacimiento: new Date(dto.fechaNacimiento),
          descripcion: dto.descripcion,
          clave: claveEncriptada,
          imagenPerfilUrl,
          perfil: 'usuario', // TODO: VISTA ADMIN
        });
      
        return this.respuestaSinClave(usuarioCreado);
      } 
  
    async login(dto: LoginDto) {
      const identificador = dto.identificador.trim();
      const filtro = identificador.includes('@')
        ? { correo: identificador.toLowerCase() }
        : { nombreUsuario: identificador };
  
      const usuario = await this.usuarioModel
        .findOne(filtro)
        .select('+clave')
        .exec();
  
      if (!usuario) {
        throw new UnauthorizedException('Correo/usuario o contraseña incorrectos.');
      }
  
      const valida = await bcrypt.compare(dto.clave, usuario.clave);
      if (!valida) {
        throw new UnauthorizedException('Correo/usuario o contraseña incorrectos.');
      }
  
      return this.respuestaSinClave(usuario);
    }
  
    private respuestaSinClave(usuario: any) {
      return {
        id: usuario._id.toString(),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        nombreUsuario: usuario.nombreUsuario,
        fechaNacimiento: usuario.fechaNacimiento.toISOString(),
        descripcion: usuario.descripcion,
        imagenPerfilUrl: usuario.imagenPerfilUrl,
        perfil: usuario.perfil,
      };
    }
  }