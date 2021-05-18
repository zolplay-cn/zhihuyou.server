import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ProfileClient } from '~/models/profile.model'
import { ProfileStatusClient } from '~/models/profile-status.model'

export class SaveProfileDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  bio?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  city?: string
}

export class CreateProfileDto extends SaveProfileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId!: string
}

export class SaveProfileStatusDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  content?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  emoji?: string

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  clearInterval?: number
}

export class CreateProfileStatusDto extends SaveProfileStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  profileId!: string
}

export class SaveProfileWithStatusDto {
  @ApiProperty()
  @IsOptional()
  @IsObject()
  profile?: SaveProfileDto

  @ApiProperty()
  @IsOptional()
  @IsObject()
  status?: SaveProfileStatusDto
}

export class SaveProfileResponse {
  profile?: ProfileClient

  status?: ProfileStatusClient
}
