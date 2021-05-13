import { Post as PostObject } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Transform } from 'class-transformer'
import { Model } from '~/core/model/base.model'

export class Post extends Model<PostObject> implements PostObject {
  @ApiProperty()
  id!: string

  @Exclude()
  published!: boolean

  @ApiProperty()
  title!: string

  @ApiProperty()
  content!: string | null

  @ApiProperty()
  @Transform(({ value }) => value.toString())
  createdAt!: Date

  @ApiProperty()
  @Transform(({ value }) => value.toString())
  updatedAt!: Date

  @ApiProperty()
  authorId!: string | null
}
