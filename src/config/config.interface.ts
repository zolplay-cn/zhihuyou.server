export enum ConfigKey {
  App = 'app',
  CORS = 'cors',
  Security = 'security',
  I18n = 'i18n',
}

export interface Config {
  [ConfigKey.App]: AppConfig
  [ConfigKey.CORS]: CorsConfig
  [ConfigKey.Security]: SecurityConfig
  [ConfigKey.I18n]: I18nConfig
}

export interface AppConfig {
  port: number
}

export interface CorsConfig {
  enabled: boolean
  origin: string | string[]
}

export interface SecurityConfig {
  expiresIn: string
  refreshIn: string
  refreshInForRemembering: string
  bcryptSaltOrRound: string | number
  jwtSecret: string
}

export interface I18nConfig {
  defaultLanguage: string
}
