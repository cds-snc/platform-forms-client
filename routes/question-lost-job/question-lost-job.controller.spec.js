const request = require('supertest')
const app = require('../../app.js')

test('Can send get request lost-job route ', async () => {
  const route = app.routes.get('question-lost-job')
  const response = await request(app).get(route.path.en)
  expect(response.statusCode).toBe(200)
})

test('Can send post request lost-job route ', async () => {
  const route = app.routes.get('question-lost-job')
  const response = await request(app).post(route.path.en)
  expect(response.statusCode).toBe(302)
})

test('Redirects to no-income route ', async () => {
  const route = app.routes.get('question-lost-job')
  const dest = app.routes.get('question-your-situation-no-income')

  await request(app).post(route.path.en).send({
      lost_job: 'lost-all-income',
  })
  .expect(302)
  .then(response => {
    expect(response.headers.location).toBe(dest.path.en)
  })
})

test('Redirects to some-income route ', async () => {
  const route = app.routes.get('question-lost-job')
  const dest = app.routes.get('question-your-situation-some-income')

  await request(app).post(route.path.en).send({
      lost_job: 'lost-some-income',
  })
  .expect(302)
  .then(response => {
    expect(response.headers.location).toBe(dest.path.en)
  })
})

test('Redirects to unchanged-income route ', async () => {
  const route = app.routes.get('question-lost-job')
  const dest = app.routes.get('question-your-situation-unchanged-income')

  await request(app).post(route.path.en).send({
      lost_job: 'lost-no-income',
  })
  .expect(302)
  .then(response => {
    expect(response.headers.location).toBe(dest.path.en)
  })
})