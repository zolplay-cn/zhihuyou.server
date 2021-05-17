import { Role, User as UserObject } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
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
  firstname!: string | null

  @ApiProperty()
  lastname!: string | null

  @ApiProperty()
  role!: Role

  @ApiProperty()
  @Expose({ name: 'name' })
  get name() {
    return this.firstname + ' ' + this.lastname
  }
}
