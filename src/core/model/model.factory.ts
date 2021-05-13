import { ClassConstructor, plainToClass } from 'class-transformer'

class ModelFactory {
  make<Model, Data>(cls: ClassConstructor<Model>, data: Data): Model {
    return plainToClass(cls, data)
  }

  makeAll<Model, Data>(cls: ClassConstructor<Model>, data: Data[]): Model[] {
    return plainToClass(cls, data)
  }
}

const modelFactory = new ModelFactory()
export default modelFactory
