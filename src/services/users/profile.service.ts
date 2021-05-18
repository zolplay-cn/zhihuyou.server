import { Inject, Injectable } from '@nestjs/common'
import { CreateProfileDto, SaveProfileDto } from '~/types/user/profile'
import { DatabaseService } from '~/services/database.service'
import { Profile } from '@prisma/client'

@Injectable()
export class ProfileService {
  @Inject()
  private readonly db!: DatabaseService

  /**
   * Saves user profile
   *
   * @param data
   * @param userId
   */
  async save(
    data: SaveProfileDto | undefined,
    userId: string
  ): Promise<Profile> {
    const profile = await this.findByUser(userId)

    if (!profile) {
      return this.create({ ...data, userId })
    }

    if (!data) {
      return profile
    }

    return this.update(data, profile.id)
  }

  /**
   * Creates user profile
   *
   * @param data
   */
  async create(data: CreateProfileDto): Promise<Profile> {
    return await this.db.profile.create({ data })
  }

  /**
   * Updates user profile
   *
   * @param data
   * @param id
   */
  async update(data: SaveProfileDto, id: string): Promise<Profile> {
    return await this.db.profile.update({ where: { id }, data })
  }

  /**
   * Finds user profile by user id
   *
   * @param userId
   */
  async findByUser(userId: string): Promise<Profile | null> {
    return await this.db.profile.findUnique({ where: { userId } })
  }
}
