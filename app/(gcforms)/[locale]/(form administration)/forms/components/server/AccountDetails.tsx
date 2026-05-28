import Link from "next/link";
import { serverTranslation } from "@i18n";

const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M14 5h5v5" />
    <path d="M10 14 19 5" />
    <path d="M19 14v5H5V5h5" />
  </svg>
);

const PersonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className="stroke-slate-900"
  >
    <circle cx="17" cy="17" r="15" strokeWidth="2" />
    <circle cx="17" cy="13.5" r="4.5" strokeWidth="2" />
    <g clipPath="url(#avatar-clip)">
      <path d="M5 28C5 21 11 21 17 21C23 21 29 21 29 28" strokeWidth="2" strokeLinecap="round" />
    </g>
    <defs>
      <clipPath id="avatar-clip">
        <circle cx="17" cy="17" r="15" />
      </clipPath>
    </defs>
  </svg>
);

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
        <PersonIcon />
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
              <ExternalLinkIcon />
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
