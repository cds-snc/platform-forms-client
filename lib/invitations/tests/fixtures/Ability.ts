import { createAbility } from "@lib/privileges";
import { UserAbility } from "@lib/types";
import { Base, mockUserPrivileges } from "__utils__/permissions";
import { Session } from "next-auth";

export const mockAbility = ({ userID }: { userID?: string } = {}): UserAbility => {
  const fakeSession = {
    user: {
      id: userID || "test-user-id",
      privileges: mockUserPrivileges(Base, { user: { id: userID || "test-user-id" } }), // @TODO: allow override privs
    },
  };

  return createAbility(fakeSession as Session);
};
