import { Test, TestingModule } from '@nestjs/testing'
import { HashService } from '~/services/security/hash.service'
import { ConfigService } from '@nestjs/config'
import { ConfigKey, SecurityConfig } from '~/config/config.interface'

describe('HashService', () => {
  const securityConfig: SecurityConfig = {
    expiresIn: '2m',
    refreshIn: '1d',
    refreshInForRemembering: '360d',
    bcryptSaltOrRound: 10,
    jwtSecret: 'secret',
  }
  let service: HashService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        HashService,
        {
          provide: ConfigService,
          useValue: {
            get(key: string) {
              switch (key) {
                case ConfigKey.Security:
                  return securityConfig
              }
            },
          },
        },
      ],
    }).compile()

    service = app.get(HashService)
  })

  test('should validate correctly', async function () {
    const secret = 'secret'
    const hashed = await service.make(secret)
    expect(service.validate(secret, hashed)).toBeTruthy()
  })
})
