import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { isNil } from 'lodash'
import { Request } from '~/types/http'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<Request>()
    if (isNil(user)) {
      throw new UnauthorizedException(user, 'You must be logged in to proceed.')
    }

    return true
  }
}
