const { routeUtils } = require('./../../utils')
const { Schema } = require('./schema.js')

module.exports = (app, route) => {
  const name = route.name

  route
    .draw(app)
    .get((req, res) => {
      if (req.session.formdata === null || req.session.formdata === undefined || req.session.formdata.province === undefined) {
        req.session.province = ''
      } else {
        req.session.province = req.session.formdata.province
      }

      res.render(
        name,
        routeUtils.getViewData(req, {
          title: res.__('province.title'),
        }),
      )
    })
    .post(route.applySchema(Schema), route.doRedirect())
}
