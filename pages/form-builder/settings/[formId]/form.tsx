import React, { ReactElement } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../../_app";
import { Settings, FormOwnership } from "@components/form-builder/app";
import { SettingsNavigation } from "@components/form-builder/app/navigation/SettingsNavigation";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { getUsers } from "@lib/users";
import { User } from "@prisma/client";
import { FormRecord } from "@lib/types";
import { BackLink } from "@components/admin/LeftNav/BackLink";
import Head from "next/head";
import { FormBuilderLayout } from "@components/globals/layouts/FormBuilderLayout";

interface AssignUsersToTemplateProps {
  formRecord: FormRecord;
  usersAssignedToFormRecord: User[];
  allUsers: User[];
  canManageOwnership: boolean;
}

const BackToManageForms = () => {
  const { t } = useTranslation("admin-users");

  const router = useRouter();
  const { backLink } = router.query;

  if (!backLink) return null;

  return (
    <div className="mb-10">
      <BackLink href={`/admin/accounts/${backLink}/manage-forms`}>
        {t("backToManageForms")}
      </BackLink>
    </div>
  );
};

const Page: NextPageWithLayout<AssignUsersToTemplateProps> = ({
  formRecord,
  usersAssignedToFormRecord,
  allUsers,
  canManageOwnership,
}: AssignUsersToTemplateProps) => {
  const { t } = useTranslation("form-builder");
  const title = `${t("branding.heading")} — ${t("gcForms")}`;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="max-w-4xl">
        <SettingsNavigation />
        {canManageOwnership && (
          <FormOwnership
            formRecord={formRecord}
            usersAssignedToFormRecord={usersAssignedToFormRecord}
            allUsers={allUsers}
          />
        )}
        <Settings />
      </div>
    </>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <FormBuilderLayout page={page} backLink={<BackToManageForms />} />;
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
    let adminProps;

    if (
      checkPrivilegesAsBoolean(ability, [
        { action: "update", subject: "FormRecord" },
        { action: "update", subject: "User" },
      ])
    ) {
      const formID = params?.formId;
      if (!formID || Array.isArray(formID)) return redirect(locale);

      const templateWithAssociatedUsers = await getTemplateWithAssociatedUsers(ability, formID);
      if (!templateWithAssociatedUsers) return redirect(locale);

      const allUsers = (await getUsers(ability)).map((user) => {
        return { id: user.id, name: user.name, email: user.email };
      });

      adminProps = {
        formRecord: templateWithAssociatedUsers.formRecord,
        usersAssignedToFormRecord: templateWithAssociatedUsers.users,
        allUsers,
        canManageOwnership: true,
      };
    }

    return {
      props: {
        ...(locale &&
          (await serverSideTranslations(locale, [
            "common",
            "form-builder",
            "admin-users",
            "admin-login",
          ]))),
        ...adminProps,
      },
    };
  }
);

export default Page;
