import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { HashService } from '~/services/security/hash.service'
import { UpdatePasswordDto, UpdateUserDto } from '~/types/user/user'
import { User } from '@prisma/client'
import { CoreService } from '~/services/common/core.service'

@Injectable()
export class UserService extends CoreService {
  @Inject()
  private readonly hash!: HashService

  protected getLangUseModel(): string {
    return 'User'
  }

  /**
   * Updates own firstname or lastname.
   *
   * @param data
   * @param id
   */
  async update(data: UpdateUserDto, id: string): Promise<User> {
    return await this.db.user.update({ where: { id }, data })
  }

  /**
   * Updates own password
   * need to validate password
   *
   * @param data
   * @param id
   */
  async updatePassword(data: UpdatePasswordDto, id: string): Promise<User> {
    const user = await this.getUser(id)

    if (!(await this.hash.validate(data.currentPassword, user.password))) {
      throw new BadRequestException(await this.lang.get('error.password'))
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
  async getUser(id: string): Promise<User> {
    const user = await this.db.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundException(
        await this.lang.get('error.not_found.id', { args: { id } })
      )
    }

    return user
  }

  /**
   * Gets a user by username
   *
   * @param username
   */
  async getUserByUsername(username: string) {
    const user = await this.db.user.findUnique({ where: { username } })

    if (!user) {
      throw new NotFoundException(
        await this.lang.get('error.not_found.username', { args: { username } })
      )
    }

    return user
  }
}
