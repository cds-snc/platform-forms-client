import { serverTranslation } from "@i18n";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { authCheck } from "@lib/actions";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { getUsers } from "@lib/users";
import { ManageForm } from "./ManageForm";
import { Metadata } from "next";
import { UserAbility } from "@lib/types";
import { Session } from "next-auth";
import { getNonce } from "./actions";

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
  const { session, ability } = await authCheck().catch(() => ({ session: null, ability: null }));
  const canManageOwnership = getCanManageOwnership(id, ability);
  const canSetClosingDate = getCanSetClosingDate(id, ability, session);
  const nonce = await getNonce();

  if (!canManageOwnership || id === "0000") {
    return (
      <ManageForm
        nonce={nonce}
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
      nonce={nonce}
      id={id}
      canManageOwnership={canManageOwnership}
      canSetClosingDate={canSetClosingDate}
      formRecord={templateWithAssociatedUsers.formRecord}
      usersAssignedToFormRecord={templateWithAssociatedUsers.users}
      allUsers={allUsers}
    />
  );
}
