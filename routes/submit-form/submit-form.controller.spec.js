const request = require('supertest')
const app = require('../../app.js')
const cheerio = require('cheerio')

function countScriptTags(res) {
  var $ = cheerio.load(res.text)
  return $('script').length
}

const mockFn = jest
  .fn((req, routePath, jsPath = null) => 'default')
  .mockImplementationOnce(() => 'https://digital.canada.ca')
  .mockImplementationOnce(() => false)

jest.mock('../../utils/load.helpers.js', () => ({
  getClientJs: () => {
    return mockFn()
  },
}))

test('User gets redirect when hitting /', async () => {
  const response = await request(app).get('/')
  expect(response.statusCode).toBe(302)
})

test('Can send get request to start route and have js src set', async () => {
  const route = app.routes.get('start')
  const response = await request(app).get(route.path.en)
  expect(response.statusCode).toBe(200)
  expect(response.text).toContain('digital.canada.ca')
})

test('Can send get request to start route and have empty js src', async () => {
  const route = app.routes.get('start')
  const response = await request(app).get(route.path.en)
  expect(response.statusCode).toBe(200)
  // call to getClientJs should return false
  // which means we should have X number of script tags
  // i.e. whatever the amount is in the base view
  expect(countScriptTags(response)).toBe(1)
})
