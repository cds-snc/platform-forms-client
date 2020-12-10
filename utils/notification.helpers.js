const sendNotification = (formData, emailRecipient, notifyTemplateId) => {
  console.log('IN SEPARATE FILE SEND NOTIFICATION', emailRecipient)
  if (
    !(
      process.env.NOTIFY_API_KEY &&
      emailRecipient &&
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
    .sendEmail(notifyTemplateId, emailRecipient, {
      personalisation: formData,
    })
    .then((response) => console.log('Sent by email'))
    .catch((err) => console.error(err))
}

module.exports = {
  sendNotification,
}
