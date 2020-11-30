let { routes } = require('./config/routes.config')
const request = require('supertest')
const app = require('./app.js')

jest.mock('./config/routes.config', () => {
  const original = jest.requireActual('./config/routes.config')
  return {
    ...original,
    configRoutes: undefined,
  }
})

test('Server can request first route and receive 200 response', async () => {
  const response = await request(app).get(routes[0].path.en)
  expect(response.statusCode).toBe(200)
})
