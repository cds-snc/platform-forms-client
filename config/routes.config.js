// 1) add your route(s) here ⬇️
const routes = [
  { name: 'welcome', path: { en: '/welcome', fr: '/bienvenue' } },
  { name: 'intake-form', path: { en: '/intake', fr: '/admission' } },

  // Healthcheck
  {
    name: 'healthcheck',
    path: { en: '/health-check', fr: '/verifier-la-sante' },
  },
]

const locales = ['en', 'fr']

// note: you can define and export a custom configRoutes function here
// see route.helpers.js which is where the default one is defined
// if configRoutes is defined here it will be used in pacle of the default

module.exports = {
  routes,
  locales,
}
