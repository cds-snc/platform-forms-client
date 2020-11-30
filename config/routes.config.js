// 1) add your route(s) here ⬇️
const routes = [

  { name: 'welcome', path: { en: '/welcome', fr: '/bienvenue' } },
  { name: 'intake-form', path: { en: '/intake', fr: '/admission' } },  
  
  // c19 routes
  { name: 'start', path: { en: '/start', fr: '/debut' } },
  { name: 'question-province', path: { en: '/province', fr: '/province' } },
  { name: 'question-lost-job', path: { en: '/lost-job', fr: '/perte-emploi' } },

  // main sorting
  { name: 'question-your-situation-no-income', path: { en: '/your-situation/no-income', fr: '/votre-situation/aucun-revenu' } },
  { name: 'question-your-situation-some-income', path: { en: '/your-situation/some-income', fr: '/votre-situation/revenu-partiel' } },
  { name: 'question-your-situation-unchanged-income', path: { en: '/your-situation/unchanged-income', fr: '/votre-situation/revenu-intact' } },

  // everyone ends up here (not sure of order?)
  { name: 'question-mortgage-payments', path: { en: '/mortgage-payments', fr: '/paiement-hypothecaire' } },
  { name: 'question-ccb', path: { en: '/CCB', fr: '/ARC' } },
  { name: 'question-student-debt', path: { en: '/student-debt', fr: '/dette-des-etudiants' } },
  { name: 'question-plans-for-school', path: { en: '/plans-for-school', fr: '/poursuivre-vos-etudes' } },
  { name: 'question-oas', path: { en: '/oas', fr: '/sv' } },
  { name: 'question-dtc', path: { en: '/dtc', fr: '/ciph' } },

  { name: 'prepare', path: { en: '/prepare', fr: '/preparer' } },
  { name: 'results', path: { en: '/results', fr: '/resultats' } },

  // retirees only
  { name: 'question-rrif', path: { en: '/RRIF', fr: '/FERR' } },

  // 3a/b lost income fork
  { name: 'question-gross-income', path: { en: '/gross-income', fr: '/revenu-brut' } },

  { name: 'question-reduced-income', path: { en: '/reduced-income', fr: '/revenu-partiel' } },

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
