import { HttpStatus, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as faker from 'faker'
import { createUser, resetsDatabaseAfterAll, setupNestApp } from 'test/helpers'
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

  describe('@GET /auth/me', () => {
    const uri = '/auth/me'

    it('should return 401 if not logged in', () => {
      return request(app.getHttpServer())
        .get(uri)
        .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should return my info when logged in', async () => {
      const { user, tokens } = await createUser(app)

      return request(app.getHttpServer())
        .get(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject({
            id: user.id,
            email: user.email,
          })
          expect(body.password).toBeUndefined()
        })
    })
  })

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

    it('should return FORBIDDEN if not guest', async () => {
      const { user, tokens } = await createUser(app)

      return request(app.getHttpServer())
        .post(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({ email: user.email, password: 'password' })
        .expect(HttpStatus.FORBIDDEN)
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

  describe('@POST /auth/register', () => {
    const uri = '/auth/register'

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
        .send({ email: 'test', password: 'password' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject(['email must be an email'])
        })
    })

    it('should return password validation errors', async () => {
      await request(app.getHttpServer())
        .post(uri)
        .send({ email: faker.internet.email() })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject([
            'password must be a string',
            'password must be longer than or equal to 6 characters',
            'password should not be empty',
          ])
        })
      await request(app.getHttpServer())
        .post(uri)
        .send({ email: faker.internet.email(), password: 'pass' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject([
            'password must be longer than or equal to 6 characters',
          ])
        })
    })

    it('should return firstname or lastname validation errors', async () => {
      await request(app.getHttpServer())
        .post(uri)
        .send({
          email: faker.internet.email(),
          firstname: 123,
          password: 'password',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject(['firstname must be a string'])
        })
      await request(app.getHttpServer())
        .post(uri)
        .send({
          email: faker.internet.email(),
          lastname: 123,
          password: 'password',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject(['lastname must be a string'])
        })
    })

    it('should return conflict if email already exists', async () => {
      const email = faker.internet.email()

      await db.user.create({
        data: {
          email,
          password: '',
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
        },
      })

      return request(app.getHttpServer())
        .post(uri)
        .send({
          email,
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
          password: 'password',
        })
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          expect(body.message).toBe(`Email ${email} already exists.`)
        })
    })

    it('should return conflict if email already exists', async () => {
      const email = faker.internet.email()
      const password = 'password'
      const firstname = faker.name.firstName()
      const lastname = faker.name.lastName()

      await request(app.getHttpServer())
        .post(uri)
        .send({
          email,
          firstname,
          lastname,
          password,
        })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toHaveProperty('accessToken')
          expect(body).toHaveProperty('refreshToken')
        })

      const user = await db.user.findUnique({
        where: { email },
      })
      expect(user).toMatchObject({
        email,
        firstname,
        lastname,
      })
      expect(
        await app.get(HashService).validate(password, user?.password || '')
      ).toBeTruthy()
    })
  })
})
