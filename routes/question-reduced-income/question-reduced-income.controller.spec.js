const request = require('supertest')
const app = require('../../app.js')

test('Can send get request reduced-income route ', async () => {
  const route = app.routes.get('question-reduced-income')
  const response = await request(app).get(route.path.en)
  expect(response.statusCode).toBe(200)
})

test('Can send post request reduced-income route ', async () => {
  const route = app.routes.get('question-reduced-income')
  const response = await request(app).post(route.path.en)
  expect(response.statusCode).toBe(302)
})

test('Redirects to mortgage-payments route path 1', async () => {
  const route = app.routes.get('question-reduced-income')
  const dest = app.routes.get('question-mortgage-payments')

  await request(app)
    .post(route.path.en)
    .send({
      reduced_income: '1000_or_less',
    })
    .expect(302)
    .then(response => {
      expect(response.headers.location).toBe(dest.path.en)
    })
})

test('Redirects to mortgage-payments route path 2', async () => {
  const route = app.routes.get('question-reduced-income')
  const dest = app.routes.get('question-mortgage-payments')

  await request(app)
    .post(route.path.en)
    .send({
      reduced_income: '1001_or_more',
    })
    .expect(302)
    .then(response => {
      expect(response.headers.location).toBe(dest.path.en)
    })
})
