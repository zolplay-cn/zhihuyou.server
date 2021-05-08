import {
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
    description: "User's first name.",
  })
  @IsOptional()
  @IsString()
  firstname?: string

  @ApiPropertyOptional({
    description: "User's last name.",
  })
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
