import { HttpStatus, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as faker from 'faker'
import { resetsDatabaseAfterAll, setupNestApp } from 'test/helpers'
import { DatabaseService } from '~/services/database.service'
import { HashService } from '~/services/security/hash.service'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let db: DatabaseService

  beforeAll(async () => {
    app = await setupNestApp()
    db = app.get(DatabaseService)
  })

  resetsDatabaseAfterAll(() => app)

  describe('@POST /auth/login', () => {
    const uri = '/auth/login'

    it('should return email validation errors', async () => {
      await request(app.getHttpServer())
        .post(uri)
        .send({ password: 'password' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject([
            'email must be an email',
            'email should not be empty',
          ])
        })
      await request(app.getHttpServer())
        .post(uri)
        .send({ email: 'cali', password: 'password' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject(['email must be an email'])
        })
    })

    it('should return password validation errors', async () => {
      return request(app.getHttpServer())
        .post(uri)
        .send({ email: 'email@test.com' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject([
            'password must be a string',
            'password should not be empty',
          ])
        })
    })

    it('should return 404 if user does not exist', async () => {
      const email = faker.internet.email()
      return request(app.getHttpServer())
        .post(uri)
        .send({ email, password: 'password' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.message).toBe(`No user found for email: ${email}`)
        })
    })

    it('should return 400 if password does not match', async () => {
      const email = faker.internet.email()
      const password = 'password'

      await db.user.create({
        data: {
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
          email,
          password: await app.get(HashService).make(password),
        },
      })

      return request(app.getHttpServer())
        .post(uri)
        .send({ email, password: 'notpassword' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toBe('Invalid credentials')
        })
    })

    it('should return tokens correctly', async () => {
      const email = faker.internet.email()
      const password = 'password'

      await db.user.create({
        data: {
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
          email,
          password: await app.get(HashService).make(password),
        },
      })

      return request(app.getHttpServer())
        .post(uri)
        .send({ email, password })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toHaveProperty('accessToken')
          expect(body).toHaveProperty('refreshToken')
        })
    })
  })
})
