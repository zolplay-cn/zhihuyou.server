import { Inject, Injectable } from '@nestjs/common'
import { DatabaseService } from '~/services/database.service'
import { SaveProfileStatusDto } from '~/types/user/profile'
import { ProfileStatus } from '@prisma/client'

@Injectable()
export class ProfileStatusService {
  @Inject()
  private readonly db!: DatabaseService

  /**
   * Saves user profile status
   *
   * @param data
   * @param profileId
   */
  async save(
    data: SaveProfileStatusDto,
    profileId: string
  ): Promise<ProfileStatus> {
    return await this.db.profileStatus.upsert({
      where: {
        profileId,
      },
      update: {
        ...data,
      },
      create: {
        ...data,
        profileId,
      },
    })
  }
}
