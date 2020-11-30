const { routeUtils } = require('./../../utils')
const { Schema } = require('./schema.js')

module.exports = (app, route) => {
  const name = route.name

  route.draw(app)
    .get((req, res) => {
      res.render(name, routeUtils.getViewData(req, {
        title: res.__('rrif.title'),
      }))
    })
    .post(route.applySchema(Schema), (req, res) => {
      return res.redirect(res.locals.routePath('question-mortgage-payments'))
    })
}
