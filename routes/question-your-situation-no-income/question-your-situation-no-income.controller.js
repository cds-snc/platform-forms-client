const { routeUtils } = require('./../../utils')
const { Schema } = require('./schema.js')
const { pruneSessionData } = require('../../utils/session.helpers')

module.exports = (app, route) => {
  const name = route.name

  route
    .draw(app)
    .get((req, res) => {
      res.render(
        name,
        routeUtils.getViewData(req, {
          title: res.__('no_income.title'),
        }),
      )
    })
    .post(route.applySchema(Schema), postNoIncome)
}

const postNoIncome = (req, res) => {
  // prune the paths you can't go down on this route
  pruneSessionData(req, [
    'some_income',
    'unchanged_income',
    'reduced-income',
    'rrif',
    'gross_income',
  ])
  return res.redirect(res.locals.routePath('question-mortgage-payments'))
}
