// ⚠️ experimental

const getFlashMessage = req => {
  if (!req || !req.session) return null
  const message = req.session.flashmessage
  clearFlashMessageContent(req)
  return message
}

const setFlashMessageContent = (req, obj) => {
  req.session.flashmessage = obj
}

const clearFlashMessageContent = req => {
  req.session.flashmessage = false
}

module.exports = {
  getFlashMessage,
  setFlashMessageContent,
  clearFlashMessageContent,
}
