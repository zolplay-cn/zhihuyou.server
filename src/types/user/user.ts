import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'
import { Role } from '@prisma/client'
import { TranslationParams } from '~/enums/TranslationParams'

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  password?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username!: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(Role)
  role?: Role
}

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  username?: string
}

export class ForceUpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { context: { [TranslationParams.min]: 6 } })
  password!: string
}

export class UpdatePasswordDto extends ForceUpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { context: { [TranslationParams.min]: 6 } })
  currentPassword!: string
}

export class UpdateEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email!: string
}

export class UpdateRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Role)
  role!: Role
}

export class ForceUpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(6, { context: { [TranslationParams.min]: 6 } })
  password?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  username?: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(Role)
  role?: Role
}

export class SearchUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  email?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  fullName?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  username?: string
}

export class UpdatePasswordSuccessfulResponse {
  @ApiProperty()
  @IsBoolean()
  data!: boolean
}
