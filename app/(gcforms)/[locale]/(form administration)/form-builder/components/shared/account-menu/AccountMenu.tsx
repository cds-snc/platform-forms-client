"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslation } from "@i18n/client";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import "./AccountMenu.css";

const PersonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
  </svg>
);

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

export const AccountMenu = ({
  locale,
  testId,
  publishingEnabled,
}: {
  locale: string;
  testId: string;
  publishingEnabled: boolean;
}) => {
  const { t } = useTranslation(["common", "profile", "form-builder"]);
  const { data } = useSession();
  const { ability } = useAccessControl();

  const user = data?.user;
  const canViewAdministration =
    ability?.can("view", "Flag") || ability?.can("view", "Privilege") || false;

  if (!user) {
    return null;
  }

  return (
    <div
      data-testid={testId}
      className="sticky bottom-4 z-20 mt-auto flex justify-center px-4 py-4"
    >
      <button
        type="button"
        popoverTarget="account-menu-popover"
        popoverTargetAction="toggle"
        interestfor="account-menu-popover"
        aria-label={t("accountMenu.label")}
        aria-haspopup="menu"
        aria-controls="account-menu-popover"
        className="account-menu-trigger flex size-11 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:outline-none"
      >
        <PersonIcon />
      </button>

      <div
        id="account-menu-popover"
        popover="hint"
        className="account-menu-popover z-20 w-[18rem] overflow-auto rounded-[1.75rem] border border-slate-300 bg-white p-0 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
      >
        <div className="flex min-h-0 flex-col">
          <div className="px-6 pt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <span
                className={
                  publishingEnabled
                    ? "size-2.5 rounded-full bg-emerald-600"
                    : "size-2.5 rounded-full bg-red-700"
                }
              />
              <span>{t("accountPanel.publishing", { ns: "profile" })} -</span>
              {publishingEnabled ? (
                <span>{t("accountPanel.unlocked", { ns: "profile" })}</span>
              ) : (
                <Link
                  href={`/${locale}/unlock-publishing`}
                  className="underline underline-offset-2"
                >
                  {t("accountPanel.locked", { ns: "profile" })}
                </Link>
              )}
            </div>
          </div>

          <nav className="flex-1 px-6 py-6" aria-label={t("accountMenu.label")}>
            <ul className="m-0 list-none space-y-5 p-0 text-[1.05rem]">
              <li>
                <Link
                  href={`/${locale}/forms`}
                  className="text-slate-600 no-underline hover:underline focus:underline"
                >
                  {t("adminNav.allForms")}
                </Link>
              </li>
              {canViewAdministration && (
                <li>
                  <Link
                    href={`/${locale}/admin`}
                    className="text-slate-600 no-underline hover:underline focus:underline"
                  >
                    {t("adminNav.administration")}
                  </Link>
                </li>
              )}
              <li>
                {user.accountUrl ? (
                  <a
                    href={user.accountUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-slate-600 no-underline hover:underline focus:underline"
                  >
                    <span>{t("accountMenu.account")}</span>
                    <ExternalLinkIcon />
                  </a>
                ) : (
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-slate-600 no-underline hover:underline focus:underline"
                  >
                    <span>{t("accountMenu.account")}</span>
                    <ExternalLinkIcon />
                  </a>
                )}
              </li>
            </ul>
          </nav>

          <div className="mt-auto border-t border-slate-300 bg-emerald-50 px-6 py-5">
            <p className="m-0 truncate text-[1.05rem] font-semibold text-slate-900">
              {user.name || t("accountMenu.fallbackName")}
            </p>
            <p className="m-0 truncate pt-1 text-base text-slate-500">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
