import { Inject, Injectable } from '@nestjs/common'
import { I18nService, translateOptions } from 'nestjs-i18n'
import { TranslationParams } from '~/enums/TranslationParams'

/**
 * 处理器白名单
 */
const handlerWhiteList = ['model', 'lang']

@Injectable()
export class LangService {
  @Inject()
  private readonly i18n!: I18nService

  private model?: string

  private lang?: string

  private newOptions: translateOptions = {}

  public setModel(model: string) {
    this.model = model
  }

  public setLang(lang: string) {
    this.lang = lang
  }

  async get(key: string, options?: translateOptions) {
    return await this.i18n.translate(key, this.joinArgs(options))
  }

  private joinArgs(options?: translateOptions): translateOptions {
    for (const handler of handlerWhiteList) {
      // @ts-ignore
      if (this[handler]) {
        // @ts-ignore
        this[this.getHandlerMethod(handler)](options)
      }
    }

    return this.newOptions
  }

  /**
   * 拓展处理器
   * 使用方法：后续若有需要进行设置的属性，
   * 则可以直接拓展handleProperty的形式拓展方法，不需要调整方法本身的逻辑代码
   * 主要用以满足开闭原则，在拓展时，不需要影响本身的逻辑。
   *
   * @param handler
   * @private
   */
  private getHandlerMethod(handler: string) {
    return 'handle' + handler.charAt(0).toUpperCase() + handler.slice(1)
  }

  private handleModel(options?: translateOptions) {
    const args: translationArgs = {}

    args[TranslationParams.model] = this.model
    this.newOptions.args = options ? Object.assign(args, options.args) : args
  }

  private handleLang(options?: translateOptions) {
    this.newOptions.lang = options && options.lang ? options.lang : this.lang
  }
}

interface translationArgs {
  model?: string
}
