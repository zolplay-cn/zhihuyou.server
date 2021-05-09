import { Post as BasePost } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

export class Post implements BasePost {
  @ApiProperty()
  id!: string

  @Exclude()
  published!: boolean

  @ApiProperty()
  title!: string

  @ApiProperty()
  content!: string | null

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  @ApiProperty()
  authorId!: string | null
}
