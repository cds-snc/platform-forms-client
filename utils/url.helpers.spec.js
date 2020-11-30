const { getHostProtocol, getDomain } = require('./url.helpers')

test('Defaults host protocol when secure param is missing', () => {
  expect(getHostProtocol()).toEqual('http')
})

test('Returns https when req has secure param', () => {
  const req = { secure: true }
  expect(getHostProtocol(req)).toEqual('https')
})

test('Can get domain', () => {
  const req = { headers: { host: 'localhost' } }
  expect(getDomain(req)).toEqual('http://localhost')
})

test('getDomain will throw an error when missing req or host param', () => {
  expect(() => {
    getDomain()
  }).toThrow()
})
