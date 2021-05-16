import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Type,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ModuleRef, Reflector } from '@nestjs/core'
import { SERIALIZER_METADATA } from '~/core/constants'
import { Model } from '~/core/model/base.model'
import { ClassConstructor } from 'class-transformer'

@Injectable()
export class SerializerInterceptor implements NestInterceptor {
  app: any

  constructor(private reflector: Reflector, private moduleRef: ModuleRef) {
    this.app = {}
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const model = this.getContextOptions(context)

    return next.handle().pipe(
      map((data) => {
        if (data instanceof Array) {
          return data.map((item) => {
            return new model(item)
          })
        }

        return new model(data)
      })
    )
  }

  private getModelInstance(context: ExecutionContext): Model<any> {
    const options = this.getContextOptions(context)

    return new options()
  }

  private getContextOptions(
    context: ExecutionContext
  ): ClassConstructor<Model<any>> {
    return (
      this.reflectSerializerMetaData(context.getHandler()) ||
      this.reflectSerializerMetaData(context.getClass())
    )
  }

  private reflectSerializerMetaData(obj: Type | Function) {
    return this.reflector.get(SERIALIZER_METADATA, obj)
  }
}
