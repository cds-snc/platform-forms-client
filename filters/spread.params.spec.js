const { spreadParams } = require('./spread.params')

test('returns a string with attributes', () => {
  const env = {}
  env.filters = {}
  env.addFilter = (name, func) => {
    env.filters[name] = func
  }
  spreadParams(env)
  const attrs = env.filters.spreadParams('', { data1: 'a', data2: 'b' })
  expect(attrs).toEqual(' data1=a  data2=b ')
})
