import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  title!: string

  @IsNotEmpty()
  @IsBoolean()
  published!: boolean

  @IsOptional()
  @IsString()
  content?: string
}

export type UpdatePostDto = Partial<CreatePostDto>
