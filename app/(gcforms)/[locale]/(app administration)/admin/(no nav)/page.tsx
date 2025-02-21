import { serverTranslation } from "@i18n";
import Link from "next/link";
import { ManageAccountsIcon, SettingsApplicationsIcon } from "@serverComponents/icons";
import { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-home", { lang: locale });
  return {
    title: `${t("title")}`,
  };
}

// keeping this here if we want to add a welcome page
export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation(["admin-home", "common"]);

  return (
    <>
      <h1 className="visually-hidden">{t("title", { ns: "admin-home" })}</h1>
      <div className="flex flex-row justify-center">
        <div className="rounded-lg border bg-white p-10">
          <h2>
            <ManageAccountsIcon className="inline-block size-14" /> {t("accountAdministration")}
          </h2>
          <p>{t("manageUsersAndTheirForms")}</p>
          <ul className="list-none pl-0">
            <li>
              <Link href={`/${locale}/admin/accounts`}>{t("accounts")}</Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/accounts/recent`}>Recent accounts</Link>
            </li>
          </ul>
        </div>

        <div className="ml-20 rounded-lg border bg-white p-10">
          <h2>
            <SettingsApplicationsIcon className="inline-block size-14" />
            {t("systemAdministration")}
          </h2>
          <p>{t("configureHowTheApplicationWorks")}</p>
          <ul className="list-none pl-0">
            <li>
              <Link href={`/${locale}/admin/settings`}>{t("systemSettings")}</Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/flags`}>{t("featureFlags")}</Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/typography`}>{t("typography")}</Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/buttons`}>{t("buttons")}</Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/upload`}>{t("upload")}</Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/view-templates`}>{t("viewTemplates")}</Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
