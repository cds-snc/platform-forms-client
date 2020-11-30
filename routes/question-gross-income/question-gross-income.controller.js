const { routeUtils } = require('./../../utils')
const { Schema } = require('./schema.js')

module.exports = (app, route) => {
  const name = route.name

  route.draw(app)
    .get((req, res) => {
      res.render(name, routeUtils.getViewData(req, {
        title: res.__('gross_income.title'),
      }))
    })
    .post(route.applySchema(Schema), (req, res) => {
      if (req.session.formdata.some_income && req.session.formdata.some_income === 'retired') {
        return res.redirect(res.locals.routePath('question-rrif'))
      }

      return res.redirect(res.locals.routePath('question-mortgage-payments'))
    })
}
