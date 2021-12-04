export function hasOwnProperty<X extends Record<string, unknown>, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export const isServer = (): boolean => {
  return typeof window === "undefined";
};

/**
 * Check if an email has GC valid domain name.
 * It returns true if emai is a valid GC email otherwise false.
 * @param email
 * @param extensions
 * @returns boolean
 */
export const isValidGovEmail = (email: string, domains: string[]): boolean => {
  const reg = new RegExp(
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.([a-zA-Z0-9-]{2,}))+$"
  );
  if (!email || !domains || !reg.test(email)) {
    return false;
  }
  //Get domain i.e gc.ca
  const emailDomain = email.substring(email.lastIndexOf("@") + 1);
  //EmailDomain exists
  return domains.includes(emailDomain.toString());
};
