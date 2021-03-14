/* eslint-env jest */

import { BaseError } from '../BaseError'
import { DeserializeOpts, SerializedError } from '../../interfaces'

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

    expect(err.getMetadata()).toEqual({
      test: 'value',
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

    expect(err.getSafeMetadata()).toEqual({
      test2: 'value',
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

    expect(err.getCausedBy()).toEqual(cause)

    expect(obj.stack).toBeDefined()
  })

  it('should omit fields in toJSON()', () => {
    const cause = new Error('test caused by')
    const err = new BaseError('test message')
    err.causedBy(cause)

    const obj = err.toJSON(['causedBy'])

    expect(obj.causedBy).not.toBeDefined()
  })

  it('should omit fields in toJSON() via config', () => {
    const cause = new Error('test caused by')
    const err = new BaseError('test message', {
      toJSONFieldsToOmit: ['causedBy'],
      omitEmptyMetadata: true
    })
    err.causedBy(cause)

    const obj = err.toJSON()

    expect(obj.causedBy).not.toBeDefined()
    expect(obj.meta).not.toBeDefined()
  })

  it('should not show stack trace or causedBy when using toJSONSafe()', () => {
    const cause = new Error('test caused by')
    const err = new BaseError('test message')
    err.causedBy(cause)

    expect(err.toJSONSafe()).toEqual({
      meta: {}
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

  it('should omit fields in toJSONSafe() via config', () => {
    const err = new BaseError('test message', {
      toJSONSafeFieldsToOmit: ['errId'],
      omitEmptyMetadata: true
    }).withErrorId('test-id')

    const data = err.toJSONSafe()

    expect(data.errId).not.toBeDefined()
    expect(data.meta).not.toBeDefined()
  })

  it('should call transformToJSONFn / transformToJSONSafeFn if defined', () => {
    const err = new BaseError('test message', {
      onPreToJSONData: data => {
        data.blah = 'test'
        return data
      },
      onPreToJSONSafeData: data => {
        data.blah2 = 'test2'
        return data
      }
    }).withErrorId('test-id')

    const notSafe = err.toJSON()
    const safe = err.toJSONSafe()

    expect(notSafe.blah).toEqual('test')
    expect(safe.blah2).toEqual('test2')
  })

  it('should update config', () => {
    const err = new BaseError('test message', {
      toJSONSafeFieldsToOmit: ['errId']
    }).withErrorId('test-id')

    expect(err.toJSONSafe().errId).not.toBeDefined()

    err.setConfig({})

    expect(err.toJSONSafe().errId).toBeDefined()
  })

  it('should not throw if toJSON / toJSONSafe is not defined with an omit array', () => {
    const err = new BaseError('test message')

    expect(() => err.toJSON(null)).not.toThrow()
    expect(() => err.toJSONSafe(null)).not.toThrow()
  })

  it('should default to an empty object if null is passed to the config option', () => {
    const err = new BaseError('test message', null)

    expect(err.getConfig()).toBeDefined()
  })

  describe('conversion', () => {
    it('should return false if onConvert is not defined', () => {
      const err = new BaseError('test')
      expect(err.hasOnConvertDefined()).toEqual(false)
    })

    it('should return true if onConvert is defined', () => {
      const err = new BaseError('test', {
        onConvert: () => {
          return 'test'
        }
      })

      expect(err.hasOnConvertDefined()).toEqual(true)
    })

    it('should update the conversion fn', () => {
      const err = new BaseError('test')
      err.setOnConvert(() => {
        return 'test'
      })
      expect(err.hasOnConvertDefined()).toEqual(true)
    })
  })

  describe('Deserialization', () => {
    it('throws if the data is not an object', () => {
      // @ts-ignore
      expect(() => BaseError.fromJSON('')).toThrowError()
    })

    it('#copyDeserializationData - should work with empty data', () => {
      const err = new BaseError('test message')

      BaseError.copyDeserializationData(err, {}, {})

      expect(err.toJSON()).toEqual(
        expect.objectContaining({
          message: 'test message',
          meta: {},
          name: 'BaseError'
        })
      )
    })

    it('#copyDeserializationData - should work with metadata', () => {
      const err = new BaseError('test message')

      BaseError.copyDeserializationData(
        err,
        {
          meta: {
            safe: '123',
            unsafe: '456'
          }
        },
        {
          safeMetadataFields: {
            safe: true
          }
        }
      )

      expect(err.getMetadata()).toEqual({
        unsafe: '456'
      })

      expect(err.getSafeMetadata()).toEqual({
        safe: '123'
      })

      expect(err.toJSON()).toEqual(
        expect.objectContaining({
          message: 'test message',
          name: 'BaseError'
        })
      )
    })

    it('#copyDeserializationData - should copy data to an instance', () => {
      const err = new BaseError('test message')

      BaseError.copyDeserializationData(
        err,
        {
          errId: 'err-123',
          code: 'ERR_INT_500',
          subCode: 'DB_0001',
          message: 'test message',
          meta: { safe: 'test454', test: 'test123' },
          name: 'BaseError',
          statusCode: 500,
          causedBy: 'test',
          stack: 'abcd'
        },
        {}
      )

      expect(err.toJSON()).toEqual(
        expect.objectContaining({
          errId: 'err-123',
          code: 'ERR_INT_500',
          subCode: 'DB_0001',
          message: 'test message',
          meta: { safe: 'test454', test: 'test123' },
          name: 'BaseError',
          statusCode: 500,
          causedBy: 'test'
        })
      )
    })

    it('should deserialize an error without options', () => {
      const err = new BaseError('test message')
        .withErrorId('err-123')
        .withErrorType('DATABASE_FAILURE')
        .withErrorCode('ERR_INT_500')
        .withErrorSubCode('DB_0001')
        .withStatusCode(500)
        .withLogLevel('error')
        .withMetadata({
          test: 'test123'
        })
        .withSafeMetadata({
          safe: 'test454'
        })
        .causedBy('test')

      const data = err.toJSON()
      const err2 = BaseError.fromJSON(data)

      expect(err2.getSafeMetadata()).toEqual({})
      expect(err2.getMetadata()).toEqual({
        test: 'test123',
        safe: 'test454'
      })

      expect(err2.toJSON()).toEqual(
        expect.objectContaining({
          errId: 'err-123',
          code: 'ERR_INT_500',
          subCode: 'DB_0001',
          message: 'test message',
          meta: { safe: 'test454', test: 'test123' },
          name: 'BaseError',
          statusCode: 500,
          causedBy: 'test'
        })
      )
    })

    it('should deserialize an error with options', () => {
      const err = new BaseError('test message')
        .withErrorId('err-123')
        .withErrorType('DATABASE_FAILURE')
        .withErrorCode('ERR_INT_500')
        .withErrorSubCode('DB_0001')
        .withStatusCode(500)
        .withLogLevel('error')
        .withMetadata({
          test: 'test123'
        })
        .withSafeMetadata({
          safe: 'test454'
        })
        .causedBy('test')

      const data = err.toJSON()
      const err2 = BaseError.fromJSON(data, {
        safeMetadataFields: {
          safe: true
        }
      })

      expect(err2.getSafeMetadata()).toEqual({
        safe: 'test454'
      })

      expect(err2.toJSON()).toEqual(
        expect.objectContaining({
          errId: 'err-123',
          code: 'ERR_INT_500',
          subCode: 'DB_0001',
          message: 'test message',
          meta: { safe: 'test454', test: 'test123' },
          name: 'BaseError',
          statusCode: 500,
          causedBy: 'test'
        })
      )
    })

    it('should be able to override fromJSON()', () => {
      interface InternalServerErrorOpts extends DeserializeOpts {}

      class InternalServerError extends BaseError {
        // You can extend DeserializeOpts to add in additional options if you want
        static fromJSON (
          data: Partial<SerializedError>,
          opts: InternalServerErrorOpts
        ): InternalServerError {
          if (!opts) {
            opts = {} as InternalServerErrorOpts
          }

          if (typeof data === 'string') {
            throw new Error(
              `InternalServerError#fromJSON(): Data is not an object.`
            )
          }

          let err = new InternalServerError(data.message)

          BaseError.copyDeserializationData<
            InternalServerError,
            InternalServerErrorOpts
          >(err, data, opts)

          return err
        }
      }

      const err = new InternalServerError('test message')
        .withErrorId('err-123')
        .withErrorType('DATABASE_FAILURE')
        .withErrorCode('ERR_INT_500')
        .withErrorSubCode('DB_0001')
        .withStatusCode(500)
        .withLogLevel('error')
        .withMetadata({
          test: 'test123'
        })
        .withSafeMetadata({
          safe: 'test454'
        })

      const data = err.toJSON()

      const err2 = InternalServerError.fromJSON(data, {
        safeMetadataFields: {
          safe: true
        }
      })

      expect(err2.toJSON()).toEqual(
        expect.objectContaining({
          errId: 'err-123',
          code: 'ERR_INT_500',
          subCode: 'DB_0001',
          message: 'test message',
          meta: { safe: 'test454', test: 'test123' },
          name: 'InternalServerError',
          statusCode: 500
        })
      )
    })
  })
})
