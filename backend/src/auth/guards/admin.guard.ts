import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const usuario = request['user'];

        if (!usuario || usuario.perfil !== 'administrador') {
            throw new ForbiddenException(
                'Acceso denegado. Se requiere perfil administrador.',
            );
        }

        return true;
    }
}