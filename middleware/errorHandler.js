const errorHandler = (appInsights) => (err, req, res, next) => {
  const errObj = {}

  const status = err.status || err.statusCode || 500
  res.statusCode = status

  // TODO: Ask pcraig why he did the following instead of just setting
  // res.locals.err to the err that gets passed in here.
  errObj.status = status
  if (err.message) errObj.message = err.message
  if (err.stack) errObj.stack = err.stack
  if (err.code) errObj.code = err.code
  if (err.name) errObj.name = err.name
  if (err.type) errObj.type = err.type

  // istanbul ignore next
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights.trackException({ exception: errObj })
  }

  res.locals.err = errObj
  next(err)
}

module.exports = {
  errorHandler,
}
