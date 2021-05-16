import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { DatabaseService } from '~/services/database.service'
import { HashService } from '~/services/security/hash.service'
import {
  CreateUserDto,
  ForceUpdatePasswordDto,
  ForceUpdateUserDto,
  SearchUserDto,
  UpdateEmailDto,
  UpdateRoleDto,
  UpdateUserDto,
} from '~/types/user/user'
import { Prisma, User } from '@prisma/client'
import { PrismaErrorCode } from '~/enums/PrismaErrorCode'

const defaultPassword = 'zolran666'

@Injectable()
export class AdminUserService {
  @Inject()
  private readonly db!: DatabaseService

  @Inject()
  private readonly hash!: HashService

  /**
   * Create a user.
   *
   * @param password
   * @param email
   * @param data
   */
  async create({
    password = defaultPassword,
    email,
    ...data
  }: CreateUserDto): Promise<User> {
    const hashPassword = await this.hash.make(password)

    try {
      return await this.db.user.create({
        data: {
          password: hashPassword,
          email,
          ...data,
        },
      })
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === PrismaErrorCode.Unique
      ) {
        throw new ConflictException(`Email ${email} already exists.`)
      } else {
        throw new Error(e)
      }
    }
  }

  /**
   * Force updates a user by id.
   *
   * @param data
   * @param id
   */
  async forceUpdate(data: ForceUpdateUserDto, id: string): Promise<User> {
    try {
      return await this.db.user.update({
        where: {
          id,
        },
        data,
      })
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === PrismaErrorCode.NotFound
      ) {
        throw new NotFoundException('The User to update is not found.')
      }

      throw new Error(e)
    }
  }

  /**
   * Updates a user by id.
   *
   * @param data
   * @param id
   */
  async update(data: UpdateUserDto, id: string): Promise<User> {
    return await this.forceUpdate(data, id)
  }

  /**
   * Updates ths password of user.
   *
   * @param data
   * @param id
   */
  async updatePassword(
    data: ForceUpdatePasswordDto,
    id: string
  ): Promise<boolean> {
    data.password = await this.hash.make(data.password)

    await this.forceUpdate(data, id)

    return true
  }

  /**
   * Updates the email of user.
   *
   * @param data
   * @param id
   */
  async updateEmail(data: UpdateEmailDto, id: string): Promise<User> {
    return await this.forceUpdate(data, id)
  }

  /**
   * Updates the role of user.
   *
   * @param data
   * @param id
   */
  async updateRole(data: UpdateRoleDto, id: string): Promise<User> {
    return await this.forceUpdate(data, id)
  }

  /**
   * Deletes a user by id.
   *
   * @param id
   */
  async remove(id: string): Promise<User> {
    try {
      return await this.db.user.delete({ where: { id } })
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === PrismaErrorCode.NotFound
      ) {
        throw new NotFoundException('The User to delete does not exist.')
      }

      throw new Error(e)
    }
  }

  /**
   * Gets a user by id.
   *
   * @param id
   */
  async getUser(id: string): Promise<User> {
    const user = await this.db.user.findUnique({ where: { id } })

    if (!user) {
      throw new NotFoundException(`The User Cannot be found for id: ${id}`)
    }

    return user
  }

  /**
   * Gets all users orderBy desc createdAt
   */
  async getAllUser(): Promise<User[]> {
    return await this.db.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Search all users by email/firstname/lastname
   *
   * @param data
   */
  async search(data: SearchUserDto): Promise<User[]> {
    return await this.db.user.findMany({
      where: Object.assign({}, ...this.searchWhere(data)),
    })
  }

  /**
   * Splice Search where
   *
   * @param data
   * @private
   */
  private searchWhere(data: SearchUserDto): object[] {
    return Object.entries(data).map((item) => {
      return Object.fromEntries([
        [item[0], Object.fromEntries([['contains', item[1]]])],
      ])
    })
  }
}
