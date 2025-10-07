import { useTranslation } from "@i18n/client";
import { toast } from "@formBuilder/components/shared/Toast";

import { Button } from "@clientComponents/globals";

import { ContentWrapper } from "./ContentWrapper";

interface LoadKeyProps {
  onLoadKey: () => Promise<boolean>;
}

export const LoadKey = ({ onLoadKey }: LoadKeyProps) => {
  const { t } = useTranslation(["response-api", "common"]);

  return (
    <ContentWrapper>
      <div>
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
    </ContentWrapper>
  );
};
