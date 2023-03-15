/**
 * Scrolls an element with overflow to its bottom.
 *
 * @param containerEl container element that has the overflow-y set on it
 * @returns undefined
 */
export const scrollToBottom = (containerEl: HTMLElement) => {
  if (!containerEl) {
    return;
  }
  const scrollHeight = containerEl.scrollHeight;
  if (containerEl.scrollTo !== undefined) {
    containerEl.scrollTo({
      top: scrollHeight,
      left: 0,
      behavior: "smooth",
    });
  }
};

/**
 * Like a UUID but smaller and not as unique. So best to append this to the element name.
 * e.g. id = `myElementName-${randomId()}`
 *
 * @returns a random number
 */
export const randomId = () => {
  return Math.random().toString(36).substr(2, 9);
};
