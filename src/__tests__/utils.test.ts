/* eslint-env jest */

import { generateHighLevelErrors, generateLowLevelErrors } from '../utils'

const errors = {
  INTERNAL_SERVER_ERROR: {},
  AUTH_ERROR: {
    className: 'AuthError',
    code: 'AUTH_ERR'
  }
}

const errorCodes = {
  DATABASE_FAILURE: {
    statusCode: 500,
    message: 'There is an issue with the database'
  },
  ANOTHER_FAILURE: {
    subCode: 'ANOTHER_FAILURE',
    message: 'Another failure'
  }
}

describe('utils', () => {
  describe('generateHighLevelErrors', () => {
    it('should generate the codes and classNames', () => {
      expect(generateHighLevelErrors(errors)).toMatchObject({
        INTERNAL_SERVER_ERROR: {
          className: 'InternalServerError',
          code: 'INTERNAL_SERVER_ERROR'
        },
        AUTH_ERROR: {
          className: 'AuthError',
          code: 'AUTH_ERR'
        }
      })
    })

    it('should not generate className', () => {
      expect(
        generateHighLevelErrors(errors, { disableGenerateClassName: true })
      ).toMatchObject({
        INTERNAL_SERVER_ERROR: {
          code: 'INTERNAL_SERVER_ERROR'
        },
        AUTH_ERROR: {
          className: 'AuthError',
          code: 'AUTH_ERR'
        }
      })
    })

    it('should not generate code', () => {
      expect(
        generateHighLevelErrors(errors, { disableGenerateCode: true })
      ).toMatchObject({
        INTERNAL_SERVER_ERROR: {
          className: 'InternalServerError'
        },
        AUTH_ERROR: {
          className: 'AuthError',
          code: 'AUTH_ERR'
        }
      })
    })
  })

  describe('generateLowLevelErrors', () => {
    it('should generate the subcodes', () => {
      expect(generateLowLevelErrors(errorCodes)).toMatchObject({
        DATABASE_FAILURE: {
          subCode: 'DATABASE_FAILURE',
          statusCode: 500,
          message: 'There is an issue with the database'
        },
        ANOTHER_FAILURE: {
          subCode: 'ANOTHER_FAILURE',
          message: 'Another failure'
        }
      })
    })

    it('should not generate the subcodes', () => {
      expect(
        generateLowLevelErrors(errorCodes, { disableGenerateSubCode: true })
      ).toMatchObject({
        DATABASE_FAILURE: {
          statusCode: 500,
          message: 'There is an issue with the database'
        },
        ANOTHER_FAILURE: {
          subCode: 'ANOTHER_FAILURE',
          message: 'Another failure'
        }
      })
    })
  })
})
