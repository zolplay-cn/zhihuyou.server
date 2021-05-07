import { HttpStatus, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { resetsDatabaseAfterAll, setupNestApp } from 'test/helpers'
import { DatabaseService } from '~/services/database.service'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let db: DatabaseService

  beforeAll(async () => {
    app = await setupNestApp()
    db = app.get(DatabaseService)
  })

  resetsDatabaseAfterAll(() => app)

  describe('@POST /auth/login', () => {
    it('should have validation error with insufficient payload', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
