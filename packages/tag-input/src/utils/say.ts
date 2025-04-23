export const say = (
  phrase: string,
  container: HTMLElement,
  settings = {
    prefix: "tag-input",
  }
) => {
  // const container = this.tagInput.parentNode;
  const oldRegion = container.querySelector(`[id^="${settings.prefix}-live-region-"]`);

  if (oldRegion) {
    container.removeChild(oldRegion);
  }

  const newRegion = document.createElement("span");

  newRegion.id = `${settings.prefix}-live-region-${rand()}`;
  newRegion.setAttribute("aria-live", "assertive");
  newRegion.setAttribute("role", "alert");
  visuallyHide(newRegion);
  container.appendChild(newRegion);
  newRegion.textContent = phrase;
};

/**
 * Hides an element visually, but keeps it accessible for screen readers.
 *
 * @param {HTMLElement} el Element.
 * @returns {undefined}
 */
function visuallyHide(el: HTMLElement) {
  el.style.clip = "1px, 1px, 1px, 1px";
  el.style.height = "1px";
  el.style.width = "1px";
  el.style.overflow = "hidden";
  el.style.position = "absolute";
  el.style.whiteSpace = "nowrap";
}

/**
 * Simple random number generator.
 *
 * @returns {number}
 */
function rand() {
  return Math.floor(Math.random() * 10000);
}
