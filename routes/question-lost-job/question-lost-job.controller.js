const { routeUtils } = require('./../../utils')
const { Schema } = require('./schema.js')

module.exports = (app, route) => {
  const name = route.name

  route.draw(app)
    .get((req, res) => {
      res.render(name, routeUtils.getViewData(req, {
        title: res.__('lost_job.title'),
      }))
    })
    .post(route.applySchema(Schema), postLostJob)
}

const postLostJob = (req, res) => {
  // validator should catch if it's not 1,2, or 3
  if (req.body.lost_job === 'lost-all-income') {
    return res.redirect(res.locals.routePath('question-your-situation-no-income'))
  }

  if (req.body.lost_job === 'lost-some-income') {
    return res.redirect(res.locals.routePath('question-your-situation-some-income'))
  }

  return res.redirect(res.locals.routePath('question-your-situation-unchanged-income'))

}
