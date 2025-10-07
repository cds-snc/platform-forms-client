import Link from "next/link";
import { useTranslation } from "@i18n/client";

import { SiteLogo } from "@serverComponents/icons";
import { toast, ToastContainer } from "@formBuilder/components/shared/Toast";
import { Button } from "@clientComponents/globals";

interface LoadKeyProps {
  onLoadKey: () => Promise<boolean>;
}

export const LoadKey = ({ onLoadKey }: LoadKeyProps) => {
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

          <div className=" flex items-center justify-center">
            <Button
              onClick={async () => {
                const result = await onLoadKey();

                if (!result) {
                  toast.error(t("failed-to-load-api-key"), "response-api");
                }
              }}
            >
              Load API Key
            </Button>
          </div>

          <ToastContainer autoClose={false} containerId="response-api" />
        </main>
      </div>
    </div>
  );
};
