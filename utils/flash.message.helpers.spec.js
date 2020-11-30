const {
  setFlashMessageContent,
  getFlashMessage,
} = require('./flash.message.helpers')

test('Sets and clears flash messages', () => {
  const req = { session: {} }
  const errMessage = 'this is an error'

  setFlashMessageContent(req, { errors: [errMessage] })
  const err = req.session.flashmessage.errors[0]
  expect(err).toBe(errMessage)
  expect(getFlashMessage(req).errors[0]).toBe(err)

  // should clear itself after calling getFlashMessage
  expect(getFlashMessage(req).errors).toBe(undefined)
})
