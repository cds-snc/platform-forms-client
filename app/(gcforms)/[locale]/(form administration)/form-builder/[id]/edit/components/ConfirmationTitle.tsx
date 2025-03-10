"use client";

import React from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";

export const ConfirmationTitle = ({ language }: { language: Language }) => {
  const { t } = useTranslation("form-builder");
  const getGroupsEnabled = useTemplateStore((s) => s.getGroupsEnabled);

  return (
    <div className="mb-8 text-[1rem]">
      <div
        className="mb-10 h-px"
        style={{
          backgroundImage: "linear-gradient(to right, #1E293B 50%, transparent 50%)",
          backgroundSize: "16px 1px",
          backgroundRepeat: "repeat-x",
        }}
      ></div>

      {getGroupsEnabled() && (
        <div className="mb-2 inline-block rounded-md border-1 border-slate-500 bg-slate-50 px-2 py-1 text-slate-500">
          {t("confirmation.pageTitle")}
        </div>
      )}
      <h2 className="mt-0 text-2xl text-slate-500 laptop:mt-0">
        {t("confirmation.title", { lng: language })}
      </h2>
    </div>
  );
};
