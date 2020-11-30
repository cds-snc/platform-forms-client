const locale = document.documentElement.lang || 'en';

const locales = {
  'en': require('../../locales/en.json'),
  'fr': require('../../locales/fr.json'),
}
const __ = (key) => {
  return locales[locale][key] || '[MISSING TRANSLATION STRING]'
}

module.exports = {
  __,
}