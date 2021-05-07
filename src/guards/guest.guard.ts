import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { isNil } from 'lodash'

@Injectable()
export class GuestGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>()
    const bearerToken = req.header('Authorization')?.replace('Bearer ', '')

    return isNil(bearerToken)
  }
}
