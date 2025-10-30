import { useTranslation } from "@i18n/client";
import { toast } from "@formBuilder/components/shared/Toast";

import { Button } from "@clientComponents/globals";

interface LoadKeyProps {
  onLoadKey: () => Promise<boolean>;
}

export const LoadKey = ({ onLoadKey }: LoadKeyProps) => {
  const { t } = useTranslation(["response-api", "common"]);

  return (
    <div>
      <p className="mb-4">
        <strong>Upload your form&apos;s API key to get started</strong>
      </p>
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
  );
};
