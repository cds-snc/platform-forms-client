const { startOver } = require('./startOver')

test('The start over button on the english results page is visible', async () => {
  var req = {
    path: '/en/results',
  }
  var res = {
    locals: {},
  }

  startOver(req, res, () => {})

  expect(res.locals.showStartOver).toBe(true)
})

test('The start over button on the french results page is visible', async () => {
  var req = {
    path: '/fr/resultats',
  }
  var res = {
    locals: {},
  }

  startOver(req, res, () => {})

  expect(res.locals.showStartOver).toBe(true)
})

test('The start over button on any other english page is not visible', async () => {
  var req = {
    path: '/en/start',
  }
  var res = {
    locals: {},
  }

  startOver(req, res, () => {})

  expect(res.locals.showStartOver).toBe(false)
})

test('The start over button on any other french page is not visible', async () => {
  var req = {
    path: '/fr/debut',
  }
  var res = {
    locals: {},
  }

  startOver(req, res, () => {})

  expect(res.locals.showStartOver).toBe(false)
})