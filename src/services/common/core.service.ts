import { LangService } from '~/services/lang.service'
import { ModuleRef } from '@nestjs/core'
import { Inject, OnModuleInit } from '@nestjs/common'
import { ConfigKey, I18nConfig } from '~/config/config.interface'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from '~/services/database.service'

export class CoreService implements OnModuleInit {
  protected lang!: LangService

  @Inject()
  private readonly ref!: ModuleRef

  @Inject()
  protected readonly config!: ConfigService

  @Inject()
  protected readonly db!: DatabaseService

  async onModuleInit() {
    //创建每个service独有的Lang Service
    this.lang = await this.ref.create(LangService)
    this.lang.setModel(this.getLangUseModel())
    this.lang.setLang(this.getLang())
  }

  /**
   * Gets language service use the model string
   * default: Model
   *
   * @protected
   */
  protected getLangUseModel(): string {
    return 'Model'
  }

  /**
   * Gets language service use default lang
   * TODO: Can set user's profile lang in Custom Service
   * @protected
   */
  protected getLang(): string {
    return this.config.get<I18nConfig>(ConfigKey.I18n)
      ?.defaultLanguage as string
  }
}
