const { hasData, checkErrorsJSON } = require('../utils')

test('returns key if it exists', () => {
  expect(hasData({ phone: '613-111-1111' }, 'phone')).toEqual(true)
  expect(hasData({ email: 'test@example.com' }, 'phone')).toEqual(false)
  expect(hasData()).toEqual(false)
  expect(hasData({})).toEqual(false)
})

jest.mock('express-validator', () => ({
  validationResult: jest.fn(req => {
    return {
      isEmpty: () => {
        return true
      },
    }
  }),
}))

jest.mock('./validate.helpers', () => {
  const original = jest.requireActual('./validate.helpers')
  return {
    ...original,
    errorArray2ErrorObject: jest.fn(req => {
      return []
    }),
  }
})

test('returns key if it exists', () => {
  const req = {
    body: {},
  }

  const next = jest.fn()

  const res = {
    query: {},
    headers: {},
    data: null,
    json(payload) {
      return payload
    },
    cookie(name, value, options) {
      this.headers[name] = value
    },
  }

  expect(checkErrorsJSON(req, res, next)).toEqual({})
})
