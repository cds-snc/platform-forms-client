/* istanbul ignore file */
module.exports = (app, route) => {
  route.draw(app).post((req, res) => {
    const date = new Date()

    const problems = req.body.problems || []

    const url = new URL(req.headers.referer)

    if (req.session.history === undefined){
      req.session.history = []
    }
    req.session.history.push(url.pathname)

    if (problems.length === 0 && (req.body.details === undefined || req.body.details === '')) {
      console.log('redirecting to feedback-error')
      return res.redirect(res.locals.routePath('feedback-error'))
    }

    const feedback = {
      incorrect_info: +problems.includes('incorrect_info'),
      confusing_info: +problems.includes('confusing_info'),
      didnt_find: +problems.includes('didnt_find'),
      a11y_issue: +problems.includes('a11y_issue'),
      privacy_concerns: +problems.includes('privacy_concerns'),
      dont_know: +problems.includes('dont_know'),
      other_issue: +problems.includes('other_issue'),
      session: req.locals.session.id || 'n/a',
      version: process.env.GITHUB_SHA || 'n/a',
      url: req.headers.referer || req.headers.referrer || 'n/a',
      path: url.pathname,
      date: date.toISOString(),
      language: res.locals.getLocale(),
    }

    if (req.locals.featureFlags.enableFreetext) {
      feedback.details =  req.body.details || 'n/a'
    } else {
      feedback.details =  'disabled'
    }

    console.log(JSON.stringify({ feedback: feedback }))

    sendNotification(feedback)

    return res.redirect(res.locals.routePath('feedback-thanks'))
  })
}

const sendNotification = (feedback) => {
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
    .sendEmail(
      '111f0bc5-8682-4df1-9e16-d73e86bea46d',
      process.env.FEEDBACK_EMAIL_TO,
      {
        personalisation: feedback,
      },
    )
    .then((response) => console.log('Sent by email'))
    .catch((err) => console.error(err))
}
