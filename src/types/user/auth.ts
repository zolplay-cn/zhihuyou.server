import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  remembers?: boolean
}

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  password!: string

  @ApiPropertyOptional({
    description: "User's name.",
  })
  @IsNotEmpty()
  @IsString()
  username!: string

  @ApiPropertyOptional({
    description: "User's full name.",
  })
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  remembers?: boolean
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refreshToken!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  remembers?: boolean
}

export const authTokenKey = 'userId'

export interface AuthTokenPayloadForSigning {
  [authTokenKey]: string
}

export interface AuthToken {
  accessToken: string

  refreshToken: string
}

export class AuthTokenInstance implements AuthToken {
  @ApiProperty({
    description:
      'The access token for JWT authentication. (Used in Authorization header for bearer token)',
  })
  accessToken!: string

  @ApiProperty({
    description:
      'The refresh token for refreshing an access token for JWT authentication.',
  })
  refreshToken!: string
}
