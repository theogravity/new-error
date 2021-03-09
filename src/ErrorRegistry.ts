import {
  DeserializeOpts,
  HighLevelErrorInternal,
  IBaseError,
  IErrorRegistryConfig,
  LowLevelErrorInternal,
  SerializedError
} from './interfaces'

import { BaseRegistryError } from './error-types/BaseRegistryError'
import { BaseError } from './error-types/BaseError'

/**
 * Contains the definitions for High and Low Level Errors and
 * generates custom errors from those definitions.
 */
export class ErrorRegistry<
  ErrCode extends LowLevelErrorInternal,
  HLError extends Record<keyof HLError, HighLevelErrorInternal>,
  LLErrorName extends Record<keyof LLErrorName, LowLevelErrorInternal>,
  LLError extends Record<keyof LLErrorName, LowLevelErrorInternal>
> {
  /**
   * High level error definitions
   */
  protected highLevelErrors: Record<keyof HLError, HighLevelErrorInternal>

  /**
   * A map of high level names to class name
   * @protected
   */
  protected classNameHighLevelNameMap: Record<keyof HLError, string>

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

  /**
   * Error registry configuration
\   */
  protected _config: IErrorRegistryConfig

  constructor (
    highLvErrors: HLError,
    lowLvErrors: LLErrorName,
    config: IErrorRegistryConfig = {}
  ) {
    this.highLevelErrors = highLvErrors
    this.lowLevelErrors = {} as any
    this.classNameHighLevelNameMap = {} as any
    this.highLevelErrorClasses = {} as any
    this._config = config

    Object.keys(highLvErrors).forEach(name => {
      this.classNameHighLevelNameMap[highLvErrors[name].className] = name
    })

    // populate the lowLevelErrors dictionary
    Object.keys(lowLvErrors).forEach(type => {
      const errCode = lowLvErrors[type] as LowLevelErrorInternal
      errCode.type = type
      this.lowLevelErrors[type] = errCode
    })
  }

  /**
   * Gets the definition of a High Level Error
   * @param {string} highLvErrName
   */
  protected getHighLevelError (
    highLvErrName: keyof HLError
  ): HighLevelErrorInternal {
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
   * Compares an instance of an object to a specified High Level Error
   */
  instanceOf (a: any, highLvErrName: keyof HLError) {
    return a instanceof this.getClass(highLvErrName)
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
    const C = this.getClass(highLvErrName)
    const err = new C(
      this.getHighLevelError(highLvErrName),
      {
        message
      },
      this._config.baseErrorConfig
    )

    if (typeof this._config.onCreateError === 'function') {
      this._config.onCreateError(err)
    }

    this.reformatTrace(err)

    return err
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
    if (!this.lowLevelErrors[lowLvErrName]) {
      throw new Error(`Low level error not defined: ${lowLvErrName}`)
    }

    const C = this.getClass(highLvErrName)
    const err = new C(
      this.getHighLevelError(highLvErrName),
      this.getLowLevelError(lowLvErrName) as LowLevelErrorInternal,
      this._config.baseErrorConfig
    )

    if (typeof this._config.onCreateError === 'function') {
      this._config.onCreateError(err)
    }

    this.reformatTrace(err)

    return err
  }

  /**
   * Updates the stack trace to remove the error registry entry:
   * "at ErrorRegistry.newError" and related entries
   */
  private reformatTrace (err: BaseRegistryError): void {
    const stack = err.stack.split('\n')
    stack.splice(1, 1)
    err.stack = stack.join('\n')
  }

  /**
   * Deserializes data into an error
   * @param {string} data JSON.parse()'d error object from
   * BaseError#toJSON() or BaseError#toJSONSafe()
   * @param {DeserializeOpts} [opts] Deserialization options
   */
  fromJSON<
    T extends IBaseError = IBaseError,
    U extends DeserializeOpts = DeserializeOpts
  > (data: Partial<SerializedError>, opts?: U): T {
    if (typeof data !== 'object') {
      throw new Error(`fromJSON(): Data is not an object.`)
    }

    // data.name is the class name - we need to resolve it to the name of the high level class definition
    const errorName = this.classNameHighLevelNameMap[data.name]

    // use the lookup results to see if we can get the class definition of the high level error
    const highLevelDef = this.getHighLevelError(errorName as keyof HLError)

    let err = null

    // Can deserialize into an custom error instance class
    if (highLevelDef) {
      // get the class for the error type
      const C = this.getClass(errorName as keyof HLError)
      err = C.fromJSON(data, opts)
    } else {
      err = BaseError.fromJSON(data, opts)
    }

    return err
  }
}
