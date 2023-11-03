import React from "react";
import { useIsFormClosed } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { StyledLink } from "@components/globals";

export const ClosedBanner = ({ id }: { id: string | undefined }) => {
  const isPastClosingDate = useIsFormClosed();
  const { t } = useTranslation("form-closed");
  const href = `/form-builder/settings/${id}/form`;

  if (!isPastClosingDate || !id) {
    return null;
  }

  return (
    <div className="mb-5 block bg-purple-200 p-3 font-bold">
      {t("closedBanner.text1")}{" "}
      <StyledLink className="font-normal" href={href}>
        {t("closedBanner.text2")}
      </StyledLink>
    </div>
  );
};
