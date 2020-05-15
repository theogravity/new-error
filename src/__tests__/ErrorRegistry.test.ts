/* eslint-env jest */

import { ErrorRegistry } from '../ErrorRegistry'
import { BaseError } from '..'

const errors = {
  INTERNAL_SERVER_ERROR: {
    className: 'InternalServerError'
  },
  AUTH_ERROR: {
    className: 'AuthError'
  }
}

const errorCodes = {
  DATABASE_FAILURE: {
    statusCode: 500,
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
})
