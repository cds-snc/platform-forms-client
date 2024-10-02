import { AppUser } from "@lib/types/user-types";

export const mockAppUser = (overrides: Partial<AppUser> = {}): AppUser => {
  const defaultUser: AppUser = {
    id: "1",
    email: "test@cds-snc.ca",
    name: "test",
    privileges: [],
    active: true,
  };

  return { ...defaultUser, ...overrides };
};
