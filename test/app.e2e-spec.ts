import { HttpStatus, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { setupNestApp } from 'test/helpers'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await setupNestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('@GET /', async () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.text).toBe('Hello World!')
      })
  })
})
