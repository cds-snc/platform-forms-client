import Link from "next/link";
import { serverTranslation } from "@i18n/server";
import { ExternalLinkIcon2, PersonIcon } from "@root/components/serverComponents/icons";

export const AccountDetails = async ({
  name,
  email,
  accountUrl,
  profileUrl,
  isZitadelLoginEnabled,
  locale,
}: {
  name?: string | null;
  email?: string | null;
  accountUrl?: string | null;
  profileUrl?: string;
  isZitadelLoginEnabled?: boolean;
  locale?: string;
}) => {
  const { t } = await serverTranslation(["my-forms", "profile"], { lang: locale });
  return (
    <div className="mt-2 mb-6 ml-2 flex items-start gap-3">
      <div className="mt-1">
        <PersonIcon className="stroke-slate-900" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-[1.05rem] font-semibold text-slate-900">{name || "User"}</p>
        <p className="m-0 truncate pt-1 text-base text-blue-700">{email}</p>
        <div className="mt-1">
          {isZitadelLoginEnabled && accountUrl ? (
            <a
              href={accountUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-slate-600 no-underline hover:underline focus:underline"
            >
              <span>{t("account.viewAccount")}</span>
              <ExternalLinkIcon2 />
            </a>
          ) : profileUrl && locale ? (
            <Link
              href={profileUrl}
              className="text-sm text-slate-600 no-underline hover:underline focus:underline"
            >
              {t("title", { ns: "profile" })}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};
