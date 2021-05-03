import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppConfig, ConfigKey, CorsConfig } from './config/config.interface'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import helmet from 'fastify-helmet'
;(async () => {
  const logger = new Logger()

  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter()
    )

    app.useGlobalPipes(new ValidationPipe())

    const configService = app.get(ConfigService)
    const appConfig = configService.get<AppConfig>(ConfigKey.App)
    const corsConfig = configService.get<CorsConfig>(ConfigKey.CORS)

    if (corsConfig?.enabled) {
      app.enableCors()
      logger.debug('CORS enabled for App')
    }

    await app.register(helmet)
    await app.listen(appConfig?.port || 3000)

    logger.debug(`App is running at ${await app.getUrl()}`)
  } catch (e) {
    logger.error(e)
  }
})()
