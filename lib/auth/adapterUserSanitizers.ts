import { AdapterUser } from "next-auth/adapters";

/*
 * These functions sanitize user data before it's sent to the NextAuth adapter. They ensure that only valid fields are included and that the data types are correct.
 */
export const sanitizeAdapterCreateUser = (user: AdapterUser): AdapterUser => {
  return {
    id: user.id,
    email: user.email,
    name: typeof user.name === "string" || user.name === null ? user.name : null,
    image: typeof user.image === "string" || user.image === null ? user.image : null,
    emailVerified:
      user.emailVerified instanceof Date || user.emailVerified === null ? user.emailVerified : null,
  };
};

export const sanitizeAdapterUpdateUser = (
  user: Partial<AdapterUser> & Pick<AdapterUser, "id">
): Partial<AdapterUser> & Pick<AdapterUser, "id"> => {
  const sanitizedUser: Partial<AdapterUser> & Pick<AdapterUser, "id"> = { id: user.id };

  if (typeof user.email === "string") sanitizedUser.email = user.email;
  if (typeof user.name === "string" || user.name === null) sanitizedUser.name = user.name;
  if (typeof user.image === "string" || user.image === null) sanitizedUser.image = user.image;
  if (user.emailVerified instanceof Date || user.emailVerified === null) {
    sanitizedUser.emailVerified = user.emailVerified;
  }

  return sanitizedUser;
};
