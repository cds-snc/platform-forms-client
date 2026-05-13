import { serverTranslation } from "@i18n";
import { authorization } from "@lib/privileges";
import { DownloadAccountsLink } from "../client/DownloadAccountsLink";

export const DownloadAccountsButtons = async ({ locale }: { locale: string }) => {
  const canManageUsers = await authorization
    .canManageAllUsers()
    .then(() => true)
    .catch(() => false);

  if (!canManageUsers) {
    return null;
  }

  const { t } = await serverTranslation("admin-users", { lang: locale });
  const label = t("downloadActiveAccountsTooltip");

  return (
    <div className="ml-auto flex items-center">
      <DownloadAccountsLink
        href={`/${locale}/admin/accounts/download?userState=active`}
        label={label}
      />
    </div>
  );
};
