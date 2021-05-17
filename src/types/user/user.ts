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
  firstname?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastname?: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(Role)
  role?: Role
}

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  firstname?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastname?: string
}

export class ForceUpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string
}

export class UpdatePasswordDto extends ForceUpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
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
  @MinLength(6)
  password?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  firstname?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastname?: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(Role)
  role?: Role
}

export class SearchUserDto {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  firstname?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastname?: string
}

export class UpdatePasswordSuccessfulResponse {
  @ApiProperty()
  @IsBoolean()
  data!: boolean
}
