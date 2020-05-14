import {
  HighLevelErrorDef,
  LowLevelErrorInternal,
  LowLevelErrorDef
} from './interfaces'
import { BaseRegistryError } from './error-types/BaseRegistryError'

/**
 * Contains the definitions for High and Low Level Errors and
 * generates custom errors from those definitions.
 */
export class ErrorRegistry<
  ErrCode extends LowLevelErrorDef,
  HLError extends Record<keyof HLError, HighLevelErrorDef>,
  LLErrorName extends Record<keyof LLErrorName, LowLevelErrorDef>,
  LLError extends Record<keyof LLErrorName, LowLevelErrorInternal>
> {
  /**
   * High level error definitions
   */
  protected highLevelErrors: Record<keyof HLError, HighLevelErrorDef>
  /**
   * Cached high level error classes
   */
  protected highLevelErrorClasses: Record<
    keyof HLError,
    typeof BaseRegistryError
  >
  /**
   * Low level error definitions
   */
  protected lowLevelErrors: LLError

  constructor (highLvErrors: HLError, lowLvErrors: LLErrorName) {
    this.highLevelErrors = highLvErrors
    this.lowLevelErrors = {} as any
    this.highLevelErrorClasses = {} as any

    Object.keys(lowLvErrors).forEach(code => {
      const errCode = this.lowLevelErrors[code] as LowLevelErrorInternal
      errCode.code = code
    })
  }

  /**
   * Gets the definition of a High Level Error
   * @param {string} highLvErrName
   */
  protected getHighLevelError (
    highLvErrName: keyof HLError
  ): HighLevelErrorDef {
    return this.highLevelErrors[highLvErrName]
  }

  /**
   * Gets the definition of a Low Level Error
   * @param {string} lowLvErrName
   */
  protected getLowLevelError (
    lowLvErrName: keyof LLError
  ): LowLevelErrorInternal {
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
    const highLevelDef = this.getHighLevelError(highLvErrName)

    if (!highLevelDef) {
      throw new Error(`High level error not defined: ${highLvErrName}`)
    }

    // Create class definition of the highLevelError and cache
    if (!this.highLevelErrorClasses[highLvErrName]) {
      // https://stackoverflow.com/questions/33605775/es6-dynamic-class-names
      const C = class extends BaseRegistryError {}
      Object.defineProperty(C, 'name', { value: highLevelDef.className })

      this.highLevelErrorClasses[highLvErrName] = C
    }

    return this.highLevelErrorClasses[highLvErrName]
  }

  /**
   * Creates an instance of a High Level Error, without a Low Level Error
   * attached to it.
   * @param {string} highLvErrName
   * @param {string} message Error message
   */
  newBareError (
    highLvErrName: keyof HLError,
    message: string
  ): BaseRegistryError {
    if (!highLvErrName) {
      throw new Error(`High level error not defined: ${highLvErrName}`)
    }

    const C = this.getClass(highLvErrName)
    return new C(this.getHighLevelError(highLvErrName), {
      message
    })
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
    return new C(
      this.getHighLevelError(highLvErrName),
      this.getLowLevelError(lowLvErrName) as LowLevelErrorInternal
    )
  }
}
