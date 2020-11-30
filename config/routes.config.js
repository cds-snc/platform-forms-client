// 1) add your route(s) here ⬇️
const routes = [

  { name: 'welcome', path: { en: '/welcome', fr: '/bienvenue' } },
  { name: 'intake-form', path: { en: '/intake', fr: '/admission' } },  
  
  // c19 routes
  { name: 'start', path: { en: '/start', fr: '/debut' } },
  
  { name: 'prepare', path: { en: '/prepare', fr: '/preparer' } },
  
  // feedback
  { name: 'feedback', path: { en: '/feedback', fr: '/feedback' } },
  { name: 'feedback-thanks', path: { en: '/thanks', fr: '/merci' } },
  { name: 'feedback-error', path: { en: '/error', fr: '/erreur' } },

  // Healthcheck
  { name: 'healthcheck', path: { en:'/health-check', fr:'/verifier-la-sante'}},
]

const locales = ['en', 'fr']

// note: you can define and export a custom configRoutes function here
// see route.helpers.js which is where the default one is defined
// if configRoutes is defined here it will be used in pacle of the default

module.exports = {
  routes,
  locales,
}
