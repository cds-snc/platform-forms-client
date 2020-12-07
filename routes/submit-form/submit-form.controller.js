const { routeUtils } = require('../../utils/index')

module.exports = (app, route) => {
  const name = route.name

  app.post('/submit-form', (req, res) => {
    const username = req.body.username
    console.log('in submit form', username, req.body)
    res.end()
  })

  app.get('/en', (req, res) => res.redirect(route.path.en))
  app.get('/fr', (req, res) => res.redirect(route.path.fr))

  route.draw(app).get(async (req, res) => {
    req.session.formdata = null
    res.render(
      name,
      routeUtils.getViewData(req, {
        title: res.__('intake-form.title'),
      }),
    )
  })
}
