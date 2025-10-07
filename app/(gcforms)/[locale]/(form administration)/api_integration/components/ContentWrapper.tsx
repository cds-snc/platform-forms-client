import Link from "next/link";
import { SiteLogo } from "@serverComponents/icons";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { useTranslation } from "@i18n/client";

export const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const { t, i18n } = useTranslation(["response-api", "common"]);
  const locale = i18n.language;
  return (
    <div className="account-wrapper mt-10">
      <div className="w-[622px] rounded-2xl border-1 border-[#D1D5DB] bg-white p-10">
        <main id="content ">
          <Link
            className="mb-6 mr-10 inline-flex no-underline focus:bg-white"
            href={`/${locale}/form-builder`}
          >
            <span className="">
              <SiteLogo title={t("title")} />
            </span>
            <span className="ml-3 inline-block text-[24px] font-semibold leading-10 text-[#1B00C2]">
              {t("title", { ns: "common" })}
            </span>
          </Link>
          <div className="flex w-full items-center justify-center">{children}</div>
          <ToastContainer autoClose={false} containerId="response-api" />
        </main>
      </div>
    </div>
  );
};
