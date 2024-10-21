import { User } from "@prisma/client";

export const mockUser = (overrides: Partial<User> = {}): User => {
  const defaultInvitation: User = {
    id: "1",
    email: "user@cds-snc.ca",
    name: "test user",
    image: "",
    emailVerified: new Date(),
    active: true,
    lastLogin: new Date(),
  };

  return { ...defaultInvitation, ...overrides };
};
