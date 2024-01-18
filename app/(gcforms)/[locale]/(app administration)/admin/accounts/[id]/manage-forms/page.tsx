import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { getUnprocessedSubmissionsForUser, getUser } from "@lib/users";
import { ManageForms } from "./clientSide";
import { Metadata } from "next";
import { getAllTemplatesForUser } from "@lib/templates";
import { TwoColumnLayout } from "@serverComponents/globals/layouts";
import { BackLink } from "@clientComponents/admin/LeftNav/BackLink";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-forms", { lang: locale });
  return {
    title: `${t("title")}`,
  };
}

const BackToAccounts = async ({ id, locale }: { id: string; locale: string }) => {
  const { t } = await serverTranslation("admin-users");
  return <BackLink href={`/${locale}/admin/accounts?id=${id}`}>{t("backToAccounts")}</BackLink>;
};

export default async function Page({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  const { user } = await requireAuthentication();
  checkPrivilegesAsBoolean(
    user.ability,
    [
      { action: "view", subject: "User" },
      {
        action: "view",
        subject: {
          type: "FormRecord",
          // Passing an empty object here just to force CASL evaluate the condition part of a permission.
          // Will only allow users who have privilege of Manage All Forms
          object: {},
        },
      },
    ],
    { redirect: true }
  );

  const formUser = await getUser(user.ability, id);

  const templates = (await getAllTemplatesForUser(user.ability, id as string)).map((template) => {
    const {
      id,
      form: { titleEn, titleFr },
      isPublished,
      createdAt,
    } = template;

    return {
      id,
      titleEn,
      titleFr,
      isPublished,
      createdAt: Number(createdAt),
    };
  });

  const overdue = await getUnprocessedSubmissionsForUser(user.ability, id as string, templates);

  return (
    <TwoColumnLayout
      user={user}
      context="admin"
      leftColumnContent={<BackToAccounts id={formUser.id} locale={locale} />}
    >
      <ManageForms {...{ formUser, templates, overdue }} />;
    </TwoColumnLayout>
  );
}
