import { Module } from '@nestjs/common'
import { AppController } from './controllers/app.controller'
import { AppService } from './services/app.service'
import { ConfigModule } from '@nestjs/config'
import config from './config'
import { UserModule } from '~/modules/user.module'
import { CoreModule } from '~/modules/core.module'
import { AuthModule } from '~/modules/users/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: process.env.NODE_ENV === 'production',
      load: [config],
    }),
    CoreModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
