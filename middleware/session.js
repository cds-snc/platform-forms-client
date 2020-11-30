const uuidv4 = require('uuid').v4

const session = (req, res, next) => {
  // set a unique user id per session
  if (!req.session.id) req.session.id = uuidv4()

  // add user session req.locals so that the logger has access to it
  req.locals = { session: req.session }

  // remove the back button if the session has no history
  if (
    req.session === undefined ||
    req.session.history === undefined ||
    req.session.history.length === 0){
    res.locals.hideBackButton = true
  } else if(req.session.history[req.session.history.length - 1] === req.url){
    req.session.history.pop()
    if( req.session.history.length === 0){
      res.locals.hideBackButton = true
    }
  }

  next()
}

module.exports = {
  session,
}
