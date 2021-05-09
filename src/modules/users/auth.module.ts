import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '~/services/users/auth.service'
import { PassportModule } from '@nestjs/passport'
import { ConfigKey, SecurityConfig } from '~/config/config.interface'
import { AuthController } from '~/controllers/users/auth.controller'
import { JwtStrategy } from '~/core/auth/jwt.strategy'

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const config = configService.get<SecurityConfig>(ConfigKey.Security)

        return {
          secret: config?.jwtSecret,
          signOptions: {
            expiresIn: config?.expiresIn,
          },
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
