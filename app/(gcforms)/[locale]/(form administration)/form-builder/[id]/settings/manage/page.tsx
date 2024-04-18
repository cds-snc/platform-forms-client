import { serverTranslation } from "@i18n";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { auth } from "@lib/auth";
import { checkPrivilegesAsBoolean, createAbility } from "@lib/privileges";
import { getUsers } from "@lib/users";
import { ManageForm } from "./ManageForm";
import { Metadata } from "next";
import { UserAbility } from "@lib/types";
import { Session } from "next-auth";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("branding.heading")} — ${t("gcForms")}`,
  };
}

const getSessionAndAbility = async () => {
  const session = await auth();

  const ability = session && createAbility(session);

  return { session, ability };
};

const getCanManageOwnership = (formId: string, ability: UserAbility | null) => {
  if (!ability || formId === "0000") {
    return false;
  }

  return checkPrivilegesAsBoolean(ability, [
    {
      action: "view",
      subject: {
        type: "User",
        // Empty object to force the ability to check for any user
        object: {},
      },
    },
    {
      action: "view",
      subject: {
        type: "FormRecord",
        // We want to make sure the user has the permission to view all templates
        object: {},
      },
    },
  ]);
};

const getCanSetClosingDate = (
  formId: string,
  ability: UserAbility | null,
  session: Session | null
) => {
  if (!ability || !session || formId === "0000") {
    return false;
  }

  return session ? true : false;
};

const getAllUsers = async (ability: UserAbility) => {
  const users = await getUsers(ability);
  return users.map((user) => ({
    id: user.id,
    name: user.name || "",
    email: user.email || "",
  }));
};

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const { session, ability } = await getSessionAndAbility();
  const canManageOwnership = getCanManageOwnership(id, ability);
  const canSetClosingDate = getCanSetClosingDate(id, ability, session);

  if (!canManageOwnership || id === "0000") {
    return (
      <ManageForm
        id={id}
        canManageOwnership={canManageOwnership}
        canSetClosingDate={canSetClosingDate}
      />
    );
  }

  const templateWithAssociatedUsers =
    ability && (await getTemplateWithAssociatedUsers(ability, id));

  if (!templateWithAssociatedUsers) {
    throw new Error("Template not found");
  }

  const allUsers = await getAllUsers(ability);

  return (
    <ManageForm
      id={id}
      canManageOwnership={canManageOwnership}
      canSetClosingDate={canSetClosingDate}
      formRecord={templateWithAssociatedUsers.formRecord}
      usersAssignedToFormRecord={templateWithAssociatedUsers.users}
      allUsers={allUsers}
    />
  );
}
