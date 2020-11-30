const { addViewPath } = require('./view.helpers')
const express = require('express')
const app = express()
app.set('views', ['./views'])

test('Can add to app view array', () => {
  const path = '/newpath'
  addViewPath(app, path)
  expect(app.get('views')[1]).toEqual(path)
})
