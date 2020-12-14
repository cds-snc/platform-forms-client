// 1) add your route(s) here ⬇️
const routes = [
  { name: 'welcome', path: { en: '/welcome', fr: '/bienvenue' } },
  { name: 'intake-form', path: { en: '/intake', fr: '/admission' } },
  { name: 'ssc-tech', path: { en: '/ssc-tech', fr: '/spc-tech' } },
  { name: 'ssc-tech-2', path: { en: '/ssc-tech-2', fr: '/spc-tech-2' } },
  { name: 'ssc-tech-3', path: { en: '/ssc-tech-3', fr: '/spc-tech-3' } },
  { name: 'ssc-tech-4', path: { en: '/ssc-tech-4', fr: '/spc-tech-4' } },
  { name: 'ssc-tech-5', path: { en: '/ssc-tech-5', fr: '/spc-tech-5' } },
  { name: 'confirmation', path: '/confirmation' },

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
