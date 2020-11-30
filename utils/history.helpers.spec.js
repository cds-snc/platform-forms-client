const { setHistory } = require('./history.helpers')

test('session history exists', () => {
  const req = {
    body: {},
    session: {},
    url: 'localhost',
  }
  const res = {}

  setHistory(req, res)

  expect(req.session.history).not.toBe(undefined)
})

test('populates session history', () => {
  const req = {
    body: {},
    session: {},
    url: 'localhost',
  }
  const res = {}

  setHistory(req, res)

  expect(req.session.history.length).toBe(1)
  expect(req.session.history[0]).toBe('localhost')
})