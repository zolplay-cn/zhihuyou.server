import { Model } from '~/core/model/base.model'
import { Profile as ProfileObject } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Transform } from 'class-transformer'

export class Profile extends Model<ProfileObject> implements ProfileObject {
  @ApiProperty()
  id!: string

  @ApiProperty()
  bio!: string | null

  @ApiProperty()
  city!: string | null

  @ApiProperty()
  userId!: string

  @ApiProperty()
  @Transform(({ value }) => value.toString())
  createdAt!: Date

  @ApiProperty()
  @Transform(({ value }) => value.toString())
  updatedAt!: Date
}

export class ProfileClient extends Profile {
  @Exclude()
  createdAt!: Date

  @Exclude()
  updatedAt!: Date

  @Exclude()
  userId!: string
}
