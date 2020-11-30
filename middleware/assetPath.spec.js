const {assetPath} = require('./assetPath')

test('CSS file path is correct', async () => {
  const app = require('../app.js')

  process.env.CDN_PREFIX = '//localhost';
  assetPath(app)({protocol:"http"},null,() => {})

  var cssPath = '/dist/css/styles.css'
  var route = app.locals.asset(cssPath);

  expect(route).toBe('http://localhost/dist/css/styles.css')
  delete process.env.CDN_PREFIX;
})

test('app.js file path is correct', async () => {
  const app = require('../app.js')
  
  assetPath(app)({protocol:"http"},null,() => {})
  process.env.CDN_PREFIX = '//localhost';

  var jsPath = '/dist/js/app.js'
  var route = app.locals.asset(jsPath);

  expect(route).toBe('http://localhost/dist/js/app.js')
  delete process.env.CDN_PREFIX;
})