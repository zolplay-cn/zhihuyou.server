import { HttpStatus, INestApplication } from '@nestjs/common'
import { DatabaseService } from '~/services/database.service'
import {
  createUser,
  http,
  resetsDatabaseAfterAll,
  setupNestApp,
} from 'test/helpers'
import * as faker from 'faker'

describe('ProfileController (e2e)', () => {
  let app: INestApplication
  let db: DatabaseService

  beforeAll(async () => {
    app = await setupNestApp()
    db = app.get(DatabaseService)
  })

  resetsDatabaseAfterAll(() => app)

  describe('@PUT /profile', () => {
    const uri = '/profile'

    it('should return 201 if user update own profile and status successfully', async () => {
      const { user, tokens } = await createUser(app)

      const profileWithStatus = {
        profile: {
          bio: faker.lorem.words(10),
          city: faker.address.city(),
        },
        status: {
          content: faker.lorem.words(5),
          emoji: faker.lorem.word(5),
          clearInterval: faker.datatype.number(60),
        },
      }

      await http(app)
        .put(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(profileWithStatus)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toMatchObject(profileWithStatus)
          expect(body.profile).toMatchObject({ userId: user.id })
          expect(body.profile).not.toHaveProperty(['createdAt', 'updatedAt'])
          expect(body.status).toMatchObject({ profileId: body.profile.id })
        })

      const profile = {
        bio: faker.lorem.words(10),
        city: faker.address.city(),
      }

      await http(app)
        .put(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({ profile })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body.profile).toMatchObject({
            userId: user.id,
            ...profile,
          })
        })

      const status = {
        content: faker.lorem.words(5),
        emoji: faker.lorem.word(5),
        clearInterval: faker.datatype.number(60),
      }

      await http(app)
        .put(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({ status })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body.status).toMatchObject({
            profileId: body.profile.id,
            ...status,
          })
        })
    })

    it('should return 201 if user only update profile', async () => {
      const { user, tokens } = await createUser(app)

      const profileWithStatus = {
        profile: {
          bio: faker.lorem.words(10),
          city: faker.address.city(),
        },
      }

      return http(app)
        .put(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(profileWithStatus)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toMatchObject(profileWithStatus)
          expect(body.profile).toMatchObject({ userId: user.id })
        })
    })

    it('should return 201 if user only update profile status', async () => {
      const { user, tokens } = await createUser(app)

      const profileWithStatus = {
        status: {
          content: faker.lorem.words(5),
          emoji: faker.lorem.word(5),
          clearInterval: faker.datatype.number(60),
        },
      }

      return http(app)
        .put(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(profileWithStatus)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toMatchObject(profileWithStatus)
          expect(body.profile).toMatchObject({ userId: user.id })
          expect(body.status).toMatchObject({ profileId: body.profile.id })
        })
    })

    it('should return 201 if user submit empty object', async () => {
      const { user, tokens } = await createUser(app)

      const profileWithStatus = {}

      return http(app)
        .put(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(profileWithStatus)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toMatchObject(profileWithStatus)
          expect(body.profile).toMatchObject({ userId: user.id })
        })
    })

    it('should return profile validation errors', async () => {
      const { tokens } = await createUser(app)

      const status = {
        content: faker.lorem.words(5),
        emoji: faker.lorem.word(5),
        clearInterval: faker.lorem.word(8),
      }

      await http(app)
        .put(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({ status })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toBe('clearInterval must be a int')
        })
    })

    it('should return unauthorized if not logged in', async () => {
      return http(app).put(uri).send({}).expect(HttpStatus.UNAUTHORIZED)
    })
  })
})
