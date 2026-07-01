import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateMiPerfilDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(30)
    nombre?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(30)
    apellido?: string;

    @IsOptional()
    @IsEmail()
    correo?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9_]+$/)
    nombreUsuario?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    fechaNacimiento?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    descripcion?: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[A-Z])(?=.*\d).+$/)
    clave?: string;
}