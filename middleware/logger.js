const logger = (req, res, next) => {
  res.locals.log = (msg) => {
    const logObject = {}
    if (req.session.id) {
      logObject.id = req.session.id
    }

    if (msg) {
      logObject.msg = msg
    }

    console.log(JSON.stringify(logObject))
  }

  next()
}

module.exports = {
  logger,
}
