const { routeUtils } = require('./../../utils')
const { Schema } = require('./schema.js')

module.exports = (app, route) => {
  const name = route.name

  route
    .draw(app)
    .get((req, res) => {
      res.render(name, routeUtils.getViewData(req, {}))
    })
    .post(route.applySchema(Schema), (req, res) => {
      const formData = req.body
      return res.redirect(res.locals.routePath('ssc-tech-3'))
    })
}
