// Canada Post IDs are alphanumeric with pipe separators e.g. "CA|CP|A|1234567"
const CANADA_POST_ID_PATTERN = /^[\w|]+$/;
export const MAX_CANADA_POST_ID_LENGTH = 64;
export const isValidCanadaPostId = (id: string): boolean => {
  return id.length > 0 && id.length <= MAX_CANADA_POST_ID_LENGTH && CANADA_POST_ID_PATTERN.test(id);
};
