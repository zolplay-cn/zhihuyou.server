import { Body, Controller, Inject, Post } from '@nestjs/common'
import { LoginDto, RegisterDto } from '~/types/user/auth'
import { AuthService } from '~/services/users/auth.service'

@Controller('auth')
export class AuthController {
  @Inject()
  private readonly service!: AuthService

  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.service.login(data)
  }

  @Post('register')
  async register(@Body() data: RegisterDto) {
    return this.service.register(data)
  }
}
