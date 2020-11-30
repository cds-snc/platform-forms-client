const { logger } = require('./logger')

test('It adds a logger to the response', async () => {
  const res = { locals: {} }
  await new Promise((resolve) => logger({ session: {} }, res, () => resolve()))
  expect(res.locals.log).toBeDefined()
})

test('The logger returns a structured msg with the session id', async () => {
  // mock console.log so we can see what is written there
  console.log = jest.fn()

  const res = { locals: {} }
  const req = { session: { id: 'foo' } }
  await new Promise((resolve) => logger(req, res, () => resolve()))
  res.locals.log('bar')

  expect(console.log.mock.calls[0][0]).toBe(
    JSON.stringify({
      id: 'foo',
      msg: 'bar',
    }),
  )
})
