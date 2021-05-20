import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '~/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as execa from 'execa'
import * as faker from 'faker'
import { HashService } from '~/services/security/hash.service'
import { AuthService } from '~/services/users/auth.service'
import { authTokenKey } from '~/types/user/auth'
import { DatabaseService } from '~/services/database.service'
import * as request from 'supertest'
import { Role } from '@prisma/client'

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
 * Quickly creates a user for e2e tests.
 *
 * @param app
 */
export async function createUser(app: INestApplication) {
  const db = app.get(DatabaseService)
  const email = faker.internet.email()
  const password = faker.internet.password(8)

  const user = await db.user.create({
    data: {
      email,
      username: faker.internet.userName(),
      password: await app.get(HashService).make(password),
    },
  })
  const tokens = app.get(AuthService).generateToken({ [authTokenKey]: user.id })

  return { user, tokens, password }
}

export async function createAdminUser(app: INestApplication) {
  const db = app.get(DatabaseService)
  const { user, tokens } = await createUser(app)

  const updatedUser = await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      role: Role.ADMIN,
      updatedAt: user.createdAt,
    },
  })

  return {
    user: updatedUser,
    tokens,
  }
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

export const http = (app: INestApplication) => {
  return request(app.getHttpServer())
}
