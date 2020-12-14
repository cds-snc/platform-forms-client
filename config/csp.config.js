// docs: https://helmetjs.github.io/docs/csp/

const scriptSrc = [
  "'self'",
  'cdnjs.cloudflare.com',
  '*.herokuapp.com',
  "'unsafe-inline'",
  'sitecatalyst.omniture.com',
]

let upgradeInsecureRequests = true

if (process.env.NODE_ENV === 'development') {
  scriptSrc.push("'unsafe-eval'")
  upgradeInsecureRequests = false
}

module.exports = {
  defaultSrc: [
    "'self'",
    '*.omniture.com',
    '*.2o7.net',
  ],
  scriptSrc: scriptSrc,
  baseUri: ["'none'"],
  connectSrc: [
    "'self'",
    '*.demdex.net',
    'cm.everesttech.net',
    '*.omtrdc.net',
  ],
  fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  frameSrc: ["'self'", '*.demdex.net'],
  imgSrc: [
    "'self'",
    'data:',
    '*.demdex.net',
    'cm.everesttech.net',
    '*.omtrdc.net',
  ],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  upgradeInsecureRequests,
}
