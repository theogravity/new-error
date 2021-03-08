/* eslint-env jest */

import { ErrorRegistry } from '../ErrorRegistry'
import { BaseError } from '..'

const errors = {
  INTERNAL_SERVER_ERROR: {
    className: 'InternalServerError',
    code: 'INT_ERR'
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

  it('should create a bare error instance', () => {
    const registry = new ErrorRegistry(errors, errorCodes)
    const err = registry.newBareError('INTERNAL_SERVER_ERROR', 'bare error msg')

    expect(registry.instanceOf(err, 'INTERNAL_SERVER_ERROR'))

    expect(err.toJSON()).toEqual(
      expect.objectContaining({
        message: 'bare error msg'
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
})
