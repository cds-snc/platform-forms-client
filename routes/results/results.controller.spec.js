const request = require('supertest')
const app = require('../../app.js')

test('Can send get request results route ', async () => {
  const route = app.routes.get('results')
  const response = await request(app).get(route.path.en)
  expect(response.statusCode).toBe(200)
})
