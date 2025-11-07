"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useResponsesContext } from "./context/ResponsesContext";

export const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const { formId } = useResponsesContext();
  const { t, i18n } = useTranslation(["form-builder-responses"]);

  return (
    <>
      <div className="account-wrapper">
        <div className="w-[750px] rounded-2xl border-1 border-[#D1D5DB] bg-white px-10 py-8">
          <main id="content w-full">
            <div>{children}</div>
          </main>
        </div>
      </div>

      <div>
        <div className="mt-4">
          <Link
            href={`/${i18n.language}/form-builder/${formId}/responses`}
            className="text-black visited:text-black"
          >
            {t("responsesBeta.responsesSwitchLink")}
          </Link>
        </div>
      </div>
    </>
  );
};
