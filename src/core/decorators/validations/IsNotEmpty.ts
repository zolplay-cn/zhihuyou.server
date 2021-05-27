import {
  ValidationOptions,
  IsNotEmpty as BaseIsNotEmpty,
} from 'class-validator'
import { createPropertyDecorator } from '@nestjs/swagger/dist/decorators/helpers'
import { ExecutionContext, Inject } from '@nestjs/common'
import { I18nContext } from 'nestjs-i18n'
import { LangService } from '~/services/lang.service'

export function IsNotEmpty(validationOptions?: ValidationOptions): any {
  const i18nInjection = Inject(LangService)

  console.log(i18nInjection.prototype)

  return function (
    target: Record<string, any>,
    _: any,
    descriptor: PropertyDescriptor
  ) {
    i18nInjection(target, 'I18nService')

    console.log(target)
    //
    // console.log(i18nInjection.name)
    // console.log(descriptor)
    //
    // descriptor.value = function (...args: any[]) {
    //   // @ts-ignore
    //   const { I18nService } = this
    //
    //   console.log(I18nService)
    // }
  }

  // console.log(i18n)
  // console.log(validationOptions)
  // return createPropertyDecorator(
  //   'validation',
  //   (data: any, ctx: ExecutionContext) => {
  //     // const I18n: I18nContext = i18n(data, ctx)
  //     // const message = I18n.translate('validation.IsNotEmpty')
  //     //
  //     // const options = Object.assign({ message }, validationOptions)
  //     //
  //     // return BaseIsNotEmpty(options)
  //   }
  // )
}

// function i18n(data: any, ctx: ExecutionContext): I18nContext {
//   switch (ctx.getType() as string) {
//     case 'http':
//       return new I18nContext(
//         ...resolveI18nServiceFromRequest(ctx.switchToHttp().getRequest())
//       )
//     case 'graphql':
//       return new I18nContext(
//         ...resolveI18nServiceFromGraphQLContext(ctx.getArgs())
//       )
//     case 'rpc':
//       return new I18nContext(
//         ...resolveI18nServiceFromRpcContext(ctx.switchToRpc().getContext())
//       )
//     default:
//       throw Error(`context type: ${ctx.getType()} not supported`)
//   }
// }
//
// function resolveI18nServiceFromRequest(req: any): [string, I18nService] {
//   return [
//     req.raw && req.raw.i18nLang ? req.raw.i18nLang : req.i18nLang,
//     req.raw && req.raw.i18nService ? req.raw.i18nService : req.i18nService,
//   ]
// }
//
// function resolveI18nServiceFromGraphQLContext(
//   graphqlContext: any
// ): [string, I18nService] {
//   const [root, args, ctx, info] = graphqlContext
//   return [ctx.i18nLang, ctx.i18nService]
// }
//
// function resolveI18nServiceFromRpcContext(
//   rpcContext: any
// ): [string, I18nService] {
//   return [rpcContext.i18nLang, rpcContext.i18nService]
// }
