import { AppUser } from "@lib/types/user-types";

export const mockAppUser = (overrides: Partial<AppUser> = {}): AppUser => {
  const defaultUser: AppUser = {
    id: "test-user-id",
    email: "test@cds-snc.ca",
    name: "test",
    privileges: [],
    active: true,
    createdAt: new Date(),
  };

  return { ...defaultUser, ...overrides };
};
