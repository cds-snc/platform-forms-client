import React, { useState } from "react";
import { useTranslation } from "@i18n/client";
import { ApiTooltip } from "./ApiTooltip";
import { deleteServiceAccountKey } from "../actions";

import { SubmitButton as DeleteApiKeyButton } from "@clientComponents/globals/Buttons/SubmitButton";

import { DeleteKeyFailed } from "./DeleteKeyFailed";
import { DeleteKeySuccess } from "./DeleteKeySuccess";
import { toast } from "@formBuilder/components/shared";

export const DeleteKeyButton = ({ id, keyId }: { id: string; keyId: string }) => {
  const { t } = useTranslation("form-builder");
  const [deleting, setDeleting] = useState(false);
  return (
    <>
      <div className="mb-4">
        <div className="font-bold">{t("settings.api.keyId")}</div>
        {keyId} <ApiTooltip />
      </div>
      <DeleteApiKeyButton
        loading={deleting}
        theme="destructive"
        className="mr-4"
        onClick={async () => {
          setDeleting(true);
          const result = await deleteServiceAccountKey(id);
          if (result.error) {
            toast.success(<DeleteKeyFailed />, "wide");
            setDeleting(false);
            return;
          }

          toast.success(<DeleteKeySuccess id={id} />, "wide");
          setDeleting(false);
        }}
      >
        {t("settings.api.deleteKey")}
      </DeleteApiKeyButton>
    </>
  );
};
