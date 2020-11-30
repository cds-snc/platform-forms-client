const { getSessionData } = require('../../utils')

module.exports = (app, route) => {
  route.draw(app)
    .get((req, res) => {
      // serialize the data object and throw it up on url
      const data = getSessionData(req)
      // Please note this is purely for obfuscating the language and is not meant to secure
      // if this scales up we will need to look at a way to represent the values in a bilingual way
      const encoded = { q: Buffer.from(JSON.stringify(data)).toString('base64')};
      const benefitsParam = new URLSearchParams(encoded);


      // then redirect to results
      return res.redirect(res.locals.routePath('results') + '?' + benefitsParam);
    })
}
