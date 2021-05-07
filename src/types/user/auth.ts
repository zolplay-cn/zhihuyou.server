import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @IsNotEmpty()
  @IsString()
  password!: string
}

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string

  @IsOptional()
  @IsString()
  firstname?: string

  @IsOptional()
  @IsString()
  lastname?: string
}

export const authTokenKey = 'userId'

export interface AuthTokenPayloadForSigning {
  [authTokenKey]: string
}

export interface AuthToken {
  accessToken: string

  refreshToken: string
}
