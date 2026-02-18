import { updateTemplateUsers } from "@formBuilder/actions";
import { authorization } from "@root/lib/privileges";
import { getTemplateWithAssociatedUsers } from "@root/lib/templates";
import { getUsers } from "@lib/users";
import { FormOwnership } from "./FormOwnership";
import { headers } from "next/headers";

export const ManageOwners = async ({ id }: { id: string }) => {
  const manageAllForms = await authorization
    .canManageAllForms()
    .then(() => true)
    .catch(() => false);

  if (!manageAllForms) {
    return null;
  }

  const templateWithAssociatedUsers = await getTemplateWithAssociatedUsers(id);

  if (!templateWithAssociatedUsers) {
    throw new Error("Template not found");
  }

  const allUsers = await getUsers().then((users) =>
    users.map((user) => ({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
    }))
  );

  const nonce = (await headers()).get("x-nonce");

  return (
    <FormOwnership
      nonce={nonce}
      formRecord={templateWithAssociatedUsers.formRecord}
      usersAssignedToFormRecord={templateWithAssociatedUsers.users}
      allUsers={allUsers}
      updateTemplateUsers={updateTemplateUsers}
    />
  );
};
