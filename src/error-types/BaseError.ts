import { vsprintf } from 'sprintf-js'
import ExtendableError from 'es6-error'
import {
  ConvertedType,
  ConvertFn,
  DeserializeOpts,
  IBaseError,
  IBaseErrorConfig,
  SerializedError,
  SerializedErrorSafe
} from '../interfaces'

/**
 * Improved error class.
 */
export class BaseError extends ExtendableError implements IBaseError {
  protected _errId: string
  protected _reqId: string
  protected _type: string
  protected _code: string | number
  protected _subCode: string | number
  protected _statusCode: any
  protected _causedBy: any
  protected _safeMetadata: Record<string, any>
  protected _metadata: Record<string, any>
  protected _logLevel: string | number
  protected _config: IBaseErrorConfig
  protected _hasMetadata: boolean
  protected _hasSafeMetadata: boolean
  protected _onConvert: ConvertFn | null
  protected _appendedWithErrorMsg: boolean

  constructor (message: string, config: IBaseErrorConfig = {}) {
    super(message)

    this._safeMetadata = {}
    this._metadata = {}
    this._hasMetadata = false
    this._hasSafeMetadata = false
    this._config = config || {}
    this._onConvert = this._config.onConvert || null
    this._appendedWithErrorMsg = false
  }

  /**
   * Assign a log level to the error. Useful if you want to
   * determine which log level to use when logging the error.
   * @param {string|number} logLevel
   */
  withLogLevel (logLevel: string | number) {
    this._logLevel = logLevel
    return this
  }

  /**
   * Set an error id used to link back to the specific error
   * @param errId
   */
  withErrorId (errId: string) {
    this._errId = errId
    return this
  }

  /**
   * Set a request id used to link back to the specific error
   * @param requestId
   */
  withRequestId (requestId: string) {
    this._reqId = requestId
    return this
  }

  /**
   * Set the error type
   * @param type
   */
  withErrorType (type: string) {
    this._type = type
    return this
  }

  /**
   * Set high level error code
   * @param code
   */
  withErrorCode (code: string | number) {
    this._code = code
    return this
  }

  /**
   * Set low level error code
   * @param subCode
   */
  withErrorSubCode (subCode: string | number) {
    this._subCode = subCode
    return this
  }

  /**
   * Gets the log level assigned to the error
   */
  getLogLevel () {
    return this._logLevel
  }

  /**
   * Get the instance-specific error id
   */
  getErrorId () {
    return this._errId
  }

  /**
   * Get the request id associated with the error
   */
  getRequestId () {
    return this._reqId
  }

  /**
   * Get the class name of the error
   */
  getErrorName () {
    return this.name
  }

  /**
   * Get the low level error type
   */
  getErrorType () {
    return this._type
  }

  /**
   * Returns the status code.
   */
  getStatusCode () {
    return this._statusCode
  }

  /**
   * Returns the high level error code
   */
  getCode () {
    return this._code
  }

  /**
   * Returns the low level error code
   */
  getSubCode () {
    return this._subCode
  }

  /**
   * Returns the attached error
   */
  getCausedBy (): any {
    return this._causedBy
  }

  /**
   * Returns metadata set by withMetadata()
   */
  getMetadata (): Record<string, any> {
    return this._metadata
  }

  /**
   * Returns metadata set by withSafeMetadata()
   */
  getSafeMetadata (): Record<string, any> {
    return this._safeMetadata
  }

  /**
   * Gets the error config
   */
  getConfig (): IBaseErrorConfig {
    return this._config
  }

  /**
   * Sets the error config
   */
  setConfig (config: IBaseErrorConfig) {
    this._config = config
    return this
  }

  /**
   * Replaces sprintf() flags in an error message, if present.
   * @see https://www.npmjs.com/package/sprintf-js
   * @param args
   */
  formatMessage (...args) {
    this.message = vsprintf(this.message, args)
    this.appendCausedByMessage()
    return this
  }

  /**
   * Attach the original error that was thrown, if available
   * @param {Error} error
   */
  causedBy (error: any) {
    this._causedBy = error
    this.appendCausedByMessage()
    return this
  }

  /**
   * Appends the caused by message to the main error message if
   * the appendWithErrorMessageFormat config item is defined.
   */
  protected appendCausedByMessage () {
    if (
      !this._appendedWithErrorMsg &&
      this._causedBy?.message &&
      this._config.appendWithErrorMessageFormat
    ) {
      this.message =
        this.message +
        vsprintf(
          this._config.appendWithErrorMessageFormat,
          this._causedBy.message
        )
      this._appendedWithErrorMsg = true
    }
  }

  /**
   * Adds metadata that will be included with toJSON() serialization.
   * Multiple calls will append and not replace.
   * @param {Object} metadata
   */
  withMetadata (metadata: Record<string, any>) {
    this._hasMetadata = true
    this._metadata = {
      ...this._metadata,
      ...metadata
    }
    return this
  }

  /**
   * Set a protocol-specific status code
   * @param statusCode
   */
  withStatusCode (statusCode: any) {
    this._statusCode = statusCode
    return this
  }

  /**
   * Adds metadata that will be included with toJSON() / toJsonSafe()
   * serialization. Multiple calls will append and not replace.
   * @param {Object} metadata
   */
  withSafeMetadata (metadata: Record<string, any>) {
    this._hasMetadata = true
    this._hasSafeMetadata = true
    this._safeMetadata = {
      ...this._safeMetadata,
      ...metadata
    }
    return this
  }

  /**
   * Returns a json representation of the error. Assume the data
   * contained is for internal purposes only as it contains the stack trace.
   * Use / implement toJsonSafe() to return data that is safe for client
   * consumption.
   * @param {string[]} [fieldsToOmit] An array of root properties to omit from the output
   */
  toJSON (fieldsToOmit: string[] = []): Partial<SerializedError> {
    let data: Partial<SerializedError> = {
      errId: this._errId,
      reqId: this._reqId,
      name: this.name,
      code: this._code,
      message: this.message,
      type: this._type,
      subCode: this._subCode,
      statusCode: this._statusCode,
      logLevel: this._logLevel,
      meta: {
        ...this._metadata,
        ...this._safeMetadata
      },
      causedBy: this._causedBy,
      stack: this.stack
    }

    if (
      !this._hasSafeMetadata &&
      !this._hasMetadata &&
      this._config.omitEmptyMetadata
    ) {
      delete data.meta
    }

    if (typeof this._config.onPreToJSONData === 'function') {
      data = this._config.onPreToJSONData(data)
    }

    Object.keys(data).forEach(item => {
      // remove undefined items
      if (data[item] === undefined) {
        delete data[item]
      }
    })

    if (Array.isArray(fieldsToOmit)) {
      fieldsToOmit.forEach(item => {
        delete data[item]
      })
    }

    if (Array.isArray(this._config.toJSONFieldsToOmit)) {
      this._config.toJSONFieldsToOmit.forEach(item => {
        delete data[item]
      })
    }

    return data
  }

  /**
   * Returns a safe json representation of the error (error stack / causedBy is removed).
   * This should be used for display to a user / pass to a client.
   * @param {string[]} [fieldsToOmit] An array of root properties to omit from the output
   */
  toJSONSafe (fieldsToOmit: string[] = []): Partial<SerializedErrorSafe> {
    let data: Partial<SerializedErrorSafe> = {
      errId: this._errId,
      reqId: this._reqId,
      code: this._code,
      subCode: this._subCode,
      statusCode: this._statusCode,
      meta: {
        ...this._safeMetadata
      }
    }

    if (!this._hasSafeMetadata && this._config.omitEmptyMetadata) {
      delete data.meta
    }

    Object.keys(data).forEach(item => {
      // remove undefined items
      if (data[item] === undefined) {
        delete data[item]
      }
    })

    if (typeof this._config.onPreToJSONSafeData === 'function') {
      data = this._config.onPreToJSONSafeData(data)
    }

    if (Array.isArray(fieldsToOmit)) {
      fieldsToOmit.forEach(item => {
        delete data[item]
      })
    }

    if (Array.isArray(this._config.toJSONSafeFieldsToOmit)) {
      this._config.toJSONSafeFieldsToOmit.forEach(item => {
        delete data[item]
      })
    }

    return data
  }

  /**
   * Calls the user-defined `onConvert` function to convert the error into another type.
   * If `onConvert` is not defined, then returns the error itself.
   */
  convert<T = ConvertedType> (): T {
    if (this.hasOnConvertDefined()) {
      return this._onConvert.bind(this)(this) as T
    }

    return this as any
  }

  /**
   * Returns true if the onConvert handler is defined
   */
  hasOnConvertDefined (): boolean {
    return typeof this._onConvert === 'function'
  }

  /**
   * Set the onConvert handler for convert() calls.
   * This can also be defined via the onConvert config property in the constructor.
   */
  setOnConvert (convertFn: ConvertFn) {
    this._onConvert = convertFn
  }

  /**
   * Helper method for use with fromJson()
   * @param errInstance An error instance that extends BaseError
   * @param {string} data JSON.parse()'d error object from
   * BaseError#toJSON() or BaseError#toJSONSafe()
   * @param {DeserializeOpts} [opts] Deserialization options
   */
  static copyDeserializationData<
    T extends IBaseError = IBaseError,
    U extends DeserializeOpts = DeserializeOpts
  > (errInstance: T, data: Partial<SerializedError>, opts: U) {
    if (data.code) {
      errInstance.withErrorCode(data.code)
    }

    if (data.subCode) {
      errInstance.withErrorSubCode(data.subCode)
    }

    if (data.errId) {
      errInstance.withErrorId(data.errId)
    }

    if (data.reqId) {
      errInstance.withRequestId(data.reqId)
    }

    if (data.statusCode) {
      errInstance.withStatusCode(data.statusCode)
    }

    if (data.stack) {
      errInstance.stack = data.stack
    }

    if (data.logLevel) {
      errInstance.withLogLevel(data.logLevel)
    }

    // not possible to know what the underlying causedBy type is
    // so we can't deserialize to its original representation
    if (data.causedBy) {
      errInstance.causedBy(data.causedBy)
    }

    // if defined, pluck the metadata fields to their respective safe and unsafe counterparts
    if (data.meta && opts && opts.safeMetadataFields) {
      Object.keys(data.meta).forEach(key => {
        if (opts.safeMetadataFields[key]) {
          errInstance.withSafeMetadata({
            [key]: data.meta[key]
          })
        } else {
          errInstance.withMetadata({
            [key]: data.meta[key]
          })
        }
      })
    } else {
      errInstance.withMetadata(data.meta || {})
    }
  }

  /**
   * Deserializes an error into an instance
   * @param {string} data JSON.parse()'d error object from
   * BaseError#toJSON() or BaseError#toJSONSafe()
   * @param {DeserializeOpts} [opts] Deserialization options
   */
  static fromJSON<T extends DeserializeOpts = DeserializeOpts> (
    data: Partial<SerializedError>,
    opts?: T
  ): IBaseError {
    if (!opts) {
      opts = {} as T
    }

    if (typeof data !== 'object') {
      throw new Error('fromJSON(): Data is not an object.')
    }

    const err = new this(data.message)

    this.copyDeserializationData<BaseError, T>(err, data, opts)

    return err
  }
}
