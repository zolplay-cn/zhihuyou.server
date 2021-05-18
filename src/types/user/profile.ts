import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ProfileClient } from '~/models/profile.model'
import { ProfileStatusClient } from '~/models/profileStatus.model'

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
  @IsInt()
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
  @IsOptional({ each: true })
  @IsObject({ each: true })
  status?: SaveProfileStatusDto
}

export class SaveProfileResponse {
  profile?: ProfileClient

  status?: ProfileStatusClient
}
