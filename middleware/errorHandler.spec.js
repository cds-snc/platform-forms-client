const { errorHandler } = require('./errorHandler')
test('The error object gets appended to res.locals and passed to the next middleware', async () => {
  const testError = {
    message: 'foo',
    stack: 'bar',
    code: 'baz',
    name: 'qux',
    type: 'qaz',
  }
  const res = { locals: {} }
  const errHandlingFunc = errorHandler(null)

  const result = await new Promise((resolve) =>
    errHandlingFunc(testError, {}, res, (err) => {
      resolve(err)
    }),
  )

  // Make sure we pass on the err object
  expect(result).toBe(testError)
  expect(res.locals.err).toStrictEqual({
    status: 500,
    message: 'foo',
    stack: 'bar',
    code: 'baz',
    name: 'qux',
    type: 'qaz',
  })
})
