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
          title: res.__('some_income.title'),
        }),
      )
    })
    .post(route.applySchema(Schema), postSomeIncome)
}

const postSomeIncome = (req, res) => {
  pruneSessionData(req, ['no_income', 'unchanged_income'])
  if (
    [
      'hours-reduced',
      'selfemployed-some-income',
      'employed-lost-a-job',
    ].includes(req.body.some_income)
  ) {
    pruneSessionData(req, ['gross-income', 'rrif'])
    return res.redirect(res.locals.routePath('question-reduced-income'))
  }

  if (['quarantine','none-of-the-above'].includes(req.body.some_income)) {
    pruneSessionData(req, ['rrif', 'reduced-income', 'gross-income'])
    return res.redirect(res.locals.routePath('question-mortgage-payments'))
  }

  if (req.body.some_income === 'retired') {
    pruneSessionData(req, ['reduced-income'])
    return res.redirect(res.locals.routePath('question-gross-income'))
  }
}
