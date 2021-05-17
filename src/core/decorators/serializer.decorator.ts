import {
  applyDecorators,
  ClassSerializerInterceptor,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common'
import { SERIALIZER_METADATA } from '~/core/constants'
import { ClassConstructor } from 'class-transformer'
import { Model } from '~/core/model/base.model'
import { SerializerInterceptor } from '~/core/interceptors/serializer.interceptor'

export const Serializer = (cls: ClassConstructor<Model<any>>) => {
  return applyDecorators(
    SetMetadata(SERIALIZER_METADATA, cls),
    UseInterceptors(ClassSerializerInterceptor, SerializerInterceptor)
  )
}
