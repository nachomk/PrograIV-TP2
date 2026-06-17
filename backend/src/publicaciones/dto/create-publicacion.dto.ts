import { IsMongoId, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePublicacionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  descripcion: string;

  @IsMongoId()
  usuarioId: string;
}