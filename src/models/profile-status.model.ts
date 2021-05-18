import { Model } from '~/core/model/base.model'
import { ProfileStatus as ProfileStatusObject } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Transform } from 'class-transformer'

export class ProfileStatus
  extends Model<ProfileStatusObject>
  implements ProfileStatusObject {
  @ApiProperty()
  id!: string

  @ApiProperty()
  content!: string | null

  @ApiProperty()
  emoji!: string | null

  @ApiProperty()
  clearInterval!: number | null

  @ApiProperty()
  @Transform(({ value }) => value.toString())
  createdAt!: Date

  @ApiProperty()
  @Transform(({ value }) => value.toString())
  updatedAt!: Date

  @ApiProperty()
  profileId!: string
}

export class ProfileStatusClient extends ProfileStatus {
  @Exclude()
  createdAt!: Date

  @Exclude()
  updatedAt!: Date

  @Exclude()
  profileId!: string
}
