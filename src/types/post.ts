import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreatePostDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title!: string

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  published!: boolean

  @ApiProperty()
  @IsOptional()
  @IsString()
  content?: string
}

export class UpdatePostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  published?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string
}

export class DeletePostResponse {
  @ApiProperty({
    description: "the deleted post's id",
  })
  id!: string
}
