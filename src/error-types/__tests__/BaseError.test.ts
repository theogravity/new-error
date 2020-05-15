/* eslint-env jest */

import { BaseError } from '../BaseError'

describe('BaseError', () => {
  it('should create an instance', () => {
    const err = new BaseError('test message')
    expect(err).toBeDefined()
  })

  it('should format a message', () => {
    const err = new BaseError('test %s')
    err.formatMessage('blah')
    expect(err.message).toBe('test blah')
  })

  it('should set the causedBy', () => {
    const cause = new Error('test caused by')

    const err = new BaseError('test %s')
    err.causedBy(cause)

    expect(err.toJSON()).toEqual(
      expect.objectContaining({
        causedBy: cause
      })
    )
  })

  it('should set metadata', () => {
    const err = new BaseError('test message')
    err
      .withMetadata({
        test: 'value'
      })
      .withMetadata({
        test2: 'value2'
      })

    expect(err.toJSON()).toEqual(
      expect.objectContaining({
        meta: {
          test: 'value',
          test2: 'value2'
        }
      })
    )

    expect(err.toJSONSafe()).toEqual(
      expect.objectContaining({
        meta: {}
      })
    )
  })

  it('should set safe metadata', () => {
    const err = new BaseError('test message')
    err
      .withSafeMetadata({
        test2: 'value'
      })
      .withSafeMetadata({
        test3: 123
      })

    expect(err.toJSON()).toEqual(
      expect.objectContaining({
        meta: {
          test2: 'value',
          test3: 123
        }
      })
    )

    expect(err.toJSONSafe()).toEqual(
      expect.objectContaining({
        meta: {
          test2: 'value',
          test3: 123
        }
      })
    )
  })

  it('should allow a mix of safe and unsafe metadata', () => {
    const err = new BaseError('test message')
    err
      .withMetadata({
        unsafe: 'value'
      })
      .withSafeMetadata({
        safe: 123
      })

    expect(err.toJSON()).toEqual(
      expect.objectContaining({
        meta: {
          unsafe: 'value',
          safe: 123
        }
      })
    )

    expect(err.toJSONSafe()).toEqual(
      expect.objectContaining({
        meta: {
          unsafe: undefined,
          safe: 123
        }
      })
    )
  })

  it('should show stack trace and causedBy when using toJSON()', () => {
    const cause = new Error('test caused by')
    const err = new BaseError('test message')
    err.causedBy(cause)

    const obj = err.toJSON()

    expect(obj).toEqual(
      expect.objectContaining({
        message: 'test message',
        meta: {},
        name: 'BaseError',
        causedBy: cause
      })
    )

    expect(obj.stack).toBeDefined()
  })

  it('should omit fields in toJSON()', () => {
    const cause = new Error('test caused by')
    const err = new BaseError('test message')
    err.causedBy(cause)

    const obj = err.toJSON(['causedBy'])

    expect(obj.causedBy).not.toBeDefined()
  })

  it('should not show stack trace or causedBy when using toJSONSafe()', () => {
    const cause = new Error('test caused by')
    const err = new BaseError('test message')
    err.causedBy(cause)

    expect(err.toJSONSafe()).toEqual({
      meta: {},
      name: 'BaseError'
    })
  })

  it('should omit fields in toJSONSafe()', () => {
    const cause = new Error('test caused by')
    const err = new BaseError('test message')
    err.causedBy(cause)

    expect(err.toJSONSafe(['name'])).toEqual({
      meta: {},
      name: undefined
    })
  })
})
