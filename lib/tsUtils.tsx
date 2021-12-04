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
 * This function checks if a given email is a government valid email.
 * And it returns true if the email is a valid GC email otherwise false.
 * @param email A valid government email
 * @param domains The list of GC domains
 * @returns {boolean} The validation result
 */
export const isValidGovEmail = (email: string, domains: string[]): boolean => {
  const reg = new RegExp(
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.([a-zA-Z0-9-]{2,}))+$"
  );
  if (!email || !domains || !reg.test(email)) {
    return false;
  }
  //Get the domain from email
  const emailDomain = email.substring(email.lastIndexOf("@") + 1);
  //Check the email's domain against the list of domains
  return domains.includes(emailDomain.toString());
};
