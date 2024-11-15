import { serverTranslation } from "@i18n";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { authCheckAndThrow } from "@lib/actions";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { getUsers } from "@lib/users";
import { ManageForm } from "./ManageForm";
import { Metadata } from "next";
import { UserAbility } from "@lib/types";
import { Session } from "next-auth";
import { getNonce } from "./actions";
import { checkIfClosed } from "@lib/actions/checkIfClosed";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });

  return {
    title: `${t("settings.formManagement")} — ${t("gcForms")}`,
  };
}

const getCanManageOwnership = (formId: string, ability: UserAbility | null) => {
  if (!ability || formId === "0000") {
    return false;
  }

  return checkPrivilegesAsBoolean(ability, [
    {
      action: "view",
      subject: "User",
    },
    {
      action: "view",
      subject: "FormRecord",
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

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const { id } = params;

  const { session, ability } = await authCheckAndThrow().catch(() => ({
    session: null,
    ability: null,
  }));

  let closedDetails;

  const canManageOwnership = getCanManageOwnership(id, ability);
  const canSetClosingDate = getCanSetClosingDate(id, ability, session);
  const nonce = await getNonce();

  if (canSetClosingDate) {
    const closedData = await checkIfClosed(id);
    closedDetails = closedData?.closedDetails;
  }

  if (!canManageOwnership || id === "0000") {
    return (
      <ManageForm
        nonce={nonce}
        id={id}
        canManageOwnership={canManageOwnership}
        canSetClosingDate={canSetClosingDate}
        closedDetails={closedDetails}
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
      closedDetails={closedDetails}
    />
  );
}
