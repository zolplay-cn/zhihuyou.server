import { HttpStatus, INestApplication } from '@nestjs/common'
import { DatabaseService } from '~/services/database.service'
import {
  createUser,
  http,
  resetsDatabaseAfterAll,
  setupNestApp,
} from 'test/helpers'
import * as faker from 'faker'
import { isNil } from '@nestjs/common/utils/shared.utils'

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
        .then(async ({ body }) => {
          expect(body).toMatchObject(profileWithStatus)
          expect(body.profile).not.toHaveProperty(['createdAt', 'updatedAt'])

          const profile = await db.profile.findUnique({
            where: { userId: user.id },
          })

          expect({ ...profile }).toMatchObject(body.profile)

          const status = await db.profileStatus.findUnique({
            where: { profileId: profile!.id },
          })

          expect({ ...status }).toMatchObject(body.status)
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
        .then(async ({ body }) => {
          expect(body).toMatchObject(profileWithStatus)

          const profile = await db.profile.findUnique({
            where: { userId: user.id },
          })

          expect({ ...profile }).toMatchObject(body.profile)
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
        .then(async ({ body }) => {
          expect(body).toMatchObject(profileWithStatus)
          const profile = await db.profile.findUnique({
            where: { userId: user.id },
          })

          expect(!isNil(profile)).toBeTruthy()

          const status = await db.profileStatus.findUnique({
            where: { profileId: profile!.id },
          })

          expect({ ...status }).toMatchObject(body.status)
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
        .then(async ({ body }) => {
          expect(body).toMatchObject(profileWithStatus)
          const profile = await db.profile.findUnique({
            where: { userId: user.id },
          })

          expect(!isNil(profile)).toBeTruthy()
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
          expect(body.message).toBe('clearInterval must be a number')
        })
    })

    it('should return unauthorized if not logged in', async () => {
      return http(app).put(uri).send({}).expect(HttpStatus.UNAUTHORIZED)
    })
  })
})
