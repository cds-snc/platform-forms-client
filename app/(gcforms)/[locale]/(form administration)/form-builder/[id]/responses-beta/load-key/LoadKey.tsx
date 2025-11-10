import React from "react";
import { useTranslation } from "@i18n/client";
import { toast } from "@formBuilder/components/shared/Toast";

import { Button } from "@clientComponents/globals";

interface LoadKeyProps {
  onLoadKey: () => Promise<boolean>;
}

const UploadSuccess = () => {
  const { t } = useTranslation(["response-api", "common"]);
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("loadKeyPage.uploadSuccessTitle")}</h3>
      <p className="mb-2 text-black">{t("loadKeyPage.uploadSuccessMessage")}</p>
    </div>
  );
};

const UploadFailed = () => {
  const { t } = useTranslation(["response-api", "common"]);
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("loadKeyPage.uploadFailedTitle")}</h3>
      <p className="mb-2 text-black">{t("loadKeyPage.uploadFailedMessage")}</p>
    </div>
  );
};

export const LoadKey = ({ onLoadKey }: LoadKeyProps) => {
  const { t } = useTranslation(["response-api", "common"]);

  return (
    <Button
      theme="secondary"
      className="mb-4"
      onClick={async () => {
        const result = await onLoadKey();

        if (!result) {
          toast.error(<UploadFailed />, "wide");
        } else {
          toast.success(<UploadSuccess />, "wide");
        }
      }}
    >
      {t("loadKeyPage.chooseFileButton")}
    </Button>
  );
};
