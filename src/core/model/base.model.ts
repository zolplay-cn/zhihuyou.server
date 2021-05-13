import { classToPlain, ClassTransformOptions } from 'class-transformer'
import { isNil } from 'lodash'

export abstract class Model<T extends Object> {
  constructor(data?: T) {
    if (!isNil(data)) {
      for (const key of Object.keys(data)) {
        // @ts-ignore
        this[key] = data[key]
      }
    }
  }

  toJson(options?: ClassTransformOptions) {
    return classToPlain(this, options)
  }
}
