const path = require('path')
const url = require('url');

const { checkSchema } = require('express-validator')
const { checkErrors } = require('./validate.helpers')
const { addViewPath } = require('./view.helpers')
const { routes } = require('../config/routes.config')

const simpleRoute = (name, lang, testMode = false) => {
  if (!name) {
    throw new Error('Route helper: missing name argument')
  }

  const language = lang || 'en'
  const route = routes.find(rt => rt.name === name)
  const path = route.path[language]

  if (testMode){
    return language + path
  }
  return path
}

class RoutingTable {
  /**
   * A routing table, based on the user's configured routes from
   * routes.config.js. Can have arbitrary keys set via the `conf`
   * parameter. In particular, this parameter allows setting the
   * directory for the route files, by default `./routes` from the
   * project root.
   */
  constructor(routes, locales, conf) {
    Object.assign(this, conf)
    this.locales = locales
    this.directory = path.resolve(this.directory || './routes')
    this.routes = routes.map((r, i) => new Route(this, i, r))
  }

  /**
   * Returns a route given a route name
   */
  get(name) { return this.routes.find(r => r.name === name) }

  /**
   * Attach the route controllers to an app.
   */
  config(app) {
    this.routes.forEach(r => r.config(app))
    require(`${this.directory}/global/global.controller`)(app, this)
    return this
  }
}

class Route {
  /**
   * A route is a single element of a routing table. It contains
   * a back-reference to the table, as well as an index in that
   * table, for use with `.prev` and `.next`, to find adjacent
   * routes in the same table. `conf` is the user's configuration
   * object, which we will expect to contain `.name` and `.path`
   * at minimum, but can also contain other configuration keys.
   */
  constructor(table, index, conf) {
    this.table = table
    this.index = index
    Object.assign(this, conf)

    // if path is specified as a string, turn it into { en: ..., fr: ... }
    // so the api is consistent
    if (typeof this.path === 'string') {
      const globalPath = this.path
      this.path = {}
      this.table.locales.forEach(l => { this.path[l] = globalPath })
    }

    // prepend the locale (/en, /fr) to each path
    this.table.locales.forEach(l => { this.path[l] = `/${l}${this.path[l]}` })
  }

  // an alias for RoutingTable::get
  get(routeName) { return this.table.get(routeName) }

  draw(app) {
    return new DrawRoutes(this, app)
  }

  // paths to load files during setup
  get directory() { return `${this.table.directory}/${this.name}` }
  get controllerPath() { return `${this.directory}/${this.name}.controller` }

  // the adjacent routes from the same table
  get next() { return this.table.routes[this.index + 1] }
  get prev() { return this.table.routes[this.index - 1] }

  // helpers for the path of the next / previous route
  get nextPath() { return this.next && this.next.path }
  get prevPath() { return this.prev && this.prev.path }

  eachLocale(fn) {
    return this.table.locales.forEach(locale => fn(this.path[locale], locale))
  }

  // a URL for this route, given a query
  url(locale, query={}) {
    return url.format({
      pathname: this.path[locale],
      query: query,
    })
  }

  // set up this route's controller in an Express app
  config(app) {
    addViewPath(app, this.directory)
    require(this.controllerPath)(app, this)
    return this
  }

  /**
   * The default middleware for this route, intended
   * for the POST method.
   */
  defaultMiddleware(opts) {
    return [
      ...this.applySchema(opts.schema),
      this.doRedirect(opts.computeNext),
    ]
  }

  applySchema(schema) {
    return [checkSchema(schema), checkErrors(this.name)]
  }

  doRedirect(redirectTo = null) {
    return (req, res, next) => {
      if (req.body.json) return next()

      if (typeof redirectTo === 'function') redirectTo = redirectTo(req, res, this)
      if (!redirectTo) redirectTo = this.next
      if (typeof redirectTo === 'string') redirectTo = this.get(redirectTo)
      res.redirect(redirectTo.url(req.locale))
    }
  }
}

class DrawRoutes {
  constructor(route, app) {
    this.route = route
    this.app = app
  }

  request(method, ...args) {
    this.route.eachLocale((path, locale) => {
      this.app[method](path, routeMiddleware(this.route, locale), ...args)
    })

    return this
  }

  get(...args) { return this.request('get', ...args) }
  post(...args) { return this.request('post', ...args) }
  put(...args) { return this.request('put', ...args) }
  delete(...args) { return this.request('delete', ...args) }
}

const oneHour = 1000 * 60 * 60 * 1
const routeMiddleware = (route, locale) => (req, res, next) => {
  res.cookie('lang', locale, {
    httpOnly: true,
    maxAge: oneHour,
    sameSite: 'strict',
  })

  res.setLocale(locale)

  res.locals.route = route
  res.locals.routePath = (nameOrObj) => {
    if (typeof nameOrObj === 'string') nameOrObj = route.get(nameOrObj)
    return nameOrObj.path[locale]
  }

  return next()
}

/**
 * @returns a new routing table
 */
const makeRoutingTable = (routes, locales, opts={}) => new RoutingTable(routes, locales, opts)

/**
 * The default `configRoutes` function
 */
const configRoutes = (app, routes, locales, opts={}) => {
  // require the controllers defined in the routes
  // dir and file name based on the route name
  return makeRoutingTable(routes, locales, opts).config(app)
}

module.exports = {
  makeRoutingTable,
  configRoutes,
  simpleRoute,
}
