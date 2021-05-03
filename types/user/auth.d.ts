import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

declare class LoginArgs {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  password: string
}

declare class RegisterArgs {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string

  @IsOptional()
  @IsString()
  firstname?: string

  @IsOptional()
  @IsString()
  lastname?: string
}

declare const authTokenKey = 'userId'

declare interface AuthTokenPayloadForSigning {
  [authTokenKey]: string
}

declare interface AuthToken {
  accessToken: string

  refreshToken: string
}
