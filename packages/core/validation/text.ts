/**
 * Used to limit a form input fields' character length. Limiting the length stops potential attack
 * vectors and is a first step to help prevent hitting the Notify max character limit.
 * @param inputField form input field. e.g. input, textarea, checkbox, radio, etc.
 * @param maxCharacters charcter limit. Default is 10,000.
 * @returns true if the input field is too long, false otherwise. False is also returned if the
 * value type is not a string. e.g. file input value is an object.
 */
export const isInputTooLong = (inputField: string, maxCharacters = 10000): boolean => {
  return inputField?.length > maxCharacters;
};
