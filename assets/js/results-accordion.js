
const details = document.querySelectorAll(".benefits--unavailable details");

details.forEach((targetDetail) => {
  targetDetail.removeAttribute('open');
});

const container = document.querySelector('.benefits--unavailable .benefits__list');

if (container) {
  container.classList.add('hidden');

  const expando = document.getElementById('unavailableBenefitsButton');
  if (expando) {
    expando.classList.remove('hidden');

    expando.addEventListener("click", () => {
      if (expando.getAttribute('aria-expanded') === 'true') {
        container.classList.add('hidden')
        container.setAttribute('aria-hidden', true)
        expando.setAttribute('aria-expanded', false)
        expando.querySelector('span.closed').classList.remove('hidden')
        expando.querySelector('span.open').classList.add('hidden')
      } else {
        container.classList.remove('hidden')
        container.setAttribute('aria-hidden', false)
        expando.setAttribute('aria-expanded', true)
        expando.querySelector('span.closed').classList.add('hidden')
        expando.querySelector('span.open').classList.remove('hidden')
      }
    });
  }
}