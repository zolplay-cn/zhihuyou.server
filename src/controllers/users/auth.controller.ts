import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { AuthTokenInstance, LoginDto, RegisterDto } from '~/types/user/auth'
import { AuthService } from '~/services/users/auth.service'
import { AuthGuard } from '~/guards/auth.guard'
import { Role, User } from '@prisma/client'
import { GuestGuard } from '~/guards/guest.guard'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

// TODO: temporary UserResponse
class UserResponse implements User {
  @ApiProperty()
  id!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date
  email!: string

  @ApiProperty()
  password!: string

  @ApiProperty()
  firstname!: string | null

  @ApiProperty()
  lastname!: string | null

  @ApiProperty()
  role!: Role
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Inject()
  private readonly service!: AuthService

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Requires authentication.' })
  @ApiOkResponse({ type: UserResponse })
  async my(@Request() req: { user: User }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = req.user

    return { ...rest }
  }

  @Post('login')
  @UseGuards(GuestGuard)
  @ApiForbiddenResponse()
  @ApiBadRequestResponse({
    description: 'When there are validation errors.',
  })
  @ApiNotFoundResponse({
    description: 'When the user email is not found.',
  })
  @ApiCreatedResponse({ type: AuthTokenInstance })
  async login(@Body() data: LoginDto) {
    return this.service.login(data)
  }

  @Post('register')
  @UseGuards(GuestGuard)
  @ApiForbiddenResponse()
  @ApiBadRequestResponse({
    description: 'Validation errors.',
  })
  @ApiConflictResponse({
    description: 'When the email already exists in the database.',
  })
  @ApiCreatedResponse({
    type: AuthTokenInstance,
  })
  async register(@Body() data: RegisterDto) {
    return this.service.register(data)
  }
}
