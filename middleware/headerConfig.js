const headerConfig = function (req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  next()
}

module.exports = {
  headerConfig,
}
