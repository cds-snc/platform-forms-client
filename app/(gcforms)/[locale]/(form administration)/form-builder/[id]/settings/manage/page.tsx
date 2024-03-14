import { serverTranslation } from "@i18n";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { getUsers } from "@lib/users";
import { ManageForm } from "./ManageForm";
import { notFound } from "next/navigation";

import { Metadata } from "next";

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

/*
@todo re enable back button
const BackToManageForms = async ({ backLink }: { backLink: string }) => {
  const { t } = await serverTranslation("admin-users");

  if (!backLink) return null;

  return (
    <div className="mb-10">
      <BackLink href={`/admin/accounts/${backLink}/manage-forms`}>
        {t("backToManageForms")}
      </BackLink>
    </div>
  );
};
*/

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const { user } = await requireAuthentication();

  if (
    checkPrivilegesAsBoolean(user.ability, [
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
    ])
  ) {
    if (!id || Array.isArray(id)) notFound();

    const templateWithAssociatedUsers = await getTemplateWithAssociatedUsers(user.ability, id);
    if (!templateWithAssociatedUsers) notFound();

    const allUsers = (await getUsers(user.ability)).map((user) => {
      return { id: user.id, name: user.name || "", email: user.email || "" };
    });
    return (
      <ManageForm
        id={id}
        formRecord={templateWithAssociatedUsers.formRecord}
        usersAssignedToFormRecord={templateWithAssociatedUsers.users}
        allUsers={allUsers}
        canManageOwnership={true}
      />
    );
  }

  return <ManageForm id={id} canManageOwnership={false} />;
}
