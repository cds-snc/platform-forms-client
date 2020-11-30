const { routeUtils } = require('./../../utils')
const { Schema } = require('./schema.js')

module.exports = (app, route) => {
  const name = route.name

  route.draw(app)
    .get((req, res) => {
      res.render(name, routeUtils.getViewData(req, {
        title: res.__("oas.title"),
      }))
    })
    .post(route.applySchema(Schema), (req, res) => {

      let path
      if (req.locals.featureFlags.enableDtc){
        path = res.locals.routePath('question-dtc')
      } else {
        path = res.locals.routePath('prepare')
      }


      return res.redirect(path)
    })
}
