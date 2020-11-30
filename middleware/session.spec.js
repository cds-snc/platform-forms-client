const { session } = require('./session')

test('Assigns a session id', async () => {
  var req = {}
  req.session = {}
  var res = {}
  res.locals = {}
  session(req,res,() => {})

  expect(req.session.id).toEqual(expect.anything())
})

test('Dont assign a session id', async () => {
  var req = {}
  req.session = {}
  req.session.id = '123'
  var res = {}
  res.locals = {}
  session(req,res,() => {})

  expect(req.session.id).toEqual('123')
})

test('Sets the hide back button to false', async () => {
  var req = {}
  req.session = {}
  var res = {}
  res.locals = {}
  res.locals.hideBackButton = false
  session(req,res,() => {})

  expect(res.locals.hideBackButton).toBe(true)
})

test('Removes last history if equal and hide back', async () => {
  var req = {}
  req.session = {}
  req.session.history = ['test']
  req.url = 'test'
  var res = {}
  res.locals = {}
  res.locals.hideBackButton = false

  session(req,res,() => {})

  expect(req.session.history.length).toBe(0)
  expect(res.locals.hideBackButton).toBe(true)
})

test('Removes last history if equal and DONT hide back', async () => {
  var req = {}
  req.session = {}
  req.session.history = ['test1', 'test2']
  req.url = 'test2'
  var res = {}
  res.locals = {}
  res.locals.hideBackButton = false

  session(req,res,() => {})

  expect(req.session.history.length).toBe(1)
  expect(res.locals.hideBackButton).toBe(false)
})