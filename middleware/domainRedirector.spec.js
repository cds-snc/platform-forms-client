const { domainRedirector } = require('./domainRedirector')

test('We do nothing if on the proper domain ', async () => {
  process.env.SLOT_NAME = 'default'
  process.env.DOMAIN_FR = 'foo'
  process.env.DOMAIN_EN = 'bar'

  const path = '/en/baz'
  const res = { redirect: jest.fn() }
  const req = { path: path, headers: { host: process.env.DOMAIN_EN } }

  await new Promise((resolve) => domainRedirector(req, res, () => resolve()))
})

test('We skip redirect if not in "default" slot', async () => {
  const res = { redirect: jest.fn() }
  process.env.SLOT_NAME = 'staging'

  await new Promise((resolve) => domainRedirector(null, res, () => resolve()))

  expect(res.redirect.mock.calls.length).toBe(0)
})

test('redirect to french site if path starts with /fr/', () => {
  process.env.SLOT_NAME = 'default'
  process.env.DOMAIN_FR = 'foo'
  process.env.DOMAIN_EN = 'bar'

  const path = '/fr/baz'
  const res = { redirect: jest.fn() }
  const req = { path: path, headers: { host: process.env.DOMAIN_EN } }

  domainRedirector(req, res, null)
  expect(res.redirect.mock.calls[0][0]).toBe(
    `https://${process.env.DOMAIN_FR}${path}`,
  )
})

test('redirect to english site if path starts with /en/', () => {
  process.env.SLOT_NAME = 'default'
  process.env.DOMAIN_FR = 'foo'
  process.env.DOMAIN_EN = 'bar'

  const path = '/en/baz'
  const res = { redirect: jest.fn() }
  const req = { path: path, headers: { host: process.env.DOMAIN_FR } }

  domainRedirector(req, res, null)
  expect(res.redirect.mock.calls[0][0]).toBe(
    `https://${process.env.DOMAIN_EN}${path}`,
  )
})
