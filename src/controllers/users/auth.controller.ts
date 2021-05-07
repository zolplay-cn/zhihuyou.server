import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { LoginDto, RegisterDto } from '~/types/user/auth'
import { AuthService } from '~/services/users/auth.service'
import { AuthGuard } from '~/guards/auth.guard'
import { User } from '@prisma/client'
import { GuestGuard } from '~/guards/guest.guard'

@Controller('auth')
export class AuthController {
  @Inject()
  private readonly service!: AuthService

  @Get('me')
  @UseGuards(AuthGuard)
  async my(@Request() req: { user: User }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = req.user

    return { ...rest }
  }

  @Post('login')
  @UseGuards(GuestGuard)
  async login(@Body() data: LoginDto) {
    return this.service.login(data)
  }

  @Post('register')
  @UseGuards(GuestGuard)
  async register(@Body() data: RegisterDto) {
    return this.service.register(data)
  }
}
