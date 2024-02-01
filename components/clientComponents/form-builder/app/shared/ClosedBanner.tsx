"use client";
import React from "react";
import { useIsFormClosed } from "@lib/hooks";
import { useTranslation } from "@i18n/client";
import { StyledLink } from "@clientComponents/globals";

export const ClosedBanner = ({ id }: { id: string | undefined }) => {
  const isPastClosingDate = useIsFormClosed();
  const {
    t,
    i18n: { language },
  } = useTranslation("form-closed");
  const href = `/${language}/form-builder/settings/${id}/form`;

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
