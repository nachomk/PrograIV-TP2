import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegistroDto {
    @IsEmail()
    correo: string;

    @IsString()
    @MinLength(2)
    @MaxLength(30)
    nombre: string;

    @IsString()
    @MinLength(2)
    @MaxLength(30)
    apellido: string;

    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9_]+$/)
    nombreUsuario: string;

    @IsString()
    @IsNotEmpty()
    fechaNacimiento: string;

    @IsString()
    @MinLength(1)
    @MaxLength(200)
    descripcion: string;

    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[A-Z])(?=.*\d).+$/)
    clave: string;
}