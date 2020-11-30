const featureFlags = (app) => (req, res, next) => {

  // We usually want our features to default to false so we don't accidentally release them before they are ready.
  const featureFlags = {
    enableDtc : process.env.FF_ENABLE_DTC || false,
    enableFreeText: process.env.FF_ENABLE_FEEDBACK_TEXT || false,
  }

  // We want this available in templates and in controllers
  req.locals.featureFlags = featureFlags
  app.locals.featureFlags = featureFlags

  next()
}


module.exports = {
  featureFlags,
}