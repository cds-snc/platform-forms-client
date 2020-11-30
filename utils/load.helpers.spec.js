const { getClientJs } = require('../utils')

describe('Can pull JavaScript file', () => {
  test('returns js file if it exists', () => {
    const req = {
      body: {},
      headers: { host: 'localhost' },
    }
    expect(getClientJs(req, 'start', '../__tests__/fixtures')).toEqual(
      'http://localhost/dist/js/start.f1ed5571f87447db4451.js',
    )
  })

  test(`returns false if file or directory doesn't exist`, () => {
    const req = {
      body: {},
      headers: { host: 'localhost' },
    }
    expect(getClientJs(req, 'start', '../__tests__/fixtures_missing')).toEqual(
      false,
    )
  })

  test(`returns false if file doesn't exist`, () => {
    const req = {
      body: {},
      headers: { host: 'localhost' },
    }
    expect(getClientJs(req, 'start1', '../__tests__/fixtures')).toEqual(false)
  })
})
