import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../../_app";
import { Template, PageTemplate, Settings, FormOwnership } from "@components/form-builder/app";
import { SettingsNavigation } from "@components/form-builder/app/navigation/SettingsNavigation";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";
import { getUsers } from "@lib/users";
import { User } from "@prisma/client";
import { FormRecord } from "@lib/types";

interface AssignUsersToTemplateProps {
  formRecord: FormRecord;
  usersAssignedToFormRecord: User[];
  allUsers: User[];
}

const Page: NextPageWithLayout<AssignUsersToTemplateProps> = ({
  formRecord,
  usersAssignedToFormRecord,
  allUsers,
}: AssignUsersToTemplateProps) => {
  const { t } = useTranslation("form-builder");
  const title = `${t("branding.heading")} — ${t("gcForms")}`;

  return (
    <PageTemplate title={title} navigation={<SettingsNavigation />}>
      <FormOwnership
        formRecord={formRecord}
        usersAssignedToFormRecord={usersAssignedToFormRecord}
        allUsers={allUsers}
      />
      <Settings />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} isFormBuilder />;
};

const redirect = (locale: string | undefined) => {
  return {
    redirect: {
      // We can redirect to a 'Form does not exist page' in the future
      destination: `/${locale}/404`,
      permanent: false,
    },
  };
};

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability }, locale, params }) => {
    checkPrivileges(ability, [
      { action: "update", subject: "FormRecord" },
      { action: "update", subject: "User" },
    ]);

    const formID = params?.formId;
    if (!formID || Array.isArray(formID)) return redirect(locale);

    const templateWithAssociatedUsers = await getTemplateWithAssociatedUsers(ability, formID);
    if (!templateWithAssociatedUsers) return redirect(locale);

    const allUsers = (await getUsers(ability)).map((user) => {
      return { id: user.id, name: user.name, email: user.email };
    });

    return {
      props: {
        ...(locale &&
          (await serverSideTranslations(locale, [
            "common",
            "form-builder",
            "admin-users",
            "admin-login",
          ]))),
        formRecord: templateWithAssociatedUsers.formRecord,
        usersAssignedToFormRecord: templateWithAssociatedUsers.users,
        allUsers,
      },
    };
  }
);

export default Page;
