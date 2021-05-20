import { HttpStatus, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as faker from 'faker'
import { createUser, resetsDatabaseAfterAll, setupNestApp } from 'test/helpers'
import { DatabaseService } from '~/services/database.service'
import { HashService } from '~/services/security/hash.service'

const getFakerName = () => ({
  fullName: faker.name.findName(),
  username: faker.internet.userName(),
})

const getFakerUser = () => ({
  ...getFakerName(),
  email: faker.internet.email(),
  password: faker.internet.password(7),
})

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
            username: user.username,
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

    it('should return remembers validation errors', async () => {
      return request(app.getHttpServer())
        .post(uri)
        .send({ email: 'email@test.com', password: 'password', remembers: '1' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject([
            'remembers must be a boolean value',
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
          ...getFakerName(),
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
          ...getFakerName(),
          email,
          password: await app.get(HashService).make(password),
        },
      })

      return request(app.getHttpServer())
        .post(uri)
        .send({ email, password, remembers: true })
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
      const { password, username } = getFakerUser()

      await request(app.getHttpServer())
        .post(uri)
        .send({ password, username })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject([
            'email must be an email',
            'email should not be empty',
          ])
        })
      await request(app.getHttpServer())
        .post(uri)
        .send({ email: 'test', password, username })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject(['email must be an email'])
        })
    })

    it('should return password validation errors', async () => {
      const { email, username } = getFakerUser()

      await request(app.getHttpServer())
        .post(uri)
        .send({ email, username })
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
        .send({ email, username, password: 'pass' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject([
            'password must be longer than or equal to 6 characters',
          ])
        })
    })

    it('should return fullName or username validation errors', async () => {
      await request(app.getHttpServer())
        .post(uri)
        .send({
          ...getFakerUser(),
          fullName: 123,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject(['fullName must be a string'])
        })
      await request(app.getHttpServer())
        .post(uri)
        .send({
          ...getFakerUser(),
          username: 123,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject(['username must be a string'])
        })
    })

    it('should return conflict if email already exists', async () => {
      const email = faker.internet.email()

      await db.user.create({
        data: {
          ...getFakerUser(),
          email,
        },
      })

      return request(app.getHttpServer())
        .post(uri)
        .send({
          ...getFakerUser(),
          email,
        })
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          expect(body.message).toBe(`Email ${email} already exists.`)
        })
    })

    it('should return conflict if username already exists', async () => {
      const username = faker.internet.userName()

      await db.user.create({
        data: {
          ...getFakerUser(),
          username,
        },
      })

      return request(app.getHttpServer())
        .post(uri)
        .send({
          ...getFakerUser(),
          username,
        })
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          expect(body.message).toBe(`username ${username} already exists.`)
        })
    })

    it('should return created if user register successfully', async () => {
      const email = faker.internet.email()
      const password = 'password'
      const { fullName, username } = getFakerName()

      await request(app.getHttpServer())
        .post(uri)
        .send({
          email,
          fullName,
          username,
          password,
          remembers: true,
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
        fullName,
        username,
      })
      expect(
        await app.get(HashService).validate(password, user?.password || '')
      ).toBeTruthy()
    })
  })

  describe('@POST /auth/refresh', () => {
    const uri = '/auth/refresh'

    it('should return 401 if not logged in', function () {
      return request(app.getHttpServer())
        .post(uri)
        .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should return 400 for validation errors', async function () {
      const { tokens } = await createUser(app)

      return request(app.getHttpServer())
        .post(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toStrictEqual([
            'refreshToken must be a string',
            'refreshToken should not be empty',
          ])
        })
    })

    it('should return 401 if refresh token is invalid', async function () {
      const { tokens } = await createUser(app)

      return request(app.getHttpServer())
        .post(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({ refreshToken: faker.datatype.string(20) })
        .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should return new tokens correctly', async function () {
      const { tokens } = await createUser(app)

      return request(app.getHttpServer())
        .post(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({ refreshToken: tokens.refreshToken, remembers: true })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toHaveProperty('accessToken')
          expect(body).toHaveProperty('refreshToken')
        })
    })
  })
})
