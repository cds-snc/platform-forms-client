const { localizedSort } = require('./localized.sort')

describe('localizedSort', () => {

  const env = {}
  env.filters = {}
  env.addFilter = (name, func) => {
    env.filters[name] = func
  }
  localizedSort(env)


  test('returns a sorted list for english', () => {
    const enArr = [
      {text: 'a'},
      {text: 'c'},
      {text: 'b'},
    ]
    const sortedArr = [
      {text: 'a'},
      {text: 'b'},
      {text: 'c'},

    ]
    expect(env.filters.localizedSort(enArr, 'text','en'))
      .toStrictEqual(sortedArr)
  })

  test('returns a sorted list for french', () => {
    const frArr = [
      {text: 'A'},
      {text: 'Í'},
      {text: 'D'},
    ]
    const sortedArr = [
      {text: 'A'},
      {text: 'D'},
      {text: 'Í'},

    ]
    expect(env.filters.localizedSort(frArr, 'text','fr'))
      .toStrictEqual(sortedArr)
  })

})
