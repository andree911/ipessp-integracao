import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterAlunoDto {
  @IsString() @MinLength(2) @MaxLength(200) nome: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) @MaxLength(72) senha: string;
}

export class RegisterProfessorDto {
  @IsString() @MinLength(2) @MaxLength(200) nome: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) @MaxLength(72) senha: string;
  @IsOptional() @IsString() @MaxLength(50) matricula?: string;
  @IsOptional() @IsString() @MaxLength(30) telefone?: string;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(1) senha: string;
}

export class ForgotPasswordDto {
  @IsEmail() email: string;
}

export class ResetPasswordDto {
  @IsString() @MinLength(1) token: string;
  @IsString() @MinLength(8) @MaxLength(72) senha: string;
}
