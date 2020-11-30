const request = require('supertest')
const app = require('../app.js')

test('The cache-control header is set properly', async () => {
  const route = app.routes.get('start');
  const response = await request(app).get(route.path.en);

  expect(response.headers['cache-control']).toBe('no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
})