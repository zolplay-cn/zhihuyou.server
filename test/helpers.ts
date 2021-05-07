import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '~/app.module'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'
import * as execa from 'execa'

/**
 * Bootstraps and sets up the nest app.
 */
export async function setupNestApp(): Promise<NestFastifyApplication> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter()
  )
  await app.init()
  await app.getHttpAdapter().getInstance().ready()

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validationError: {
        target: false,
      },
    })
  )

  return app
}

/**
 * Programmatically resets the database.
 */
export async function resetDatabase() {
  await execa.command('yarn test:reset')
}

export const resetsDatabaseAfterEach = () => {
  afterEach(async () => await resetDatabase())
}

export const resetsDatabaseAfterAll = (
  getApp: () => NestFastifyApplication
) => {
  afterAll(async () => {
    await getApp().close()
    await resetDatabase()
  })
}
