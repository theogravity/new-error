/* eslint-env jest */

import { ErrorRegistry } from '../ErrorRegistry'
import { BaseError, generateHighLevelErrors, generateLowLevelErrors } from '..'

const errors = {
  INTERNAL_SERVER_ERROR: {
    className: 'InternalServerError',
    code: 'INT_ERR',
    message: 'Internal server error'
  },
  AUTH_ERROR: {
    className: 'AuthError',
    code: 'AUTH_ERR'
  }
}

const errorCodes = {
  DATABASE_FAILURE: {
    statusCode: 500,
    subCode: 'DB_ERR',
    message: 'There is an issue with the database'
  }
}

describe('ErrorRegistry', () => {
  it('should create an instance', () => {
    const registry = new ErrorRegistry(errors, errorCodes)
    expect(registry).toBeDefined()
  })

  it('should get a class definition of an error', () => {
    const registry = new ErrorRegistry(errors, errorCodes)
    const C = registry.getClass('INTERNAL_SERVER_ERROR')
    expect(C.name).toBe(errors.INTERNAL_SERVER_ERROR.className)
  })

  it('should throw if a class definition does not exist', () => {
    const registry = new ErrorRegistry(errors, errorCodes)

    // @ts-ignore
    expect(() => registry.getClass('invalid')).toThrowError(/not defined/)
  })

  it('should compare instances of an error', () => {
    const registry = new ErrorRegistry(errors, errorCodes)
    const err = registry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')
    expect(registry.instanceOf(err, 'INTERNAL_SERVER_ERROR')).toBe(true)
    expect(registry.instanceOf(err, 'AUTH_ERROR')).toBe(false)
  })

  describe('newBareError', () => {
    it('should create a bare error instance with a message', () => {
      const registry = new ErrorRegistry(errors, errorCodes)
      const err = registry.newBareError(
        'INTERNAL_SERVER_ERROR',
        'bare error msg'
      )

      expect(registry.instanceOf(err, 'INTERNAL_SERVER_ERROR'))

      expect(err.toJSON()).toEqual(
        expect.objectContaining({
          message: 'bare error msg'
        })
      )
    })

    it('should create a bare error instance using the high level error', () => {
      const registry = new ErrorRegistry(errors, errorCodes)
      const err = registry.newBareError('INTERNAL_SERVER_ERROR')

      expect(registry.instanceOf(err, 'INTERNAL_SERVER_ERROR'))

      expect(err.toJSON()).toEqual(
        expect.objectContaining({
          message: 'Internal server error'
        })
      )
    })

    it('should create a bare error instance with the code as the message', () => {
      const registry = new ErrorRegistry(errors, errorCodes)
      const err = registry.newBareError('AUTH_ERROR')

      expect(registry.instanceOf(err, 'AUTH_ERROR'))

      expect(err.toJSON()).toEqual(
        expect.objectContaining({
          message: errors.AUTH_ERROR.code
        })
      )
    })

    it('should throw if a bare error class def does not exist', () => {
      const registry = new ErrorRegistry(errors, errorCodes)

      // @ts-ignore
      expect(() => registry.newBareError('invalid', 'msg')).toThrowError(
        /not defined/
      )
    })
  })

  it('should create an error instance', () => {
    const registry = new ErrorRegistry(errors, errorCodes)
    const err = registry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')

    expect(registry.instanceOf(err, 'INTERNAL_SERVER_ERROR'))
    expect(err instanceof BaseError).toBe(true)
    expect(err.toJSON()).toEqual(
      expect.objectContaining({
        ...errorCodes.DATABASE_FAILURE
      })
    )
  })

  it('should create an error instance without the ErrorRegistry reference', () => {
    const registry = new ErrorRegistry(errors, errorCodes)
    const err = registry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')

    expect(err.stack).not.toContain('at ErrorRegistry.newError')
  })

  it('should call the onCreateError handler', () => {
    const registry = new ErrorRegistry(errors, errorCodes, {
      onCreateError: err => {
        err.withErrorId('test-id')
      }
    })

    const err = registry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')
    expect(err.getErrorId()).toBe('test-id')
    const err2 = registry.newBareError(
      'INTERNAL_SERVER_ERROR',
      'DATABASE_FAILURE'
    )
    expect(err2.getErrorId()).toBe('test-id')
  })

  it('should throw if a low error code does not exist', () => {
    const registry = new ErrorRegistry(errors, errorCodes)

    expect(() =>
      // @ts-ignore
      registry.newError('INTERNAL_SERVER_ERROR', 'invalid')
    ).toThrowError(/Low level error/)
  })

  it('should create an error instance with base error config', () => {
    const registry = new ErrorRegistry(errors, errorCodes, {
      baseErrorConfig: {
        toJSONFieldsToOmit: ['errId'],
        toJSONSafeFieldsToOmit: ['errId']
      }
    })

    const err = registry
      .newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')
      .withErrorId('test-id')

    const json = err.toJSON()
    const jsonSafe = err.toJSONSafe()

    expect(json.errId).not.toBeDefined()
    expect(jsonSafe.errId).not.toBeDefined()

    const err2 = registry
      .newBareError('INTERNAL_SERVER_ERROR', 'test')
      .withErrorId('test-id')

    const json2 = err2.toJSON()
    const jsonSafe2 = err2.toJSONSafe()

    expect(json2.errId).not.toBeDefined()
    expect(jsonSafe2.errId).not.toBeDefined()
  })

  it('should accept a definition from generateHighLevelErrors / generateLowLevelErrors', () => {
    const hl = generateHighLevelErrors({
      HIGH_LV_ERR: {},
      HIGHER_LV_ERR: {
        code: 'HIGHER'
      }
    })

    const ll = generateLowLevelErrors({
      LOW_LV_ERR: {
        message: 'test'
      },
      LOWER_LV_ERR: {
        message: 'test2',
        subCode: 'LOWER_LV_ERR'
      }
    })

    const registry = new ErrorRegistry(hl, ll)

    expect(registry.newError('HIGH_LV_ERR', 'LOW_LV_ERR')).toBeDefined()
  })

  describe('withContext', () => {
    it('should create a new registry and error with context', () => {
      const registry = new ErrorRegistry(errors, errorCodes)
      const contextRegistry = registry.withContext({
        metadata: {
          contextA: 'context-a'
        },
        safeMetadata: {
          contextB: 'context-b'
        }
      })

      Object.keys(registry).forEach(property => {
        // this will be different between the two
        if (property === '_newErrorContext') {
          return
        }

        expect(contextRegistry[property]).toEqual(registry[property])
      })

      const err = registry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')
      const errContext = contextRegistry.newError(
        'INTERNAL_SERVER_ERROR',
        'DATABASE_FAILURE'
      )

      expect(err.toJSON().meta).toEqual({})

      expect(errContext.toJSON().meta).toEqual({
        contextA: 'context-a',
        contextB: 'context-b'
      })

      err.withMetadata({
        test: 'test'
      })

      expect(err.toJSON().meta).toEqual({
        test: 'test'
      })

      errContext.withMetadata({
        test2: 'test2'
      })

      expect(errContext.toJSON().meta).toEqual({
        contextA: 'context-a',
        contextB: 'context-b',
        test2: 'test2'
      })
    })

    it('should not add any data if none is specified', () => {
      const registry = new ErrorRegistry(errors, errorCodes)
      const contextRegistry = registry.withContext({})

      const errContext = contextRegistry.newError(
        'INTERNAL_SERVER_ERROR',
        'DATABASE_FAILURE'
      )
      expect(errContext.toJSON().meta).toEqual({})
    })
  })

  describe('deserialization', () => {
    it('should throw if data is not an object', () => {
      const registry = new ErrorRegistry(errors, errorCodes)

      // @ts-ignore
      expect(() => registry.fromJSON('')).toThrowError()
    })

    it('should deserialize into a custom error', () => {
      const registry = new ErrorRegistry(errors, errorCodes)

      const data = {
        errId: 'err-123',
        code: 'ERR_INT_500',
        subCode: 'DB_0001',
        message: 'test message',
        meta: { safe: 'test454', test: 'test123' },
        name: 'InternalServerError',
        statusCode: 500,
        causedBy: 'test',
        stack: 'abcd'
      }

      const err = registry.fromJSON(data)

      expect(registry.instanceOf(err, 'INTERNAL_SERVER_ERROR')).toBe(true)
    })

    it('should deserialize into a base error', () => {
      const registry = new ErrorRegistry(errors, errorCodes)

      const data = {
        errId: 'err-123',
        code: 'ERR_INT_500',
        subCode: 'DB_0001',
        message: 'test message',
        meta: { safe: 'test454', test: 'test123' },
        name: 'invalid',
        statusCode: 500,
        causedBy: 'test',
        stack: 'abcd'
      }

      const err = registry.fromJSON(data)

      expect(registry.instanceOf(err, 'INTERNAL_SERVER_ERROR')).toBe(false)
    })
  })

  describe('conversion handler', () => {
    const err = new Error('err')
    const PERM_ERR_STR = 'permission error'

    const errors = {
      PERMISSION_REQUIRED: {
        className: 'PermissionRequiredError',
        code: 'PERMISSION_REQUIRED',
        onConvert: () => {
          return PERM_ERR_STR
        }
      },
      AUTH_REQUIRED: {
        className: 'AuthRequiredError',
        code: 'AUTH_REQUIRED'
      }
    }

    const errorCodes = {
      ADMIN_PANEL_RESTRICTED: {
        message: 'Access scope required: admin',
        onConvert: () => {
          return err
        }
      },
      EDITOR_SECTION_RESTRICTED: {
        message: 'Access scope required: editor'
      }
    }

    const errRegistry = new ErrorRegistry(errors, errorCodes)

    it('should call onConvert for a subcategory', () => {
      expect(
        errRegistry
          .newError('PERMISSION_REQUIRED', 'ADMIN_PANEL_RESTRICTED')
          .convert()
      ).toEqual(err)

      expect(
        errRegistry
          .newError('AUTH_REQUIRED', 'ADMIN_PANEL_RESTRICTED')
          .convert()
      ).toEqual(err)
    })

    it('should call onConvert for a category', () => {
      expect(
        errRegistry
          .newError('PERMISSION_REQUIRED', 'EDITOR_SECTION_RESTRICTED')
          .convert()
      ).toEqual(PERM_ERR_STR)

      expect(
        errRegistry.newBareError('PERMISSION_REQUIRED', 'test').convert()
      ).toEqual(PERM_ERR_STR)
    })

    it('should return the error when onConvert is not defined', () => {
      let baseErr = errRegistry.newError(
        'AUTH_REQUIRED',
        'EDITOR_SECTION_RESTRICTED'
      )

      expect(baseErr.convert()).toEqual(baseErr)

      baseErr = errRegistry.newBareError('AUTH_REQUIRED', 'test')

      expect(baseErr.convert()).toEqual(baseErr)
    })
  })
})
