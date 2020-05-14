import { LowLevelError, LowLevelErrorDef } from './interfaces'
import { BaseRegistryError } from './error-types/BaseRegistryError'

export class ErrorRegistry<
  ErrCode extends LowLevelErrorDef,
  HLError extends Record<keyof HLError, string>,
  LLErrorName extends Record<keyof LLErrorName, LowLevelErrorDef>,
  LLError extends Record<keyof LLErrorName, LowLevelError>
> {
  highLevelErrorNames: HLError
  highLevelErrorClasses: Record<keyof HLError, typeof BaseRegistryError>
  lowLevelErrors: LLError

  constructor (highLvErrors: HLError, lowLvErrors: LLErrorName) {
    this.highLevelErrorNames = highLvErrors
    this.lowLevelErrors = {} as any
    this.highLevelErrorClasses = {} as any

    Object.keys(lowLvErrors).forEach(code => {
      const errCode = this.lowLevelErrors[code] as LowLevelError
      errCode.code = code
    })
  }

  /**
   * Gets the definition of a Low Level Error
   * @param {string} lowLvErrName
   */
  getLowLevelError (lowLvErrName: keyof LLError): LowLevelError {
    return this.lowLevelErrors[lowLvErrName]
  }

  /**
   * Compares an instance of an object to a specified High Level Error
   */
  instanceOf (a: any, highLvErrName: keyof HLError) {
    return a instanceof this.highLevelErrorClasses[highLvErrName]
  }

  /**
   * Gets the class definition of a High Level Error
   * @param highLvErrName
   */
  getClass (highLvErrName: keyof HLError): typeof BaseRegistryError {
    if (!this.highLevelErrorNames[highLvErrName]) {
      throw new Error(`High level error not defined: ${highLvErrName}`)
    }

    // Create class definition of the highLevelError and cache
    if (!this.highLevelErrorClasses[highLvErrName]) {
      // https://stackoverflow.com/questions/33605775/es6-dynamic-class-names
      const C = class extends BaseRegistryError {}
      Object.defineProperty(C, 'name', { value: highLvErrName })

      this.highLevelErrorClasses[highLvErrName] = C
    }

    return this.highLevelErrorClasses[highLvErrName]
  }

  /**
   * Creates an instance of a High Level Error, with a Low Level Error
   * attached to it.
   * @param {string} highLvErrName
   * @param {string} lowLvErrName
   */
  newError (
    highLvErrName: keyof HLError,
    lowLvErrName: keyof LLError
  ): BaseRegistryError {
    if (!lowLvErrName) {
      throw new Error(`Low level error not defined: ${lowLvErrName}`)
    }

    const C = this.getClass(highLvErrName)
    return new C(this.getLowLevelError(lowLvErrName) as LowLevelError)
  }
}
