import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { AppController } from './controllers/app.controller'
import { AppService } from './services/app.service'
import { ConfigModule } from '@nestjs/config'
import config from './config'
import { UserModule } from '~/modules/user.module'
import { CoreModule } from '~/modules/core.module'
import { AuthModule } from '~/modules/users/auth.module'
import { PostsModule } from '~/modules/posts.module'
import { AuthMiddleware } from '~/middleware/auth.middleware'
import { ProfileModule } from '~/modules/users/profile.module'

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
    PostsModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Global middleware
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    })
  }
}
