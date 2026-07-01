import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { StorageModule } from '../storage/storage.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { OptionalAuthGuard } from './guards/optional-auth.guard';


@Module({
  imports: [UsuariosModule, StorageModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as `${number}${'s' | 'm' | 'h' | 'd'}`}
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AdminGuard, OptionalAuthGuard],
  exports: [AuthGuard, JwtModule, AdminGuard, OptionalAuthGuard]
})
export class AuthModule {}