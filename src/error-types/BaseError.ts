import { vsprintf } from 'sprintf-js'
import ExtendableError from 'es6-error'
import { IBaseError, SerializedError, SerializedErrorSafe } from '../interfaces'

/**
 * Improved error class.
 */
export class BaseError extends ExtendableError implements IBaseError {
  protected _causedBy: any
  protected _safeMetadata: Record<string, any>
  protected _metadata: Record<string, any>

  constructor (message: string) {
    super(message)

    this._safeMetadata = {}
    this._metadata = {}
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
   */
  toJson (): SerializedError {
    return {
      ...this._metadata,
      ...this._safeMetadata,
      name: this.name,
      message: this.message,
      stack: this.stack,
      causedBy: this._causedBy
    }
  }

  /**
   * Returns a safe json representation of the error (error stack is removed).
   * This should be used for display to a user / pass to a client.
   */
  toJsonSafe (): SerializedErrorSafe {
    return {
      ...this._safeMetadata,
      name: this.name,
      message: this.message
    }
  }
}
