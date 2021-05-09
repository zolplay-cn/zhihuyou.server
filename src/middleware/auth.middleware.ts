import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { Request } from '~/types/http'
import { AuthService } from '~/services/users/auth.service'
import { isNil } from 'lodash'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  @Inject()
  private readonly authService!: AuthService

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract bearer token from header
    const bearerToken = req.header('Authorization')?.replace('Bearer ', '')
    if (isNil(bearerToken)) {
      return next()
    }

    // Verify token and get user
    const user = await this.authService.verifyAndGetUser(bearerToken!)
    if (!isNil(user)) {
      // Attach user to the request
      req.user = user
    }

    next()
  }
}
