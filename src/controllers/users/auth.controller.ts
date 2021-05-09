import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  AuthTokenInstance,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
} from '~/types/user/auth'
import { AuthService } from '~/services/users/auth.service'
import { AuthGuard } from '~/guards/auth.guard'
import { GuestGuard } from '~/guards/guest.guard'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { User } from '~/models/user.model'
import { Request } from '~/types/http'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Inject()
  private readonly service!: AuthService

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Requires authentication.' })
  @ApiOkResponse({ type: User })
  async my(@Req() { user }: Request) {
    return user
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

  @Post('refresh')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Requires authentication.' })
  @ApiCreatedResponse({ type: AuthTokenInstance })
  async refresh(@Body() { refreshToken }: RefreshTokenDto) {
    return this.service.refreshToken(refreshToken)
  }
}
