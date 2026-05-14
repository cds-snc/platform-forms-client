"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "@i18n/client";
import { FeatureFlags } from "@lib/cache/types";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { clearTemplateStore } from "@lib/store/utils";
import "./AccountMenu.css";

const PersonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className="stroke-slate-900 transition-colors group-hover:stroke-indigo-700"
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
  const { getFlag } = useFeatureFlags();

  const user = data?.user;
  const isZitadelLoginEnabled = getFlag(FeatureFlags.zitadelLogin);
  const canViewAdministration =
    ability?.can("view", "Flag") || ability?.can("view", "Privilege") || false;

  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Add logic to handle aria-expanded and focus management when the popover is toggled
  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    const handleToggle = (event: Event) => {
      const open = (event as ToggleEvent).newState === "open";
      setIsOpen(open);
      if (open) {
        const firstFocusable = popover.querySelector<HTMLElement>(
          "a[href], button:not([disabled])"
        );
        firstFocusable?.focus();
      }
    };

    popover.addEventListener("toggle", handleToggle);
    return () => popover.removeEventListener("toggle", handleToggle);
  }, []);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    clearTemplateStore();

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeOptions = { timeZone: tz };
    const enTime = new Date().toLocaleString("en-CA", timeOptions);
    const frTime = new Date().toLocaleString("fr-CA", timeOptions);

    sessionStorage.setItem(
      "logoutTime",
      JSON.stringify({
        en: enTime,
        fr: frTime,
      })
    );

    void signOut({ callbackUrl: `/${locale}/auth/logout` });
  };

  return (
    <div data-testid={testId} className="sticky bottom-4 z-20 mt-auto flex justify-center py-4">
      <button
        type="button"
        popoverTarget="account-menu-popover"
        popoverTargetAction="toggle"
        interestfor="account-menu-popover"
        aria-label={t("accountMenu.label")}
        aria-expanded={isOpen}
        aria-controls="account-menu-popover"
        className="account-menu-trigger group flex cursor-pointer items-center gap-3 bg-transparent text-slate-900 transition-opacity hover:opacity-80 focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:outline-none"
      >
        <PersonIcon />
      </button>

      <div
        ref={popoverRef}
        id="account-menu-popover"
        popover="hint"
        className="account-menu-popover z-20 w-[18rem] overflow-auto rounded-lg bg-white p-0 text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
      >
        <div className="flex min-h-0 flex-col">
          <div className={`px-6 py-5 ${publishingEnabled ? "bg-emerald-50" : "bg-yellow-50"}`}>
            <p className="m-0 truncate text-[1.05rem] font-semibold text-slate-900">
              {user.name || t("accountMenu.fallbackName")}
            </p>
            <p className="m-0 truncate pt-1 pb-5 text-base text-slate-500">{user.email}</p>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <span
                className={
                  publishingEnabled
                    ? "size-2.5 rounded-full bg-emerald-600"
                    : "size-2.5 rounded-full bg-yellow-700"
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
                  <span className="sr-only">
                    {t("accountPanel.publishing", { ns: "profile" })} -{" "}
                  </span>
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
              {isZitadelLoginEnabled ? (
                user.accountUrl && (
                  <li>
                    <a
                      href={user.accountUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-slate-600 no-underline hover:underline focus:underline"
                    >
                      <span>{t("accountMenu.account")}</span>
                      <ExternalLinkIcon />
                    </a>
                  </li>
                )
              ) : (
                <li>
                  <Link
                    href={`/${locale}/profile`}
                    className="text-slate-600 no-underline hover:underline focus:underline"
                  >
                    {t("title", { ns: "profile" })}
                  </Link>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="cursor-pointer border-0 bg-transparent p-0 text-slate-600 hover:underline focus:underline"
                >
                  {t("adminNav.logout")}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};
