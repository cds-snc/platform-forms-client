const request = require('supertest')
const app = require('../../app.js')

const feedbackRoute = app.routes.get('feedback')
const feedbackThanks = app.routes.get('feedback-thanks')
const feedbackError = app.routes.get('feedback-error')

test('Redirect to thanks with just details', async () => {
  const response = await request(app)
    .post(feedbackRoute.path.en)
    .set('referer', 'http://foo.bar')
    .send({
      problems: undefined,
      details: 'foo',
    })
  expect(response.statusCode).toBe(302)
  expect(response.headers.location).toBe(feedbackThanks.path.en)
})

test('Redirect to thanks with just problems', async () => {
  const response = await request(app)
    .post(feedbackRoute.path.en)
    .set('referer', 'http://foo.bar')
    .send({
      problems: ['dont_know'],
      details: '',
    })
  expect(response.statusCode).toBe(302)
  expect(response.headers.location).toBe(feedbackThanks.path.en)
})

test('Redirect to feedback error', async () => {
  const response = await request(app)
    .post(feedbackRoute.path.en)
    .set('referer', 'http://foo.bar')
    .send({
      problems: undefined,
      details: '',
    })
  
  expect(response.statusCode).toBe(302)
  expect(response.headers.location).toBe(feedbackError.path.en)
})
