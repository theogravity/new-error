/**
 * A High Level Error definition defined by the user
 */
export interface HighLevelErrorDef {
  /**
   * The class name of the generated error
   */
  className: string

  /**
   * Protocol-specific status code, such as an HTTP status code. Used as the
   * default if a Low Level Error status code is not specified or defined.
   */
  statusCode?: any
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
   * Protocol-specific status code, such as an HTTP status code.
   */
  statusCode?: any
}

/**
 * Low Level Error stored in the ErrorRegistry
 */
export interface LowLevelErrorInternal extends LowLevelErrorDef {
  /**
   * Name of the Low Level Error
   */
  code?: string
}

export interface IBaseError {
  /**
   * Attach the original error that was thrown, if available
   * @param {Error} error
   */
  causedBy(error: any): this

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
   * Replaces printf flags in an error message, if present.
   * @see https://www.npmjs.com/package/sprintf-js
   * @param args
   */
  formatMessage(...args): this

  /**
   * Returns a json representation of the error. Assume the data
   * contained is for internal purposes only as it contains the stack trace.
   * Use / implement toJsonSafe() to return data that is safe for client
   * consumption.
   * @param {string[]} [fieldsToOmit] An array of root properties to omit from the output
   */
  toJSON(fieldsToOmit: string[]): Partial<SerializedError>
  /**
   * Returns a safe json representation of the error (error stack / causedBy is removed).
   * This should be used for display to a user / pass to a client.
   * @param {string[]} [fieldsToOmit] An array of root properties to omit from the output
   */
  toJSONSafe(fieldsToOmit: string[]): Partial<SerializedErrorSafe>
}

/**
 * Safe-version of a serialized error object
 */
export interface SerializedErrorSafe {
  /**
   * Name of the High Level Error
   */
  name: string
  /**
   * Name of the Low Level Error
   */
  code?: string
  /**
   * Protocol-specific status code, such as an HTTP status code.
   */
  statusCode: any
  /**
   * User-defined metadata
   */
  meta: Record<string, any>
}

/**
 * Serialized error object
 */
export interface SerializedError extends SerializedErrorSafe {
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
