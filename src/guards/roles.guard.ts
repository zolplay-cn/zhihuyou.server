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

    this.checkUserExists(user)

    if (!this.isAdmin(user!)) {
      this.checkHaveRole(roles as [], user!)
    }

    return true
  }

  private isAdmin(user: User) {
    return user.role === Role.ADMIN
  }

  private checkUserExists(user?: User): boolean {
    if (isNil(user)) {
      this.throwForbidden()
    }

    return true
  }

  private checkHaveRole(roles: [], user: User): boolean {
    if (!roles.some((role) => user!.role.includes(role))) {
      this.throwForbidden()
    }

    return true
  }

  private throwForbidden() {
    throw new ForbiddenException("You don't have the permission")
  }
}
