import { useTranslation } from "@i18n/client";
import { toast } from "@formBuilder/components/shared/Toast";

import { Button } from "@clientComponents/globals";
import React from "react";

interface LoadKeyProps {
  onLoadKey: () => Promise<boolean>;
}

const UploadSuccess = ({ t }: { t: (key: string, opts?: Record<string, unknown>) => string }) => (
  <div className="w-full">
    <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("loadKeyPage.uploadSuccessTitle")}</h3>
    <p className="mb-2 text-black">{t("loadKeyPage.uploadSuccessMessage")}</p>
  </div>
);

const UploadFailed = ({ t }: { t: (key: string, opts?: Record<string, unknown>) => string }) => (
  <div className="w-full">
    <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("loadKeyPage.uploadFailedTitle")}</h3>
    <p className="mb-2 text-black">{t("loadKeyPage.uploadFailedMessage")}</p>
  </div>
);

export const LoadKey = ({ onLoadKey }: LoadKeyProps) => {
  const { t } = useTranslation(["response-api", "common"]);

  return (
    <Button
      theme="secondary"
      className="mb-4"
      onClick={async () => {
        const result = await onLoadKey();

        if (!result) {
          // show wide error toast with title + message
          toast.error(<UploadFailed t={t} />, "wide");
        } else {
          // show the same wide toast pattern as GenerateKeySuccess
          toast.success(<UploadSuccess t={t} />, "wide");
        }
      }}
    >
      {t("loadKeyPage.chooseFileButton")}
    </Button>
  );
};
