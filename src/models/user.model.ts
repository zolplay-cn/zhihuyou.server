import { Role, User as UserObject } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Transform } from 'class-transformer'
import { Model } from '~/core/model/base.model'

export class User extends Model<UserObject> implements UserObject {
  @ApiProperty()
  id!: string

  @ApiProperty()
  email!: string

  @Exclude()
  password!: string

  @ApiProperty()
  @Transform(({ value }) => value.toString())
  createdAt!: Date

  @ApiProperty()
  @Transform(({ value }) => value.toString())
  updatedAt!: Date

  @ApiProperty()
  fullName!: string | null

  @ApiProperty()
  username!: string | null

  @ApiProperty()
  role!: Role
}

export class UserClient extends User {
  @Exclude()
  createdAt!: Date

  @Exclude()
  updatedAt!: Date

  @Exclude()
  role!: Role
}
