
const { getDomain } = require('../utils')
const domainRedirector = function (req, res, next) {
  // if not running on production azure, skip this
  if (process.env.SLOT_NAME !== 'default') return next()

  const domain = getDomain(req)

  // if `/fr/` appears in the path for the english domain, redirect to DOMAIN_FR
  if (req.path.startsWith('/fr/') && domain.includes(process.env.DOMAIN_EN))
    return res.redirect(`https://${process.env.DOMAIN_FR}${req.path}`)

  // if `/en/` appears in the path for the french domain, redirect to DOMAIN_EN
  if (req.path.startsWith('/en/') && domain.includes(process.env.DOMAIN_FR))
    return res.redirect(`https://${process.env.DOMAIN_EN}${req.path}`)

  next()
}

module.exports = {
  domainRedirector,
}