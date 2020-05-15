/* eslint-env jest */
import { BaseRegistryError } from '../BaseRegistryError'

describe('BaseRegistryError', () => {
  it('should create an instance', () => {
    const err = new BaseRegistryError(
      {
        className: 'TestError',
        statusCode: 300
      },
      {
        statusCode: 400,
        message: 'This is a test error'
      }
    )

    expect(err.toJSON()).toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: 'This is a test error'
      })
    )

    expect(err.stack).toBeDefined()
  })

  it('should use the default high level error code', () => {
    const err = new BaseRegistryError(
      {
        className: 'TestError',
        statusCode: 300
      },
      {
        message: 'This is a test error'
      }
    )

    expect(err.toJSON()).toEqual(
      expect.objectContaining({
        statusCode: 300
      })
    )

    expect(err.stack).toBeDefined()
  })

  it('should use the low level error code', () => {
    const err = new BaseRegistryError(
      {
        className: 'TestError'
      },
      {
        message: 'This is a test error',
        statusCode: 500
      }
    )

    expect(err.toJSON()).toEqual(
      expect.objectContaining({
        statusCode: 500
      })
    )

    expect(err.stack).toBeDefined()
  })
})
