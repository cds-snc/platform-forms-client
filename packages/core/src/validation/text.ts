// The hard limit for input field character length.
const inputLimit = 10000;

/**
 * Used to limit a form input fields' character length. Limiting the length stops potential attack
 * vectors and is a first step to help prevent hitting the Notify max character limit.
 * @param inputField form input field. e.g. input, textarea, checkbox, radio, etc.
 * @param maxCharacters charcter limit. Default is 10,000.
 * @returns true if the input field is too long, false otherwise. False is also returned if the
 * value type is not a string. e.g. file input value is an object.
 */
export const isInputTooLong = (inputField: string, maxCharacters = inputLimit): boolean => {
  return inputLengthOverLimit(inputField, maxCharacters) > 0;
};

/**
 * Used to calculate how many characters a form input field exceeds the specified limit, for reporting or validation purposes.
 * @param inputField form input field. e.g. input, textarea, checkbox, radio, etc.
 * @param maxCharacters charcter limit. Default is 10,000.
 * @returns number of characters over the limit. Returns 0 if the input is within the limit.
 */
export const inputLengthOverLimit = (inputField: string, maxCharacters = inputLimit): number => {
  return Math.max(0, inputField?.length - maxCharacters);
};

/**
 * Used to calculate the number of words a form input field has.
 * @param inputField form input field. e.g. input, textarea, checkbox, radio, etc.
 * @returns number of words in the input field. Returns 0 if the input is empty or not a string.  
 */
export const wordCount = (inputField: string): number => {
  if (typeof inputField !== "string" || !inputField.trim()) {
    return 0;
  }
  return inputField.trim().split(/\s+/).length;
};

/**
 * Used to evaluate if a form input field exceeds the specified word limit.
 * @param inputField form input field. e.g. input, textarea, checkbox, radio, etc.
 * @param maxWords word limit.
 * @returns true if the input field exceeds the word limit, false otherwise.
 */
export const isWordCountTooHigh = (inputField: string, maxWords: number): boolean => {
  return wordCount(inputField) > maxWords;
};
