import { IsISO8601 } from 'class-validator';

export class RangoFechasDto {
  @IsISO8601()
  fechaDesde: string;

  @IsISO8601()
  fechaHasta: string;
}