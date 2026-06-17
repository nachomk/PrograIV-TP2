import { IsMongoId } from 'class-validator';

export class MeGustaDto {
  @IsMongoId()
  usuarioId: string;
}