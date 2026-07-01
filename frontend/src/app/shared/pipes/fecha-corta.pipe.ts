import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaCorta',
})
export class FechaCortaPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return new Date(value).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}