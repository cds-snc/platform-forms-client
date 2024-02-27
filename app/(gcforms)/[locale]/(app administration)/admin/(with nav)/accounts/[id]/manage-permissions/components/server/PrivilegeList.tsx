import { serverTranslation } from "@i18n";
import { AppUser } from "@lib/types/user-types";
import type { Privilege as PType } from "@prisma/client";
import { Privilege } from "../client/Privilege";

type PrivilegeList = Omit<PType, "permissions" | "priority">[];

export const PrivilegeList = async ({
  formUser,
  privileges,
  canManageUsers,
}: {
  formUser: AppUser;
  privileges: PrivilegeList;
  canManageUsers: boolean;
}) => {
  const { i18n } = await serverTranslation("admin-users");
  const userPrivileges = formUser.privileges.map((privilege) => privilege.id);

  return (
    <ul className="m-0 mb-12 p-0">
      {privileges?.map((privilege) => {
        const active = userPrivileges.includes(privilege.id);
        const description =
          i18n.language === "en" ? privilege.descriptionEn : privilege.descriptionFr;
        return (
          <li key={privilege.id} className="mb-4 block max-w-lg pb-4">
            <Privilege
              canManageUsers={canManageUsers}
              active={active}
              description={description}
              userId={formUser.id}
              privilegeId={privilege.id}
            />
          </li>
        );
      })}
    </ul>
  );
};
