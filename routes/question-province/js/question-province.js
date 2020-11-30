// your js code here

import accessibleAutocomplete from 'accessible-autocomplete'

accessibleAutocomplete.enhanceSelectElement({
  selectElement: document.querySelector('#province-select'),
  showAllValues: true,
  showNoOptionsFound: false,
})