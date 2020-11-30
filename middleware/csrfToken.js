const csrfToken = function (req, res, next) {
  res.locals.csrfToken = req.csrfToken()
  next()
}

module.exports = {
  csrfToken,
}
