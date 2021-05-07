import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '~/app.module'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { HttpStatus } from '@nestjs/common'
import { setupNestApp } from 'test/helpers'

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    app = await setupNestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/ (GET)', async () => {
    return app
      .inject({
        method: 'GET',
        url: '/',
      })
      .then(({ statusCode, payload }) => {
        expect(statusCode).toEqual(HttpStatus.OK)
        expect(payload).toEqual('Hello World!')
      })
  })
})
