import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { DatabaseService } from '~/services/database.service'
import { HashService } from '~/services/security/hash.service'
import {
  CreateUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from '~/types/user/user'
import { PrismaErrorCode } from '~/enums/PrismaErrorCode'
import { User } from '~/models/user.model'

@Injectable()
export class UserService {
  @Inject()
  private readonly db!: DatabaseService

  @Inject()
  private readonly hash!: HashService

  /**
   * Updates own firstname or lastname.
   *
   * @param data
   * @param id
   */
  async update(data: UpdateUserDto, id: string) {
    return await this.db.user.update({ where: { id }, data })
  }

  /**
   * Updates own password
   * need to validate password
   *
   * @param data
   * @param id
   */
  async updatePassword(data: UpdatePasswordDto, id: string) {
    const user = await this.getUser(id)

    if (!(await this.hash.validate(data.oldPassword, user.password))) {
      throw new BadRequestException('password is incorrect')
    }

    return await this.db.user.update({
      where: { id },
      data: {
        password: await this.hash.make(data.password),
      },
    })
  }

  async getUser(id: string) {
    const user = await this.db.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundException(`No user found for id: ${id}`)
    }

    return user
  }
}
