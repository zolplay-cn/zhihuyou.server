import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '~/app.module'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { HttpStatus } from '@nestjs/common'

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    )
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
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
