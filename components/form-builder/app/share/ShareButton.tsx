import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";

import { Button } from "../shared/Button";
import { ShareModal } from "./ShareModal";

export const ShareButton = () => {
  const { t } = useTranslation("form-builder");

  const [shareModal, showShareModal] = useState(false);

  const handleOpenDialog = useCallback(() => {
    showShareModal(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    showShareModal(false);
  }, []);

  return (
    <>
      <Button
        onClick={() => {
          handleOpenDialog();
        }}
        theme="secondary"
        className="!border-1.5 !py-2 !px-4 leading-6 text-sm"
        dataTestId="add-element"
      >
        {t("Share form")}
      </Button>
      {shareModal && <ShareModal handleClose={handleCloseDialog} />}
    </>
  );
};
