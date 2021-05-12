import { Role, User as UserObject } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { Model } from '~/core/model/base.model'

export class User extends Model<UserObject> implements UserObject {
  @ApiProperty()
  id!: string

  @ApiProperty()
  email!: string

  @Exclude()
  password!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  @ApiProperty()
  firstname!: string | null

  @ApiProperty()
  lastname!: string | null

  @ApiProperty()
  role!: Role
}
