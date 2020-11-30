const request = require('supertest')
const app = require('../../app.js')

test('Can send get request no-income route ', async () => {
  const route = app.routes.get('question-your-situation-no-income')
  const response = await request(app).get(route.path.en)
  expect(response.statusCode).toBe(200)
})

test('Can send post request no-income route ', async () => {
  const route = app.routes.get('question-your-situation-no-income')
  const response = await request(app).post(route.path.en)
  expect(response.statusCode).toBe(302)
})

describe('Test redirects for no-income ', () => {
  const route = app.routes.get('question-your-situation-no-income')

  const redirects = [
    {
      dest: 'question-mortgage-payments',
      values: [
        'lost-job-employer-closed',
        'self-employed-closed',
        'unpaid-leave-to-care',
        'sick-or-quarantined',
        'parental-recently-cant-return',
        'student_2019_20',
        'ei-recently-claim-ended',
        'none-of-the-above',
      ],
    },
  ]

  redirects.map((redirect) => {
    redirect.values.map((value) => {
      test(`Redirects to ${redirect.dest} with a post value of ${value} `, async () => {
        const dest = app.routes.get(redirect.dest)

        await request(app)
          .post(route.path.en)
          .send({
            no_income: value,
          })
          .expect(302)
          .then((response) => {
            expect(response.headers.location).toBe(dest.path.en)
          })
      })
    })
  })
})
