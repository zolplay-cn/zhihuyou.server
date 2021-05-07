import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppConfig, ConfigKey, CorsConfig } from './config/config.interface'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as helmet from 'helmet'

const logger = new Logger()

async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const configService = app.get(ConfigService)
  const appConfig = configService.get<AppConfig>(ConfigKey.App)
  const corsConfig = configService.get<CorsConfig>(ConfigKey.CORS)

  if (corsConfig?.enabled) {
    app.enableCors()
    logger.debug('CORS enabled for App')
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validationError: {
        target: false,
      },
    })
  )

  await app.use(helmet())
  await app.listen(appConfig?.port || 3000)

  logger.debug(`App is running at ${await app.getUrl()}`)
}

main().catch(logger.error)
