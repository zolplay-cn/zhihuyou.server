import { Role, User as BaseUser } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

export class User implements BaseUser {
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
