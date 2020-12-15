const { routeUtils } = require('./../../utils')
const { Schema } = require('./schema.js')

module.exports = (app, route) => {
  const name = route.name

  route
    .draw(app)
    .get((req, res) => {
      if (req.session && req.session.formdata) {
        // Clear previous form submissions
        if (
          req.session.history !== undefined &&
          req.session.history.length > 0
        ) {
          req.session.history = []
        }
        req.session.formdata = null
      }
      res.render(name, routeUtils.getViewData(req, {}))
    })
    .post(route.applySchema(Schema), (req, res) => {
      return res.redirect(res.locals.routePath('ssc-tech-2'))
    })
}
