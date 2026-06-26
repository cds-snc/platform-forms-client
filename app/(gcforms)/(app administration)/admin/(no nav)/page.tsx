import { I18n } from "@i18n";
import Link from "next/link";
import { ManageAccountsIcon, SettingsApplicationsIcon } from "@serverComponents/icons";

import { PageTitle } from "@root/components/serverComponents/globals/PageTitle";

// keeping this here if we want to add a welcome page
export default async function Page() {
  return (
    <>
      <PageTitle key="title" namespace="admin-home" />
      <h1 className="visually-hidden">
        <I18n i18nKey="title" namespace="admin-home" />
      </h1>
      <div className="flex flex-row justify-center">
        <div className="rounded-lg border bg-white p-10">
          <h2>
            <ManageAccountsIcon className="inline-block size-14" />
            <I18n i18nKey="accountAdministration" namespace="admin-home" />
          </h2>
          <p>
            <I18n i18nKey="manageUsersAndTheirForms" />
          </p>
          <ul className="list-none pl-0">
            <li>
              <Link href={`/admin/accounts`}>
                <I18n i18nKey="accounts" namespace="admin-home" />
              </Link>
            </li>
            <li>
              <Link href={`/admin/accounts/recent`}>
                <I18n i18nKey="recentAccounts" namespace="admin-home" />
              </Link>
            </li>
          </ul>
        </div>

        <div className="ml-20 rounded-lg border bg-white p-10">
          <h2>
            <SettingsApplicationsIcon className="inline-block size-14" />
            <I18n i18nKey="systemAdministration" />
          </h2>
          <p>
            <I18n i18nKey="configureHowTheApplicationWorks" namespace="admin-home" />
          </p>
          <ul className="list-none pl-0">
            <li>
              <Link href={`/admin/settings`}>
                <I18n i18nKey="systemSettings" namespace="admin-home" />
              </Link>
            </li>
            <li>
              <Link href={`/admin/flags`}>
                <I18n i18nKey="featureFlags" namespace="admin-home" />
              </Link>
            </li>
            <li>
              <Link href={`/admin/view-templates`}>
                <I18n i18nKey="viewTemplates" namespace="admin-home" />
              </Link>
            </li>
            <li>
              <Link href={`/admin/events`}>
                <I18n i18nKey="auditLogs" namespace="admin-home" />
              </Link>
            </li>
          </ul>
          <hr className="my-10" />
          <ul className="list-none pl-0">
            <li>
              <Link href={`/admin/typography`}>
                <I18n i18nKey="typography" namespace="admin-home" />
              </Link>
            </li>
            <li>
              <Link href={`/admin/buttons`}>
                <I18n i18nKey="buttons" namespace="admin-home" />
              </Link>
            </li>
            <li>
              <Link href={`/admin/lexical`}>
                <I18n i18nKey="lexical" namespace="admin-home" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
