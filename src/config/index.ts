/* istanbul ignore file */
import * as dotenv from 'dotenv'
import { Config, ConfigKey } from '~/config/config.interface'

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
})

const config: Config = {
  [ConfigKey.App]: { port: parseInt(process.env.APP_PORT || '3000', 10) },
  [ConfigKey.CORS]: {
    enabled: true,
    origin: process.env.CORS_ORIGIN || '*',
  },
  [ConfigKey.Security]: {
    expiresIn: '2m',
    refreshIn: '1d',
    refreshInForRemembering: '360d',
    bcryptSaltOrRound: 10,
    jwtSecret: process.env.JWT_SECRET || '',
  },
}

export default (): Config => config
