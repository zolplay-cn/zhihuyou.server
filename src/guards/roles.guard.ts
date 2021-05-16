import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLE_METADATA } from '~/core/constants'
import { Request } from '~/types/http'
import { Role } from '@prisma/client'
import { User } from '~/models/user.model'
import { isNil } from 'lodash'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndMerge<Role[]>(ROLE_METADATA, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!roles) return true

    const { user } = context.switchToHttp().getRequest<Request>()

    if (
      !isNil(user) &&
      !roles.some((role) => user?.role.includes(role)) &&
      !this.isAdmin(user!)
    ) {
      throw new ForbiddenException("You don't have the permission")
    }

    return true
  }

  private isAdmin(user: User) {
    return user.role === Role.ADMIN
  }
}
