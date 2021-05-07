import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '~/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as execa from 'execa'

/**
 * Bootstraps and sets up the nest app.
 */
export async function setupNestApp() {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleRef.createNestApplication()

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validationError: {
        target: false,
      },
    })
  )

  await app.init()

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

export const resetsDatabaseAfterAll = (getApp: () => INestApplication) => {
  afterAll(async () => {
    await getApp().close()
    await resetDatabase()
  })
}
