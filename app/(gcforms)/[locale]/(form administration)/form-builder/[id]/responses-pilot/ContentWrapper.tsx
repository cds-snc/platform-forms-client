"use client";

import Link from "next/link";
import { useResponsesContext } from "./context/ResponsesContext";
import { useResponsesApp } from "./context";
import { disableResponsesPilotMode } from "../responses/actions";

export const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const { formId } = useResponsesContext();
  const { t, i18n, router } = useResponsesApp();

  const handleSwitchBack = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await disableResponsesPilotMode();
    router.push(`/${i18n.language}/form-builder/${formId}/responses`);
  };

  return (
    <>
      <div className="account-wrapper">
        <div className="w-[850px] rounded-2xl border-1 border-[#D1D5DB] bg-white px-10 py-8">
          <main id="content w-full">
            <div>{children}</div>
          </main>
        </div>
      </div>

      <div>
        <div className="mt-4">
          <Link
            data-testid="responses-pilot-switch-back-link"
            href={`/${i18n.language}/form-builder/${formId}/responses`}
            onClick={handleSwitchBack}
            className="text-black visited:text-black"
          >
            {t("responsesPilot.responsesSwitchLink")}
          </Link>
        </div>
      </div>
    </>
  );
};
