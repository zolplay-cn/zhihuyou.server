import { Inject, Injectable } from '@nestjs/common'
import { DatabaseService } from '~/services/database.service'
import { HashService } from '~/services/security/hash.service'

@Injectable()
export class UserService {
  @Inject()
  private readonly db!: DatabaseService

  @Inject()
  private readonly hash!: HashService
}
