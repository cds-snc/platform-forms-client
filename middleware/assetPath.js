const assetPath = (app) => function (req, res, next) {
  /**
 * Create an asset path helper for templates
 * If a CDN_PREFIX is set in env, the helper 
 * will return the path with the CDN prefix,
 * otherwise it just returns the path with 
 * current protocol and host prefix
 */
  app.locals.asset = (path) => {
    const assetPrefix = process.env.CDN_PREFIX || '//' + req.get('host');

    return req.protocol + ':' + assetPrefix + path;
  }
  next();
}

module.exports = {
  assetPath,
}
