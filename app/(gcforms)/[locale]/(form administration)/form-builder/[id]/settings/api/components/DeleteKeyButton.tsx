import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { ApiTooltip } from "./ApiTooltip";
import { deleteServiceAccountKey } from "../actions";

export const DeleteKeyButton = ({ id, keyId }: { id: string; keyId: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <div className="mb-4">
        <div className="font-bold">{t("settings.api.keyId")}</div>
        {keyId} <ApiTooltip />
      </div>
      <Button theme="destructive" className="mr-4" onClick={() => deleteServiceAccountKey(id)}>
        {t("settings.api.deleteKey")}
      </Button>
    </>
  );
};
