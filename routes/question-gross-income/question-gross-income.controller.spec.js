const request = require('supertest')
const app = require('../../app.js')

test('Can send get request gross-income route ', async () => {
  const route = app.routes.get('question-gross-income')
  const response = await request(app).get(route.path.en)
  expect(response.statusCode).toBe(200)
})

test('Can send post request gross-income route ', async () => {
  const route = app.routes.get('question-gross-income')
  const response = await request(app).post(route.path.en)
  expect(response.statusCode).toBe(302)
})

test('Redirects to mortgage-payments route path 1', async () => {
  const route = app.routes.get('question-gross-income')
  const dest = app.routes.get('question-mortgage-payments')

  await request(app)
    .post(route.path.en)
    .send({
      gross_income: '4999_or_less',
    })
    .expect(302)
    .then(response => {
      expect(response.headers.location).toBe(dest.path.en)
    })
})

test('Redirects to mortgage-payments route path 2', async () => {
  const route = app.routes.get('question-gross-income')
  const dest = app.routes.get('question-mortgage-payments')

  await request(app)
    .post(route.path.en)
    .send({
      gross_income: 'over_5k',
    })
    .expect(302)
    .then(response => {
      expect(response.headers.location).toBe(dest.path.en)
    })
})
