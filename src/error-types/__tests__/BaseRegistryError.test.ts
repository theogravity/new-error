/* eslint-env jest */
import { BaseRegistryError } from '../BaseRegistryError'

describe('BaseRegistryError', () => {
  it('should create an instance', () => {
    const err = new BaseRegistryError(
      {
        className: 'TestError',
        code: 'TEST_ERR',
        statusCode: 300
      },
      {
        statusCode: 400,
        subCode: 'SUB_CODE_ERR',
        message: 'This is a test error'
      }
    )

    expect(err.toJSON()).toEqual(
      expect.objectContaining({
        code: 'TEST_ERR',
        subCode: 'SUB_CODE_ERR',
        statusCode: 400,
        message: 'This is a test error'
      })
    )

    expect(err.getCode()).toBe('TEST_ERR')
    expect(err.getSubCode()).toBe('SUB_CODE_ERR')
    expect(err.getStatusCode()).toBe(400)
    expect(err.stack).toBeDefined()
  })

  it('should use the default high level error code', () => {
    const err = new BaseRegistryError(
      {
        className: 'TestError',
        code: 'TEST_ERR',
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
        className: 'TestError',
        code: 'TEST_ERR'
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
