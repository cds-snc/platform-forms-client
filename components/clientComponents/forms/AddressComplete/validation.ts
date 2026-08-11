
// Canada Post IDs are alphanumeric with pipe separators e.g. "CA|CP|A|1234567"
const CANADA_POST_ID_PATTERN = /^[\w|]+$/;
export const MAX_CANADA_POST_ID_LENGTH = 64;
export const isValidCanadaPostId = (id: string): boolean => {
  return id.length > 0 && id.length <= MAX_CANADA_POST_ID_LENGTH && CANADA_POST_ID_PATTERN.test(id);
};

const COUNTRY_CODE_PATTERN = /^[A-Z]{2,3}$/;
export const isValidCountryCode = (code: string): boolean => {
  return COUNTRY_CODE_PATTERN.test(code);
};

const ALLOWED_LANGUAGES = ["en", "fr"] as const;
export const isValidLanguage = (lang: string): boolean => {
  return (ALLOWED_LANGUAGES as readonly string[]).includes(lang);
};

// format used by Prisma-generated form IDs
const FORM_ID_PATTERN = /^[a-z0-9]{20,40}$/;
export const isValidFormId = (id: string): boolean => {
  return FORM_ID_PATTERN.test(id);
}
