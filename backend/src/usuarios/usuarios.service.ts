import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './entities/usuario.entity';
import { Model, Types } from 'mongoose';
import { CreateUsuarioAdminDto } from './dto/create-usuario-admin.dto';
import * as bcrypt from 'bcrypt';
import { UpdateMiPerfilDto } from './dto/update-mi-perfil.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class UsuariosService {

  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    private readonly storageService: StorageService
  ) {}

  async listar() {
    const usuarios = await this.usuarioModel
      .find()
      .select('-clave')
      .sort({ nombreUsuario: 1 })
      .lean();
    return usuarios.map((u) => this.formatearUsuario(u));
  }

  async crear(dto: CreateUsuarioAdminDto) {
    const correo = dto.correo.toLowerCase();
    if (await this.usuarioModel.exists({ correo })) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }
    if (await this.usuarioModel.exists({ nombreUsuario: dto.nombreUsuario })) {
      throw new ConflictException('Ese nombre de usuario ya está en uso.');
    }
    const claveEncriptada = await bcrypt.hash(dto.clave, 10);
    const usuario = await this.usuarioModel.create({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo,
      nombreUsuario: dto.nombreUsuario,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      descripcion: dto.descripcion,
      clave: claveEncriptada,
      imagenPerfilUrl: '',
      perfil: dto.perfil,
      activa: true,
    });
    return this.formatearUsuario(usuario);
  }

  async deshabilitar(usuarioId: string) {
    const usuario = await this.buscarPorId(usuarioId);
    if (usuario.activa === false) {
      throw new BadRequestException('El usuario ya está deshabilitado.');
    }
    usuario.activa = false;
    await usuario.save();
    return this.formatearUsuario(usuario);
  }

  async rehabilitar(usuarioId: string) {
    const usuario = await this.buscarPorId(usuarioId);
    if (usuario.activa !== false) {
      throw new BadRequestException('El usuario ya está activo.');
    }
    usuario.activa = true;
    await usuario.save();
    return this.formatearUsuario(usuario);
  }

  private async buscarPorId(usuarioId: string) {
    if (!Types.ObjectId.isValid(usuarioId)) {
      throw new BadRequestException('Id de usuario inválido.');
    }
    const usuario = await this.usuarioModel.findById(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return usuario;
  }

  private formatearUsuario(usuario: Usuario & { _id }) {
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
      activa: usuario.activa !== false,
    };
  }

  async actualizarMiPerfil(
    usuarioId: string,
    dto: UpdateMiPerfilDto,
    imagen?: Express.Multer.File,
  ) {
    const usuario = await this.buscarPorId(usuarioId);
  
    if (dto.correo) {
      const correo = dto.correo.toLowerCase();
      const existe = await this.usuarioModel.exists({
        correo,
        _id: { $ne: usuarioId },
      });
      if (existe) throw new ConflictException('Ya existe una cuenta con ese correo.');
      usuario.correo = correo;
    }
  
    if (dto.nombreUsuario) {
      const existe = await this.usuarioModel.exists({
        nombreUsuario: dto.nombreUsuario,
        _id: { $ne: usuarioId },
      });
      if (existe) throw new ConflictException('Ese nombre de usuario ya está en uso.');
      usuario.nombreUsuario = dto.nombreUsuario;
    }
  
    if (dto.nombre) usuario.nombre = dto.nombre;
    if (dto.apellido) usuario.apellido = dto.apellido;
    if (dto.descripcion) usuario.descripcion = dto.descripcion;
    if (dto.fechaNacimiento) {
      usuario.fechaNacimiento = new Date(dto.fechaNacimiento);
    }
    if (dto.clave) {
      usuario.clave = await bcrypt.hash(dto.clave, 10);
    }
    if (imagen) {
      usuario.imagenPerfilUrl = await this.storageService.subirImagenPerfil(
        imagen,
        usuario.nombreUsuario,
      );
    }
  
    await usuario.save();
    return this.formatearUsuario(usuario);
  }
}
