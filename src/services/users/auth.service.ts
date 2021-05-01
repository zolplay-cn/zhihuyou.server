import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DatabaseService } from '~/services/database.service'
import { HashService } from '~/services/security/hash.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  @Inject()
  private readonly jwt!: JwtService

  @Inject()
  private readonly db!: DatabaseService

  @Inject()
  private readonly hash!: HashService

  @Inject()
  private readonly config!: ConfigService

  async login() {
    //
  }
}
