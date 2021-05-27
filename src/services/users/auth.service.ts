import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Prisma } from '@prisma/client'
import { HashService } from '~/services/security/hash.service'
import {
  AuthToken,
  authTokenKey,
  AuthTokenPayloadForSigning,
  LoginDto,
  RegisterDto,
} from '~/types/user/auth'
import { ConfigKey, SecurityConfig } from '~/config/config.interface'
import { User } from '~/models/user.model'
import { isNil } from 'lodash'
import { PrismaErrorCode } from '~/enums/PrismaErrorCode'
import { CoreService } from '~/services/common/core.service'

@Injectable()
export class AuthService extends CoreService {
  @Inject()
  private readonly jwt!: JwtService

  @Inject()
  private readonly hash!: HashService

  protected getLangUseModel(): string {
    return 'User'
  }

  /**
   * Logs a user in.
   *
   * @param email
   * @param password
   * @param remembers
   *
   * @throws NotFoundException
   * @throws BadRequestException
   */
  async login({
    email,
    password,
    remembers = false,
  }: LoginDto): Promise<AuthToken> {
    const user = await this.db.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      throw new NotFoundException(
        await this.lang.get('error.not_found.email', { args: { email } })
      )
    }

    if (!(await this.hash.validate(password, user.password))) {
      throw new BadRequestException(await this.lang.get('error.login'))
    }

    return this.generateToken({ [authTokenKey]: user.id }, remembers)
  }

  /**
   * Registers a user to the database.
   *
   * @param email
   * @param password
   * @param remembers
   * @param rest
   *
   * @throws ConflictException
   */
  async register({
    email,
    password,
    remembers = false,
    ...rest
  }: RegisterDto): Promise<AuthToken> {
    const hashedPassword = await this.hash.make(password)

    try {
      const user = await this.db.user.create({
        data: {
          email,
          ...rest,
          password: hashedPassword,
          role: 'USER',
        },
      })

      return this.generateToken({ [authTokenKey]: user.id }, remembers)
    } catch (e) {
      /* istanbul ignore else */
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === PrismaErrorCode.Unique
      ) {
        const meta: any = e.meta
        if (meta && meta.target) {
          switch (true) {
            case meta.target.indexOf('username') !== -1:
              throw new ConflictException(
                await this.lang.get('error.conflict.username', {
                  args: { username: rest.username },
                })
              )
            default:
              throw new ConflictException(
                await this.lang.get('error.conflict.email', { args: { email } })
              )
          }
        }
      }

      throw new Error(e)
    }
  }

  /**
   * Generates auth jwt token for user.
   *
   * @param payload
   * @param remembers
   */
  generateToken(
    payload: AuthTokenPayloadForSigning,
    remembers = false
  ): AuthToken {
    const accessToken = this.jwt.sign(payload)

    const securityConfig = this.config.get<SecurityConfig>(ConfigKey.Security)
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: remembers
        ? securityConfig?.refreshInForRemembering
        : securityConfig?.refreshIn,
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  /**
   * Refreshes a user's access token.
   *
   * @param token
   * @param remembers
   *
   * @throws UnauthorizedException
   */
  refreshToken(token: string, remembers = false): AuthToken {
    try {
      const { userId } = this.jwt.verify<AuthTokenPayloadForSigning>(token)

      return this.generateToken({ userId }, remembers)
    } catch (e) {
      throw new UnauthorizedException()
    }
  }

  /**
   * Verifies a bearer token.
   *
   * @param bearerToken
   */
  async verifyAndGetUser(bearerToken: string): Promise<User | undefined> {
    const payload = this.jwt.verify(bearerToken) as AuthTokenPayloadForSigning
    return this.validateUser(payload[authTokenKey])
  }

  /**
   * Validates user by user's ID.
   *
   * @param userId
   */
  private async validateUser(userId: string): Promise<User | undefined> {
    const data = await this.db.user.findUnique({ where: { id: userId } })

    return isNil(data) ? undefined : new User(data)
  }
}
