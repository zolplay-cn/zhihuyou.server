import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import config from '~/config/index'
import { ConfigKey } from '~/config/config.interface'
import { AuthTokenPayloadForSigning } from '~/types/user/auth'
import { isNil } from 'lodash'

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const bearerToken = request.header('Authorization')?.replace('Bearer ', '')
    let user = request.user

    if (bearerToken && isNil(user)) {
      const jwtService = new JwtService({})
      const security = config()[ConfigKey.Security]
      const secret = security?.jwtSecret

      const {
        userId,
      }: AuthTokenPayloadForSigning = jwtService.verify(bearerToken, { secret })

      user = {
        id: userId,
      }
    }

    return data ? user && user[data] : user
  }
)
