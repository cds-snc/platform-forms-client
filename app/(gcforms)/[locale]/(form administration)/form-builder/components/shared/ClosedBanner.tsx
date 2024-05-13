"use client";
import React from "react";
import { useIsFormClosed } from "@lib/hooks/useIsFormClosed";
import { useTranslation } from "@i18n/client";
import Link from "next/link";

export const ClosedBanner = ({ id }: { id: string | undefined }) => {
  const isPastClosingDate = useIsFormClosed();
  const {
    t,
    i18n: { language },
  } = useTranslation("form-closed");
  const href = `/${language}/form-builder/${id}/settings/manage`;

  if (!isPastClosingDate || !id) {
    return null;
  }

  return (
    <div className="mb-5 block bg-purple-200 p-3 font-bold">
      {t("closedBanner.text1")}{" "}
      <Link className="font-normal" href={href}>
        {t("closedBanner.text2")}
      </Link>
    </div>
  );
};
