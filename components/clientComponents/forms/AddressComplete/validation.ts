// Another option would be to use the general max of 1000 in valation with isFieldResponseValid()

// What if a user has a typo and accidently goes over e.g. 20 characters for postal code, or 200 for street address? -- maybe much more generous is better?

export const MAX_SEARCH_QUERY_LENGTH = 200;
export const MAX_CANADA_POST_ID_LENGTH = 64;
export const MAX_COUNTRY_CODE_LENGTH = 3;
export const MAX_ADDRESS_FIELD_LENGTH = 200;
export const MAX_POSTAL_CODE_LENGTH = 20;

// Note: could also use Zod but seems like overkill unless adopt project wide

// Instead of truncating, showing an error may be better in both server + client

const truncate = (value: string, maxLength: number): string => {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
};

const sanitizeString = (value: string): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

export const sanitizeAddressField = (value: string): string => {
  return truncate(sanitizeString(value), MAX_ADDRESS_FIELD_LENGTH);
};

export const sanitizeQuery = (value: string): string => {
  return truncate(sanitizeString(value), MAX_SEARCH_QUERY_LENGTH);
};

export const sanitizeCountryCode = (value: string): string => {
  return truncate(sanitizeString(value), MAX_COUNTRY_CODE_LENGTH);
};

export const sanitizePostalCode = (value: string): string => {
  return truncate(sanitizeString(value), MAX_POSTAL_CODE_LENGTH);
};

// Canada Post IDs are alphanumeric with pipe separators e.g. "CA|CP|A|1234567"
const CANADA_POST_ID_PATTERN = /^[\w|]+$/;
export const isValidCanadaPostId = (id: string): boolean => {
  return id.length > 0 && id.length <= MAX_CANADA_POST_ID_LENGTH && CANADA_POST_ID_PATTERN.test(id);
};
