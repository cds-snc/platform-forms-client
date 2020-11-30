// @todo break the tests up

const { isValidDate, isEmptyObject } = require('./index')

describe('Has valid date', () => {
  test('returns true for valid date', () => {
    expect(isValidDate('2019-01')).toBe(true)
  })

  test('returns false for bad date', () => {
    expect(isValidDate('20191-01')).toBe(false)
  })

  test('returns false for date with bad format', () => {
    expect(isValidDate('2019/01')).toBe(false)
  })

  test('returns false for date with wrong format', () => {
    expect(isValidDate('2019-01-01')).toBe(false)
  })
})

describe('Is empty Object', () => {
  test('returns true is the object is empty', () => {
    const result = isEmptyObject({})
    expect(result).toEqual(true)
  })

  test('returns false if the object has values', () => {
    const result = isEmptyObject({ name: 'your name' })
    expect(result).toEqual(false)
  })
})
