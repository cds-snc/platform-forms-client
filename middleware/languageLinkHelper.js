const languageLinkHelper  = (app) => function (req, res, next) {
  const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  const url = new URL(fullUrl);
  const querystring = url.search;

  app.locals.getTranslatedRoute = (route, lang) => {
    return route.path[lang] + querystring;
  }
  next()
}

module.exports = {
  languageLinkHelper,
}