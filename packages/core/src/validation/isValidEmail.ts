export const isValidEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.([a-zA-Z0-9-]{2,}))+$/;

  if (!email) {
    return false;
  }

  const trimmedEmail = email.trim();

  // Check email length based on RFC 5321
  // https://www.rfc-editor.org/rfc/rfc5321#section-4.5.3
  if (trimmedEmail.length > 254) {
    return false;
  }

  return emailRegex.test(trimmedEmail);
};
