import { HttpStatus, INestApplication } from '@nestjs/common'
import { DatabaseService } from '~/services/database.service'
import { createUser, resetsDatabaseAfterAll, setupNestApp } from 'test/helpers'
import * as faker from 'faker'
import * as request from 'supertest'
import modelFactory from '~/core/model/model.factory'
import { Post } from '~/models/post.model'

const getFakerPost = () => {
  const title = faker.lorem.word(10)
  const content = faker.lorem.words(20)
  const published = false

  return { title, content, published }
}

describe('PostsController (e2e)', () => {
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

    it('should return empty list if all posts are unpublished', async () => {
      await http()
        .get(uri)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject([])
        })

      for (const item in Array(10).fill('')) {
        await db.post.create({ data: getFakerPost() })
      }

      await http()
        .get(uri)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject([])
        })
    })

    it('should return 200 and posts details', async () => {
      const posts: Post[] = []

      for (const _ of Array(10).fill('')) {
        const post = getFakerPost()
        post.published = true
        posts.push(
          new Post(
            await db.post.create({
              data: post,
            })
          )
        )
      }

      return http()
        .get(uri)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject(posts.map((p) => p.toJson()))
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
          expect(body.message).toBe(`Post cannot be found for id: ${id}.`)
        })
    })

    it('should return 200 with post details', async () => {
      const form = getFakerPost()
      form.published = true
      const post = await db.post.create({ data: form })
      const { title, content, id } = post

      return request(app.getHttpServer())
        .get(uri + `/${post.id}`)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body.published).toBeUndefined()
          expect(body).toMatchObject({
            title,
            content,
            id,
          })
        })
    })
  })

  describe('@POST /posts', () => {
    const uri = '/posts'
    const form = getFakerPost()

    it('should return 201 correctly', async () => {
      const { user, tokens } = await createUser(app)

      return http()
        .post(uri)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(form)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toMatchObject({
            ...modelFactory.make(Post, form),
            authorId: user.id,
          })
        })
    })

    it('should return unauthorized if not logged in', async () => {
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

    it('should return 200 with updated post details correctly', async () => {
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
            ...modelFactory.make(Post, form),
            authorId: user.id,
          })
        })
    })

    it('should return 404 if post does not exist', async () => {
      const id = faker.datatype.uuid()
      const { tokens } = await createUser(app)
      const form = getFakerPost()

      return http()
        .put(uri + id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(form)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.message).toBe(`Post cannot be found for id: ${id}.`)
        })
    })

    it("should return 400 if user wants to update other users' posts", async () => {
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
          expect(body.message).toBe(
            "You don't have the permission to update this Post."
          )
        })
    })

    it('should return posts details', async () => {
      const { user, tokens } = await createUser(app)
      const form = getFakerPost()
      const post = new Post(
        await db.post.create({
          data: {
            ...form,
            authorId: user.id,
          },
        })
      )

      return http()
        .put(uri + post.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({})
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toMatchObject(post.toJson())
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

    it('should return 200 and deleted post id correctly', async () => {
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

    it('should return 404 if post cannot be found', async () => {
      const { tokens } = await commonPreform()
      const id = faker.datatype.uuid()

      return http()
        .delete(uri + id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.message).toBe(`Post cannot be found for id: ${id}.`)
        })
    })

    it("should return 400 if user wants to delete other users' posts", async () => {
      const { post } = await commonPreform()
      const { tokens } = await createUser(app)

      return http()
        .delete(uri + post.id)
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.message).toBe(
            "You don't have the permission to delete this Post."
          )
        })
    })
  })
})
