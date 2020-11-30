const { routeUtils, getDomain } = require('../../utils/index')

module.exports = (app, route) => {
  const name = route.name

  // redirect from "/" → "/start"
  app.get('/', (req, res) => {
    const domain = getDomain(req)

    // firefox keeps the session even after closing, so clear it here just in case
    if (req.session.history !== undefined && req.session.history.length > 0) {
      req.session.history = []
    }

    // if on the French domain, redirect to the /fr start page
    // istanbul ignore next
    if (domain.includes(process.env.DOMAIN_FR)) {
      return res.redirect(`${domain}${route.path.fr}`)
    }

    res.redirect(route.path[req.locale])
  })

  app.get('/en', (req, res) => res.redirect(route.path.en))
  app.get('/fr', (req, res) => res.redirect(route.path.fr))

  route.draw(app).get(async (req, res) => {
    req.session.formdata = null
    res.render(name, routeUtils.getViewData(req, {
      title: res.__('start.title'),
    }))
  })
}
