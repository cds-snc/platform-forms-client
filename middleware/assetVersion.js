const assetVersion = (app) => function (req, res, next) {
  /**
   * Used to append the apps version to the end of an asset declaration in a view
   * Will invalidate older versions of that asset.
   */
  app.locals.assetVersion = () => {
    const id = process.env.TAG_VERSION;
    return id;
  }
  next();
}


module.exports = {
  assetVersion,
}
