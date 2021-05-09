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
import { DatabaseService } from '~/services/database.service'
import { HashService } from '~/services/security/hash.service'
import { ConfigService } from '@nestjs/config'
import {
  AuthToken,
  authTokenKey,
  AuthTokenPayloadForSigning,
  LoginDto,
  RegisterDto,
} from '~/types/user/auth'
import { ConfigKey, SecurityConfig } from '~/config/config.interface'
import { UserSerializer } from '~/core/serializers/user.serializer'
import { User } from '~/models/user.model'

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

  @Inject()
  private readonly userSerializer!: UserSerializer

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
      throw new NotFoundException(`No user found for email: ${email}`)
    }

    if (!(await this.hash.validate(password, user.password))) {
      throw new BadRequestException('Invalid credentials')
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
        e.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${email} already exists.`)
      } else {
        throw new Error(e)
      }
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
    const user = await this.validateUser(payload[authTokenKey])

    return user ? this.userSerializer.morph(user) : undefined
  }

  /**
   * Validates user by user's ID.
   *
   * @param userId
   */
  validateUser(userId: string) {
    return this.db.user.findUnique({ where: { id: userId } })
  }
}
