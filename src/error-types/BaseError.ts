import { vsprintf } from 'sprintf-js'
import ExtendableError from 'es6-error'
import { IBaseError, SerializedError, SerializedErrorSafe } from '../interfaces'

/**
 * Improved error class.
 */
export class BaseError extends ExtendableError implements IBaseError {
  protected _type: string
  protected _code: string | number
  protected _subCode: string | number
  protected _statusCode: any
  protected _causedBy: any
  protected _safeMetadata: Record<string, any>
  protected _metadata: Record<string, any>

  constructor (message: string) {
    super(message)

    this._safeMetadata = {}
    this._metadata = {}
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
   * Replaces sprintf() flags in an error message, if present.
   * @see https://www.npmjs.com/package/sprintf-js
   * @param args
   */
  formatMessage (...args) {
    this.message = vsprintf(this.message, args)
    return this
  }

  /**
   * Attach the original error that was thrown, if available
   * @param {Error} error
   */
  causedBy (error: any) {
    this._causedBy = error
    return this
  }

  /**
   * Adds metadata that will be included with toJSON() serialization.
   * Multiple calls will append and not replace.
   * @param {Object} metadata
   */
  withMetadata (metadata: Record<string, any>) {
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
    const data = {
      name: this.name,
      code: this._code,
      message: this.message,
      type: this._type,
      subCode: this._subCode,
      statusCode: this._statusCode,
      meta: {
        ...this._metadata,
        ...this._safeMetadata
      },
      causedBy: this._causedBy,
      stack: this.stack
    }

    Object.keys(data).forEach(item => {
      // remove undefined items
      if (data[item] === undefined) {
        delete data[item]
      }
    })

    fieldsToOmit.forEach(item => {
      delete data[item]
    })

    return data
  }

  /**
   * Returns a safe json representation of the error (error stack / causedBy is removed).
   * This should be used for display to a user / pass to a client.
   * @param {string[]} [fieldsToOmit] An array of root properties to omit from the output
   */
  toJSONSafe (fieldsToOmit: string[] = []): Partial<SerializedErrorSafe> {
    const data = {
      code: this._code,
      subCode: this._subCode,
      statusCode: this._statusCode,
      meta: {
        ...this._safeMetadata
      }
    }

    Object.keys(data).forEach(item => {
      // remove undefined items
      if (data[item] === undefined) {
        delete data[item]
      }
    })

    fieldsToOmit.forEach(item => {
      delete data[item]
    })

    return data
  }
}
