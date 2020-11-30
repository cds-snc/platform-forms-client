const getLocale = () => {
  return document.documentElement.lang || 'en'
}

const form = document.getElementById('feedback-form')
const confirmation = document.getElementById('feedback-confirmation')
const errorMsg = document.getElementById('feedback-error')
const submitErrorMsg = document.getElementById('feedback-submit-error')

function isEmpty(iter) {
  const values = [...iter]
  if (values.length > 2) {
    return false
  }

  if (values.every(ele => (ele[0] === '_csrf' || (ele[0] === 'details' && ele[1] === '')))) {
    return true;
  }

  return false;
}

const submitFeedback = (event) => {
  event.preventDefault()

  // eslint-disable-next-line no-undef
  const data = new URLSearchParams(new FormData(form))


  if (isEmpty(data.entries())) {
    submitErrorMsg.classList.remove('hidden')
    submitErrorMsg.focus({preventScroll : false})
    return
  }

  // eslint-disable-next-line no-undef
  fetch(`/${getLocale()}/feedback`, {
    method: 'POST',
    body: data,
  })
    .then((response) => {
      if (response.ok) {
        form.classList.add('hidden')
        confirmation.classList.remove('hidden')
      }
    })
    .catch((error) => {
      console.log(error)
      errorMsg.classList.remove('hidden')
    })
}

if (form) {
  // intercept the form submit
  form.addEventListener('submit', submitFeedback)
}

var feedbackContainer = document.getElementsByClassName('feedback-container')[0];

if (feedbackContainer) {
  feedbackContainer.className = feedbackContainer.className.replace(/\bno-js\b/g, "");
}