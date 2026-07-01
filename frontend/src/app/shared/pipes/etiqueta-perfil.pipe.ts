import { Pipe, PipeTransform } from '@angular/core';
import { PerfilUsuario } from '../../clases/usuario';

@Pipe({
  name: 'etiquetaPerfil',
})
export class EtiquetaPerfilPipe implements PipeTransform {
  transform(value: PerfilUsuario | string): string {
    if (value === 'administrador') return 'Administrador';
    if (value === 'usuario') return 'Usuario';
    return String(value);
  }
}