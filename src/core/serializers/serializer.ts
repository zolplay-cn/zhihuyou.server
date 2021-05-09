import { plainToClass } from 'class-transformer'

export abstract class Serializer<T extends Record<string, unknown>, Model> {
  /**
   * The model class for class transformation target.
   *
   * @protected
   */
  protected abstract modelClass: { new (): Model }

  /**
   * Morphs the plain object into a model instance.
   *
   * @param data The plain object form of model
   */
  morph(data: T): Model {
    return plainToClass(this.modelClass, data)
  }
}
