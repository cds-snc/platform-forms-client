import { authCheckAndRedirect } from "@lib/actions";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { serverTranslation } from "@i18n";
import Link from "next/link";
import { ManageAccountsIcon, SettingsApplicationsIcon } from "@serverComponents/icons";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("admin-home", { lang: locale });
  return {
    title: `${t("title")}`,
  };
}

// keeping this here if we want to add a welcome page
export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const { t } = await serverTranslation(["admin-home", "common"]);

  const { ability } = await authCheckAndRedirect();

  const canViewUsers = checkPrivilegesAsBoolean(ability, [{ action: "view", subject: "User" }], {
    redirect: true,
  });

  if (!canViewUsers) {
    redirect(`/${locale}/forms`);
  }

  return (
    <>
      <h1 className="visually-hidden">{t("title", { ns: "admin-home" })}</h1>
      <div className="flex flex-row justify-center">
        <div className="rounded-lg border bg-white p-10">
          <h2>
            <ManageAccountsIcon className="inline-block h-14 w-14" /> {t("accountAdministration")}
          </h2>
          <p>{t("manageUsersAndTheirForms")}</p>
          <p>
            <Link href={`/${locale}/admin/accounts`} legacyBehavior>
              <a href={`/${locale}/admin/accounts`}>{t("accounts")}</a>
            </Link>
          </p>
        </div>

        <div className="ml-20 rounded-lg border bg-white p-10">
          <h2>
            <SettingsApplicationsIcon className="inline-block h-14 w-14" />
            {t("systemAdministration")}
          </h2>
          <p>{t("configureHowTheApplicationWorks")}</p>
          <ul className="list-none pl-0">
            <li>
              <Link href={`/${locale}/admin/settings`} legacyBehavior>
                <a href={`/${locale}/admin/settings`}>{t("systemSettings")}</a>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/flags`} legacyBehavior>
                <a href={`/${locale}/admin/flags`}>{t("featureFlags")}</a>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/typography`} legacyBehavior>
                <a href={`/${locale}/admin/typography`}>{t("typography")}</a>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/upload`} legacyBehavior>
                <a href={`/${locale}/admin/upload`}>{t("upload")}</a>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/view-templates`} legacyBehavior>
                <a href={`/${locale}/admin/view-templates`}>{t("viewTemplates")}</a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
