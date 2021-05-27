import { Global, Module } from '@nestjs/common'
import { HashService } from '~/services/security/hash.service'
import { DatabaseModule } from '~/modules/database.module'
import {
  I18nJsonParser,
  I18nModule,
  I18nOptionsWithoutResolvers,
} from 'nestjs-i18n'
import * as path from 'path'
import { ConfigService } from '@nestjs/config'
import { ConfigKey, I18nConfig } from '~/config/config.interface'

@Global()
@Module({
  imports: [
    DatabaseModule,
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          fallbackLanguage: configService.get<I18nConfig>(ConfigKey.I18n)
            ?.defaultLanguage,
          parserOptions: {
            path: path.join(__dirname, '../i18n/'),
          },
        } as I18nOptionsWithoutResolvers
      },
      parser: I18nJsonParser,
      inject: [ConfigService],
    }),
  ],
  providers: [HashService],
  exports: [DatabaseModule, HashService],
})
export class CoreModule {}
