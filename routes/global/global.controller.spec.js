const request = require('supertest')
const app = require('../../app.js')

if (process.env.NODE_ENV === 'test') {
  app.get('/test-500', (req, res) => {
    throw new Error('something bad')
  })
}

test('Returns 404', async () => {
  const response = await request(app).get("/some-route-that-doesn't exist")
  expect(response.statusCode).toBe(404)
})

test('Returns 500', async () => {
  // overwrite console.error for this test for cleaner command line output
  console.error = () => {}
  const response = await request(app).get('/test-500')
  expect(response.statusCode).toBe(500)
})

test('Returns 302', async () => {
  const response = await request(app).get('/clear')
  expect(response.statusCode).toBe(302)
})
