import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { Role } from '@prisma/client'

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
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
  password!: string
}

export class UpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password!: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  oldPassword!: string
}

export class UpdateEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
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
  @IsString()
  email?: string

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

export class SearchUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
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
