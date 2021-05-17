import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { DatabaseService } from '~/services/database.service'
import { HashService } from '~/services/security/hash.service'
import { UpdatePasswordDto, UpdateUserDto } from '~/types/user/user'

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

    if (!(await this.hash.validate(data.currentPassword, user.password))) {
      throw new BadRequestException('password is incorrect')
    }

    return await this.db.user.update({
      where: { id },
      data: {
        password: await this.hash.make(data.password),
      },
    })
  }

  /**
   * Gets a user
   *
   * @param id
   */
  async getUser(id: string) {
    const user = await this.db.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundException(`No user found for id: ${id}`)
    }

    return user
  }
}
