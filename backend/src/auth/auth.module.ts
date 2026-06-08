import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [UsuariosModule, StorageModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}