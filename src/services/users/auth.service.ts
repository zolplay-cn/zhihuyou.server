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
  LoginArgs,
  RegisterArgs,
} from 'types/user/auth'
import { ConfigKey, SecurityConfig } from '~/config/config.interface'

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

  /**
   * Logs a user in.
   *
   * @param email
   * @param password
   *
   * @throws NotFoundException
   * @throws BadRequestException
   */
  async login({ email, password }: LoginArgs): Promise<AuthToken> {
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

    return this.generateToken({ [authTokenKey]: user.id })
  }

  /**
   * Registers a user to the database.
   *
   * @param email
   * @param password
   * @param rest
   *
   * @throws ConflictException
   */
  async register({
    email,
    password,
    ...rest
  }: RegisterArgs): Promise<AuthToken> {
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

      return this.generateToken({ [authTokenKey]: user.id })
    } catch (e) {
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
   */
  generateToken(payload: AuthTokenPayloadForSigning): AuthToken {
    const accessToken = this.jwt.sign(payload)

    const securityConfig = this.config.get<SecurityConfig>(ConfigKey.Security)
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: securityConfig?.refreshIn,
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
   * @throws UnauthorizedException
   */
  refreshToken(token: string): AuthToken {
    try {
      const { userId } = this.jwt.verify<AuthTokenPayloadForSigning>(token)

      return this.generateToken({ userId })
    } catch (e) {
      throw new UnauthorizedException()
    }
  }
}
