import { classToPlain, ClassTransformOptions } from 'class-transformer'
import { isNil } from 'lodash'

export abstract class Model<T extends Object> {
  constructor(data?: T) {
    if (!isNil(data)) {
      this.init(data)
    }
  }

  toJson(options?: ClassTransformOptions) {
    return classToPlain(this, options)
  }

  protected init(data: T) {
    for (const key of Object.keys(data)) {
      // @ts-ignore
      this[key] = data[key]
    }
  }
}
