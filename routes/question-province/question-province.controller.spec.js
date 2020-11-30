const request = require('supertest')
const app = require('../../app.js')

test('Can send get request province route ', async () => {
  const route = app.routes.get('question-province')
  const response = await request(app).get(route.path.en)
  expect(response.statusCode).toBe(200)
})

test('Can send post request province route ', async () => {
  const route = app.routes.get('question-province')
  const response = await request(app).post(route.path.en)
  expect(response.statusCode).toBe(302)
})

