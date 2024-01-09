import { serverTranslation } from "@i18n";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { getUsers } from "@lib/users";

import { BackLink } from "@clientComponents/admin/LeftNav/BackLink";

import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

import { ClientSide } from "./clientSide";
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

export default async function Page({
  params: { locale, formID },
  searchParams: { backLink },
}: {
  params: { locale: string; formID: string };
  searchParams: { backLink: string };
}) {
  const { user } = await requireAuthentication();

  checkPrivilegesAsBoolean(
    user.ability,
    [
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
    ],
    { redirect: true }
  );

  if (!formID || Array.isArray(formID)) notFound();

  const templateWithAssociatedUsers = await getTemplateWithAssociatedUsers(user.ability, formID);
  if (!templateWithAssociatedUsers) notFound();

  const allUsers = (await getUsers(user.ability)).map((user) => {
    return { id: user.id, name: user.name, email: user.email };
  });

  return (
    <FormBuilderInitializer locale={locale} backLink={<BackToManageForms backLink={backLink} />}>
      <ClientSide
        formRecord={templateWithAssociatedUsers.formRecord}
        usersAssignedToFormRecord={templateWithAssociatedUsers.users}
        allUsers={allUsers}
        canManageOwnership={true}
      />
    </FormBuilderInitializer>
  );
}
