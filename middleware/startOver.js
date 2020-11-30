const startOver = (req, res, next) => {
  // show or hide the start over button on the results page
  if (req.path === '/en/results' || req.path === '/fr/resultats') {
    res.locals.showStartOver = true
  } else {
    res.locals.showStartOver = false
  }

  next()
}

module.exports = {
  startOver,
}