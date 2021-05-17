import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { ROLE_METADATA } from '~/core/constants'
import { Role } from '@prisma/client'
import { AuthGuard } from '~/guards/auth.guard'
import { RolesGuard } from '~/guards/roles.guard'
import { ApiBearerAuth, ApiForbiddenResponse } from '@nestjs/swagger'

export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator => {
  return applyDecorators(
    SetMetadata(ROLE_METADATA, roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiForbiddenResponse({ description: "You don't have the permission" })
  )
}
