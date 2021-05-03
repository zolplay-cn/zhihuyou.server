import { Module } from '@nestjs/common'
import { AppController } from './controllers/app.controller'
import { AppService } from './services/app.service'
import { ConfigModule } from '@nestjs/config'
import config from './config'
import { UserModule } from '~/modules/user.module'
import { CoreModule } from '~/modules/core.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    CoreModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
