import { Test, TestingModule } from '@nestjs/testing'
import { HashService } from '~/services/security/hash.service'
import { ConfigService } from '@nestjs/config'
import { ConfigKey, SecurityConfig } from '~/config/config.interface'

describe('HashService', () => {
  const securityConfig: SecurityConfig = {
    expiresIn: '2m',
    refreshIn: '30d',
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

  test('should have correct bcrypt salt rounds.', function () {
    expect(service.bcryptSaltRounds).toBe(securityConfig.bcryptSaltOrRound)
  })
})
