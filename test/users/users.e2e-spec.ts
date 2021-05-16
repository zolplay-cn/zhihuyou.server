import { HttpStatus, INestApplication } from '@nestjs/common'
import { DatabaseService } from '~/services/database.service'
import {
  createAdminUser,
  createUser,
  http,
  resetDatabase,
  resetsDatabaseAfterAll,
  resetsDatabaseAfterEach,
  setupNestApp,
} from 'test/helpers'
import * as faker from 'faker'
import { Role, User } from '@prisma/client'
import { HashService } from '~/services/security/hash.service'
import modelFactory from '~/core/model/model.factory'
import { User as UserModel } from '~/models/user.model'
import { map, shuffle } from 'lodash'

const getFakerUser = () => {
  const email = faker.internet.email()
  const password = faker.internet.password()
  const firstname = faker.name.firstName()
  const lastname = faker.name.lastName()

  return { email, password, firstname, lastname }
}

describe('UsersController (e2e)', () => {
  let app: INestApplication
  let db: DatabaseService
  let hash: HashService

  beforeAll(async () => {
    app = await setupNestApp()
    db = app.get(DatabaseService)
    hash = app.get(HashService)
  })

  resetsDatabaseAfterAll(() => app)

  // resetsDatabaseAfterEach()

  describe('@POST /users', () => {
    const uri = '/users'

    it('should return 201 correctly', async () => {
      const { tokens } = await createAdminUser(app)
      const { password, ...rest } = getFakerUser()

      return http(app)
        .post(uri)
        .send({
          password,
          ...rest,
        })
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toMatchObject(rest)
        })
    })

    it("should return 403 if operator doesn't have the permission.", async () => {
      const { tokens } = await createUser(app)
      const user = getFakerUser()

      return http(app)
        .post(uri)
        .send(user)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.message).toBe("You don't have the permission")
        })
    })

    it('should return 409 if the user email is already exists.', async () => {
      const { tokens } = await createAdminUser(app)
      const user = getFakerUser()

      await db.user.create({ data: user })

      return http(app)
        .post(uri)
        .send(user)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          expect(body.message).toBe(`Email ${user.email} already exists.`)
        })
    })

    it('should return unauthorized if not logged in', async () => {
      return http(app)
        .post(uri)
        .send(getFakerUser())
        .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should return user validation error', async () => {
      const { tokens } = await createAdminUser(app)
      const role = faker.lorem.words(5)

      return http(app)
        .post(uri)
        .send({ role })
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject([
            'email must be a string',
            'email should not be empty',
            'role must be a valid enum value',
          ])
        })
    })
  })

  describe('@PUT /users/:id', () => {
    const uri = '/users/'

    it('should return 200 if administrator normally update successfully', async () => {
      const { tokens } = await createAdminUser(app)
      const user = getFakerUser()

      const userModel = await db.user.create({ data: user })

      const updateData = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
      }

      return http(app)
        .put(uri + userModel.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(updateData)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject(updateData)
        })
    })

    it('should return 404 if administrator want to update the user is not found.', async () => {
      const { tokens } = await createAdminUser(app)
      const user = getFakerUser()

      await db.user.create({ data: user })

      const updateData = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
      }

      const id = faker.datatype.uuid()

      return http(app)
        .put(uri + id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(updateData)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.message).toBe('The User to update is not found.')
        })
    })

    it("should return 403 if the operator doesn't have the permission.", async () => {
      const { tokens } = await createUser(app)
      const user = await db.user.create({ data: getFakerUser() })

      const updateData = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
      }

      return http(app)
        .put(uri + user.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(updateData)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.message).toBe("You don't have the permission")
        })
    })
  })

  describe('@PUT /users/password/:id', () => {
    const uri = '/users/password/'

    it('should return 200 if administrator update password successful', async () => {
      const { tokens } = await createAdminUser(app)
      const user = await db.user.create({ data: getFakerUser() })

      const password = faker.internet.password()

      return http(app)
        .put(uri + user.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({ password })
        .expect(HttpStatus.OK)
        .then(async ({ body }) => {
          expect(body.data).toBeTruthy()
          const checkUser = (await db.user.findUnique({
            where: { id: user.id },
          })) as User

          expect(await hash.validate(password, checkUser.password)).toBeTruthy()
        })
    })

    it("should return 403 if operator doesn't have the permission", async () => {
      const { tokens } = await createUser(app)
      const user = await db.user.create({ data: getFakerUser() })

      const password = faker.internet.password()

      return http(app)
        .put(uri + user.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({ password })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.message).toBe("You don't have the permission")
        })
    })

    it('should return 400 because this method only update password of the user', async () => {
      const { tokens } = await createAdminUser(app)
      const user = await db.user.create({ data: getFakerUser() })

      const updateData = {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
      }

      await http(app)
        .put(uri + user.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(updateData)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject([
            'password must be a string',
            'password should not be empty',
          ])
        })

      const password = faker.internet.password()

      return http(app)
        .put(uri + user.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({ password, ...updateData })
        .expect(HttpStatus.OK)
        .then(async ({ body }) => {
          expect(body.data).toBeTruthy()
          const checkUser = await db.user.findUnique({ where: { id: user.id } })
          expect(checkUser).not.toMatchObject(updateData)
        })
    })
  })

  describe('@PUT /users/role/:id', () => {
    const uri = '/users/role/'

    it('should return 200 and updated user', async () => {
      const { tokens } = await createAdminUser(app)
      const { user } = await createUser(app)

      let changeRole: Role = Role.ADMIN

      await http(app)
        .put(uri + user.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({
          role: changeRole,
        })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject({
            id: user.id,
            role: changeRole,
          })
        })

      changeRole = Role.USER

      await http(app)
        .put(uri + user.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({
          role: changeRole,
        })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject({
            id: user.id,
            role: changeRole,
          })
        })
    })

    it('should return 403 if operator does not have the permission', async () => {
      const { tokens } = await createUser(app)
      const { user } = await createUser(app)

      await http(app)
        .put(uri + user.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({
          role: Role.ADMIN,
        })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.message).toBe("You don't have the permission")
        })
    })
  })

  describe('@DELETE /users/:id', () => {
    const uri = '/users/'

    it('should return 200 if administrator delete a user successfully', async () => {
      const { tokens } = await createAdminUser(app)
      const user = await db.user.create({ data: getFakerUser() })

      return http(app)
        .delete(uri + user.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject({
            ...modelFactory.make(UserModel, user),
          })
        })
    })

    it("should return 403 if operator doesn't have the permission", async () => {
      const { tokens } = await createUser(app)
      const user = await db.user.create({ data: getFakerUser() })

      return http(app)
        .delete(uri + user.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.message).toBe("You don't have the permission")
        })
    })

    it('should return 404 if administrator want to delete is not found', async () => {
      const { tokens } = await createAdminUser(app)
      const id = faker.datatype.uuid()

      await db.user.create({ data: getFakerUser() })

      return http(app)
        .delete(uri + id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.message).toBe('The User to delete does not exist.')
        })
    })
  })

  describe('@GET /users/:id', () => {
    const uri = '/users/'

    it('should return 200 with user detail', async () => {
      const { tokens } = await createAdminUser(app)
      const user = await db.user.create({ data: getFakerUser() })

      return http(app)
        .get(uri + user.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject({
            ...modelFactory.make(UserModel, user),
          })
        })
    })

    it('should return 403 if operator does not have the permission', async () => {
      const { tokens } = await createUser(app)
      const user = await db.user.create({ data: getFakerUser() })

      return http(app)
        .get(uri + user.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.message).toBe("You don't have the permission")
        })
    })
  })

  describe('@GET /users', () => {
    const uri = '/users'

    it('should return 200 with users array', async () => {
      await resetDatabase()
      const { user, tokens } = await createAdminUser(app)
      const users = []

      users.push(user)
      for (const i of Array(10).fill('')) {
        users.push(await db.user.create({ data: getFakerUser() }))
      }

      const checkUsers = map(users, (item) => {
        return {
          ...modelFactory.make(UserModel, item),
        }
      })

      await http(app)
        .get(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject(checkUsers.reverse())
        })
    })

    it('should return 403 if operator does not have the permission', async () => {
      const { tokens } = await createUser(app)
      const users = []

      for (const i of Array(10).fill('')) {
        users.push(await db.user.create({ data: getFakerUser() }))
      }

      return http(app)
        .get(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.message).toBe("You don't have the permission")
        })
    })
  })

  describe('@GET /users/search', () => {
    const uri = '/users/search'

    it('should return 200 with users array by search content', async () => {
      const { user, tokens } = await createAdminUser(app)
      const users = []

      users.push(user)
      for (const i of Array(10).fill('')) {
        users.push(await db.user.create({ data: getFakerUser() }))
      }

      const checkUser = shuffle(users).pop() as User

      await http(app)
        .get(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .query({
          email: checkUser.email,
        })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject([
            {
              ...modelFactory.make(UserModel, checkUser),
            },
          ])
        })

      await http(app)
        .get(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .query({
          firstname: checkUser.firstname,
        })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject([
            {
              ...modelFactory.make(UserModel, checkUser),
            },
          ])
        })

      await http(app)
        .get(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .query({
          lastname: checkUser.lastname,
        })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject([
            {
              ...modelFactory.make(UserModel, checkUser),
            },
          ])
        })

      await http(app)
        .get(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .query({
          firstname: checkUser.firstname,
          lastname: checkUser.lastname,
        })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject([
            {
              ...modelFactory.make(UserModel, checkUser),
            },
          ])
        })

      await http(app)
        .get(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .query({
          firstname: checkUser.firstname?.substring(0, 3),
          lastname: checkUser.lastname?.substring(0, 3),
        })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject([
            {
              ...modelFactory.make(UserModel, checkUser),
            },
          ])
        })
    })

    it('should return 403 if operator does not have the permission.', async () => {
      const { user, tokens } = await createUser(app)
      const users = []

      users.push(user)
      for (const i of Array(10).fill('')) {
        users.push(await db.user.create({ data: getFakerUser() }))
      }

      const checkUser = shuffle(users).pop() as User

      await http(app)
        .get(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .query({
          email: checkUser.email,
        })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          expect(body.message).toBe("You don't have the permission")
        })
    })
  })

  describe('@PUT /users/update/me', () => {
    const uri = '/users/update/me'

    it('should return 200 with updated own user info', async () => {
      const { user, tokens } = await createUser(app)
      const firstname = faker.name.firstName()
      const lastname = faker.name.lastName()
      const email = faker.internet.email()

      return http(app)
        .put(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({ firstname, lastname, email })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject({
            id: user.id,
            email: user.email,
            firstname,
            lastname,
          })
        })
    })

    it('should return unauthorized if not logged in', async () => {
      await createUser(app)

      return http(app)
        .put(uri)
        .send({
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName(),
        })
        .expect(HttpStatus.UNAUTHORIZED)
    })
  })

  describe('@PUT /users/me/password', () => {
    const uri = '/users/me/password'

    it('should return 200 with true', async () => {
      const { user, tokens, password } = await createUser(app)
      const newPassword = faker.internet.password()

      return http(app)
        .put(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({
          oldPassword: password,
          password: newPassword,
        })
        .expect(HttpStatus.OK)
        .then(async ({ body }) => {
          expect(body.data).toBeTruthy()

          const checkUser = await db.user.findUnique({ where: { id: user.id } })

          expect(
            await hash.validate(newPassword, checkUser!.password)
          ).toBeTruthy()
        })
    })

    it('should return 400 if user submit fail oldPassword', async () => {
      const { tokens } = await createUser(app)
      const newPassword = faker.internet.password()

      return http(app)
        .put(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({
          password: newPassword,
          oldPassword: faker.internet.password(),
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toBe('password is incorrect')
        })
    })

    it('should return unauthorized if not logged in', async () => {
      const { password } = await createUser(app)

      return http(app)
        .put(uri)
        .send({
          password: faker.internet.password(),
          oldPassword: password,
        })
        .expect(HttpStatus.UNAUTHORIZED)
    })
  })
})
