const request = require('supertest')
const app = require('../../app.js')

test('Can send get request unchanged-income route ', async () => {
  const route = app.routes.get('question-your-situation-unchanged-income')
  const response = await request(app).get(route.path.en)
  expect(response.statusCode).toBe(200)
})

test('Can send post request unchanged-income route ', async () => {
  const route = app.routes.get('question-your-situation-unchanged-income')
  const response = await request(app).post(route.path.en)
  expect(response.statusCode).toBe(302)
})

describe('Test redirects for unchanged-income ', () => {
  const route = app.routes.get('question-your-situation-unchanged-income')

  const redirects = [
    {
      dest: 'question-mortgage-payments',
      values: [
        'wfh',
        'paid-leave',
        'student_2019_20',
        'high_school_grad',
        'none-of-the-above',
      ],
    },
    {
      dest: 'question-rrif',
      values: ['retired'],
    },
  ]

  redirects.map((redirect) => {
    redirect.values.map((value) => {
      test(`Redirects to ${redirect.dest} with a post value of ${value} `, async () => {
        const dest = app.routes.get(redirect.dest)

        await request(app)
          .post(route.path.en)
          .send({
            unchanged_income: value,
          })
          .expect(302)
          .then((response) => {
            expect(response.headers.location).toBe(dest.path.en)
          })
      })
    })
  })
})
