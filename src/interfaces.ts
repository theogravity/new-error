/**
 * A High Level Error definition defined by the user
 */
import { BaseRegistryError } from './error-types/BaseRegistryError'
import { BaseError } from './error-types/BaseError'

export interface HighLevelError {
  /**
   * A user-friendly code to show to a client that represents the high
   * level error.
   */
  code: string | number

  /**
   * Protocol-specific status code, such as an HTTP status code. Used as the
   * default if a Low Level Error status code is not specified or defined.
   */
  statusCode?: string | number

  /**
   * A log level to associate with this error type since not all errors
   * may be considered an 'error' log level type when combined with
   * a logger. Used as the default if a Low Level Error log level
   * is not defined.
   */
  logLevel?: string | number

  /**
   * Callback function to call when calling BaseError#convert().
   *
   * (baseError) => any type
   *
   * - If not defined, will return itself when convert() is called
   * - If defined in HighLevelError, the HighLevelError definition takes priority
   */
  onConvert?: ConvertFn

  /**
   * Full description of the error. Used only when BaseError#newBareError() is called without
   * the message parameter.
   *
   * sprintf() flags can be applied to customize it.
   * @see https://www.npmjs.com/package/sprintf-js
   */
  message?: string
}

/**
 * A High Level Error definition defined by the user for a registry
 */
export interface HighLevelErrorInternal extends HighLevelError {
  /**
   * The class name of the generated error
   */
  className: string
}

/**
 * A Low Level Error definition defined by the user
 */
export interface LowLevelErrorDef {
  /**
   * Full description of the error. sprintf() flags can be applied
   * to customize it.
   * @see https://www.npmjs.com/package/sprintf-js
   */
  message: string

  /**
   * A user-friendly code to show to a client that represents the low
   * level error.
   */
  subCode?: string | number

  /**
   * Protocol-specific status code, such as an HTTP status code.
   */
  statusCode?: string | number

  /**
   * A log level to associate with this error type since not all errors
   * may be considered an 'error' log level type when combined with
   * a logger.
   */
  logLevel?: string | number

  /**
   * Callback function to call when calling BaseError#convert().
   *
   * (baseError) => any type
   *
   * - If not defined, will return itself when convert() is called
   * - This definition takes priority if HighLevelError#onConvert is defined
   */
  onConvert?: ConvertFn
}

/**
 * Low Level Error stored in the ErrorRegistry
 */
export interface LowLevelErrorInternal extends LowLevelErrorDef {
  /**
   * Name of the Low Level Error
   */
  type?: string
}

/**
 * A Low Level Error definition defined by the user when a registry is not involved
 */
export interface LowLevelError extends LowLevelErrorDef {
  /**
   * Name of the Low Level Error
   */
  type: string
}

export interface IBaseError {
  /**
   * Get the instance-specific error id
   */
  getErrorId(): string

  /**
   * Get the class name of the error
   */
  getErrorName(): string

  /**
   * Gets the log level assigned to the error. If a low level code
   * has a log level defined, it will be used over the high level one.
   */
  getLogLevel(): string | number

  /**
   * Returns the high level error code
   */
  getCode(): string | number

  /**
   * Returns the low level error code
   */
  getSubCode(): string | number

  /**
   * Returns the status code.
   */
  getStatusCode(): string | number

  /**
   * Get the low level error type
   */
  getErrorType(): string

  /**
   * Returns the attached error
   */
  getCausedBy(): any

  /**
   * Returns metadata set by withMetadata()
   */
  getMetadata(): Record<string, any>

  /**
   * Returns metadata set by withSafeMetadata()
   */
  getSafeMetadata(): Record<string, any>

  /**
   * Gets the configuration options
   */
  getConfig(): IBaseErrorConfig

  /**
   * Sets configuration options
   */
  setConfig(config: IBaseErrorConfig): void

  /**
   * Set the onConvert handler for convert() calls.
   * This can also be defined via the onConvert config property in the constructor.
   */
  setOnConvert(convertFn: ConvertFn): void

  /**
   * Attach the original error that was thrown, if available
   * @param {Error} error
   */
  causedBy(error: any): this

  /**
   * Set an error id used to link back to the specific error
   * @param {string} errId
   */
  withErrorId(errId: string): this

  /**
   * Set the error type
   * @param type
   */
  withErrorType(type: string): this

  /**
   * Set high level error code
   * @param code
   */
  withErrorCode(code: string | number): this

  /**
   * Set low level error code
   * @param subCode
   */
  withErrorSubCode(subCode: string | number): this

  /**
   * Adds metadata that will be included with toJSON() serialization.
   * Multiple calls will append and not replace.
   * @param {Object} metadata
   */
  withMetadata(metadata: Record<string, any>): this

  /**
   * Adds metadata that will be included with toJSON() / toJsonSafe()
   * serialization. Multiple calls will append and not replace.
   * @param {Object} safeMetadata
   */
  withSafeMetadata(safeMetadata: Record<string, any>): this

  /**
   * Set a protocol-specific status code
   * @param statusCode
   */
  withStatusCode(statusCode: any): this

  /**
   * Replaces printf flags in an error message, if present.
   * @see https://www.npmjs.com/package/sprintf-js
   * @param args
   */
  formatMessage(...args): this

  /**
   * Assign a log level to the error. Useful if you want to
   * determine which log level to use when logging the error.
   * @param {string|number} logLevel
   */
  withLogLevel(logLevel: string | number): this

  /**
   * Returns a json representation of the error. Assume the data
   * contained is for internal purposes only as it contains the stack trace.
   * Use / implement toJsonSafe() to return data that is safe for client
   * consumption.
   * @param {string[]} [fieldsToOmit] An array of root properties to omit from the output
   */
  toJSON(fieldsToOmit?: string[]): Partial<SerializedError>
  /**
   * Returns a safe json representation of the error (error stack / causedBy is removed).
   * This should be used for display to a user / pass to a client.
   * @param {string[]} [fieldsToOmit] An array of root properties to omit from the output
   */
  toJSONSafe(fieldsToOmit?: string[]): Partial<SerializedErrorSafe>

  /**
   * Calls the user-defined `onConvert` function to convert the error into another type.
   * If `onConvert` is not defined, then returns the error itself.
   */
  convert<T = ConvertedType>(): T

  /**
   * Returns true if the onConvert handler is defined
   */
  hasOnConvertDefined(): boolean

  /**
   * Stack trace
   */
  stack?: any
}

/**
 * Configuration options for the BaseError class
 */
export interface IBaseErrorConfig {
  /**
   * A list of fields to always omit when calling toJSON
   */
  toJSONFieldsToOmit?: string[]
  /**
   * A list of fields to always omit when calling toJSONSafe
   */
  toJSONSafeFieldsToOmit?: string[]
  /**
   * If the metadata has no data defined, remove the `meta` property on `toJSON` / `toJSONSafe`
   */
  omitEmptyMetadata?: boolean
  /**
   * A function to run against the computed data when calling `toJSON`. This is called prior
   * to field omission. If defined, must return the data back.
   */
  onPreToJSONData?: (data: Partial<SerializedError>) => Partial<SerializedError>
  /**
   * A function to run against the computed safe data when calling `toJSONSafe`. This is called
   * prior to field omission. If defined, must return the data back.
   */
  onPreToJSONSafeData?: (
    data: Partial<SerializedErrorSafe>
  ) => Partial<SerializedErrorSafe>

  /**
   * A callback function to call when calling BaseError#convert(). This allows for user-defined conversion
   * of the BaseError into some other type (such as an Apollo GraphQL error type).
   *
   * (baseError) => any type
   */
  onConvert?: ConvertFn
}

/**
 * Configuration options for the ErrorRegistry class
 */
export interface IErrorRegistryConfig {
  /**
   * Options when creating a new BaseError
   */
  baseErrorConfig?: IBaseErrorConfig
  /**
   * Handler to modify the created error when newError / newBareError is called
   */
  onCreateError?: (err: BaseRegistryError) => void
}

/**
 * Safe-version of a serialized error object that can be shown to a client /
 * end-user.
 */
export interface SerializedErrorSafe {
  /**
   * The error id
   */
  errId?: string
  /**
   * The high level code to show to a client.
   */
  code: any
  /**
   * The low level code to show to a client.
   */
  subCode?: string | number
  /**
   * Protocol-specific status code, such as an HTTP status code.
   */
  statusCode?: string | number

  /**
   * Assigned log level
   */
  logLevel?: string | number

  /**
   * User-defined metadata. May not be present if there is no data and omitEmptyMetadata is enabled
   */
  meta?: Record<string, any>

  /**
   * Other optional values
   */
  [key: string]: any
}

/**
 * Serialized error object
 */
export interface SerializedError extends SerializedErrorSafe {
  /**
   * Name of the High Level Error
   */
  name: string
  /**
   * Name of the Low Level Error
   */
  type: string
  /**
   * Message as defined in the Low Level Error
   */
  message: string
  /**
   * Stack trace
   */
  stack: string
  /**
   * If applicable, the original error that was thrown
   */
  causedBy?: any
}

export interface DeserializeOpts {
  /**
   * Fields from meta to pluck as a safe metadata field
   */
  safeMetadataFields?: Record<string, true>
}

export interface GenerateHighLevelErrorOpts {
  /**
   * Disable to not generate the class name based on the property name if the className is not defined.
   */
  disableGenerateClassName?: boolean
  /**
   * Disable to not generate the error code based on the property name if the code is not defined.
   */
  disableGenerateCode?: boolean
}

export interface GenerateLowLevelErrorOpts {
  /**
   * Disable to not generate the error code based on the property name if the subCode is not defined.
   */
  disableGenerateSubCode?: boolean
}

export type ConvertedType = any

/**
 * onConvert function handler definition
 */
export type ConvertFn = <E extends BaseError = BaseError>(
  err: E
) => ConvertedType

/**
 * Alias for keyof w/ string only
 */
export type KeyOfStr<T> = Extract<keyof T, string>

/**
 * A collection of high level error definitions
 */
export type HLDefs<
  T extends string,
  HLDef extends HighLevelErrorInternal = HighLevelErrorInternal
> = Record<T, HLDef>

/**
 * A collection of low level error definitions
 */
export type LLDefs<
  T extends string,
  LLDef extends LowLevelErrorInternal = LowLevelErrorInternal
> = Record<T, LLDef>
