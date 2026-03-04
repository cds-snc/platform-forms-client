import { serverTranslation } from "@i18n";
import { Icon } from "../../../components/server/Icon";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";

interface ProfileProps {
  locale: string;
  email: string;
  givenName?: string;
  familyName?: string;
  accountUrl?: string;
  publishingStatus: boolean;
}
/*
 Profile page for OIDC flow
*/
export const Profile = async ({
  locale,
  email,
  givenName,
  familyName,
  accountUrl,
  publishingStatus,
}: ProfileProps) => {
  const { t } = await serverTranslation(["profile"], { lang: locale });

  return (
    <>
      <h1 className="mb-2 border-b-0">{t("title")}</h1>
      <div className="w-full rounded-lg border bg-white p-4">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="pb-0 text-2xl">{t("profilePanel.title")}</h2>
          {accountUrl && (
            <LinkButton.Primary href={accountUrl} target="_blank" className="shrink-0">
              {t("accountPanel.manageAccount")}
            </LinkButton.Primary>
          )}
        </div>
        {givenName && (
          <div>
            <h3 className="mb-2 text-xl">{t("accountPanel.givenName")}</h3>
            <p className="mb-4">{givenName}</p>
          </div>
        )}
        {familyName && (
          <div>
            <h3 className="mb-2 text-xl">{t("accountPanel.familyName")}</h3>
            <p className="mb-4">{familyName}</p>
          </div>
        )}
        <div>
          <h3 className="mb-2 text-xl">{t("accountPanel.email")}</h3>
          <p className="mb-4">{email}</p>
        </div>
      </div>

      <div className="mt-4 w-full rounded-lg border bg-white p-4">
        <h2 className="mb-6 pb-0 text-2xl">{t("accountPanel.publishing")}</h2>
        <div>
          <p className="mb-4">
            <Icon checked={publishingStatus} />{" "}
            {publishingStatus ? t("accountPanel.unlocked") : t("accountPanel.locked")}
          </p>
        </div>
      </div>
    </>
  );
};
