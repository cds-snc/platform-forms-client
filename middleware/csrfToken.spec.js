const { csrfToken } = require('./csrfToken')

test('It adds a csrfToken to the response', async () => {
  const res = { locals: {} }
  await new Promise((resolve) =>
    csrfToken({ csrfToken: () => 'foo' }, res, () => {
      resolve()
    }),
  )

  expect(res.locals.csrfToken).toBe('foo')
})
