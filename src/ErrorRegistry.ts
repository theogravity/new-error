import {
  DeserializeOpts,
  HighLevelErrorInternal,
  HLDefs,
  IBaseError,
  IErrorRegistryConfig,
  IErrorRegistryContextConfig,
  KeyOfStr,
  LLDefs,
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
  HLErrors extends HLDefs<KeyOfStr<HLErrors>>,
  LLErrors extends LLDefs<KeyOfStr<LLErrors>>
> {
  /**
   * High level error definitions
   */
  protected highLevelErrors: HLErrors

  /**
   * A map of high level names to class name
   */
  protected classNameHighLevelNameMap: Record<KeyOfStr<HLErrors>, string>

  /**
   * Cached high level error classes
   */
  protected highLevelErrorClasses: Record<
    KeyOfStr<HLErrors>,
    typeof BaseRegistryError
  >

  /**
   * Low level error definitions
   */
  protected lowLevelErrors: LLErrors

  /**
   * Error registry configuration
   */
  protected _config: IErrorRegistryConfig

  /**
   * Error metadata to always include in an error
   */
  protected _newErrorContext: IErrorRegistryContextConfig | null

  constructor (
    highLvErrors: HLErrors,
    lowLvErrors: LLErrors,
    config: IErrorRegistryConfig = {}
  ) {
    this.highLevelErrors = highLvErrors
    this.lowLevelErrors = {} as any
    this.classNameHighLevelNameMap = {} as any
    this.highLevelErrorClasses = {} as any
    this._config = config
    this._newErrorContext = null

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
    highLvErrName: KeyOfStr<HLErrors>
  ): HighLevelErrorInternal {
    return this.highLevelErrors[highLvErrName]
  }

  /**
   * Gets the definition of a Low Level Error
   * @param {string} lowLvErrName
   */
  protected getLowLevelError (
    lowLvErrName: KeyOfStr<LLErrors>
  ): LowLevelErrorInternal {
    return this.lowLevelErrors[lowLvErrName]
  }

  /**
   * Gets the class definition of a High Level Error
   * @param highLvErrName
   */
  getClass (highLvErrName: KeyOfStr<HLErrors>): typeof BaseRegistryError {
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
  instanceOf (a: any, highLvErrName: KeyOfStr<HLErrors>) {
    return a instanceof this.getClass(highLvErrName)
  }

  /**
   * Creates an instance of a High Level Error, without a Low Level Error
   * attached to it.
   * @param {string} highLvErrName
   * @param {string} [message] Error message. If not defined and the high level error has the
   * message property defined, will use that instead. If the high level error message is not defined,
   * then will use the high level error id instead for the message.
   */
  newBareError (
    highLvErrName: KeyOfStr<HLErrors>,
    message?: string
  ): BaseRegistryError {
    const hlErrDef = this.highLevelErrors[highLvErrName]

    if (!message && hlErrDef.message) {
      message = hlErrDef.message
    } else if (!message) {
      message = hlErrDef.code.toString()
    }

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

    return this.assignErrContext(err)
  }

  /**
   * Creates an instance of a High Level Error, with a Low Level Error
   * attached to it.
   * @param {string} highLvErrName
   * @param {string} lowLvErrName
   */
  newError (
    highLvErrName: KeyOfStr<HLErrors>,
    lowLvErrName: KeyOfStr<LLErrors>
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

    return this.assignErrContext(err)
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
   * If a new error context is defined, then set the values
   */
  private assignErrContext (err: BaseError) {
    if (!this._newErrorContext) {
      return err
    }

    if (this._newErrorContext.metadata) {
      err.withMetadata(this._newErrorContext.metadata)
    }

    if (this._newErrorContext.safeMetadata) {
      err.withSafeMetadata(this._newErrorContext.safeMetadata)
    }

    return err
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
    const highLevelDef = this.getHighLevelError(errorName as KeyOfStr<HLErrors>)

    let err = null

    // Can deserialize into an custom error instance class
    if (highLevelDef) {
      // get the class for the error type
      const C = this.getClass(errorName as KeyOfStr<HLErrors>)
      err = C.fromJSON(data, opts)
    } else {
      err = BaseError.fromJSON(data, opts)
    }

    return err
  }

  /**
   * Creates a new error registry instance that will include / set specific data
   * for each new error created.
   *
   * Memory overhead should be trivial as the internal *references* of the existing
   * error registry instance properties is copied over to the new instance.
   */
  withContext (context: IErrorRegistryContextConfig) {
    const registry = new ErrorRegistry({}, {})

    Object.keys(this).forEach(property => {
      // copy over references vs creating completely new entries
      registry[property] = this[property]
    })

    registry._newErrorContext = context

    return registry as ErrorRegistry<HLErrors, LLErrors>
  }
}
