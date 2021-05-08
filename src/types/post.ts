import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class PostSubmitDto {
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
