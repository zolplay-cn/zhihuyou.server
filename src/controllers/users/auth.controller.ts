import { Body, Controller, Inject, Post } from '@nestjs/common'
import { LoginArgs, RegisterArgs } from '~/types/user/auth'
import { AuthService } from '~/services/users/auth.service'

@Controller('auth')
export class AuthController {
  @Inject()
  private readonly service!: AuthService

  @Post('login')
  async login(@Body() data: LoginArgs) {
    return this.service.login(data)
  }

  @Post('register')
  async register(@Body() data: RegisterArgs) {
    return this.service.register(data)
  }
}
