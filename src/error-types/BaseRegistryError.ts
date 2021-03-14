import {
  HighLevelError,
  IBaseErrorConfig,
  LowLevelErrorInternal,
  IBaseError,
  SerializedError,
  DeserializeOpts
} from '../interfaces'

import { BaseError } from './BaseError'

/**
 * Improved error class generated by the ErrorRegistry.
 **/
export class BaseRegistryError extends BaseError {
  constructor (
    highLevelErrorDef: HighLevelError,
    lowLevelErrorDef: LowLevelErrorInternal,
    config: IBaseErrorConfig = {}
  ) {
    if (typeof highLevelErrorDef.onConvert === 'function') {
      config.onConvert = highLevelErrorDef.onConvert
    }

    if (typeof lowLevelErrorDef.onConvert === 'function') {
      config.onConvert = lowLevelErrorDef.onConvert
    }

    super(lowLevelErrorDef.message, config)

    this.withErrorCode(highLevelErrorDef.code)

    if (highLevelErrorDef.statusCode) {
      this.withStatusCode(highLevelErrorDef.statusCode)
    }

    if (highLevelErrorDef.logLevel) {
      this.withLogLevel(highLevelErrorDef.logLevel)
    }

    if (lowLevelErrorDef.statusCode) {
      this.withStatusCode(lowLevelErrorDef.statusCode)
    }

    if (lowLevelErrorDef.type) {
      this.withErrorType(lowLevelErrorDef.type)
    }

    if (lowLevelErrorDef.subCode) {
      this.withErrorSubCode(lowLevelErrorDef.subCode)
    }

    if (lowLevelErrorDef.logLevel) {
      this.withLogLevel(lowLevelErrorDef.logLevel)
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

    const err = new this(
      {
        code: data.code
      },
      {
        message: data.message
      }
    )

    this.copyDeserializationData<IBaseError, T>(err, data, opts)

    return err
  }
}
