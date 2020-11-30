const { routeUtils } = require('./../../utils')
const { Schema } = require('./schema.js')
const { pruneSessionData } = require('../../utils/session.helpers')


module.exports = (app, route) => {
  const name = route.name

  route.draw(app)
    .get((req, res) => {
      res.render(name, routeUtils.getViewData(req, {
        title: res.__('unchanged_income.title'),
      }))
    })
    .post(route.applySchema(Schema), postUnchangedIncome)
}

const postUnchangedIncome = (req, res) => {

  pruneSessionData(req, ['some_income', 'no_income', 'gross_income', 'income-earned'])

  if (['wfh', 'paid-leave', 'student_2019_20', 'high_school_grad','none-of-the-above'].includes(req.body.unchanged_income)) {
    // prune rrif since we won't go down that path
    pruneSessionData(req, ['rrif'])
    return res.redirect(res.locals.routePath('question-mortgage-payments'))
  }

  if (req.body.unchanged_income === 'retired') {
    return res.redirect(res.locals.routePath('question-rrif'))
  }

}