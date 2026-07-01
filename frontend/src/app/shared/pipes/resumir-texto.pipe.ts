import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'resumirTexto',
})
export class ResumirTextoPipe implements PipeTransform {
  transform(value: string | null | undefined, max = 150): string {
    if (!value) return '';
    if (value.length <= max) return value;
    return `${value.slice(0, max - 3)}...`;
  }
}