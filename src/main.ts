import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppConfig, ConfigKey, CorsConfig } from './config/config.interface'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as helmet from 'helmet'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const logger = new Logger()
  const configService = app.get(ConfigService)
  const appConfig = configService.get<AppConfig>(ConfigKey.App)
  const corsConfig = configService.get<CorsConfig>(ConfigKey.CORS)

  if (corsConfig?.enabled) {
    app.enableCors({
      credentials: true,
      origin: corsConfig?.origin,
    })
    logger.debug('CORS enabled for App')
  }

  const openAPIDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Zhihuyou (知忽悠) API')
      .setDescription('The API documentation for Zhihuyou (知忽悠)')
      .setVersion(process.env.npm_package_version || '1.0')
      .addBearerAuth()
      .build()
  )
  SwaggerModule.setup('api', app, openAPIDocument, {
    customSiteTitle: 'Zhihuyou API Docs',
  })

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

main().catch(console.error)
