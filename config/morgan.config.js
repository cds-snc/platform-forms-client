var morgan = require('morgan')

morgan.token('host', function getHost(req, res) {
  if (!req || !req.headers || !req.headers.host) {
    return undefined
  }

  return req.headers.host
})

morgan.token('version', function getSha() {
  return process.env.GITHUB_SHA
})

morgan.token('err', function getErr(req, res) {
  return req.locals.err
})

morgan.token('id', function getId(req, res) {
  return req.locals.session.id
})

morgan.token('data', function getData(req, res) {
  // add formdata to request logs on every request
  return req.locals.session.formdata
})

module.exports = (function morganConfig() {
  return process.env.NODE_ENV === 'production'
    ? jsonFormatProduction
    : jsonFormatDev
})()

/* eslint-disable dot-notation */

function jsonFormatDev(tokens, req, res) {
  return JSON.stringify({
    method: tokens['method'](req, res),
    url: tokens['url'](req, res),
    status: tokens['status'](req, res),
    'response-time': tokens['response-time'](req, res) + 'ms',
  })
}

function jsonFormatProduction(tokens, req, res) {
  return JSON.stringify({
    id: tokens['id'](req, res),
    method: tokens['method'](req, res),
    url: tokens['url'](req, res),
    status: tokens['status'](req, res),
    host: tokens['host'](req, res),
    'response-time': tokens['response-time'](req, res) + 'ms',
    timestamp: tokens['date'](req, res, 'iso'),
    'content-length': tokens['res'](req, res, 'content-length'),
    referrer: tokens['referrer'](req, res),
    'user-agent': tokens['user-agent'](req, res),
    err: tokens['err'](req, res),
    version: tokens['version'](),
    data: tokens['data'](req, res),
  })
}
