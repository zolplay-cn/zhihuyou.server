import { HttpStatus, INestApplication } from '@nestjs/common'
import { DatabaseService } from '~/services/database.service'
import { createUser, resetsDatabaseAfterAll, setupNestApp } from 'test/helpers'
import * as faker from 'faker'
import * as request from 'supertest'

const getFakerPost = () => {
  const title = faker.lorem.word(10)
  const content = faker.lorem.words(20)
  const published = false

  return { title, content, published }
}

describe('PostController (e2e)', () => {
  let app: INestApplication
  let db: DatabaseService

  const http = () => {
    return request(app.getHttpServer())
  }

  beforeAll(async () => {
    app = await setupNestApp()
    db = app.get(DatabaseService)
  })

  resetsDatabaseAfterAll(() => app)

  describe('@GET /posts', () => {
    const uri = '/posts'

    it('should return 404 if no published record in the database', async () => {
      await http()
        .get(uri)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.message).toBe('no posts had found')
        })

      let counter = 10
      while (counter) {
        await db.post.create({ data: getFakerPost() })
        counter--
      }

      await http()
        .get(uri)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.message).toBe('no posts had found')
        })
    })

    it('should return 200 and posts if posts have been published in the database', async () => {
      const posts: Array<any> = []
      let counter = 10
      while (counter) {
        const form = getFakerPost()
        form.published = true
        const { createdAt, updatedAt, ...rest } = await db.post.create({
          data: form,
        })
        posts.push(rest)
        counter--
      }

      return http()
        .get(uri)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject(posts)
        })
    })
  })

  describe('@GET /posts/:id', () => {
    const uri = '/posts'

    it('should return 404 if post does not exist', async () => {
      const id = faker.datatype.uuid()

      return request(app.getHttpServer())
        .get(uri + `/${id}`)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.message).toBe(`Not post found for id: ${id}`)
        })
    })

    it('should return 200 and a post if post exists', async () => {
      const form = getFakerPost()
      form.published = true
      const post = await db.post.create({ data: form })
      const { title, content, published, id } = post

      return request(app.getHttpServer())
        .get(uri + `/${post.id}`)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject({
            title,
            content,
            published,
            id,
          })
        })
    })
  })

  describe('@POST /posts/submit', () => {
    const uri = '/posts/submit'
    const form = getFakerPost()

    it('should return 201 if create a post successful', async () => {
      const { user, tokens } = await createUser(app)

      return http()
        .post(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(form)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toMatchObject({
            ...form,
            authorId: user.id,
          })
        })
    })
    it('should return unauthorized if user not logged in', async () => {
      return http().post(uri).send(form).expect(HttpStatus.UNAUTHORIZED)
    })
    it('should return post validation errors', async () => {
      const { tokens } = await createUser(app)

      return http()
        .post(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({})
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject([
            'title must be a string',
            'title should not be empty',
            'published must be a boolean value',
            'published should not be empty',
          ])
        })
    })
  })

  describe('@PUT /posts/:id', () => {
    const uri = '/posts/'

    it('should return 200 and updated post if updated post successful', async () => {
      const { user, tokens } = await createUser(app)
      const form = getFakerPost()
      const post = await db.post.create({
        data: {
          ...form,
          authorId: user.id,
        },
      })
      form.title = faker.lorem.word(5)
      form.content = faker.lorem.words(5)
      form.published = true

      return http()
        .put(uri + post.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(form)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject({
            ...form,
            authorId: user.id,
          })
        })
    })
    it('should return 404 if update not found post', async () => {
      const id = faker.datatype.uuid()
      const { tokens } = await createUser(app)
      const form = getFakerPost()

      return http()
        .put(uri + id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(form)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.message).toBe(`not post found for id: ${id}`)
        })
    })
    it('should return 400 if update a post that is not my own', async () => {
      const { user } = await createUser(app)
      const { tokens } = await createUser(app)
      const form = getFakerPost()
      const post = await db.post.create({
        data: {
          ...form,
          authorId: user.id,
        },
      })
      form.title = faker.lorem.word(5)
      form.content = faker.lorem.words(5)
      form.published = true

      return http()
        .put(uri + post.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(form)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toBe("you haven't permission to update")
        })
    })
    it('should return post validation errors', async () => {
      const { user, tokens } = await createUser(app)
      const form = getFakerPost()
      const post = await db.post.create({
        data: {
          ...form,
          authorId: user.id,
        },
      })

      return http()
        .put(uri + post.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({})
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toMatchObject([
            'title must be a string',
            'title should not be empty',
            'published must be a boolean value',
            'published should not be empty',
          ])
        })
    })
  })

  describe('@DELETE /posts/:id', () => {
    const uri = '/posts/'
    const form = getFakerPost()

    const commonPreform = async () => {
      const { user, tokens } = await createUser(app)
      const post = await db.post.create({
        data: {
          ...form,
          authorId: user.id,
        },
      })

      return { user, tokens, post }
    }

    it('should return 200 and deleted id when deleted post successful', async () => {
      const { tokens, post } = await commonPreform()

      return http()
        .delete(uri + post.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject({
            id: post.id,
          })
        })
    })
    it('should return 404 if delete a post that not found', async () => {
      const { tokens, post } = await commonPreform()
      const id = faker.datatype.uuid()

      return http()
        .delete(uri + id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.message).toBe(`not post found for id: ${id}`)
        })
    })
    it('should return 400 if delete a post that is not my own', async () => {
      const { post } = await commonPreform()
      const { tokens } = await createUser(app)

      return http()
        .delete(uri + post.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toBe("you haven't permission to update")
        })
    })
  })
})
