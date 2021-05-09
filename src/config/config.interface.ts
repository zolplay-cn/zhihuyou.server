export enum ConfigKey {
  App = 'app',
  CORS = 'cors',
  Security = 'security',
}

export interface Config {
  [ConfigKey.App]: AppConfig
  [ConfigKey.CORS]: CorsConfig
  [ConfigKey.Security]: SecurityConfig
}

export interface AppConfig {
  port: number
}

export interface CorsConfig {
  enabled: boolean
}

export interface SecurityConfig {
  expiresIn: string
  refreshIn: string
  refreshInForRemembering: string
  bcryptSaltOrRound: string | number
  jwtSecret: string
}
