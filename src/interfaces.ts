/**
 * A High Level Error definition defined by the user
 */
export interface HighLevelErrorDef {
  /**
   * The class name of the generated error
   */
  className: string

  /**
   * A numeric representation of the High Level Error. Used as the default
   * if a Low Level Error is not specified or defined.
   */
  codeNo?: number

  /**
   * Protocol-specific status code, such as an HTTP status code. Used as the
   * default if a Low Level Error status code is not specified or defined.
   */
  statusCode: any
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
   * A numeric representation of the Low Level Error.
   * Useful if you want to omit the Low Level Error name
   * and display this instead to the user.
   */
  codeNo?: number

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
   */
  toJson(): SerializedError
  /**
   * Returns a safe json representation of the error (error stack is removed).
   * This should be used for display to a user / pass to a client.
   */
  toJsonSafe(): SerializedErrorSafe
}

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
   * A numeric representation of the sub-category.
   * Useful if you want to omit the sub category code
   * and display this instead to the user.
   */
  codeNo?: number
  /**
   * Message as defined in the Low Level Error
   */
  message: string

  /**
   * Additional metadata
   */
  [key: string]: any
}

export interface SerializedError extends SerializedErrorSafe {
  /**
   * Stack trace
   */
  stack: string
  /**
   * If applicable, the original error that was thrown
   */
  causedBy?: any
}
