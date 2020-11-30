require('details-polyfill')

require('./feedback')
require('./button-link')
require('./check-cookies')

const jQuery = require('jquery')
window.$ = jQuery
window.jQuery = jQuery

require('./results-accordion')
