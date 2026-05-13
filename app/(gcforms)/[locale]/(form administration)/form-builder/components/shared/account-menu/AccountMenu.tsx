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
  >
    <path
      d="M16.667 0C25.8668 0.000176351 33.333 7.4671 33.333 16.667C33.3328 25.8667 25.8667 33.3328 16.667 33.333C7.4671 33.333 0.00017634 25.8668 0 16.667C0 7.46699 7.46699 0 16.667 0ZM16.667 24.167C13.5337 24.167 9.16686 25.6338 8.4502 27.1338C10.7168 28.9336 13.5671 30 16.667 30C19.7669 29.9999 22.6172 28.9337 24.8838 27.1338C24.1838 25.6338 19.8003 24.1671 16.667 24.167ZM16.667 3.33301C9.31699 3.33301 3.33301 9.31699 3.33301 16.667C3.33308 19.7002 4.36649 22.4836 6.06641 24.7168C8.44974 21.8168 14.2337 20.833 16.667 20.833C19.1005 20.8331 24.8834 21.8169 27.2666 24.7168C28.9665 22.4835 29.9999 19.7002 30 16.667C30 9.3171 24.0168 3.33318 16.667 3.33301ZM16.667 6.66699C19.9002 6.66717 22.5 9.26678 22.5 12.5C22.5 15.7332 19.9002 18.3328 16.667 18.333C13.4337 18.333 10.833 15.7333 10.833 12.5C10.833 9.26667 13.4337 6.66699 16.667 6.66699ZM16.667 10C15.2837 10 14.167 11.1167 14.167 12.5C14.167 13.8833 15.2837 15 16.667 15C18.0502 14.9998 19.167 13.8832 19.167 12.5C19.167 11.1168 18.0502 10.0002 16.667 10Z"
      fill="#020617"
    />
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
        aria-expanded={isOpen}
        aria-controls="account-menu-popover"
        className="account-menu-trigger flex cursor-pointer items-center gap-3 bg-transparent text-slate-900 transition-opacity hover:opacity-80 focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:outline-none"
      >
        <PersonIcon />
      </button>

      <div
        ref={popoverRef}
        id="account-menu-popover"
        popover="hint"
        className="account-menu-popover z-20 w-[18rem] overflow-auto rounded-[1.75rem] bg-white p-0 text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
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
