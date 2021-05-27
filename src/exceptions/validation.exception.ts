import iterate from 'iterare'
import { ValidationError } from 'class-validator'
import { I18nService } from 'nestjs-i18n'
import {
  ErrorHttpStatusCode,
  HttpErrorByCode,
} from '@nestjs/common/utils/http-error-by-code.util'
import { HttpStatus } from '@nestjs/common'

export class ValidationException {
  constructor(
    private readonly i18n: I18nService,
    private readonly errorHttpStatusCode: ErrorHttpStatusCode = HttpStatus.BAD_REQUEST
  ) {}

  async generate(validationErrors: ValidationError[]) {
    const errors = await this.flattenValidationErrors(validationErrors)

    return new HttpErrorByCode[this.errorHttpStatusCode](errors)
  }

  protected async flattenValidationErrors(validationErrors: ValidationError[]) {
    const errors = iterate(validationErrors)
      .map((error) => this.mapChildrenToValidationErrors(error))
      .flatten()
      .filter((item) => !!item.constraints)
      .toArray()

    const result = []

    for (const item in errors) {
      result.push(await this.prependConstraints(errors[item]))
    }

    return iterate(result)
      .map((item) => Object.values(item.constraints!))
      .flatten()
      .toArray()
  }

  protected mapChildrenToValidationErrors(
    error: ValidationError,
    parentPath?: string
  ): ValidationError[] {
    if (!(error.children && error.children.length)) {
      return [error]
    }
    const validationErrors = []
    parentPath = parentPath ? `${parentPath}.${error.property}` : error.property
    for (const item of error.children) {
      if (item.children && item.children.length) {
        validationErrors.push(
          ...this.mapChildrenToValidationErrors(item, parentPath)
        )
      }
      validationErrors.push(
        this.prependPropertyWithParentProp(item, parentPath)
      )
    }
    return validationErrors
  }

  protected prependPropertyWithParentProp(
    error: ValidationError,
    parentPath: string
  ): ValidationError {
    return {
      ...error,
      property: `${parentPath}.${error.property}`,
    }
  }

  protected async prependConstraints(
    error: ValidationError
  ): Promise<ValidationError> {
    const constraints: any = {}
    // console.log(error)
    for (const key in error.constraints) {
      constraints[key] = await this.getConstraint(
        error.property,
        key,
        error.contexts
      )
    }

    return {
      ...error,
      constraints,
    }
  }

  protected async getConstraint(property: string, key: string, contexts?: any) {
    const context: any = contexts ? Object.values(contexts)[0] : {}

    return await this.i18n.translate(`validation.${key}`, {
      args: Object.assign({ property }, context),
    })
  }
}
