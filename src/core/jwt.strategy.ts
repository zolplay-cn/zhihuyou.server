import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from '~/services/users/auth.service'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import { ConfigKey, SecurityConfig } from '~/config/config.interface'
import { AuthTokenPayloadForSigning } from '~/types/user/auth'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<SecurityConfig>(ConfigKey.Security)
        ?.jwtSecret,
    })
  }

  async validate(payload: AuthTokenPayloadForSigning): Promise<User> {
    const user = await this.authService.validateUser(payload.userId)
    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }
}
