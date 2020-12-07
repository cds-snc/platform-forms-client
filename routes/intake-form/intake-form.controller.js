const { routeUtils } = require('./../../utils')
const { Schema } = require('./schema.js')

module.exports = (app, route) => {
  const name = route.name

  route
    .draw(app)
    .get((req, res) => {
      res.render(name, routeUtils.getViewData(req, {}))
    })
    .post((req, res) => {
      route.applySchema(Schema)

      const formData = req.body
      console.log(
        'INTAKE CONTROLLER stringify',
        JSON.stringify({ formData: formData }),
      )

      sendNotification(formData)

      return res.redirect(res.locals.routePath('confirmation'))
    })
}

const sendNotification = (formData) => {
  if (
    !(
      process.env.NOTIFY_API_KEY &&
      process.env.FEEDBACK_EMAIL_TO &&
      process.env.NOTIFY_ENDPOINT
    )
  ) {
    return
  }

  const NotifyClient = require('notifications-node-client').NotifyClient
  const notify = new NotifyClient(
    process.env.NOTIFY_ENDPOINT,
    process.env.NOTIFY_API_KEY,
  )
  notify
    .sendEmail(process.env.NOTIFY_TEMPLATE_ID, process.env.FEEDBACK_EMAIL_TO, {
      personalisation: formData,
    })
    .then((response) => console.log('Sent by email'))
    .catch((err) => console.error(err))
}
