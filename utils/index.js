const routeHelpers = require('./route.helpers.js')
const dataHelpers = require('./data.helpers.js')
const sessionHelpers = require('./session.helpers.js')
const urlHelpers = require('./url.helpers.js')
const validateHelpers = require('./validate.helpers.js')
const viewHelpers = require('./view.helpers.js')
const flashMessageHelpers = require('./flash.message.helpers')
const loadHelpers = require('./load.helpers')
const history = require('./history.helpers')

module.exports = {
  ...routeHelpers,
  ...viewHelpers,
  ...sessionHelpers,
  ...urlHelpers,
  ...validateHelpers,
  ...viewHelpers,
  ...flashMessageHelpers,
  ...dataHelpers,
  ...loadHelpers,
  ...history,
}

const { getRouteByName } = require('./route.helpers')
const { addViewPath } = require('./view.helpers')
const { getViewData } = require('./data.helpers')
const { getDefaultMiddleware } = require('./route.helpers')

module.exports.routeUtils = {
  getRouteByName,
  addViewPath,
  getViewData,
  getDefaultMiddleware,
}
