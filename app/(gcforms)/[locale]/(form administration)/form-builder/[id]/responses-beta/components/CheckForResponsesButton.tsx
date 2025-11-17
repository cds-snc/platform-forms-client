import { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useResponsesContext } from "../context/ResponsesContext";
import { SubmitButton } from "@clientComponents/globals/Buttons/SubmitButton";

export const CheckForResponsesButton = ({
  disabled,
  callBack,
}: {
  disabled?: boolean;
  callBack?: () => void;
}) => {
  const { t } = useTranslation("response-api");
  const [loading, setLoading] = useState(false);

  const { retrieveResponses } = useResponsesContext();

  const handleCheck = useCallback(async () => {
    setLoading(true);
    // Add a minimum delay to show loading state
    await Promise.all([retrieveResponses(), new Promise((resolve) => setTimeout(resolve, 1500))]);

    setLoading(false);
    callBack && callBack();
  }, [retrieveResponses, callBack]);
  return (
    <SubmitButton theme="primary" loading={loading} onClick={handleCheck} disabled={disabled}>
      {loading ? t("checking") : t("loadKeyPage.checkForNewResponsesButton")}
    </SubmitButton>
  );
};
