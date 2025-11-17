import { useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";

export const CheckForResponsesButton = ({
  disabled,
  callBack,
}: {
  disabled?: boolean;
  callBack?: () => void;
}) => {
  const { t } = useTranslation("response-api");

  const { retrieveResponses } = useResponsesContext();

  const handleCheck = useCallback(async () => {
    void retrieveResponses();
    callBack && callBack();
  }, [retrieveResponses, callBack]);
  return (
    <Button theme="primary" onClick={handleCheck} disabled={disabled}>
      {t("loadKeyPage.checkForNewResponsesButton")}
    </Button>
  );
};
