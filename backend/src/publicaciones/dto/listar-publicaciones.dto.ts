import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export enum OrdenPublicaciones {
  FECHA = 'fecha',
  LIKES = 'likes',
}

export class ListarPublicacionesDto {
  @IsOptional()
  @IsEnum(OrdenPublicaciones)
  orden?: OrdenPublicaciones;

  @IsOptional()
  @IsMongoId()
  usuarioId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}