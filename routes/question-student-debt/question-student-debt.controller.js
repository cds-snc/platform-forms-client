const { routeUtils } = require('../../utils')
const { Schema } = require('./schema.js')

module.exports = (app, route) => {
  const name = route.name

  route.draw(app)
    .get((req, res) => {
      res.render(name, routeUtils.getViewData(req, {
        title: res.__('student_debt.title'),
      }))
    })
    .post(route.applySchema(Schema), route.doRedirect())
}
