const { _lastUpdated } = require('./last.updated')

describe('_lastUpdated', () => {
  const invalidDates = ['', 'albertosaurus', 'tomorrow']
  invalidDates.map((invalidDate) => {
    test(`returns original string for invalid date: ${invalidDate}`, () => {
      expect(_lastUpdated(invalidDate)).toEqual(invalidDate)
    })
  })

  const date = '2020-02-02'

  test('returns English-formatted date when no locale is specified', () => {
    expect(_lastUpdated(date)).toEqual('February 2, 2020')
  })

  test('returns English-formatted date when "en" locale is specified', () => {
    expect(_lastUpdated(date, 'en')).toEqual('February 2, 2020')
  })

  test('returns French-formatted date when "fr" locale is specified', () => {
    expect(_lastUpdated(date, 'fr')).toEqual('2 février 2020')
  })

  test('returns French-formatted date with "1er" for the first day of the month when "fr" locale is specified', () => {
    const firstDayOfMonth = '2020-02-01'

    expect(_lastUpdated(firstDayOfMonth, 'fr')).toEqual('1er février 2020')
  })
})
