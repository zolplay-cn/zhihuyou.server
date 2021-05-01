import { Config, ConfigKey } from '~/config/config.interface'

const config: Config = {
  [ConfigKey.App]: { port: parseInt(process.env.APP_PORT || '3000', 10) },
  [ConfigKey.CORS]: {
    enabled: true,
  },
  [ConfigKey.Security]: {
    expiresIn: '2m',
    refreshIn: '360d',
    bcryptSaltOrRound: 10,
  },
}

export default (): Config => config
