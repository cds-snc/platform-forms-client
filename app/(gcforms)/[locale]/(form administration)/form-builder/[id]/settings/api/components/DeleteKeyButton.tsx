import React from "react";
import { useTranslation } from "@i18n/client";
import { ApiTooltip } from "./ApiTooltip";
// import { deleteServiceAccountKey } from "../actions";

import { SubmitButton as DeleteApiKeyButton } from "@clientComponents/globals/Buttons/SubmitButton";

// import { DeleteKeyFailed } from "./DeleteKeyFailed";
// import { DeleteKeySuccess } from "./DeleteKeySuccess";
// import { toast } from "@formBuilder/components/shared";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

export const DeleteKeyButton = ({ id, keyId }: { id: string; keyId: string }) => {
  const { t } = useTranslation("form-builder");
  // const [deleting, setDeleting] = useState(false);

  const { Event } = useCustomEvent();

  const openDeleteApiDialog = () => {
    Event.fire(EventKeys.openDeleteApiKeyDialog, { id });
  };

  return (
    <>
      <div className="mb-4">
        <div className="font-bold">{t("settings.api.keyId")}</div>
        {keyId} <ApiTooltip />
      </div>
      <DeleteApiKeyButton
        loading={false}
        theme="destructive"
        className="mr-4"
        onClick={async () => {
          openDeleteApiDialog();
          /*
          setDeleting(true);
          const result = await deleteServiceAccountKey(id);
          if (result.error) {
            toast.success(<DeleteKeyFailed />, "wide");
            setDeleting(false);
            return;
          }

          toast.success(<DeleteKeySuccess id={id} />, "wide");
          setDeleting(false);
          */
        }}
      >
        {t("settings.api.deleteKey")}
      </DeleteApiKeyButton>
    </>
  );
};
