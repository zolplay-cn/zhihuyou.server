import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { HttpStatus } from '@nestjs/common'
import { resetsDatabaseAfterAll, setupNestApp } from 'test/helpers'
import { DatabaseService } from '~/services/database.service'

describe('AuthController (e2e)', () => {
  let app: NestFastifyApplication
  let db: DatabaseService

  beforeAll(async () => {
    app = await setupNestApp()
    db = app.get(DatabaseService)
  })

  resetsDatabaseAfterAll(() => app)

  describe('@POST /auth/login', () => {
    it('should throw error if user not found', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/auth/login',
        })
        .then(({ statusCode, payload }) => {
          expect(statusCode).toEqual(HttpStatus.OK)
        })
    })
  })
})
