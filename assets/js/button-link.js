// make "button links" behave like buttons
var elements = document.querySelectorAll('a.button-link')
for (var i = 0, len = elements.length; i < len; i++) {
  elements[i].addEventListener('keydown', function (e) {
    if (e.keyCode === 32) {
      e
        .target
        .click()
    }
  })
}