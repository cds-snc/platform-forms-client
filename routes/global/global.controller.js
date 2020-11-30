const { simpleRoute } = require('../../utils/route.helpers')

module.exports = (app, table) => {
  // clear session

  app.get('/back', (req, res) => {
    if (
      req.session === undefined ||
      req.session.history === undefined ||
      req.session.history.length === 0
    ) {
      throw new Error('No History Available') // TODO Fix this later
    }

    const url = req.session.history.pop()

    return res.redirect(url)
  })

  app.get('/test-500', (req, res) => {
    throw new Error('something bad')
  })

  app.get('/clear', (req, res) => {
    req.session.formdata = null
    req.session.history = []
    res.locals.hideBackButton = true
    res.redirect(302, '/')
  })

  app.use(function (req, res, next) {
    res.status(404)

    let message = false

    const routePath = req.path
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'production') {
      message = `❌ Forgot to add this route? \n\nAdd the following to config/routes.config.js: \n\nconst routes = [{ name: "${routePath}", path: "${routePath}" }]\n ...\n configRoutes(app){\n  require("../routes${routePath}${routePath}.controller")(app);\n}`
    }

    res.locals.simpleRoute = (name, locale) => simpleRoute(name, locale)
    res.locals.hideBackButton = true
    res.render('404', { message })
  })

  app.use(function (err, req, res, next) {
    res.status(500)

    console.error(`☠️ Error => ${err.message}`)

    let message = false

    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'production') {
      message = `❌ ${err.message}`
    }

    res.locals.simpleRoute = (name, locale) => simpleRoute(name, locale)
    res.locals.hideBackButton = true
    res.render('500', { message })
  })
}
